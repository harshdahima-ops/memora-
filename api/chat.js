export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, system, image, url } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  let contextExtra = '';

  // Fetch URL content
  if (url) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await r.text();
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000);
      contextExtra = `\n\nContent from URL (${url}):\n${text}`;
    } catch { contextExtra = '\n\n[Could not fetch URL content]'; }
  }

  const systemFinal = (system || 'You are Memora, a smart AI study assistant.') + contextExtra;

  // Vision model for images, text model otherwise
  const hasImage = !!image;
  const model = hasImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile';

  // Build messages
  let groqMessages = [{ role: 'system', content: systemFinal }];

  if (hasImage) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const prevMsgs = messages.slice(0, -1);
    groqMessages = [
      { role: 'system', content: systemFinal },
      ...prevMsgs,
      {
        role: 'user',
        content: [
          { type: 'text', text: lastUserMsg?.content || 'Analyze this image' },
          { type: 'image_url', image_url: { url: image } },
        ],
      },
    ];
  } else {
    groqMessages = [{ role: 'system', content: systemFinal }, ...messages];
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model, messages: groqMessages, max_tokens: 1200, temperature: 0.7 }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || 'AI error' });
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'No response from AI' });
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
}
