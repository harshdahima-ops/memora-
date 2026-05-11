// api/payment.js
// Memora — Razorpay Payment Backend (Vercel Serverless Function)
// Handles: create_order, verify_payment, webhook (auto-premium activation)

import crypto   from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Supabase admin client (service role) — needed to update premium status
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // NOT the anon key
)

const AMOUNT_PAISE = 9900  // ₹99 in paise
const CURRENCY     = 'INR'

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.body || {}

  // ── 1. CREATE ORDER ─────────────────────────────────────────
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
      console.error('[payment.js] create_order error:', err.message)
      return res.status(500).json({ error: 'Failed to create payment order' })
    }
  }

  // ── 2. VERIFY PAYMENT ────────────────────────────────────────
  if (action === 'verify_payment') {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id
    } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment fields' })
    }

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      console.warn('[payment.js] Signature mismatch for order:', razorpay_order_id)
      return res.status(400).json({ verified: false, error: 'Payment verification failed' })
    }

    // Activate premium in Supabase (if user_id provided)
    if (user_id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          premium:       true,
          premium_since: new Date().toISOString(),
        })
        .eq('user_id', user_id)

      if (error) {
        console.error('[payment.js] Supabase update error:', error.message)
        // Still return verified=true — premium can be activated via webhook fallback
      }
    }

    return res.status(200).json({ verified: true })
  }

  // ── 3. RAZORPAY WEBHOOK ──────────────────────────────────────
  // Razorpay sends this to /api/payment?webhook=1
  // Set Webhook URL in Razorpay Dashboard → https://your-domain.vercel.app/api/payment?webhook=1
  if (req.query?.webhook === '1') {
    const webhookSecret   = process.env.RAZORPAY_WEBHOOK_SECRET
    const receivedSig     = req.headers['x-razorpay-signature']
    const rawBody         = JSON.stringify(req.body)

    // Verify webhook signature
    if (webhookSecret && receivedSig) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (expectedSig !== receivedSig) {
        return res.status(400).json({ error: 'Invalid webhook signature' })
      }
    }

    const event = req.body?.event
    const payment = req.body?.payload?.payment?.entity

    // payment.captured = successful payment
    if (event === 'payment.captured' && payment) {
      const userEmail = payment.email

      if (userEmail) {
        // Find user by email and activate premium
        const { data: authUser } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', userEmail)
          .single()

        // Alternative: use admin API
        const { data: users } = await supabase.auth.admin.listUsers()
        const matchedUser = users?.users?.find(u => u.email === userEmail)

        if (matchedUser) {
          await supabase
            .from('profiles')
            .update({
              premium:       true,
              premium_since: new Date().toISOString(),
            })
            .eq('user_id', matchedUser.id)
        }
      }
    }

    return res.status(200).json({ received: true })
  }

  return res.status(400).json({ error: 'Invalid action' })
}
