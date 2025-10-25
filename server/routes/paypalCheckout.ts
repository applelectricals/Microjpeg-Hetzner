import { Router } from 'express';
import fetch from 'node-fetch';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://www.paypal.com'
  : 'https://www.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data: any = await response.json();
  return data.access_token;
}

// One-time payment (guest checkout allowed)
router.get('/checkout', async (req, res) => {
  const { tier, cycle, userId } = req.query;

  if (!tier || !cycle || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Get tier pricing
  const prices: Record<string, any> = {
    starter: { monthly: 9, yearly: 79 },
    pro: { monthly: 19, yearly: 149 },
    business: { monthly: 49, yearly: 399 }
  };

  const amount = prices[tier as string]?.[cycle as string];
  if (!amount) {
    return res.status(400).json({ error: 'Invalid tier or cycle' });
  }

  try {
    const token = await getAccessToken();
    const APP_URL = process.env.APP_URL || 'https://microjpeg.com';

    // Create PayPal order for one-time payment
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `${tier}_${cycle}_${userId}`,
        description: `MicroJPEG ${tier} - ${cycle}`,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        custom_id: userId
      }],
      application_context: {
        return_url: `${APP_URL}/api/paypal/capture?userId=${userId}&tier=${tier}&cycle=${cycle}`,
        cancel_url: `${APP_URL}/pricing`,
        brand_name: 'MicroJPEG',
        landing_page: 'NO_PREFERENCE', // Allows guest checkout
        user_action: 'PAY_NOW'
      }
    };

    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const order: any = await orderResponse.json();

    if (order.id) {
      // Find approval URL
      const approveLink = order.links.find((link: any) => link.rel === 'approve');
      if (approveLink) {
        console.log('🛒 One-time payment created:', order.id);
        return res.redirect(approveLink.href);
      }
    }

    throw new Error('Failed to create PayPal order');
  } catch (error: any) {
    console.error('PayPal checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Capture one-time payment
router.get('/capture', async (req, res) => {
  const { token: orderId, userId, tier, cycle } = req.query;

  if (!orderId || !userId || !tier || !cycle) {
    return res.redirect('/pricing?error=missing_params');
  }

  try {
    const token = await getAccessToken();

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const capture: any = await captureResponse.json();

    if (capture.status === 'COMPLETED') {
      // Calculate expiry (30 days for monthly, 365 for yearly)
      const days = cycle === 'yearly' ? 365 : 30;
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + days);

      // Create subscription record
      await db.execute(sql`
        INSERT INTO subscriptions (
          user_id, tier_name, payment_provider, 
          provider_customer_id, provider_subscription_id,
          billing_cycle, amount, status,
          current_period_start, current_period_end
        ) VALUES (
          ${userId}, ${tier}, 'paypal',
          ${capture.payer.payer_id}, ${orderId},
          ${cycle}, ${capture.purchase_units[0].amount.value}, 'active',
          NOW(), ${periodEnd}
        )
      `);

      // Update user tier
      await db.execute(sql`
        UPDATE users 
        SET tier = ${tier}, subscription_status = 'active'
        WHERE id = ${userId}
      `);

      console.log(`✅ One-time payment completed: User ${userId} → ${tier}`);
      return res.redirect('/subscription/success');
    }

    throw new Error('Payment capture failed');
  } catch (error: any) {
    console.error('Capture error:', error);
    res.redirect('/pricing?error=payment_failed');
  }
});

export default router;