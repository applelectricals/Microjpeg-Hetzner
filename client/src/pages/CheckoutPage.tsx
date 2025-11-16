import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Check, Crown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  return { isDark, setIsDark };
}

const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers',
    monthly: { price: 9, subscriptionPlanId: 'P-5H209695PC6961949NEHOG2Q' },
    yearly: { price: 49, subscriptionPlanId: 'P-8RD90370JE5056234NEHPDGA', savings: 59 },
    features: ['Unlimited compressions', '75MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Standard processing', '1 concurrent upload'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    monthly: { price: 19, subscriptionPlanId: 'P-3T648163FS1399357NEHPECQ' },
    yearly: { price: 149, subscriptionPlanId: 'P-1EF84364HY329484XNEHPFMA', savings: 79 },
    features: ['Unlimited compressions', '150MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Priority processing', '1 concurrent upload'],
    popular: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For teams',
    monthly: { price: 49, subscriptionPlanId: 'P-5AW33365PX203061NNEHPGIY' },
    yearly: { price: 349, subscriptionPlanId: 'P-3Y884449P0365514TNEHPHDA', savings: 239 },
    features: ['Unlimited compressions', '200MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Priority processing', '1 concurrent upload'],
  },
};

const PAYPAL_CLIENT_ID = 'BAA6hsJNpHbcTBMWxqcfbZs22QgzO7knIaUhASkWYLR-u6AtMlYgibBGR9pInXEWV7kartihrWi0wTu9O8';

// ===== RAZORPAY HELPER FUNCTIONS =====
// Convert USD to INR (approximate rate)
const convertToINR = (usd: number) => {
  const rate = 83; // $1 = ₹83 (update as needed)
  return Math.round(usd * rate);
};

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan') || 'pro';
  
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>(
    (preSelectedPlan as keyof typeof PLANS) || 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [onetimeLoaded, setOnetimeLoaded] = useState(false);
  
  // ✅ NEW: Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Use refs to track if buttons are currently rendered
  const subscriptionRendered = useRef(false);
  const onetimeRendered = useRef(false);

  // ===== RAZORPAY PAYMENT HANDLER =====
  const handleRazorpayPayment = async () => {
    console.log('🔄 Initiating Razorpay payment...');

    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Failed to load payment gateway. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Initializing payment...');

    try {
      const amountINR = convertToINR(totalPrice);

      // Create order on backend
      console.log('📦 Creating Razorpay order...');

      const orderResponse = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: `${selectedPlan}-${billingCycle}`,
          quantity,
          amount: amountINR,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      console.log('✅ Order created:', orderData.order_id);

      // Razorpay checkout options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MicroJPEG',
        description: `${currentPlan.name} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        image: '/logo.png', // Your logo URL
        order_id: orderData.order_id,

        // Payment success handler
        handler: async function (response: any) {
          console.log('✅ Payment successful:', response.razorpay_payment_id);

          setProcessingMessage('Verifying payment...');

          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: `${selectedPlan}-${billingCycle}`,
                quantity,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              console.log('✅ Payment verified');
              setProcessingMessage('Redirecting to success page...');

              setTimeout(() => {
                window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&payment_id=${response.razorpay_payment_id}`;
              }, 1000);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('❌ Verification error:', error);
            setIsProcessing(false);
            alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          }
        },

        // Prefill user details
        prefill: {
          name: user?.firstName || user?.email || '',
          email: user?.email || '',
        },

        // Theme customization
        theme: {
          color: '#14b8a6', // Teal color to match your theme
        },

        // Modal settings
        modal: {
          ondismiss: function() {
            console.log('❌ Payment cancelled by user');
            setIsProcessing(false);
          },
          escape: true,
          backdropclose: false,
        },

        // Notes
        notes: {
          plan: `${selectedPlan}-${billingCycle}`,
          quantity: quantity.toString(),
        },
      };

      // @ts-ignore - Razorpay types
      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response.error);
        setIsProcessing(false);
        alert('Payment failed: ' + response.error.description);
      });

      // Open Razorpay checkout
      razorpay.open();
      setIsProcessing(false); // Remove processing overlay as Razorpay modal is shown

    } catch (error: any) {
      console.error('❌ Razorpay payment error:', error);
      setIsProcessing(false);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  // Load PayPal SDK for subscriptions
  useEffect(() => {
    const existingScript = document.getElementById('paypal-subscription-sdk');
    if (existingScript) {
      setSubscriptionLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-subscription-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => {
      console.log('✅ Subscription SDK loaded');
      setSubscriptionLoaded(true);
    };
    script.onerror = () => console.error('❌ Failed to load subscription SDK');
    document.body.appendChild(script);
  }, []);

  // Load separate SDK for one-time payments
  useEffect(() => {
    const existingScript = document.getElementById('paypal-onetime-sdk');
    if (existingScript) {
      setOnetimeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-onetime-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=capture&disable-funding=credit`;
    script.async = true;
    script.onload = () => {
      console.log('✅ One-time SDK loaded');
      setOnetimeLoaded(true);
    };
    script.onerror = () => console.error('❌ Failed to load one-time SDK');
    document.body.appendChild(script);
  }, []);

  // Render subscription button with proper cleanup
  useEffect(() => {
    if (!subscriptionLoaded) return;

    const plan = PLANS[selectedPlan];
    const planId = billingCycle === 'monthly' ? plan.monthly.subscriptionPlanId : plan.yearly.subscriptionPlanId;
    
    const containerId = `paypal-sub-${selectedPlan}-${billingCycle}`;
    const mainContainer = document.getElementById('paypal-subscription-container');
    if (!mainContainer) return;
    
    mainContainer.innerHTML = '';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = containerId;
    mainContainer.appendChild(buttonContainer);
    
    subscriptionRendered.current = false;

    // @ts-ignore
    if (window.paypal && !subscriptionRendered.current) {
      console.log('🔄 Rendering subscription button for:', selectedPlan, billingCycle);
      
      // @ts-ignore
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({ plan_id: planId });
        },
        onApprove: async function(data: any) {
          console.log('✅ Subscription approved:', data.subscriptionID);
          
          // ✅ NEW: Show processing state
          setIsProcessing(true);
          setProcessingMessage('Processing your subscription...');
          
          try {
            // ✅ NEW: Wait for backend response
            const response = await fetch('/api/payment/paypal/subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                paypal_subscription_id: data.subscriptionID,
                billing: { name: user?.email || 'guest', email: user?.email || 'guest' }
              })
            });

            // ✅ NEW: Check response status
            if (!response.ok) {
              throw new Error('Payment processing failed');
            }

            const result = await response.json();
            console.log('✅ Backend processed successfully:', result);

            setProcessingMessage('Redirecting to success page...');
            
            // ✅ NEW: Wait a moment before redirect
            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&subscription_id=${data.subscriptionID}`;
            }, 1000);
            
          } catch (error) {
            console.error('❌ Backend error:', error);
            setIsProcessing(false);
            alert('Payment processing failed. Please contact support.');
          }
        },
        onError: function(err: any) {
          console.error('PayPal subscription error:', err);
          setIsProcessing(false);
          alert('Payment failed. Please try again.');
        }
      }).render(`#${containerId}`).then(() => {
        subscriptionRendered.current = true;
        console.log('✅ Subscription button rendered');
      }).catch((err: any) => {
        console.error('Failed to render subscription button:', err);
      });
    }

    return () => {
      console.log('🧹 Cleaning up subscription button');
      if (mainContainer) {
        mainContainer.innerHTML = '';
      }
      subscriptionRendered.current = false;
    };
  }, [subscriptionLoaded, selectedPlan, billingCycle, user]);

  // Render one-time payment button
  useEffect(() => {
    if (!onetimeLoaded) return;

    const plan = PLANS[selectedPlan];
    const currentPrice = billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price;
    const totalPrice = currentPrice * quantity;
    
    const containerId = `paypal-onetime-${selectedPlan}-${billingCycle}-${quantity}`;
    const mainContainer = document.getElementById('paypal-onetime-container');
    if (!mainContainer) return;
    
    mainContainer.innerHTML = '';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = containerId;
    mainContainer.appendChild(buttonContainer);
    
    onetimeRendered.current = false;

    // @ts-ignore
    if (window.paypal && !onetimeRendered.current) {
      console.log('🔄 Rendering one-time button');
      
      // @ts-ignore
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'pay' },
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalPrice.toString() },
              description: `${plan.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} (${quantity} user${quantity > 1 ? 's' : ''})`
            }]
          });
        },
        onApprove: async function(data: any, actions: any) {
          // ✅ NEW: Show processing state
          setIsProcessing(true);
          setProcessingMessage('Processing your payment...');
          
          try {
            const details = await actions.order.capture();
            console.log('✅ Payment captured:', details);

            setProcessingMessage('Updating your account...');

            // ✅ NEW: Wait for backend response
            const response = await fetch('/api/payment/paypal/onetime', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                quantity,
                order_id: data.orderID,
                billing: { name: details.payer.name.given_name + ' ' + details.payer.name.surname, email: details.payer.email_address }
              })
            });

            // ✅ NEW: Check response status
            if (!response.ok) {
              throw new Error('Payment processing failed');
            }

            const result = await response.json();
            console.log('✅ Backend processed successfully:', result);

            setProcessingMessage('Redirecting to success page...');
            
            // ✅ NEW: Wait a moment before redirect
            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&order_id=${data.orderID}`;
            }, 1000);
            
          } catch (error) {
            console.error('❌ Payment error:', error);
            setIsProcessing(false);
            alert('Payment processing failed. Please contact support.');
          }
        },
        onError: function(err: any) {
          console.error('PayPal one-time error:', err);
          setIsProcessing(false);
          alert('Payment failed. Please try again.');
        }
      }).render(`#${containerId}`).then(() => {
        onetimeRendered.current = true;
        console.log('✅ One-time button rendered');
      }).catch((err: any) => {
        console.error('Failed to render one-time button:', err);
      });
    }

    return () => {
      console.log('🧹 Cleaning up one-time button');
      if (mainContainer) {
        mainContainer.innerHTML = '';
      }
      onetimeRendered.current = false;
    };
  }, [onetimeLoaded, selectedPlan, billingCycle, quantity, user]);

  const currentPlan = PLANS[selectedPlan];
  const currentPrice = billingCycle === 'monthly' ? currentPlan.monthly.price : currentPlan.yearly.price;
  const savings = billingCycle === 'yearly' ? (currentPlan.yearly.savings || 0) : 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      {/* ✅ NEW: Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
            <p className="text-gray-300 mb-4">{processingMessage}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-teal-500 h-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Please do not close this window...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
            Complete Your Subscription
          </h1>
          <p className="text-gray-300">Choose your plan and payment method</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Subscription Type</h2>
            
            <div className="space-y-4 mb-6">
              {Object.entries(PLANS).map(([key, plan]) => (
                <Card
                  key={key}
                  onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                  className={`cursor-pointer transition-all bg-gray-800/50 backdrop-blur-xl ${
                    selectedPlan === key
                      ? 'border-2 border-teal-500 shadow-lg shadow-teal-500/50'
                      : 'border border-gray-700/50 hover:border-teal-500/50'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === key ? 'border-teal-500 bg-teal-500' : 'border-gray-600'
                      }`}>
                        {selectedPlan === key && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{plan.name}</h3>
                          {plan.popular && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-gray-400">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {billingCycle === 'monthly' ? 'per month' : 'per year'}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        ${billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="p-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">${currentPrice} per {currentPlan.name} user</h3>
                  <p className="text-sm text-gray-400">
                    {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      billingCycle === 'yearly' ? 'bg-teal-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 ${
                      billingCycle === 'yearly' ? 'right-1' : 'left-1'
                    } w-4 h-4 bg-white rounded-full transition-all`} />
                  </button>
                  <span className="text-sm font-medium text-white">
                    {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-400 font-medium">
                  💰 Save ${savings * quantity}/year with yearly billing
                </p>
              )}
            </Card>

            <Card className="p-4 bg-gray-800/50 backdrop-blur-xl border-2 border-yellow-500/30 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Number of Users</h3>
                  <p className="text-sm text-gray-400">
                    {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-gray-300 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-white min-w-[3ch] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-gray-300 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>

            <div>
              <h3 className="font-bold mb-3 text-white">What's included:</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Card className="mb-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader><CardTitle className="text-white">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {quantity}x {currentPlan.name} subscription
                    </span>
                    <span className="font-medium text-white">${totalPrice}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    ${currentPrice} × {quantity} user{quantity > 1 ? 's' : ''}
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-green-400">
                      💰 Total savings: ${savings * quantity}/year
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${totalPrice}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Includes sales tax (if applicable)
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader><CardTitle className="text-white">Choose Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                
                {/* PayPal Subscription */}
                <div className="border rounded-lg p-4 border-gray-700/50 bg-gray-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white">PayPal Subscription</h3>
                      <p className="text-sm text-gray-400">
                        Auto-renews {billingCycle === 'monthly' ? 'monthly' : 'yearly'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    ✓ Automatic renewal<br/>
                    ✓ Cancel anytime<br/>
                    ✓ For PayPal accounts
                  </p>
                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-2 mb-3">
                    <p className="text-xs text-yellow-200">
                      ⚠️ Country specific - May not work if paying from India
                    </p>
                  </div>
                  
                  <div id="paypal-subscription-container"></div>
                  
                  {!subscriptionLoaded && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading PayPal...</p>
                    </div>
                  )}
                </div>

                {/* Pay with Card */}
                <div className="border-2 border-teal-500 rounded-lg p-4 bg-teal-900/20 shadow-lg shadow-teal-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white">Pay with Card (One-time)</h3>
                      <p className="text-sm text-gray-400">
                        One-time payment for {billingCycle === 'monthly' ? '1 month' : '1 year'}
                      </p>
                    </div>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">RECOMMENDED</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    ✓ No auto-renewal<br/>
                    ✓ Renew manually<br/>
                    ✓ Works worldwide
                  </p>
                  <div className="bg-green-900/30 border border-green-500/50 rounded p-2 mb-3">
                    <p className="text-xs text-green-200">
                      ✓ Best option for India - Pay with Visa, Mastercard, Amex
                    </p>
                  </div>
                  
                  <div id="paypal-onetime-container"></div>
                  
                  {!onetimeLoaded && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading payment...</p>
                    </div>
                  )}
                </div>

                {/* Razorpay Payment - For Indian Users */}
                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-900/20 shadow-lg shadow-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white">Pay with Cards/UPI (India)</h3>
                      <p className="text-sm text-gray-400">
                        For Indian customers - All payment methods
                      </p>
                    </div>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                      🇮🇳 RECOMMENDED FOR INDIA
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-2">
                    ✓ Credit/Debit Cards (Visa, Mastercard, RuPay)<br/>
                    ✓ UPI (Google Pay, PhonePe, Paytm)<br/>
                    ✓ Net Banking & Wallets
                  </p>

                  <div className="bg-green-900/30 border border-green-500/50 rounded p-2 mb-3">
                    <p className="text-xs text-green-200">
                      ✓ Works perfectly in India - All payment methods supported
                    </p>
                  </div>

                  <button
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay ₹{convertToINR(totalPrice)} with Razorpay
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}

