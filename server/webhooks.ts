import express from 'express';
import { verifyWebhookSignature } from '../utils/webhookSecurity';
import { updateUserSubscription, resetMonthlyLimits } from '../services/subscriptionService';
import { sendEmail } from '../services/emailService';
import { logWebhookEvent } from '../services/analyticsService';

const router = express.Router();

/**
 * Stripe Webhook Handler
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature, 'stripe');
    
    await logWebhookEvent('stripe', event.type, event.data);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send('Webhook Error');
  }
});

/**
 * Handle Checkout Completed
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;
  
  // Update user subscription
  await updateUserSubscription(userId, {
    stripeSubscriptionId: subscriptionId,
    status: 'active'
  });
  
  // Send welcome email
  await sendEmail(userId, 'subscription-activated', {
    tier: session.metadata.tier
  });
}

/**
 * Handle Subscription Created
 */
async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.metadata.userId;
  const tier = subscription.metadata.tier;
  
  await updateUserSubscription(userId, {
    tier: tier,
    status: 'active',
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    billingCycle: subscription.items.data[0].plan.interval
  });

  // Reset monthly limits for the new billing period
  await resetMonthlyLimits(userId);
}

/**
 * Handle Subscription Updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata.userId;
  const newTier = subscription.metadata.tier;
  
  // Check if tier changed
  const oldSubscription = await getUserSubscription(userId);
  const tierChanged = oldSubscription.tier !== newTier;
  
  await updateUserSubscription(userId, {
    tier: newTier,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });

  if (tierChanged) {
    // Reset limits when tier changes
    await resetMonthlyLimits(userId);
    
    // Send upgrade notification
    await sendEmail(userId, 'subscription-upgraded', {
      oldTier: oldSubscription.tier,
      newTier: newTier
    });
  }
}

/**
 * Handle Subscription Cancelled
 */
async function handleSubscriptionCancelled(subscription: any) {
  const userId = subscription.metadata.userId;
  
  await updateUserSubscription(userId, {
    tier: 'free',
    status: 'cancelled',
    cancelledAt: new Date()
  });
  
  // Send cancellation email
  await sendEmail(userId, 'subscription-cancelled', {
    endDate: new Date(subscription.current_period_end * 1000)
  });
}

/**
 * Handle Payment Succeeded
 */
async function handlePaymentSucceeded(invoice: any) {
  const userId = invoice.customer_metadata?.userId;
  
  if (!userId) return;
  
  // Log successful payment
  await logPayment(userId, {
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    invoiceId: invoice.id,
    status: 'succeeded'
  });
  
  // Reset monthly limits for new billing period
  await resetMonthlyLimits(userId);
  
  // Send payment receipt
  await sendEmail(userId, 'payment-receipt', {
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    invoiceUrl: invoice.hosted_invoice_url
  });
}

/**
 * Handle Payment Failed
 */
async function handlePaymentFailed(invoice: any) {
  const userId = invoice.customer_metadata?.userId;
  
  if (!userId) return;
  
  // Log failed payment
  await logPayment(userId, {
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    invoiceId: invoice.id,
    status: 'failed'
  });
  
  // Send payment failure notification
  await sendEmail(userId, 'payment-failed', {
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    retryDate: new Date(invoice.next_payment_attempt * 1000)
  });
}

/**
 * WordPress Plugin Update Webhook
 * Notifies when a new plugin version is available
 */
router.post('/plugin-update', async (req, res) => {
  const { version, downloadUrl } = req.body;
  
  try {
    // Update plugin version in database
    await updatePluginVersion(version, downloadUrl);
    
    // Notify all active WordPress installations
    await notifyWordPressInstalls(version, downloadUrl);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Plugin update webhook error:', error);
    res.status(500).json({ success: false });
  }
});

/**
 * Usage Alert Webhook
 * Triggers when user approaches their limits
 */
router.post('/usage-alert', async (req, res) => {
  const { userId, limitType, percentage } = req.body;
  
  try {
    if (percentage >= 80) {
      await sendEmail(userId, 'usage-alert', {
        limitType,
        percentage,
        upgradeUrl: `${process.env.FRONTEND_URL}/upgrade`
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Usage alert webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;