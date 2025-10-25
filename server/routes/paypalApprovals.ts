import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import fetch from 'node-fetch';

const router = Router();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

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

// Handle subscription approval
router.post('/subscription-approved', async (req, res) => {
  const { subscriptionId, userId, tier, cycle, planId } = req.body;

  try {
    const token = await getAccessToken();

    // Get subscription details from PayPal
    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const subscription: any = await response.json();

    if (subscription.status === 'ACTIVE') {
      // Calculate period end
      const periodEnd = new Date(subscription.billing_info.next_billing_time);

      // Create subscription in database
      await db.execute(sql`
        INSERT INTO subscriptions (
          user_id, tier_name, payment_provider,
          provider_customer_id, provider_subscription_id,
          billing_cycle, amount, status,
          current_period_start, current_period_end
        ) VALUES (
          ${userId}, ${tier}, 'paypal',
          ${subscription.subscriber.payer_id}, ${subscriptionId},
          ${cycle}, ${subscription.billing_info.last_payment?.amount.value || 0}, 'active',
          NOW(), ${periodEnd}
        )
      `);

      // Update user tier
      await db.execute(sql`
        UPDATE users
        SET tier = ${tier}, subscription_status = 'active'
        WHERE id = ${userId}
      `);

      console.log(`✅ Subscription activated: User ${userId} → ${tier}`);

      res.json({
        success: true,
        message: 'Subscription activated successfully'
      });
    } else {
      throw new Error('Subscription not active');
    }
  } catch (error: any) {
    console.error('Subscription approval error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle one-time payment approval
router.post('/order-approved', async (req, res) => {
  const { orderId, userId, tier, cycle, amount } = req.body;

  try {
    // Calculate expiry
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
        'one-time', ${orderId},
        ${cycle}, ${amount}, 'active',
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

    res.json({
      success: true,
      message: 'Payment successful'
    });
  } catch (error: any) {
    console.error('Order approval error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;