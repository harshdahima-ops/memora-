// api/chat.js — Memora AI Backend (CommonJS for Vercel)
// Uses Groq FREE API (llama-3.3-70b-versatile)

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MODEL = 'llama-3.3-70b-versatile'
const MAX_TOKENS = 2048
const TIMEOUT_MS = 25000

// Simple IP rate limiter (in-memory, resets on cold start)
const ipHits = new Map()
function checkIpRateLimit(ip) {
  const now = Date.now()
  const window = 60 * 1000 // 1 minute
  const limit = 40
  const hits = (ipHits.get(ip) || []).filter(t => now - t < window)
  hits.push(now)
  ipHits.set(ip, hits)
  return hits.length > limit
}

// Fetch text from a URL (for URL attachments)
async function fetchUrlText(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MemoraBot/1.0)' }
    })
    clearTimeout(timer)
    const html = await res.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000)
  } catch {
    return null
  }
}

module.exports = async function handler(req, res) {
  // ── CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Check API key exists
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in Vercel environment variables.' })
  }

  // ── IP rate limit
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown'
  if (checkIpRateLimit(ip)) {
    return res.status(429).json({ error: 'RATE_LIMIT' })
  }

  // ── Validate
  const { messages, system, url } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' })
  }

  // ── Sanitize messages
  const sanitized = messages
    .filter(m => m && m.role && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, 6000)
    }))

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'No valid messages' })
  }

  // ── Handle URL attachment
  const lastMsg = sanitized[sanitized.length - 1]
  const priorMsgs = sanitized.slice(0, -1)

  let finalUserContent = lastMsg.content

  if (url && typeof url === 'string') {
    const urlText = await fetchUrlText(url)
    if (urlText) {
      finalUserContent = `[Content from URL: ${url}]\n\n${urlText}\n\n---\n\nUser question: ${lastMsg.content}`
    }
  }

  const apiMessages = [
    ...priorMsgs,
    { role: 'user', content: finalUserContent }
  ]

  // ── Fix alternating roles (Groq also requires user/assistant/user...)
  const deduped = []
  for (const msg of apiMessages) {
    if (!deduped.length || deduped[deduped.length - 1].role !== msg.role) {
      deduped.push(msg)
    }
  }
  if (deduped[0]?.role !== 'user') {
    deduped.unshift({ role: 'user', content: '(continue)' })
  }

  // ── System prompt
  const systemPrompt = (typeof system === 'string' ? system : 'You are Memora, a helpful AI study assistant.').slice(0, 4000)

  // ── Call Groq API with timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
  )

  try {
    const groqResponse = await Promise.race([
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: 'system', content: systemPrompt },
            ...deduped
          ]
        })
      }),
      timeoutPromise
    ])

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}))
      console.error('[chat.js] Groq error:', groqResponse.status, errData)

      if (groqResponse.status === 401) {
        return res.status(500).json({ error: 'API key error. Check GROQ_API_KEY in Vercel env vars.' })
      }
      if (groqResponse.status === 429) {
        return res.status(200).json({ error: 'RATE_LIMIT' })
      }
      return res.status(500).json({ error: 'AI unavailable. Please try again.' })
    }

    const data = await groqResponse.json()
    const reply = data.choices?.[0]?.message?.content?.trim()

    if (!reply) return res.status(500).json({ error: 'Empty AI response' })

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('[chat.js] Error:', err.message)
    if (err.message === 'TIMEOUT') {
      return res.status(200).json({ error: 'RATE_LIMIT' })
    }
    return res.status(500).json({ error: 'AI unavailable. Please try again.' })
  }
}
