export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { text } = req.body
    if (!text || text.trim().length < 50) return res.status(400).json({ error: 'No text provided' })

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: 'You are a syllabus parser. Extract the exact syllabus structure. Output ONLY units and topics in this format:\nUnit 1: [Name]\n- Topic 1\n- Topic 2\nUnit 2: [Name]\n- Topic 1\nDo not add anything extra. Be precise and concise.' },
          { role: 'user', content: 'Parse this syllabus and extract units/chapters:\n\n' + text.slice(0, 6000) }
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
