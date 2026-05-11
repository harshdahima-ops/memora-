// api/chat.js
// Memora — AI Chat Backend (Vercel Serverless Function)
// Handles: text chat, image analysis, URL scraping, rate limiting

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL        = 'claude-sonnet-4-6'   // fast + smart — best for study app
const MAX_TOKENS   = 2048                   // enough for detailed explanations
const FREE_LIMIT   = 20                     // messages/day for free users
const TIMEOUT_MS   = 25000                  // 25s — under Vercel's 30s limit

// Simple in-memory rate limiter (per IP, resets on cold start)
// For production, replace with Redis/Upstash
const ipHits = new Map()

function checkIpRateLimit(ip) {
  const now  = Date.now()
  const window = 60 * 1000  // 1 minute window
  const limit  = 30         // max 30 requests per minute per IP

  const hits = ipHits.get(ip) || []
  const recent = hits.filter(t => now - t < window)
  recent.push(now)
  ipHits.set(ip, recent)

  return recent.length > limit
}

// Fetch and extract text from a URL
async function fetchUrlText(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MemoraBot/1.0)' }
    })
    clearTimeout(timer)

    const html = await res.text()

    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000) // limit context

    return text || null
  } catch {
    return null
  }
}

// Build Anthropic message content (handles text + image + url)
async function buildContent(lastUserMessage, image, url) {
  const content = []

  // If image attached (base64 data URL)
  if (image && image.startsWith('data:')) {
    const [meta, data] = image.split(',')
    const mediaType = meta.match(/data:(.*);base64/)?.[1] || 'image/jpeg'

    const supported = ['image/jpeg','image/png','image/gif','image/webp']
    if (supported.includes(mediaType)) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data }
      })
    }
  }

  // If URL attached — fetch and prepend as context
  if (url) {
    const urlText = await fetchUrlText(url)
    if (urlText) {
      content.push({
        type: 'text',
        text: `[Content from URL: ${url}]\n\n${urlText}\n\n---\n\nUser question: ${lastUserMessage}`
      })
      return content
    }
  }

  // Plain text
  content.push({ type: 'text', text: lastUserMessage })
  return content
}

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  // ── IP Rate Limit ────────────────────────────────────────────
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
  if (checkIpRateLimit(ip)) {
    return res.status(429).json({ error: 'RATE_LIMIT', message: 'Too many requests. Please wait a minute.' })
  }

  // ── Validate Input ───────────────────────────────────────────
  const { messages, system, image, url } = req.body || {}

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' })
  }

  if (messages.length > 40) {
    return res.status(400).json({ error: 'Too many messages in context' })
  }

  // ── Sanitize messages ────────────────────────────────────────
  const sanitized = messages
    .filter(m => m?.role && m?.content && typeof m.content === 'string')
    .map(m => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, 8000) // cap per message
    }))

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'No valid messages' })
  }

  // ── Build final message with attachments ─────────────────────
  const lastMsg   = sanitized[sanitized.length - 1]
  const priorMsgs = sanitized.slice(0, -1)

  let finalContent
  try {
    finalContent = await buildContent(lastMsg.content, image, url)
  } catch {
    finalContent = [{ type: 'text', text: lastMsg.content }]
  }

  const apiMessages = [
    ...priorMsgs,
    { role: 'user', content: finalContent }
  ]

  // ── Ensure alternating roles (Anthropic requirement) ─────────
  const deduped = []
  for (const msg of apiMessages) {
    if (deduped.length === 0 || deduped[deduped.length-1].role !== msg.role) {
      deduped.push(msg)
    } else {
      // merge consecutive same-role messages
      const last = deduped[deduped.length-1]
      if (typeof last.content === 'string' && typeof msg.content === 'string') {
        last.content += '\n' + msg.content
      }
    }
  }

  // Must start with user
  if (deduped[0]?.role !== 'user') {
    deduped.unshift({ role: 'user', content: '(continue)' })
  }

  // ── Call Anthropic ───────────────────────────────────────────
  const systemPrompt = typeof system === 'string'
    ? system.slice(0, 4000)
    : 'You are Memora, a helpful AI study assistant for Indian students.'

  const timeout = new Promise((_, reject) =>
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
      timeout
    ])

    const reply = response.content
      ?.filter(b => b.type === 'text')
      ?.map(b => b.text)
      ?.join('')
      ?.trim()

    if (!reply) {
      return res.status(500).json({ error: 'Empty response from AI' })
    }

    return res.status(200).json({ reply })

  } catch (err) {
    console.error('[chat.js] Anthropic error:', err.message)

    // Anthropic rate limit
    if (err.status === 529 || err.message?.includes('overloaded')) {
      return res.status(200).json({ error: 'RATE_LIMIT' })
    }

    // Timeout
    if (err.message === 'TIMEOUT') {
      return res.status(200).json({ error: 'RATE_LIMIT' })
    }

    // Auth error
    if (err.status === 401) {
      return res.status(500).json({ error: 'AI service configuration error' })
    }

    // Context too large
    if (err.status === 400 && err.message?.includes('token')) {
      return res.status(200).json({ error: 'Message too long. Please start a new chat.' })
    }

    return res.status(500).json({ error: 'AI service unavailable. Please try again.' })
  }
}
