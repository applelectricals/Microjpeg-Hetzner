/**
 * PayPal Payment Integration Component
 * Handles both subscriptions (Web/CDN) and one-time payments (API packages)
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// PayPal Plan IDs from environment - FIXED: Use import.meta.env instead of process.env
const PAYPAL_PLANS = {
  'starter-monthly': import.meta.env.VITE_PAYPAL_PLAN_STARTER_MONTHLY || '',
  'starter-yearly': import.meta.env.VITE_PAYPAL_PLAN_STARTER_YEARLY || '',
  'pro-monthly': import.meta.env.VITE_PAYPAL_PLAN_PRO_MONTHLY || '',
  'pro-yearly': import.meta.env.VITE_PAYPAL_PLAN_PRO_YEARLY || '',
  'business-monthly': import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_MONTHLY || '',
  'business-yearly': import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_YEARLY || '',
  'cdn-starter': import.meta.env.VITE_PAYPAL_PLAN_CDN_STARTER || '',
  'cdn-business': import.meta.env.VITE_PAYPAL_PLAN_CDN_BUSINESS || '',
  'cdn-enterprise': import.meta.env.VITE_PAYPAL_PLAN_CDN_ENTERPRISE || '',
};

// Debug log on load
console.log('🔍 PayPal Plans Configuration:');
console.log('  Available plans:', Object.keys(PAYPAL_PLANS));
console.log('  Configured plans:', Object.entries(PAYPAL_PLANS).filter(([_, id]) => id).map(([key]) => key));
console.log('  Missing plans:', Object.entries(PAYPAL_PLANS).filter(([_, id]) => !id).map(([key]) => key));

interface PayPalButtonProps {
  planId: string; // e.g., 'starter-monthly', 'pro-yearly'
  planName: string; // Display name
  amount: number; // Price in USD
  type: 'subscription' | 'onetime'; // Payment type
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  children?: React.ReactNode;
}

export function PayPalPaymentButton({
  planId,
  planName,
  amount,
  type,
  onSuccess,
  onError,
  disabled,
  variant = 'default',
  children
}: PayPalButtonProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    if (document.getElementById('paypal-sdk')) {
      setPaypalLoaded(true);
      return;
    }

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error('❌ VITE_PAYPAL_CLIENT_ID is not set!');
      toast({
        title: 'Configuration Error',
        description: 'PayPal Client ID is missing. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ PayPal Client ID found:', clientId.substring(0, 10) + '...');

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=${type === 'subscription' ? 'subscription' : 'capture'}`;
    script.async = true;
    script.onload = () => {
      console.log('✅ PayPal SDK loaded successfully');
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load PayPal SDK');
      toast({
        title: 'Payment Error',
        description: 'Failed to load payment system. Please refresh the page.',
        variant: 'destructive'
      });
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [type, toast]);

  const handlePayment = async () => {
    console.log('🔍 Payment initiated:', { planId, planName, amount, type });

    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to subscribe',
        variant: 'destructive'
      });
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (!paypalLoaded) {
      toast({
        title: 'Please Wait',
        description: 'Payment system is loading...',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'subscription') {
        await handleSubscription();
      } else {
        await handleOneTimePayment();
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscription = async () => {
    console.log('🔍 Looking up PayPal Plan ID for:', planId);
    console.log('🔍 Available plans:', Object.keys(PAYPAL_PLANS));
    
    const paypalPlanId = PAYPAL_PLANS[planId as keyof typeof PAYPAL_PLANS];
    
    console.log('🔍 Found Plan ID:', paypalPlanId || 'NOT FOUND');
    
    if (!paypalPlanId) {
      console.error('❌ Plan ID not configured:', planId);
      console.error('Available plan IDs:', Object.entries(PAYPAL_PLANS).filter(([_, id]) => id));
      throw new Error(`PayPal plan ID not configured for ${planId}. Please check environment variables.`);
    }

    console.log('✅ Using PayPal Plan ID:', paypalPlanId);

    // @ts-ignore - PayPal SDK types
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // @ts-ignore - PayPal SDK types
    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function(data: any, actions: any) {
        console.log('📝 Creating subscription with plan:', paypalPlanId);
        return actions.subscription.create({
          plan_id: paypalPlanId,
          application_context: {
            brand_name: 'MicroJPEG',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${window.location.origin}/payment-success?plan=${planId}`,
            cancel_url: `${window.location.origin}/pricing?cancelled=true`
          }
        });
      },
      onApprove: async function(data: any, actions: any) {
        console.log('✅ PayPal subscription approved:', data.subscriptionID);
        
        // Send subscription ID to backend
        try {
          const response = await fetch('/api/payment/paypal/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              plan: planId,
              paypal_subscription_id: data.subscriptionID,
              billing: {
                name: user?.email || '',
                email: user?.email || ''
              }
            })
          });

          const result = await response.json();

          if (result.success) {
            toast({
              title: '🎉 Subscription Activated!',
              description: `Welcome to ${planName}!`,
            });
            onSuccess?.();
            
            // Redirect to success page
            window.location.href = `/payment-success?plan=${planId}&subscription_id=${data.subscriptionID}`;
          } else {
            throw new Error(result.error || 'Failed to activate subscription');
          }
        } catch (error: any) {
          console.error('❌ Backend subscription activation failed:', error);
          toast({
            title: 'Activation Failed',
            description: 'Payment received but subscription activation failed. Please contact support.',
            variant: 'destructive'
          });
        }
      },
      onError: function(err: any) {
        console.error('❌ PayPal error:', err);
        toast({
          title: 'Payment Error',
          description: 'Payment failed. Please try again.',
          variant: 'destructive'
        });
        onError?.(err.message);
      },
      onCancel: function(data: any) {
        console.log('⚠️ PayPal payment cancelled:', data);
        toast({
          title: 'Payment Cancelled',
          description: 'You cancelled the payment.',
        });
      }
    }).render('#paypal-button-container-' + planId);
  };

  const handleOneTimePayment = async () => {
    console.log('💳 Creating one-time payment for:', planName);
    
    // @ts-ignore - PayPal SDK types
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded');
    }

    // @ts-ignore - PayPal SDK types
    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'pay'
      },
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toFixed(2),
              currency_code: 'USD'
            },
            description: planName
          }],
          application_context: {
            brand_name: 'MicroJPEG',
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: async function(data: any, actions: any) {
        const order = await actions.order.capture();
        console.log('✅ PayPal one-time payment captured:', order.id);
        
        // Send order to backend
        try {
          const response = await fetch('/api/payment/paypal/onetime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              plan: planId,
              paypal_order_id: order.id,
              billing: {
                name: user?.email || '',
                email: user?.email || ''
              }
            })
          });

          const result = await response.json();

          if (result.success) {
            toast({
              title: '🎉 Payment Successful!',
              description: `${planName} purchased successfully!`,
            });
            onSuccess?.();
            
            // Redirect to success page
            window.location.href = `/payment-success?plan=${planId}&order_id=${order.id}`;
          } else {
            throw new Error(result.error || 'Failed to process payment');
          }
        } catch (error: any) {
          console.error('❌ Backend payment processing failed:', error);
          toast({
            title: 'Processing Failed',
            description: 'Payment received but processing failed. Please contact support.',
            variant: 'destructive'
          });
        }
      },
      onError: function(err: any) {
        console.error('❌ PayPal error:', err);
        toast({
          title: 'Payment Error',
          description: 'Payment failed. Please try again.',
          variant: 'destructive'
        });
        onError?.(err.message);
      },
      onCancel: function(data: any) {
        console.log('⚠️ PayPal payment cancelled:', data);
        toast({
          title: 'Payment Cancelled',
          description: 'You cancelled the payment.',
        });
      }
    }).render('#paypal-button-container-' + planId);
  };

  return (
    <div>
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        variant={variant}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading Payment...
          </>
        ) : (
          children || 'Subscribe Now'
        )}
      </Button>
      
      {/* PayPal button container (hidden, used by SDK) */}
      <div id={`paypal-button-container-${planId}`} className="hidden"></div>
    </div>
  );
}

// Simplified wrapper for pricing cards
export function SubscribeButton({
  planId,
  planName,
  amount,
  variant,
  children
}: {
  planId: string;
  planName: string;
  amount: number;
  variant?: 'default' | 'outline';
  children: React.ReactNode;
}) {
  return (
    <PayPalPaymentButton
      planId={planId}
      planName={planName}
      amount={amount}
      type="subscription"
      variant={variant}
    >
      {children}
    </PayPalPaymentButton>
  );
}

export function BuyPackageButton({
  planId,
  planName,
  amount,
  children
}: {
  planId: string;
  planName: string;
  amount: number;
  children: React.ReactNode;
}) {
  return (
    <PayPalPaymentButton
      planId={planId}
      planName={planName}
      amount={amount}
      type="onetime"
    >
      {children}
    </PayPalPaymentButton>
  );
}
