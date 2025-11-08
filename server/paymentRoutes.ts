/**
 * Updated Payment Routes - PayPal Only (Subscriptions + One-time)
 */
import { Router } from 'express';
import { processPayPalSubscription, processPayPalOneTime, getSubscriptionStatus, cancelSubscription } from './payment';
import { isAuthenticated } from './auth';

const router = Router();

// ==================== PAYPAL SUBSCRIPTION ROUTES ====================

/**
 * POST /api/payment/paypal/subscription
 * Process PayPal subscription after approval
 */
router.post('/paypal/subscription', isAuthenticated, processPayPalSubscription);

/**
 * POST /api/payment/paypal/onetime
 * Process PayPal one-time payment (for API prepaid packages)
 */
router.post('/paypal/onetime', isAuthenticated, processPayPalOneTime);

/**
 * GET /api/payment/subscription/status
 * Get current subscription status
 */
router.get('/subscription/status', isAuthenticated, getSubscriptionStatus);

/**
 * POST /api/payment/subscription/cancel
 * Cancel active subscription
 */
router.post('/subscription/cancel', isAuthenticated, cancelSubscription);

// ==================== PAYPAL WEBHOOKS ====================

/**
 * POST /api/payment/paypal/webhook
 * Handle PayPal webhook events (subscription updates, payments, etc.)
 */
router.post('/paypal/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('PayPal Webhook Event:', event.event_type);
    
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log('✅ Subscription created:', event.resource.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('✅ Subscription activated:', event.resource.id);
        // Update user subscription status
        // TODO: Implement webhook verification and processing
        break;
        
      case 'BILLING.SUBSCRIPTION.UPDATED':
        console.log('ℹ️ Subscription updated:', event.resource.id);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('⚠️ Subscription cancelled:', event.resource.id);
        // Update user subscription to cancelled
        // TODO: Implement cancellation handling
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        console.log('⚠️ Subscription suspended:', event.resource.id);
        // Suspend user access
        break;
        
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        console.log('⚠️ Subscription expired:', event.resource.id);
        // Move user to free plan
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        console.log('💰 Payment completed:', event.resource.id);
        // Payment successful
        break;
        
      case 'PAYMENT.SALE.REFUNDED':
        console.log('💸 Payment refunded:', event.resource.id);
        // Handle refund
        break;
        
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        console.log('❌ Payment failed:', event.resource.id);
        // Send payment failure notification
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

// ==================== SUCCESS/CANCEL REDIRECTS ====================

/**
 * GET /api/payment/success
 * Handle successful payment redirect from PayPal
 */
router.get('/success', async (req, res) => {
  const { subscription_id, order_id, plan } = req.query;
  
  console.log('Payment success redirect:', { subscription_id, order_id, plan });
  
  // Redirect to frontend success page
  res.redirect(`/payment-success?plan=${plan}&subscription_id=${subscription_id || ''}&order_id=${order_id || ''}`);
});

/**
 * GET /api/payment/cancel
 * Handle cancelled payment redirect from PayPal
 */
router.get('/cancel', async (req, res) => {
  console.log('Payment cancelled by user');
  
  // Redirect to pricing page with cancelled message
  res.redirect('/pricing?payment=cancelled');
});

export { router as paymentRouter };
