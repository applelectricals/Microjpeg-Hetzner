import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Check, Crown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';

// Razorpay Plan Button IDs - ONLY FOR MONTHLY PLANS
const RAZORPAY_PLAN_BUTTONS = {
  starter: 'pl_RlaSYlOEgnhvGu',  // ✅ Starter Monthly USD
  pro: 'pl_YOUR_PRO_MONTHLY_ID',      // Replace when you create Pro plan
  business: 'pl_YOUR_BUSINESS_MONTHLY_ID', // Replace when you create Business plan
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
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

// Convert USD to INR
const convertToINR = (usd: number) => {
  const rate = 83;
  return Math.round(usd * rate);
};

// Razorpay Subscription Button Component - Using dangerouslySetInnerHTML
function RazorpayButton({ planId }: { planId: 'starter' | 'pro' | 'business' }) {
  const buttonId = RAZORPAY_PLAN_BUTTONS[planId];

  if (!buttonId || buttonId.startsWith('pl_YOUR_')) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3 text-center">
        <p className="text-yellow-200 text-xs">
          ⚠️ {planId.toUpperCase()} plan not configured. Create plan in Razorpay Dashboard.
        </p>
      </div>
    );
  }

  // Direct HTML injection - the way Razorpay expects it
  const razorpayHtml = `
    <form>
      <script 
        src="https://cdn.razorpay.com/static/widget/subscription-button.js" 
        data-subscription_button_id="${buttonId}" 
        data-button_theme="brand-color"
        async>
      </script>
    </form>
  `;

  return (
    <div 
      className="min-h-[50px] razorpay-container"
      dangerouslySetInnerHTML={{ __html: razorpayHtml }}
    />
  );
}

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan') || 'pro';
  
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>(
    (preSelectedPlan as keyof typeof PLANS) || 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [onetimeLoaded, setOnetimeLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  const subscriptionRendered = useRef(false);
  const onetimeRendered = useRef(false);

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
      console.log('✅ PayPal Subscription SDK loaded');
      setSubscriptionLoaded(true);
    };
    script.onerror = () => console.error('❌ Failed to load subscription SDK');
    document.body.appendChild(script);
  }, []);

  // Load PayPal SDK for one-time payments
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
      console.log('✅ PayPal One-time SDK loaded');
      setOnetimeLoaded(true);
    };
    script.onerror = () => console.error('❌ Failed to load one-time SDK');
    document.body.appendChild(script);
  }, []);

  // Render PayPal subscription button
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
      console.log('📄 Rendering PayPal subscription button');
      
      // @ts-ignore
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({ plan_id: planId });
        },
        onApprove: async function(data: any) {
          console.log('✅ Subscription approved:', data.subscriptionID);
          setIsProcessing(true);
          setProcessingMessage('Processing your subscription...');
          
          try {
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

            if (!response.ok) throw new Error('Payment processing failed');

            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&subscription_id=${data.subscriptionID}`;
            }, 1000);
            
          } catch (error) {
            console.error('❌ Error:', error);
            setIsProcessing(false);
            alert('Payment processing failed.');
          }
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          setIsProcessing(false);
          alert('Payment failed.');
        }
      }).render(`#${containerId}`).then(() => {
        subscriptionRendered.current = true;
      });
    }

    return () => {
      if (mainContainer) mainContainer.innerHTML = '';
      subscriptionRendered.current = false;
    };
  }, [subscriptionLoaded, selectedPlan, billingCycle, user]);

  // Render PayPal one-time button
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
          setIsProcessing(true);
          setProcessingMessage('Processing payment...');
          
          try {
            const details = await actions.order.capture();
            
            const response = await fetch('/api/payment/paypal/onetime', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                quantity,
                order_id: data.orderID,
                billing: { name: details.payer.name.given_name, email: details.payer.email_address }
              })
            });

            if (!response.ok) throw new Error('Failed');
            
            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&order_id=${data.orderID}`;
            }, 1000);
            
          } catch (error) {
            setIsProcessing(false);
            alert('Payment failed.');
          }
        },
        onError: function(err: any) {
          setIsProcessing(false);
          alert('Payment failed.');
        }
      }).render(`#${containerId}`).then(() => {
        onetimeRendered.current = true;
      });
    }

    return () => {
      if (mainContainer) mainContainer.innerHTML = '';
      onetimeRendered.current = false;
    };
  }, [onetimeLoaded, selectedPlan, billingCycle, quantity, user]);

  // Instamojo Payment Handler
  const handleInstamojoPayment = async () => {
    setIsProcessing(true);
    setProcessingMessage('Redirecting to Instamojo...');

    try {
      const amountINR = convertToINR(currentPrice * quantity);

      const response = await fetch('/api/payment/instamojo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: `${selectedPlan}-${billingCycle}`,
          quantity,
          amount: amountINR,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed');
      }

      window.location.href = data.paymentUrl;

    } catch (error: any) {
      setIsProcessing(false);
      alert('Payment failed.');
    }
  };

  const currentPlan = PLANS[selectedPlan];
  const currentPrice = billingCycle === 'monthly' ? currentPlan.monthly.price : currentPlan.yearly.price;
  const savings = billingCycle === 'yearly' ? (currentPlan.yearly.savings || 0) : 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
            <p className="text-gray-300 mb-4">{processingMessage}</p>
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
                  💰 Save ${savings * quantity}/year
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
                    className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-gray-300 hover:border-teal-500 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-white min-w-[3ch] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-gray-300 hover:border-teal-500"
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
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader><CardTitle className="text-white">Choose Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                
                {/* PayPal Subscription */}
                <div className="border rounded-lg p-4 border-gray-700/50 bg-gray-900/30">
                  <h3 className="font-bold text-white mb-2">PayPal Subscription</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    ✓ Auto-renewal • Cancel anytime
                  </p>
                  <div id="paypal-subscription-container" className="min-h-[50px]"></div>
                  {!subscriptionLoaded && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 border-b-2 border-blue-500 mx-auto animate-spin" />
                    </div>
                  )}
                </div>

                {/* PayPal One-time */}
                <div className="border-2 border-teal-500 rounded-lg p-4 bg-teal-900/20">
                  <h3 className="font-bold text-white mb-2">Pay with Card (One-time)</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    ✓ No auto-renewal • Works worldwide
                  </p>
                  <div id="paypal-onetime-container" className="min-h-[50px]"></div>
                  {!onetimeLoaded && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 border-b-2 border-blue-500 mx-auto animate-spin" />
                    </div>
                  )}
                </div>

                {/* Razorpay - ONLY FOR MONTHLY */}
                {billingCycle === 'monthly' && (
                  <div className="border-2 border-green-500 rounded-lg p-4 bg-green-900/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white">Razorpay Subscription</h3>
                        <p className="text-sm text-gray-400">Monthly auto-renewal</p>
                      </div>
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                        🇮🇳 INDIA
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      ✓ Cards/UPI/NetBanking • Cancel anytime
                    </p>
                    <RazorpayButton planId={selectedPlan} />
                  </div>
                )}

                {/* Instamojo */}
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-900/20">
                  <h3 className="font-bold text-white mb-2">Pay with Instamojo</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    ✓ For India • All payment methods
                  </p>
                  <button
                    onClick={handleInstamojoPayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg disabled:opacity-50"
                  >
                    Pay ₹{convertToINR(totalPrice)} with Instamojo
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