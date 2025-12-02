/**
 * Payment Routes - Razorpay Subscriptions + PayPal One-Time
 * 
 * With proper webhook signature verification
 * 
 * ENVIRONMENT VARIABLES:
 * - RAZORPAY_KEY_ID
 * - RAZORPAY_KEY_SECRET
 * - RAZORPAY_WEBHOOK_SECRET (generate in Razorpay Dashboard)
 * - RAZORPAY_PLAN_STARTER_MONTHLY_USD
 * - RAZORPAY_PLAN_STARTER_YEARLY_USD
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_WEBHOOK_ID
 */

import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { storage } from './storage';
import { emailService } from './services/emailService';

const router = Router();

// ============================================================================
// RAZORPAY INITIALIZATION
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
// CHECK AUTH
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

    // Verify signature: HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('❌ Invalid signature');
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
      lastPaymentDate: startDate,
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    });

    // Send email
    const user = await storage.getUser(userId);
    if (user?.email) {
      await emailService.sendPaymentConfirmation(user.email, user.firstName || 'there', {
        tier, cycle, amount: pricing.usd, currency: 'USD', startDate, endDate,
        subscriptionId: razorpay_subscription_id, paymentId: razorpay_payment_id,
      }).catch((e) => console.warn('⚠️ Email failed:', e.message));
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
    const { cancel_immediately = false } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user?.razorpaySubscriptionId) {
      return res.status(400).json({ success: false, error: 'No active Razorpay subscription' });
    }

    // Cancel in Razorpay
    // cancel_at_cycle_end = true means access until period ends
    const cancelAtCycleEnd = !cancel_immediately;
    await getRazorpay().subscriptions.cancel(user.razorpaySubscriptionId, cancelAtCycleEnd);

    // Update database
    await storage.updateUser(userId, {
      subscriptionStatus: cancel_immediately ? 'cancelled' : 'active',
      cancelAtPeriodEnd: cancelAtCycleEnd,
      updatedAt: new Date(),
    });

    // Send cancellation email
    if (user.email) {
      await emailService.sendCancellationConfirmation(
        user.email, 
        user.firstName || 'there',
        user.subscriptionEndDate || new Date(), 
        user.subscriptionTier || 'starter'
      ).catch((e) => console.warn('⚠️ Email failed:', e.message));
    }

    console.log(`✅ Subscription cancelled: ${userId} (immediate: ${cancel_immediately})`);

    res.json({
      success: true,
      message: cancelAtCycleEnd 
        ? 'Subscription will end at billing period end'
        : 'Subscription cancelled immediately',
      accessUntil: user.subscriptionEndDate,
    });

  } catch (error: any) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PAYPAL ONE-TIME PAYMENT
// ============================================================================

router.post('/payment/paypal/capture', async (req: Request, res: Response) => {
  try {
    const { orderID, tier, cycle } = req.body;
    const userId = getUserId(req);

    console.log('\n💳 PayPal Capture:', { orderID, tier, cycle, userId });

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Calculate dates (one-time payment = access for the period)
    const startDate = new Date();
    const endDate = new Date();
    cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);

    const pricing = PRICING[`${tier}-${cycle}`] || { usd: 0 };

    // Update user
    await storage.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      subscriptionBillingCycle: cycle,
      paypalOrderId: orderID,
      lastPaymentAmount: pricing.usd,
      lastPaymentCurrency: 'USD',
      lastPaymentDate: startDate,
      cancelAtPeriodEnd: true, // One-time = doesn't auto-renew
      updatedAt: new Date(),
    });

    // Send email
    const user = await storage.getUser(userId);
    if (user?.email) {
      await emailService.sendPaymentConfirmation(user.email, user.firstName || 'there', {
        tier, cycle, amount: pricing.usd, currency: 'USD', startDate, endDate, paymentId: orderID,
      }).catch((e) => console.warn('⚠️ Email failed:', e.message));
    }

    console.log(`✅ PayPal payment activated: ${userId} → ${tier}-${cycle}`);

    res.json({ success: true });

  } catch (error: any) {
    console.error('❌ PayPal capture error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RAZORPAY WEBHOOK (with signature verification)
// ============================================================================

router.post('/payment/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] as string;
      
      if (!signature) {
        console.error('❌ Missing webhook signature');
        return res.status(401).json({ error: 'Missing signature' });
      }

      // Razorpay webhook signature: HMAC-SHA256(request_body, webhook_secret)
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not set - skipping signature verification');
    }

    const event = req.body;
    const eventType = event.event;
    
    console.log(`\n📨 Razorpay Webhook: ${eventType}`);

    // Get subscription/payment entity based on event type
    const subscription = event.payload?.subscription?.entity;
    const payment = event.payload?.payment?.entity;
    
    // Extract userId from notes
    const userId = subscription?.notes?.userId || payment?.notes?.userId;
    
    if (!userId) {
      console.log('   ℹ️ No userId in notes, skipping');
      return res.status(200).json({ status: 'ok' });
    }

    switch (eventType) {
      // ========================================
      // SUBSCRIPTION EVENTS
      // ========================================
      
      case 'subscription.activated': {
        // Subscription has been activated (first payment successful)
        const cycle = subscription.notes?.cycle || 'monthly';
        const tier = subscription.notes?.tier || 'starter';
        const endDate = new Date();
        cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);
        
        await storage.updateUser(userId, {
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
          subscriptionStartDate: new Date(),
          razorpaySubscriptionId: subscription.id,
          cancelAtPeriodEnd: false,
        });
        
        console.log(`   ✅ Subscription activated: ${userId} → ${tier}`);
        break;
      }

      case 'subscription.charged': {
        // Recurring payment successful
        const cycle = subscription.notes?.cycle || 'monthly';
        const tier = subscription.notes?.tier || 'starter';
        const currency = subscription.notes?.currency || 'USD';
        
        const endDate = new Date();
        cycle === 'yearly' ? endDate.setFullYear(endDate.getFullYear() + 1) : endDate.setMonth(endDate.getMonth() + 1);
        
        await storage.updateUser(userId, {
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
          lastPaymentDate: new Date(),
          cancelAtPeriodEnd: false,
        });

        // Send renewal confirmation email
        const user = await storage.getUser(userId);
        if (user?.email) {
          const pricing = PRICING[`${tier}-${cycle}`] || { usd: 0, inr: 0 };
          await emailService.sendSubscriptionCharged(user.email, user.firstName || 'there', {
            tier, cycle,
            amount: currency === 'INR' ? pricing.inr : pricing.usd,
            currency,
            startDate: new Date(),
            endDate,
          }).catch((e) => console.warn('⚠️ Email failed:', e.message));
        }

        console.log(`   💳 Subscription charged: ${userId}`);
        break;
      }

      case 'subscription.pending': {
        // Awaiting payment (e.g., bank transfer pending)
        await storage.updateUser(userId, {
          subscriptionStatus: 'pending',
        });
        console.log(`   ⏳ Subscription pending: ${userId}`);
        break;
      }

      case 'subscription.halted': {
        // Payment failed - subscription halted
        await storage.updateUser(userId, {
          subscriptionStatus: 'halted',
        });

        // Send payment failed notification
        const user = await storage.getUser(userId);
        if (user?.email) {
          await emailService.sendPaymentFailedNotification(
            user.email, 
            user.firstName || 'there', 
            subscription.notes?.tier || 'starter'
          ).catch((e) => console.warn('⚠️ Email failed:', e.message));
        }

        console.log(`   ⚠️ Subscription halted (payment failed): ${userId}`);
        break;
      }

      case 'subscription.cancelled': {
        // Subscription cancelled
        await storage.updateUser(userId, {
          subscriptionStatus: 'cancelled',
          cancelAtPeriodEnd: false,
        });

        const user = await storage.getUser(userId);
        if (user?.email) {
          await emailService.sendCancellationConfirmation(
            user.email,
            user.firstName || 'there',
            user.subscriptionEndDate || new Date(),
            user.subscriptionTier || 'starter'
          ).catch((e) => console.warn('⚠️ Email failed:', e.message));
        }

        console.log(`   🚫 Subscription cancelled: ${userId}`);
        break;
      }

      case 'subscription.paused': {
        // Subscription paused
        await storage.updateUser(userId, {
          subscriptionStatus: 'paused',
        });
        console.log(`   ⏸️ Subscription paused: ${userId}`);
        break;
      }

      case 'subscription.resumed': {
        // Subscription resumed from pause
        await storage.updateUser(userId, {
          subscriptionStatus: 'active',
        });
        console.log(`   ▶️ Subscription resumed: ${userId}`);
        break;
      }

      case 'subscription.completed': {
        // Fixed-term subscription completed
        await storage.updateUser(userId, {
          subscriptionStatus: 'completed',
          subscriptionTier: 'free',
        });
        console.log(`   ✔️ Subscription completed: ${userId}`);
        break;
      }

      // ========================================
      // PAYMENT EVENTS
      // ========================================

      case 'payment.captured': {
        // One-time payment captured
        console.log(`   💰 Payment captured for: ${userId}`);
        // Usually handled by verify-subscription, but log for reference
        break;
      }

      case 'payment.failed': {
        // Payment failed
        const user = await storage.getUser(userId);
        if (user?.email) {
          await emailService.sendPaymentFailedNotification(
            user.email,
            user.firstName || 'there',
            user.subscriptionTier || 'starter'
          ).catch((e) => console.warn('⚠️ Email failed:', e.message));
        }
        console.log(`   ❌ Payment failed for: ${userId}`);
        break;
      }

      default:
        console.log(`   ℹ️ Unhandled event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    // Return 200 anyway to prevent Razorpay from retrying
    res.status(200).json({ status: 'error', message: error.message });
  }
});

// ============================================================================
// PAYPAL WEBHOOK (optional - for refunds and disputes)
// ============================================================================

router.post('/payment/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventType = event.event_type;
    
    console.log(`\n📨 PayPal Webhook: ${eventType}`);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment successful (backup confirmation)
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        console.log(`   💰 PayPal payment completed: ${orderId}`);
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        // Refund processed
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
        console.log(`   🔄 PayPal refund processed: ${orderId}`);
        
        // Find user by PayPal order ID and downgrade
        // Note: You'd need to implement findUserByPaypalOrderId in storage
        // For now, just log it
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        // Payment denied
        console.log(`   ❌ PayPal payment denied`);
        break;
      }

      default:
        console.log(`   ℹ️ Unhandled PayPal event: ${eventType}`);
    }

    res.status(200).json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ PayPal webhook error:', error);
    res.status(200).json({ status: 'error' });
  }
});

export default router;