// api/parse-pdf.js — CommonJS for Vercel
const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return res.status(400).json({ error: 'Valid text content required' })
  }

  try {
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Extract and structure this syllabus PDF text into clean study notes.
Use ## for unit headings and bullet points for topics.
Remove page numbers, headers, footers.
If it's NOT a syllabus, return exactly: NOT_A_SYLLABUS

Raw text:
---
${text.slice(0, 10000)}
---

Return ONLY the structured syllabus. No intro or explanation.`
      }]
    })

    const result = (response.content?.[0]?.text || '').trim()

    if (!result || result === 'NOT_A_SYLLABUS') {
      return res.status(200).json({ error: 'Not a valid syllabus PDF.' })
    }

    return res.status(200).json({ syllabus: result })
  } catch (err) {
    console.error('[parse-pdf.js]', err.message)
    return res.status(500).json({ error: 'Failed to parse PDF. Please try again.' })
  }
}
