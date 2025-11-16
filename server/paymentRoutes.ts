/**
 * Payment Routes - Updated with improved Razorpay implementation
 * 
 * CHANGES MADE:
 * 1. Improved Razorpay create-order route
 * 2. Enhanced verification with proper database updates
 * 3. Added email notifications
 * 4. Better error handling
 */

import { Router } from 'express';
import { razorpayService } from './razorpayService';
import { paypalService } from './paypalService';
import { determinePaymentGateway, getPlanPricing } from './paymentRouting';
import { storage } from './storage';
import { emailService } from './services/emailService'; // Add this import

const router = Router();

// Payment routing endpoint
router.post('/payment/routing', async (req, res) => {
  try {
    const { plan, userLocation, userEmail } = req.body;
    
    const routing = determinePaymentGateway(undefined, undefined, userLocation);
    const pricing = getPlanPricing(plan, routing.currency);
    
    if (!pricing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid plan or pricing not found' 
      });
    }

    let paypalPlanId = '';
    
    if (routing.gateway === 'paypal') {
      const planMapping = {
        pro: process.env.PAYPAL_PRO_PLAN_ID || 'P-1234567890',
        enterprise: process.env.PAYPAL_ENTERPRISE_PLAN_ID || 'P-0987654321'
      };
      paypalPlanId = planMapping[plan as keyof typeof planMapping] || '';
    }

    res.json({
      success: true,
      gateway: routing.gateway,
      currency: routing.currency,
      pricing,
      paypalPlanId,
      reason: routing.reason
    });
  } catch (error) {
    console.error('Payment routing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment routing failed' 
    });
  }
});

// ========================================
// RAZORPAY ROUTES (UPDATED)
// ========================================

router.post('/payment/razorpay/create-order', async (req, res) => {
  try {
    const { plan, quantity, amount } = req.body;
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    console.log(`📦 Creating Razorpay order:`, { plan, amount, quantity, userId });
    
    // Create order with Razorpay
    const result = await razorpayService.createOrder(
      amount, 
      'INR', // Always INR for Razorpay
      `receipt_${userId}_${Date.now()}`
    );
    
    if (result.success) {
      console.log('✅ Razorpay order created:', result.orderId);
      
      res.json({
        success: true,
        order_id: result.orderId,
        amount: result.amount,
        currency: result.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    } else {
      console.error('❌ Razorpay order creation failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to create order'
      });
    }
  } catch (error: any) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

router.post('/payment/razorpay/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan,
      quantity 
    } = req.body;
    
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    console.log('🔐 Verifying Razorpay payment:', razorpay_payment_id);
    
    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isValid) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    console.log('✅ Payment signature verified');

    // Parse plan details
    const [tier, cycle] = plan.split('-');
    const duration = cycle === 'monthly' ? 30 : 365;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user subscription
    await storage.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      subscriptionBillingCycle: cycle,
      paypalOrderId: razorpay_payment_id, // Store Razorpay payment ID
      updatedAt: new Date()
    });

    console.log('✅ User subscription updated:', userId);

    // Get user details for email
    const user = await storage.getUser(userId);

    // Send confirmation email
    if (user && user.email) {
      const planPrices = {
        'starter-monthly': 9,
        'starter-yearly': 49,
        'pro-monthly': 19,
        'pro-yearly': 149,
        'business-monthly': 49,
        'business-yearly': 349,
      };

      const amount = planPrices[plan as keyof typeof planPrices] || 9;

      try {
        await emailService.sendPaymentConfirmation(
          user.email,
          user.firstName || user.email,
          tier,
          amount,
          duration
        );
        console.log('✅ Confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('⚠️  Email sending failed:', emailError);
        // Don't fail the payment if email fails
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Payment verified and subscription activated',
      paymentId: razorpay_payment_id
    });

  } catch (error: any) {
    console.error('❌ Razorpay verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment verification failed',
      message: error.message 
    });
  }
});

// ========================================
// PAYPAL ROUTES (Keep existing)
// ========================================

router.get('/payment/paypal/subscription-success', async (req, res) => {
  try {
    const { subscription_id, plan_id } = req.query;
    
    const sessionData = req.session as any;
    if (!subscription_id || !sessionData.userId) {
      return res.redirect('/simple-pricing?error=missing_subscription');
    }
    
    console.log('PayPal subscription redirect:', { subscription_id, plan_id });
    
    const result = await paypalService.getSubscription(subscription_id as string);
    
    if (result.success && result.subscription.status === 'ACTIVE') {
      console.log('PayPal subscription verified as ACTIVE:', result.subscription);
      
      const plan = result.subscription.plan_id?.includes('test') ? 'test_premium' :
                   result.subscription.plan_id?.includes('enterprise') ? 'enterprise' : 'premium';
      
      const planPrices = {
        'test_premium': 1.00,
        'premium': 29.00,
        'enterprise': 99.00
      };
      
      const subscriptionEndDate = plan === 'test_premium' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await storage.updateUser(sessionData.userId, {
        subscriptionTier: plan,
        subscriptionStatus: 'active',
        subscriptionEndDate: subscriptionEndDate,
        stripeSubscriptionId: subscription_id as string
      });
      
      const amount = planPrices[plan as keyof typeof planPrices];
      const planDisplayName = plan.replace('_', '-');
      
      console.log('Subscription activated successfully for user:', sessionData.userId);
      
      res.redirect(`/subscription-success?plan=${planDisplayName}&amount=${amount}&paypal_subscription_id=${subscription_id}`);
    } else {
      console.error('PayPal subscription verification failed:', result);
      res.redirect('/simple-pricing?error=payment_verification_failed');
    }
  } catch (error) {
    console.error('PayPal subscription verification error:', error);
    res.redirect('/simple-pricing?error=payment_processing_failed');
  }
});

router.post('/payment/paypal/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const result = await paypalService.cancelSubscription(subscriptionId);
    
    if (result.success) {
      const sessionData = req.session as any;
      if (sessionData.userId) {
        await storage.updateUser(sessionData.userId, {
          subscriptionStatus: 'cancelled'
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Subscription cancelled successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Subscription cancellation failed' 
    });
  }
});

// ========================================
// WEBHOOKS (Keep existing)
// ========================================

router.post('/payment/razorpay/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity.id);
        break;
      case 'subscription.activated':
        console.log('Subscription activated:', event.payload.subscription.entity.id);
        break;
      case 'subscription.cancelled':
        console.log('Subscription cancelled:', event.payload.subscription.entity.id);
        break;
      default:
        console.log('Unhandled Razorpay event:', event.event);
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.post('/payment/paypal/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('PayPal subscription activated:', event.resource.id);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('PayPal subscription cancelled:', event.resource.id);
        break;
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        console.log('PayPal payment failed:', event.resource.id);
        break;
      default:
        console.log('Unhandled PayPal event:', event.event_type);
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
