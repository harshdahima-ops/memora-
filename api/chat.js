module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.GROQ_API_KEY
  if (!key) return res.status(500).json({ error: 'Missing GROQ_API_KEY' })

  const { messages, system } = req.body || {}
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'Messages required' })
  }

  const clean = messages
    .filter(m => m && m.role && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content.slice(0, 3000) }))

  const fixed = []
  for (const msg of clean) {
    if (!fixed.length || fixed[fixed.length - 1].role !== msg.role) fixed.push(msg)
  }
  if (!fixed.length || fixed[0].role !== 'user') fixed.unshift({ role: 'user', content: 'Hi' })

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: typeof system === 'string' ? system.slice(0, 2000) : 'You are Memora, an AI study assistant.' },
          ...fixed
        ]
      })
    })
    const text = await r.text()
    if (!r.ok) {
      if (r.status === 401) return res.status(500).json({ error: 'Bad GROQ_API_KEY' })
      if (r.status === 429) return res.status(200).json({ error: 'RATE_LIMIT' })
      return res.status(500).json({ error: 'Groq error ' + r.status })
    }
    const reply = JSON.parse(text)?.choices?.[0]?.message?.content?.trim()
    if (!reply) return res.status(500).json({ error: 'Empty reply' })
    return res.status(200).json({ reply })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
