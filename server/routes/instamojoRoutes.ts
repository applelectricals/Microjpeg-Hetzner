/**
 * Instamojo Payment Routes
 * Add these to your existing paymentRoutes.ts or create separate file
 */

import { Router } from 'express';
import { instamojoService } from '../instamojoService';
import { storage } from '../storage';
import { emailService } from '../services/emailService';

const router = Router();

/**
 * Create Instamojo payment
 * Called when user clicks "Pay with Instamojo"
 */
router.post('/payment/instamojo/create', async (req, res) => {
  try {
    const { plan, quantity, amount } = req.body;
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Get user details
    const user = await storage.getUser(userId);

    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        error: 'User details not found',
      });
    }

    console.log('📦 Creating Instamojo payment:', { plan, amount, email: user.email });

    // Parse plan details
    const [tier, cycle] = plan.split('-');
    const purpose = `MicroJPEG ${tier.charAt(0).toUpperCase() + tier.slice(1)} - ${cycle === 'monthly' ? 'Monthly' : 'Yearly'}`;

    // Create payment request
    const result = await instamojoService.createPaymentRequest(
      amount,
      purpose,
      user.firstName || user.email,
      user.email,
      user.phone,
      `${process.env.FRONTEND_URL}/payment-success?gateway=instamojo&plan=${plan}`
    );

    if (result.success) {
      // Store payment request details temporarily
      // You might want to save this to database
      console.log('✅ Instamojo payment request created');

      res.json({
        success: true,
        paymentUrl: result.longurl,
        paymentRequestId: result.paymentRequestId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to create payment',
      });
    }
  } catch (error: any) {
    console.error('❌ Instamojo payment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment',
      message: error.message,
    });
  }
});

/**
 * Handle payment success redirect
 * Called when user is redirected back from Instamojo
 */
router.get('/payment/instamojo/success', async (req, res) => {
  try {
    const { payment_id, payment_request_id, plan } = req.query;

    if (!payment_id) {
      return res.redirect('/checkout?error=payment_failed');
    }

    console.log('✅ Payment redirect received:', payment_id);

    // Get payment details from Instamojo
    const result = await instamojoService.getPaymentDetails(payment_id as string);

    if (!result.success || !result.payment) {
      return res.redirect('/checkout?error=payment_verification_failed');
    }

    const payment = result.payment;

    // Check payment status
    if (payment.status !== 'Credit') {
      console.error('❌ Payment not successful:', payment.status);
      return res.redirect('/checkout?error=payment_failed');
    }

    console.log('✅ Payment verified:', payment_id);

    // Get user from session
    const sessionData = req.session as any;
    const userId = sessionData?.userId;

    if (!userId) {
      console.error('❌ User not authenticated');
      return res.redirect('/checkout?error=authentication_failed');
    }

    // Parse plan details
    const planStr = (plan as string) || 'starter-monthly';
    const [tier, cycle] = planStr.split('-');
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
      paypalOrderId: payment_id as string, // Store Instamojo payment ID
      updatedAt: new Date(),
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

      const amount = planPrices[planStr as keyof typeof planPrices] || 9;

      try {
        await emailService.sendPaymentConfirmation(
          user.email,
          user.firstName || user.email,
          tier,
          amount,
          duration
        );
        console.log('✅ Confirmation email sent');
      } catch (emailError) {
        console.error('⚠️  Email sending failed:', emailError);
      }
    }

    // Redirect to success page
    res.redirect(`/payment-success?plan=${planStr}&payment_id=${payment_id}&gateway=instamojo`);

  } catch (error) {
    console.error('❌ Payment success handler error:', error);
    res.redirect('/checkout?error=payment_processing_failed');
  }
});

/**
 * Webhook handler (for future implementation)
 */
router.post('/payment/instamojo/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-mac'] as string;
    
    // Verify webhook signature
    const isValid = instamojoService.verifyWebhookSignature(req.body, signature);

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('✅ Webhook received:', req.body);

    // Handle different webhook events
    const { payment_id, status } = req.body;

    if (status === 'Credit') {
      console.log('✅ Payment completed via webhook:', payment_id);
      // Additional processing if needed
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
