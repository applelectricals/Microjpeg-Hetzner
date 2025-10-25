import { Router } from 'express';

const router = Router();

// Redirect to PayPal checkout
router.get('/subscribe', (req, res) => {
  const { planId, userId } = req.query;

  if (!planId || !userId) {
    return res.status(400).json({ error: 'Missing planId or userId' });
  }

  const PAYPAL_URL = process.env.PAYPAL_MODE === 'live'
    ? 'https://www.paypal.com'
    : 'https://www.sandbox.paypal.com';

  const APP_URL = process.env.APP_URL || 'https://microjpeg.com';

  // Build PayPal subscription URL
  const returnUrl = `${APP_URL}/subscription/success?userId=${userId}`;
  const cancelUrl = `${APP_URL}/pricing`;

  // FIXED: Use proper PayPal subscription flow
  const paypalSubscribeUrl = `${PAYPAL_URL}/billing/subscriptions/create?plan_id=${planId}&custom_id=${userId}&return=${encodeURIComponent(returnUrl)}&cancel=${encodeURIComponent(cancelUrl)}`;

  console.log('🔗 Redirecting to PayPal:', paypalSubscribeUrl);

  res.redirect(paypalSubscribeUrl);
});

export default router;