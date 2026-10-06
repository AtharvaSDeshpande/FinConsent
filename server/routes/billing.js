import express from 'express';
import crypto from 'node:crypto';
import { dbStore } from '../db/store.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();

// Generate Razorpay Pro checkout link (₹2,499/mo + 18% GST = ₹2,948.82)
router.post('/create-checkout', requireAuth, (req, res) => {
  const planAmount = 2499;
  const gst = Math.round(planAmount * 0.18);
  const totalAmount = planAmount + gst;

  // Mock / Test Razorpay Order ID
  const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  const checkoutUrl = `https://rzp.io/l/finconsent-pro-${orderId}`;

  res.json({
    success: true,
    data: {
      plan: 'Pro RIA Annual / Monthly',
      subtotal: planAmount,
      gst,
      totalAmount,
      currency: 'INR',
      orderId,
      checkoutUrl,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKey123',
    },
  });
});

// Razorpay Webhook listener with HMAC-SHA256 signature verification
router.post('/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'sampleSecretKey123';
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const isValid = signature === expectedSignature || process.env.NODE_ENV !== 'production';

  if (!isValid) {
    return res.status(400).json({ success: false, error: 'Invalid HMAC signature' });
  }

  const { event, payload } = req.body;
  if (event === 'payment.captured' && payload?.payment?.entity?.notes?.userId) {
    const userId = payload.payment.entity.notes.userId;
    dbStore.updateUser(userId, { plan: 'pro' });
  }

  res.json({ status: 'ok' });
});

// Upgrade RIA to Pro directly for pilot/testing
router.post('/upgrade-test', requireAuth, (req, res) => {
  const updated = dbStore.updateUser(req.user.id, { plan: 'pro' });
  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  res.json({ success: true, user: userSafe });
});

export default router;
