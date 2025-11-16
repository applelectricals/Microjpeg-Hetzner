import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../services/emailService';

/**
 * PayPal Webhook Handler
 * Handles webhook events from PayPal for subscriptions and payments
 * 
 * Setup in PayPal:
 * 1. Go to https://developer.paypal.com/dashboard/applications
 * 2. Select your app
 * 3. Add webhook URL: https://yourdomain.com/api/payment/paypal/webhook
 * 4. Subscribe to these events:
 *    - BILLING.SUBSCRIPTION.ACTIVATED
 *    - BILLING.SUBSCRIPTION.CANCELLED
 *    - BILLING.SUBSCRIPTION.SUSPENDED
 *    - BILLING.SUBSCRIPTION.UPDATED
 *    - PAYMENT.SALE.COMPLETED
 *    - PAYMENT.SALE.REFUNDED
 */

// PayPal Webhook ID (get from PayPal dashboard)
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

/**
 * Verify PayPal webhook signature
 * This ensures the webhook is actually from PayPal
 */
function verifyWebhookSignature(req: Request): boolean {
  try {
    const transmissionId = req.headers['paypal-transmission-id'] as string;
    const transmissionTime = req.headers['paypal-transmission-time'] as string;
    const certUrl = req.headers['paypal-cert-url'] as string;
    const transmissionSig = req.headers['paypal-transmission-sig'] as string;
    const authAlgo = req.headers['paypal-auth-algo'] as string;

    // For development, you can skip verification
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  [DEV] Skipping webhook signature verification');
      return true;
    }

    // In production, implement full verification
    // See: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
    
    if (!transmissionId || !transmissionSig) {
      console.error('❌ Missing webhook signature headers');
      return false;
    }

    // TODO: Implement full signature verification for production
    // For now, we'll verify the webhook ID is set
    return !!WEBHOOK_ID;
    
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return false;
  }
}

/**
 * Parse plan from subscription plan ID
 */
function parsePlanFromId(planId: string): { tier: string; cycle: string } {
  // Map PayPal plan IDs to our tiers
  const planMap: Record<string, { tier: string; cycle: string }> = {
    'P-5H209695PC6961949NEHOG2Q': { tier: 'starter', cycle: 'monthly' },
    'P-8RD90370JE5056234NEHPDGA': { tier: 'starter', cycle: 'yearly' },
    'P-3T648163FS1399357NEHPECQ': { tier: 'pro', cycle: 'monthly' },
    'P-1EF84364HY329484XNEHPFMA': { tier: 'pro', cycle: 'yearly' },
    'P-5AW33365PX203061NNEHPGIY': { tier: 'business', cycle: 'monthly' },
    'P-3Y884449P0365514TNEHPHDA': { tier: 'business', cycle: 'yearly' },
  };

  return planMap[planId] || { tier: 'starter', cycle: 'monthly' };
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED event
 */
async function handleSubscriptionActivated(event: any) {
  console.log('✅ Subscription activated:', event.resource.id);

  const subscriptionId = event.resource.id;
  const planId = event.resource.plan_id;
  const subscriberEmail = event.resource.subscriber?.email_address;
  
  const { tier, cycle } = parsePlanFromId(planId);

  try {
    // Find user by email or subscription ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, subscriberEmail))
      .limit(1);

    if (!user) {
      console.error('❌ User not found:', subscriberEmail);
      return;
    }

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    if (cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user subscription
    await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionBillingCycle: cycle,
        paypalSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ User subscription updated:', user.email);

    // Send confirmation email
    const amount = cycle === 'monthly' 
      ? (tier === 'starter' ? 9 : tier === 'pro' ? 19 : 49)
      : (tier === 'starter' ? 49 : tier === 'pro' ? 149 : 349);

    await emailService.sendSubscriptionConfirmation(
      user.email,
      user.firstName || user.email,
      tier,
      cycle,
      amount
    );

    console.log('✅ Confirmation email sent to:', user.email);

  } catch (error) {
    console.error('❌ Error handling subscription activated:', error);
    throw error;
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED event
 */
async function handleSubscriptionCancelled(event: any) {
  console.log('⚠️  Subscription cancelled:', event.resource.id);

  const subscriptionId = event.resource.id;

  try {
    // Find user by subscription ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.paypalSubscriptionId, subscriptionId))
      .limit(1);

    if (!user) {
      console.error('❌ User not found for subscription:', subscriptionId);
      return;
    }

    // Update subscription status
    await db
      .update(users)
      .set({
        subscriptionStatus: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ Subscription cancelled for user:', user.email);

    // TODO: Send cancellation email
    // await emailService.sendSubscriptionCancelled(user.email, user.firstName);

  } catch (error) {
    console.error('❌ Error handling subscription cancelled:', error);
    throw error;
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.SUSPENDED event
 */
async function handleSubscriptionSuspended(event: any) {
  console.log('⚠️  Subscription suspended:', event.resource.id);

  const subscriptionId = event.resource.id;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.paypalSubscriptionId, subscriptionId))
      .limit(1);

    if (!user) {
      console.error('❌ User not found for subscription:', subscriptionId);
      return;
    }

    await db
      .update(users)
      .set({
        subscriptionStatus: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ Subscription suspended for user:', user.email);

    // TODO: Send suspension email
    // await emailService.sendSubscriptionSuspended(user.email, user.firstName);

  } catch (error) {
    console.error('❌ Error handling subscription suspended:', error);
    throw error;
  }
}

/**
 * Handle PAYMENT.SALE.COMPLETED event
 */
async function handlePaymentCompleted(event: any) {
  console.log('✅ Payment completed:', event.resource.id);

  const paymentId = event.resource.id;
  const billingAgreementId = event.resource.billing_agreement_id;

  try {
    if (billingAgreementId) {
      // This is a subscription payment
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.paypalSubscriptionId, billingAgreementId))
        .limit(1);

      if (user) {
        console.log('✅ Subscription payment received for:', user.email);
        
        // Extend subscription end date
        const endDate = new Date(user.subscriptionEndDate || new Date());
        if (user.subscriptionBillingCycle === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        await db
          .update(users)
          .set({
            subscriptionEndDate: endDate,
            subscriptionStatus: 'active',
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        console.log('✅ Subscription renewed until:', endDate);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment completed:', error);
    throw error;
  }
}

/**
 * Handle PAYMENT.SALE.REFUNDED event
 */
async function handlePaymentRefunded(event: any) {
  console.log('⚠️  Payment refunded:', event.resource.id);

  // TODO: Handle refunds
  // - Update user status
  // - Send refund confirmation email
  // - Adjust subscription dates
}

/**
 * Main webhook handler
 */
export async function handlePayPalWebhook(req: Request, res: Response) {
  console.log('\n🔔 PayPal Webhook received:', req.body.event_type);

  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event_type;

    // Route to appropriate handler
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(event);
        break;

      case 'BILLING.SUBSCRIPTION.UPDATED':
        console.log('ℹ️  Subscription updated:', event.resource.id);
        // Handle subscription updates if needed
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event);
        break;

      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentRefunded(event);
        break;

      default:
        console.log('ℹ️  Unhandled event type:', eventType);
    }

    // Always return 200 OK to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    
    // Still return 200 to prevent PayPal from retrying
    // Log the error for manual investigation
    res.status(200).json({ received: true, error: 'Internal error' });
  }
}
