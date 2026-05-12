// api/chat.js — Memora AI Backend (CommonJS for Vercel)
const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ✅ Use the correct full model string
const MODEL      = 'claude-sonnet-4-6'
const MAX_TOKENS = 2048
const TIMEOUT_MS = 25000

// Simple IP rate limiter (in-memory, resets on cold start)
const ipHits = new Map()
function checkIpRateLimit(ip) {
  const now    = Date.now()
  const window = 60 * 1000  // 1 minute
  const limit  = 40
  const hits   = (ipHits.get(ip) || []).filter(t => now - t < window)
  hits.push(now)
  ipHits.set(ip, hits)
  return hits.length > limit
}

// Fetch text from a URL (for URL attachments)
async function fetchUrlText(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    const res  = await fetch(url, {
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
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  // ── IP rate limit
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown'
  if (checkIpRateLimit(ip)) {
    return res.status(429).json({ error: 'RATE_LIMIT' })
  }

  // ── Validate
  const { messages, system, image, url } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' })
  }

  // ── Sanitize messages
  const sanitized = messages
    .filter(m => m && m.role && typeof m.content === 'string')
    .slice(-20)  // keep last 20 only
    .map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, 6000)
    }))

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'No valid messages' })
  }

  // ── Build final message content (handle image + url attachments)
  const lastMsg   = sanitized[sanitized.length - 1]
  const priorMsgs = sanitized.slice(0, -1)
  let finalContent = []

  // Image attachment (base64 data URL)
  if (image && typeof image === 'string' && image.startsWith('data:')) {
    try {
      const [meta, data] = image.split(',')
      const mediaType = (meta.match(/data:(.*);base64/) || [])[1] || 'image/jpeg'
      const supported = ['image/jpeg','image/png','image/gif','image/webp']
      if (supported.includes(mediaType) && data) {
        finalContent.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data } })
      }
    } catch {}
  }

  // URL attachment — fetch and prepend as context
  if (url && typeof url === 'string') {
    const urlText = await fetchUrlText(url)
    if (urlText) {
      finalContent.push({
        type: 'text',
        text: `[Content from URL: ${url}]\n\n${urlText}\n\n---\n\nUser question: ${lastMsg.content}`
      })
    } else {
      finalContent.push({ type: 'text', text: lastMsg.content })
    }
  } else {
    finalContent.push({ type: 'text', text: lastMsg.content })
  }

  const apiMessages = [...priorMsgs, { role: 'user', content: finalContent }]

  // ── Fix alternating roles (Anthropic requires user/assistant/user...)
  const deduped = []
  for (const msg of apiMessages) {
    if (!deduped.length || deduped[deduped.length - 1].role !== msg.role) {
      deduped.push(msg)
    }
  }
  if (deduped[0]?.role !== 'user') deduped.unshift({ role: 'user', content: '(continue)' })

  // ── System prompt
  const systemPrompt = (typeof system === 'string' ? system : 'You are Memora, a helpful AI study assistant.').slice(0, 4000)

  // ── Call Anthropic with timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
  )

  try {
    const response = await Promise.race([
      anthropic.messages.create({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system:     systemPrompt,
        messages:   deduped,
      }),
      timeoutPromise
    ])

    const reply = (response.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    if (!reply) return res.status(500).json({ error: 'Empty AI response' })

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('[chat.js] Error:', err.status, err.message)

    if (err.message === 'TIMEOUT' || err.status === 529) {
      return res.status(200).json({ error: 'RATE_LIMIT' })
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'API key error. Check ANTHROPIC_API_KEY in Vercel env vars.' })
    }
    if (err.status === 400) {
      return res.status(200).json({ error: 'Message too long. Please start a new chat.' })
    }

    return res.status(500).json({ error: 'AI unavailable. Please try again.' })
  }
}
