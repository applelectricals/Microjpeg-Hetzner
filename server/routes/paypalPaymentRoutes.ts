/**
 * PayPal Payment Routes - Handle subscription and one-time payments
 * Add these routes to your existing paymentRoutes.ts file
 */

import { Router } from 'express';
import { paypalService } from './paypalService';
import { storage } from './storage';
import { emailService } from './emailService';

const router = Router();

/**
 * POST /api/payment/paypal/subscription
 * Handle PayPal subscription activation after payment
 */
router.post('/payment/paypal/subscription', async (req, res) => {
  try {
    const { plan, paypal_subscription_id, billing } = req.body;
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    console.log('📝 Subscription activation request:', { plan, paypal_subscription_id, userId });

    // Validate session
    if (!userId) {
      console.error('❌ No user session found');
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated. Please log in and try again.' 
      });
    }

    // Validate required fields
    if (!plan || !paypal_subscription_id) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: plan and subscription_id' 
      });
    }

    // Verify subscription with PayPal
    console.log('🔍 Verifying subscription with PayPal...');
    const subscriptionResult = await paypalService.getSubscription(paypal_subscription_id);

    if (!subscriptionResult.success) {
      console.error('❌ PayPal verification failed:', subscriptionResult.error);
      return res.status(400).json({ 
        success: false, 
        error: 'Could not verify subscription with PayPal' 
      });
    }

    const subscription = subscriptionResult.subscription;

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE') {
      console.error('❌ Subscription not active:', subscription.status);
      return res.status(400).json({ 
        success: false, 
        error: `Subscription is not active. Status: ${subscription.status}` 
      });
    }

    console.log('✅ PayPal subscription verified:', subscription.status);

    // Parse plan details
    const [planTier, billingCycle] = plan.split('-');
    
    // Map plan tiers to match your system
    const tierMapping: Record<string, string> = {
      'starter': 'starter',
      'pro': 'pro',
      'business': 'business'
    };

    const mappedTier = tierMapping[planTier.toLowerCase()] || 'starter';

    // Calculate subscription end date
    const endDate = billingCycle === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

    // Get plan pricing
    const planPricing: Record<string, { monthly: number; yearly: number }> = {
      'starter': { monthly: 9, yearly: 49 },
      'pro': { monthly: 19, yearly: 149 },
      'business': { monthly: 49, yearly: 349 }
    };

    const amount = billingCycle === 'monthly' 
      ? planPricing[mappedTier]?.monthly || 9
      : planPricing[mappedTier]?.yearly || 49;

    // Update user in database
    console.log('💾 Updating user in database...');
    await storage.updateUser(userId, {
      subscriptionTier: mappedTier,
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate,
      paypalSubscriptionId: paypal_subscription_id,
      subscriptionBillingCycle: billingCycle,
      subscriptionStartDate: new Date(),
    });

    console.log(`✅ User ${userId} upgraded to ${mappedTier} (${billingCycle})`);

    // Get user details for email
    const user = await storage.getUser(userId);

    // Send confirmation email
    if (user?.email) {
      console.log('📧 Sending confirmation email to:', user.email);
      try {
        await emailService.sendSubscriptionConfirmation(
          user.email,
          user.name || user.email.split('@')[0],
          mappedTier,
          billingCycle,
          amount
        );
        console.log('✅ Confirmation email sent');
      } catch (emailError) {
        console.error('⚠️  Email send failed (non-critical):', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.warn('⚠️  No email address found for user, skipping email');
    }

    // Return success
    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        plan: mappedTier,
        status: 'active',
        billingCycle: billingCycle,
        endDate: endDate.toISOString(),
        amount: amount
      }
    });

  } catch (error) {
    console.error('💥 Subscription activation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to activate subscription. Please contact support.' 
    });
  }
});

/**
 * POST /api/payment/paypal/onetime
 * Handle PayPal one-time payment
 */
router.post('/payment/paypal/onetime', async (req, res) => {
  try {
    const { plan, paypal_order_id, amount, quantity, duration, billing } = req.body;
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    console.log('📝 One-time payment request:', { plan, paypal_order_id, amount, duration, userId });

    // Validate session
    if (!userId) {
      console.error('❌ No user session found');
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated. Please log in and try again.' 
      });
    }

    // Validate required fields
    if (!plan || !paypal_order_id || !amount || !duration) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Verify order with PayPal
    console.log('🔍 Verifying order with PayPal...');
    const orderResult = await paypalService.getOrder(paypal_order_id);

    if (!orderResult.success) {
      console.error('❌ PayPal verification failed:', orderResult.error);
      return res.status(400).json({ 
        success: false, 
        error: 'Could not verify payment with PayPal' 
      });
    }

    const order = orderResult.order;

    // Check if order is completed
    if (order.status !== 'COMPLETED') {
      console.error('❌ Order not completed:', order.status);
      return res.status(400).json({ 
        success: false, 
        error: `Payment not completed. Status: ${order.status}` 
      });
    }

    console.log('✅ PayPal order verified:', order.status);

    // Parse plan details
    const [planTier, billingCycle] = plan.split('-');
    
    const tierMapping: Record<string, string> = {
      'starter': 'starter',
      'pro': 'pro',
      'business': 'business'
    };

    const mappedTier = tierMapping[planTier.toLowerCase()] || 'starter';

    // Calculate end date based on duration
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    // Update user in database
    console.log('💾 Updating user in database...');
    await storage.updateUser(userId, {
      subscriptionTier: mappedTier,
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate,
      paypalOrderId: paypal_order_id,
      subscriptionBillingCycle: 'onetime',
      subscriptionStartDate: new Date(),
    });

    console.log(`✅ User ${userId} upgraded to ${mappedTier} (one-time, ${duration} days)`);

    // Get user details for email
    const user = await storage.getUser(userId);

    // Send confirmation email
    if (user?.email) {
      console.log('📧 Sending confirmation email to:', user.email);
      try {
        await emailService.sendPaymentConfirmation(
          user.email,
          user.name || user.email.split('@')[0],
          mappedTier,
          amount,
          duration
        );
        console.log('✅ Confirmation email sent');
      } catch (emailError) {
        console.error('⚠️  Email send failed (non-critical):', emailError);
      }
    } else {
      console.warn('⚠️  No email address found for user, skipping email');
    }

    // Return success
    res.json({
      success: true,
      message: 'Payment processed successfully',
      subscription: {
        plan: mappedTier,
        status: 'active',
        duration: duration,
        endDate: endDate.toISOString(),
        amount: amount
      }
    });

  } catch (error) {
    console.error('💥 One-time payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process payment. Please contact support.' 
    });
  }
});

export default router;
