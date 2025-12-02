/**
 * Payment Routes - Razorpay Subscriptions + PayPal One-Time
 * 
 * Razorpay: Recurring subscriptions (USD only based on your setup)
 * PayPal: One-time payments (USD only)
 * 
 * Your Razorpay Plans:
 * - RAZORPAY_PLAN_STARTER_MONTHLY_USD = Starter-M ($9)
 * - RAZORPAY_PLAN_STARTER_YEARLY_USD = Starter-Y ($49)
 */

import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { storage } from './storage';
import { emailService } from './services/emailService';

const router = Router();

// ============================================================================
// RAZORPAY
// ============================================================================

let razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpay;
}

function getUserId(req: Request): string | null {
  const session = req.session as any;
  return session?.userId || session?.user?.id || null;
}

function getPlanId(tier: string, cycle: string, currency: string = 'USD'): string | null {
  const envKey = `RAZORPAY_PLAN_${tier.toUpperCase()}_${cycle.toUpperCase()}_${currency.toUpperCase()}`;
  return process.env[envKey] || null;
}

const PRICING: Record<string, { inr: number; usd: number }> = {
  'starter-monthly': { inr: 749, usd: 9 },
  'starter-yearly': { inr: 4360, usd: 49 },
  'pro-monthly': { inr: 1599, usd: 19 },
  'pro-yearly': { inr: 12499, usd: 149 },
  'business-monthly': { inr: 4099, usd: 49 },
  'business-yearly': { inr: 28999, usd: 349 },
};

// ============================================================================
// CHECK AUTH MIDDLEWARE
// ============================================================================

router.get('/payment/check-auth', (req: Request, res: Response) => {
  const userId = getUserId(req);
  res.json({
    authenticated: !!userId,
    userId,
  });
});

// ============================================================================
// RAZORPAY ROUTES
// ============================================================================

router.get('/payment/razorpay/config', (_req, res) => {
  res.json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID || '',
    is_live: (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_live'),
  });
});

router.post('/payment/razorpay/create-subscription', async (req: Request, res: Response) => {
  try {
    const { tier, cycle, currency = 'USD' } = req.body;
    const userId = getUserId(req);

    console.log('\n🔄 Create Subscription:', { tier, cycle, currency, userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue',
        code: 'AUTH_REQUIRED',
        redirectUrl: '/login?redirect=/checkout',
      });
    }

    const planId = getPlanId(tier, cycle, currency);
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: `Plan not configured for ${tier}-${cycle}-${currency}`,
      });
    }

    const user = await storage.getUser(userId);
    const razorpayInstance = getRazorpay();
    
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: planId,
      total_count: 0,
      quantity: 1,
      customer_notify: 1,
      notes: { userId, tier, cycle, currency },
      ...(user?.email && { notify_info: { notify_email: user.email } }),
    });

    console.log('✅ Subscription created:', subscription.id);

    res.json({
      success: true,
      subscription_id: subscription.id,
      short_url: subscription.short_url,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('❌ Create subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payment/razorpay/verify-subscription', async (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, tier, cycle, currency = 'USD' } = req.body;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Verify signature
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date();
    cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);

    const pricing = PRICING[`${tier}-${cycle}`] || { usd: 0 };

    await storage.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      subscriptionBillingCycle: cycle,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      lastPaymentAmount: pricing.usd,
      lastPaymentCurrency: currency,
      updatedAt: new Date(),
    });

    // Send email
    const user = await storage.getUser(userId);
    if (user?.email) {
      await emailService.sendPaymentConfirmation(user.email, user.firstName || 'there', {
        tier, cycle, amount: pricing.usd, currency: 'USD', startDate, endDate,
        subscriptionId: razorpay_subscription_id, paymentId: razorpay_payment_id,
      }).catch(() => {});
    }

    console.log(`✅ Razorpay subscription activated: ${userId} → ${tier}-${cycle}`);

    res.json({ success: true, subscription_id: razorpay_subscription_id });

  } catch (error: any) {
    console.error('❌ Verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payment/razorpay/cancel-subscription', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const user = await storage.getUser(userId);
    if (!user?.razorpaySubscriptionId) {
      return res.status(400).json({ success: false, error: 'No active subscription' });
    }

    await getRazorpay().subscriptions.cancel(user.razorpaySubscriptionId, true);

    await storage.updateUser(userId, {
      subscriptionStatus: 'cancelling',
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    });

    if (user.email) {
      await emailService.sendCancellationConfirmation(
        user.email, user.firstName || 'there',
        user.subscriptionEndDate || new Date(), user.subscriptionTier || 'starter'
      ).catch(() => {});
    }

    res.json({ success: true, message: 'Subscription will end at billing period end' });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PAYPAL ONE-TIME ROUTES
// ============================================================================

router.post('/payment/paypal/capture', async (req: Request, res: Response) => {
  try {
    const { orderID, tier, cycle } = req.body;
    const userId = getUserId(req);

    console.log('\n💳 PayPal Capture:', { orderID, tier, cycle, userId });

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date();
    cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);

    const pricing = PRICING[`${tier}-${cycle}`] || { usd: 0 };

    await storage.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      subscriptionBillingCycle: cycle,
      paypalOrderId: orderID,
      lastPaymentAmount: pricing.usd,
      lastPaymentCurrency: 'USD',
      updatedAt: new Date(),
    });

    // Send email
    const user = await storage.getUser(userId);
    if (user?.email) {
      await emailService.sendPaymentConfirmation(user.email, user.firstName || 'there', {
        tier, cycle, amount: pricing.usd, currency: 'USD', startDate, endDate, paymentId: orderID,
      }).catch(() => {});
    }

    console.log(`✅ PayPal payment activated: ${userId} → ${tier}-${cycle}`);

    res.json({ success: true });

  } catch (error: any) {
    console.error('❌ PayPal capture error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WEBHOOK
// ============================================================================

router.post('/payment/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log(`📨 Webhook: ${event.event}`);

    const sub = event.payload?.subscription?.entity;
    const userId = sub?.notes?.userId;

    if (!userId) {
      return res.status(200).json({ status: 'ok' });
    }

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const cycle = sub.notes?.cycle || 'monthly';
        const endDate = new Date();
        cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);
        
        await storage.updateUser(userId, {
          subscriptionTier: sub.notes?.tier,
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
          razorpaySubscriptionId: sub.id,
        });
        break;
      }
      case 'subscription.cancelled':
        await storage.updateUser(userId, { subscriptionStatus: 'cancelled' });
        break;
      case 'subscription.halted':
        await storage.updateUser(userId, { subscriptionStatus: 'halted' });
        const user = await storage.getUser(userId);
        if (user?.email) {
          await emailService.sendPaymentFailedNotification(user.email, user.firstName || 'there', sub.notes?.tier).catch(() => {});
        }
        break;
    }

    res.status(200).json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

export default router;
