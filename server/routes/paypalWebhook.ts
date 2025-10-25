import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { subscriptionService } from '../services/SubscriptionService';

const router = Router();

// PayPal sends webhooks here
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('📩 PayPal Webhook:', event.event_type);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(event);
        break;
      
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event);
        break;

      default:
        console.log('Unhandled event:', event.event_type);
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function handleSubscriptionActivated(event: any) {
  const subscription = event.resource;
  const customId = subscription.custom_id; // userId we'll pass
  
  // Determine tier from plan_id
  const planId = subscription.plan_id;
  let tierName = 'starter';
  let billingCycle = 'monthly';

  if (planId === process.env.PAYPAL_PLAN_STARTER_MONTHLY) {
    tierName = 'starter';
    billingCycle = 'monthly';
  } else if (planId === process.env.PAYPAL_PLAN_STARTER_YEARLY) {
    tierName = 'starter';
    billingCycle = 'yearly';
  } else if (planId === process.env.PAYPAL_PLAN_PRO_MONTHLY) {
    tierName = 'pro';
    billingCycle = 'monthly';
  } else if (planId === process.env.PAYPAL_PLAN_PRO_YEARLY) {
    tierName = 'pro';
    billingCycle = 'yearly';
  } else if (planId === process.env.PAYPAL_PLAN_BUSINESS_MONTHLY) {
    tierName = 'business';
    billingCycle = 'monthly';
  } else if (planId === process.env.PAYPAL_PLAN_BUSINESS_YEARLY) {
    tierName = 'business';
    billingCycle = 'yearly';
  }

  await subscriptionService.createSubscription({
    userId: customId,
    tierName,
    paymentProvider: 'paypal',
    providerCustomerId: subscription.subscriber.payer_id,
    providerSubscriptionId: subscription.id,
    billingCycle: billingCycle as 'monthly' | 'yearly',
    amount: parseFloat(subscription.billing_info.last_payment.amount.value),
    periodStart: new Date(subscription.start_time),
    periodEnd: new Date(subscription.billing_info.next_billing_time)
  });

  console.log(`✅ Subscription activated: User ${customId} → ${tierName}`);
}

async function handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.resource.id;
  
  await db.execute(sql`
    UPDATE subscriptions 
    SET status = 'canceled', canceled_at = NOW()
    WHERE provider_subscription_id = ${subscriptionId}
  `);

  await db.execute(sql`
    UPDATE users 
    SET tier = 'free', subscription_status = 'canceled'
    WHERE id = (
      SELECT user_id FROM subscriptions 
      WHERE provider_subscription_id = ${subscriptionId}
    )
  `);

  console.log(`❌ Subscription cancelled: ${subscriptionId}`);
}

async function handleSubscriptionCreated(event: any) {
  console.log('Subscription created:', event.resource.id);
}

async function handleSubscriptionSuspended(event: any) {
  const subscriptionId = event.resource.id;
  
  await db.execute(sql`
    UPDATE subscriptions 
    SET status = 'suspended'
    WHERE provider_subscription_id = ${subscriptionId}
  `);

  console.log(`⏸️ Subscription suspended: ${subscriptionId}`);
}

async function handlePaymentCompleted(event: any) {
  console.log('Payment completed:', event.resource.id);
}

export default router;