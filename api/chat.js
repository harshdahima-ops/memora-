// api/chat.js — Memora AI Backend (uses FREE Groq API)
// No npm install needed — uses native fetch

const GROQ_API_KEY = process.env.GROQ_API_KEY

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Check API key
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables')
    return res.status(500).json({ error: 'Server config error: missing API key' })
  }

  const { messages, system, url } = req.body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' })
  }

  // Sanitize messages — keep last 14, fix roles
  const sanitized = messages
    .filter(m => m && m.role && typeof m.content === 'string' && m.content.trim())
    .slice(-14)
    .map(m => ({
      role: m.role === 'assistant' || m.role === 'ai' ? 'assistant' : 'user',
      content: m.content.slice(0, 4000)
    }))

  // Fix alternating roles (Groq requires user/assistant/user...)
  const deduped = []
  for (const msg of sanitized) {
    if (!deduped.length || deduped[deduped.length - 1].role !== msg.role) {
      deduped.push(msg)
    }
  }
  if (!deduped.length || deduped[0].role !== 'user') {
    deduped.unshift({ role: 'user', content: 'Hello' })
  }

  // If URL attachment, prepend content to last message
  if (url && typeof url === 'string') {
    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 6000)
      const r = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } })
      const html = await r.text()
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000)
      const last = deduped[deduped.length - 1]
      deduped[deduped.length - 1] = { ...last, content: `[Page content: ${text}]\n\nUser: ${last.content}` }
    } catch (_) {}
  }

  const systemPrompt = typeof system === 'string'
    ? system.slice(0, 3000)
    : 'You are Memora, a helpful AI study assistant for Indian students.'

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...deduped
        ]
      })
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.text()
      console.error('Groq API error:', groqRes.status, errBody)
      if (groqRes.status === 401) {
        return res.status(500).json({ error: 'Invalid GROQ_API_KEY. Check Vercel env vars.' })
      }
      if (groqRes.status === 429) {
        return res.status(200).json({ error: 'RATE_LIMIT' })
      }
      return res.status(500).json({ error: 'AI service error: ' + groqRes.status })
    }

    const data = await groqRes.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return res.status(500).json({ error: 'Empty response from AI' })
    }

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('Handler error:', err.message)
    return res.status(500).json({ error: 'Something went wrong: ' + err.message })
  }
}
