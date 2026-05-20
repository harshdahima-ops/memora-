module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY in Vercel env vars' })
  }

  const { messages, system } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' })
  }

  const clean = messages
    .filter(m => m && m.role && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content.slice(0, 3000)
    }))

  const fixed = []
  for (const msg of clean) {
    if (!fixed.length || fixed[fixed.length - 1].role !== msg.role) {
      fixed.push(msg)
    }
  }
  if (!fixed.length || fixed[0].role !== 'user') {
    fixed.unshift({ role: 'user', content: 'Hello' })
  }

  const systemPrompt = typeof system === 'string'
    ? system.slice(0, 2000)
    : 'You are Memora, a helpful AI study assistant for Indian students.'

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [{ role: 'system', content: systemPrompt }, ...fixed]
      })
    })

    const text = await r.text()
    if (!r.ok) {
      console.error('Groq error:', r.status, text)
      if (r.status === 401) return res.status(500).json({ error: 'Invalid GROQ_API_KEY' })
      if (r.status === 429) return res.status(200).json({ error: 'RATE_LIMIT' })
      return res.status(500).json({ error: 'Groq API error: ' + r.status })
    }

    const data = JSON.parse(text)
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) return res.status(500).json({ error: 'Empty response from AI' })
    return res.status(200).json({ reply })

  } catch (err) {
    console.error('Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
