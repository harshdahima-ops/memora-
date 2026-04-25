export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pdfBase64 } = req.body
    if (!pdfBase64) return res.status(400).json({ error: 'No PDF provided' })

    // Use Groq vision to extract syllabus structure from PDF
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'You are a syllabus parser. Extract the exact syllabus structure from the provided text. Output ONLY a clean structured list of units and their topics/chapters. Format: Unit 1: [Name] - Topic1, Topic2, Topic3. Unit 2: [Name] - Topic1, Topic2. Keep it concise and accurate. Do not add anything extra.'
          },
          {
            role: 'user',
            content: 'Here is the syllabus text extracted from a PDF. Parse and structure it:\n\n' + atob(pdfBase64).slice(0, 8000)
          }
        ]
      })
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const syllabus = data.choices?.[0]?.message?.content
    return res.status(200).json({ syllabus })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
