// api/parse-pdf.js
// Memora — Syllabus PDF Parser (Vercel Serverless Function)
// Takes raw extracted text from a PDF and uses Claude to structure it
// into a clean syllabus that the study modes can reference

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text content is required' })
  }

  if (text.trim().length < 50) {
    return res.status(400).json({ error: 'Text too short to be a valid syllabus' })
  }

  // Limit input to avoid huge tokens
  const inputText = text.slice(0, 12000)

  try {
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are extracting a structured syllabus from raw PDF text.

The text below was extracted from a student's syllabus/curriculum PDF. 
Extract and organize it into a clean, structured syllabus format.

Rules:
- Use ## for unit/module headings
- Use bullet points for topics under each unit
- Keep it concise — just topic names, no long descriptions
- Remove page numbers, headers, footers, random symbols
- If you see chapter names, topic lists, unit divisions — preserve them clearly
- If it's not a syllabus at all, return: NOT_A_SYLLABUS

Raw PDF text:
---
${inputText}
---

Return ONLY the structured syllabus. No intro, no explanation.`
      }]
    })

    const result = response.content?.[0]?.text?.trim()

    if (!result || result === 'NOT_A_SYLLABUS') {
      return res.status(200).json({ error: 'Could not extract syllabus. Please upload a proper syllabus PDF.' })
    }

    return res.status(200).json({ syllabus: result })

  } catch (err) {
    console.error('[parse-pdf.js] Error:', err.message)
    return res.status(500).json({ error: 'Failed to parse PDF. Please try again.' })
  }
}
