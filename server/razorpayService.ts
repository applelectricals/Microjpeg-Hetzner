/**
 * Razorpay Service
 * Handles Razorpay payment operations
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  private razorpay: Razorpay | null = null;

  /**
   * Initialize Razorpay instance
   */
  private initialize(): Razorpay {
    if (!this.razorpay) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
      }

      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      console.log('✅ Razorpay initialized');
    }

    return this.razorpay;
  }

  /**
   * Create a Razorpay order
   * @param amount Amount in INR (will be converted to paise)
   * @param currency Currency code (default: INR)
   * @param receipt Receipt ID for tracking
   */
  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt?: string
  ): Promise<{
    success: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    error?: string;
  }> {
    try {
      const razorpay = this.initialize();

      const options = {
        amount: Math.round(amount * 100), // Convert to paise (₹1 = 100 paise)
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };

      console.log('📦 Creating Razorpay order:', options);

      const order = await razorpay.orders.create(options);

      console.log('✅ Razorpay order created:', order.id);

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error: any) {
      console.error('❌ Razorpay order creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order',
      };
    }
  }

  /**
   * Verify payment signature
   * This ensures the payment callback is actually from Razorpay
   * @param orderId Razorpay order ID
   * @param paymentId Razorpay payment ID
   * @param signature Razorpay signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keySecret) {
        console.error('❌ Razorpay Key Secret not found');
        return false;
      }

      // Create expected signature
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      // Compare signatures
      const isValid = expectedSignature === signature;

      if (isValid) {
        console.log('✅ Payment signature verified');
      } else {
        console.error('❌ Invalid payment signature');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment details
   * @param paymentId Razorpay payment ID
   */
  async getPayment(paymentId: string): Promise<{
    success: boolean;
    payment?: any;
    error?: string;
  }> {
    try {
      const razorpay = this.initialize();
      const payment = await razorpay.payments.fetch(paymentId);

      return {
        success: true,
        payment,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment',
      };
    }
  }

  /**
   * Capture a payment (for authorized payments)
   * @param paymentId Razorpay payment ID
   * @param amount Amount to capture in paise
   */
  async capturePayment(
    paymentId: string,
    amount: number
  ): Promise<{
    success: boolean;
    payment?: any;
    error?: string;
  }> {
    try {
      const razorpay = this.initialize();
      const payment = await razorpay.payments.capture(
        paymentId,
        amount,
        'INR'
      );

      return {
        success: true,
        payment,
      };
    } catch (error: any) {
      console.error('❌ Failed to capture payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture payment',
      };
    }
  }

  /**
   * Refund a payment
   * @param paymentId Razorpay payment ID
   * @param amount Amount to refund in paise (optional, defaults to full amount)
   */
  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    try {
      const razorpay = this.initialize();
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount,
      });

      return {
        success: true,
        refund,
      };
    } catch (error: any) {
      console.error('❌ Failed to refund payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to refund payment',
      };
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
