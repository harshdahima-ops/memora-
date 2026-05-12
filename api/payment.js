// api/payment.js — CommonJS for Vercel
const crypto   = require('crypto')
const Razorpay = require('razorpay')
const { createClient } = require('@supabase/supabase-js')

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const AMOUNT_PAISE = 9900
const CURRENCY     = 'INR'

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.body || {}

  // ── 1. CREATE ORDER
  if (action === 'create_order') {
    try {
      const order = await razorpay.orders.create({
        amount:   AMOUNT_PAISE,
        currency: CURRENCY,
        receipt:  `memora_${Date.now()}`,
        notes:    { app: 'Memora', plan: 'premium_monthly' }
      })
      return res.status(200).json({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
      })
    } catch (err) {
      console.error('[payment.js] create_order:', err.message)
      return res.status(500).json({ error: 'Failed to create payment order' })
    }
  }

  // ── 2. VERIFY PAYMENT
  if (action === 'verify_payment') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment fields' })
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Signature mismatch' })
    }

    if (user_id) {
      await supabase
        .from('profiles')
        .update({ premium: true, premium_since: new Date().toISOString() })
        .eq('user_id', user_id)
    }

    return res.status(200).json({ verified: true })
  }

  // ── 3. RAZORPAY WEBHOOK
  if (req.query && req.query.webhook === '1') {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const receivedSig   = req.headers['x-razorpay-signature']

    if (webhookSecret && receivedSig) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')
      if (expectedSig !== receivedSig) {
        return res.status(400).json({ error: 'Invalid webhook signature' })
      }
    }

    const event   = req.body && req.body.event
    const payment = req.body && req.body.payload && req.body.payload.payment && req.body.payload.payment.entity

    if (event === 'payment.captured' && payment && payment.email) {
      const { data } = await supabase.auth.admin.listUsers()
      const matched  = (data && data.users || []).find(u => u.email === payment.email)
      if (matched) {
        await supabase
          .from('profiles')
          .update({ premium: true, premium_since: new Date().toISOString() })
          .eq('user_id', matched.id)
      }
    }

    return res.status(200).json({ received: true })
  }

  return res.status(400).json({ error: 'Invalid action' })
}
