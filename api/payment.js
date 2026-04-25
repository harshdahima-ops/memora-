export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.body

  if (action === 'create_order') {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keyId || !keySecret) return res.status(500).json({ error: 'API keys not configured' })
      const auth = Buffer.from(keyId + ':' + keySecret).toString('base64')
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth },
        body: JSON.stringify({ amount: 9900, currency: 'INR', receipt: 'memora_' + Date.now() })
      })
      const order = await response.json()
      if (order.error) return res.status(500).json({ error: order.error.description })
      return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (action === 'verify_payment') {
    try {
      const { createHmac } = await import('node:crypto')
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')
      if (expectedSig === razorpay_signature) {
        return res.status(200).json({ verified: true })
      } else {
        return res.status(400).json({ verified: false, error: 'Invalid signature' })
      }
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(400).json({ error: 'Invalid action' })
}
