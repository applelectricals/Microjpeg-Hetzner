import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../../services/emailService';

/**
 * Razorpay Payment Handler
 * Handles payment creation, verification, and order management for Indian customers
 */

// Initialize Razorpay instance
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log('✅ Razorpay initialized');
  }
  return razorpayInstance;
}

/**
 * Create Razorpay Order
 * Called when user clicks "Pay with Razorpay"
 */
export async function createRazorpayOrder(req: Request, res: Response) {
  try {
    const { plan, quantity, amount } = req.body;
    const user = (req as any).user; // Assuming auth middleware sets this

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('📦 Creating Razorpay order:', { plan, quantity, amount });

    const razorpay = getRazorpay();

    // Create order
    const orderOptions = {
      amount: amount * 100, // Amount in paise (₹1 = 100 paise)
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        plan,
        quantity: quantity.toString(),
        userId: user.id,
        userEmail: user.email,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    console.log('✅ Razorpay order created:', order.id);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order',
      message: error.message 
    });
  }
}

/**
 * Verify Razorpay Payment
 * Called after user completes payment in Razorpay popup
 */
export async function verifyRazorpayPayment(req: Request, res: Response) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      quantity,
    } = req.body;

    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('🔐 Verifying Razorpay payment:', razorpay_payment_id);

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('❌ Invalid Razorpay signature');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid payment signature' 
      });
    }

    console.log('✅ Payment signature verified');

    // Parse plan details
    const [tier, cycle] = plan.split('-');
    const duration = cycle === 'monthly' ? 30 : 365;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user subscription in database
    await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionBillingCycle: cycle,
        paypalOrderId: razorpay_payment_id, // Store Razorpay payment ID here
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ User subscription updated:', user.email);

    // Send confirmation email
    const planPrices = {
      'starter-monthly': 9,
      'starter-yearly': 49,
      'pro-monthly': 19,
      'pro-yearly': 149,
      'business-monthly': 49,
      'business-yearly': 349,
    };

    const amount = planPrices[plan as keyof typeof planPrices] || 9;

    await emailService.sendPaymentConfirmation(
      user.email,
      user.firstName || user.email,
      tier,
      amount,
      duration
    );

    console.log('✅ Confirmation email sent to:', user.email);

    res.json({ 
      success: true,
      message: 'Payment verified and subscription activated' 
    });

  } catch (error: any) {
    console.error('❌ Razorpay verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment verification failed',
      message: error.message 
    });
  }
}

/**
 * Get payment details (optional - for checking payment status)
 */
export async function getRazorpayPaymentDetails(req: Request, res: Response) {
  try {
    const { payment_id } = req.params;
    const razorpay = getRazorpay();

    const payment = await razorpay.payments.fetch(payment_id);

    res.json({
      success: true,
      payment,
    });

  } catch (error: any) {
    console.error('❌ Error fetching payment details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch payment details' 
    });
  }
}
