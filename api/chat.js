export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, system, image, url } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' })

  let contextExtra = ''
  if (url) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) })
      const html = await r.text()
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)
      contextExtra = '\n\nContent from URL (' + url + '):\n' + text
    } catch { contextExtra = '\n\n[Could not fetch URL]' }
  }

  const systemFinal = (system || 'You are Memora, a smart AI study assistant.') + contextExtra
  const hasImage = !!image
  const model = hasImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile'

  let groqMessages
  if (hasImage) {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    const prev = messages.slice(0, -1)
    groqMessages = [
      { role: 'system', content: systemFinal },
      ...prev,
      { role: 'user', content: [{ type: 'text', text: lastUser?.content || 'Analyze this' }, { type: 'image_url', image_url: { url: image } }] }
    ]
  } else {
    groqMessages = [{ role: 'system', content: systemFinal }, ...messages]
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model, messages: groqMessages, max_tokens: 2000, temperature: 0.7 }),
    })
    const data = await response.json()
    if (data.error) {
      if (data.error.code === 'rate_limit_exceeded' || (data.error.message && data.error.message.includes('Rate limit'))) {
        return res.status(429).json({ error: 'RATE_LIMIT', message: 'AI is taking a short break due to high usage. Please wait 1-2 minutes and try again.' })
      }
      return res.status(500).json({ error: data.error.message || 'AI error' })
    }
    const reply = data.choices?.[0]?.message?.content
    if (!reply) return res.status(500).json({ error: 'No response from AI' })
    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: 'Server error. Try again.' })
  }
}
