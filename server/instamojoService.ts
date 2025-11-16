/**
 * Instamojo Service
 * Handles Instamojo payment operations for Indian customers
 */

import axios from 'axios';
import crypto from 'crypto';

class InstamojoService {
  private baseUrl: string;
  private apiKey: string;
  private authToken: string;

  constructor() {
    // Use sandbox for testing, live for production
    const isSandbox = process.env.INSTAMOJO_SANDBOX === 'true';
    
    this.baseUrl = isSandbox 
      ? 'https://test.instamojo.com/api/1.1'
      : 'https://www.instamojo.com/api/1.1';
    
    this.apiKey = process.env.INSTAMOJO_API_KEY || '';
    this.authToken = process.env.INSTAMOJO_AUTH_TOKEN || '';

    if (!this.apiKey || !this.authToken) {
      console.warn('⚠️  Instamojo credentials not configured');
    } else {
      console.log('✅ Instamojo initialized:', isSandbox ? 'SANDBOX' : 'LIVE');
    }
  }

  /**
   * Create a payment request
   * @param amount Amount in INR
   * @param purpose Payment description
   * @param buyerName Customer name
   * @param email Customer email
   * @param phone Customer phone (optional)
   * @param redirectUrl URL to redirect after payment
   */
  async createPaymentRequest(
    amount: number,
    purpose: string,
    buyerName: string,
    email: string,
    phone?: string,
    redirectUrl?: string
  ): Promise<{
    success: boolean;
    paymentRequestId?: string;
    longurl?: string;
    error?: string;
  }> {
    try {
      console.log('📦 Creating Instamojo payment request:', { amount, purpose, email });

      const data = new URLSearchParams({
        purpose: purpose,
        amount: amount.toString(),
        buyer_name: buyerName,
        email: email,
        phone: phone || '',
        redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/payment-success`,
        send_email: 'True',
        send_sms: phone ? 'True' : 'False',
        allow_repeated_payments: 'False',
      });

      const response = await axios.post(
        `${this.baseUrl}/payment-requests/`,
        data.toString(),
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ Payment request created:', response.data.payment_request.id);
        
        return {
          success: true,
          paymentRequestId: response.data.payment_request.id,
          longurl: response.data.payment_request.longurl,
        };
      } else {
        console.error('❌ Instamojo API error:', response.data);
        return {
          success: false,
          error: response.data.message || 'Failed to create payment request',
        };
      }
    } catch (error: any) {
      console.error('❌ Instamojo payment request error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create payment request',
      };
    }
  }

  /**
   * Get payment request status
   * @param paymentRequestId Payment request ID
   */
  async getPaymentRequestStatus(paymentRequestId: string): Promise<{
    success: boolean;
    status?: string;
    payment?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment-requests/${paymentRequestId}/`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          status: response.data.payment_request.status,
          payment: response.data.payment_request,
        };
      } else {
        return {
          success: false,
          error: 'Failed to get payment status',
        };
      }
    } catch (error: any) {
      console.error('❌ Error fetching payment status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Failed to get payment status',
      };
    }
  }

  /**
   * Get payment details
   * @param paymentId Payment ID from redirect
   */
  async getPaymentDetails(paymentId: string): Promise<{
    success: boolean;
    payment?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentId}/`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ Payment details retrieved:', paymentId);
        return {
          success: true,
          payment: response.data.payment,
        };
      } else {
        return {
          success: false,
          error: 'Failed to get payment details',
        };
      }
    } catch (error: any) {
      console.error('❌ Error fetching payment details:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Failed to get payment details',
      };
    }
  }

  /**
   * Verify webhook signature (for webhook implementation later)
   * @param body Webhook body
   * @param signature MAC signature from webhook
   */
  verifyWebhookSignature(body: any, signature: string): boolean {
    try {
      const salt = process.env.INSTAMOJO_SALT || '';
      
      if (!salt) {
        console.error('❌ Instamojo salt not configured');
        return false;
      }

      // Sort keys and create string
      const sortedKeys = Object.keys(body).sort();
      const dataString = sortedKeys.map(key => `${key}=${body[key]}`).join('|');
      
      // Create HMAC
      const expectedSignature = crypto
        .createHmac('sha1', salt)
        .update(dataString)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('❌ Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Initiate refund (for future use)
   * @param paymentId Payment ID to refund
   * @param type Refund type (RFD for full, TNR for partial)
   * @param body Refund details
   */
  async initiateRefund(
    paymentId: string,
    type: 'RFD' | 'TNR',
    body?: string
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    try {
      const data = new URLSearchParams({
        payment_id: paymentId,
        type: type,
        body: body || 'Refund requested',
      });

      const response = await axios.post(
        `${this.baseUrl}/refunds/`,
        data.toString(),
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Auth-Token': this.authToken,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ Refund initiated:', response.data.refund.id);
        return {
          success: true,
          refund: response.data.refund,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to initiate refund',
        };
      }
    } catch (error: any) {
      console.error('❌ Refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message || 'Failed to initiate refund',
      };
    }
  }
}

// Export singleton instance
export const instamojoService = new InstamojoService();
