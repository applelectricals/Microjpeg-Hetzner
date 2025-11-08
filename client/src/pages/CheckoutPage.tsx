import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Check, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuth } from '@/hooks/useAuth';

// Dark mode hook
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

// Plan configuration
const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers',
    monthly: { price: 9, planId: import.meta.env.VITE_PAYPAL_PLAN_STARTER_MONTHLY },
    yearly: { price: 49, planId: import.meta.env.VITE_PAYPAL_PLAN_STARTER_YEARLY, savings: 59 },
    features: [
      'Unlimited compressions',
      '75MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    monthly: { price: 19, planId: import.meta.env.VITE_PAYPAL_PLAN_PRO_MONTHLY },
    yearly: { price: 149, planId: import.meta.env.VITE_PAYPAL_PLAN_PRO_YEARLY, savings: 79 },
    features: [
      'Unlimited compressions',
      '150MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Priority processing',
      '1 concurrent upload',
    ],
    popular: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For teams',
    monthly: { price: 49, planId: import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_MONTHLY },
    yearly: { price: 349, planId: import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_YEARLY, savings: 239 },
    features: [
      'Unlimited compressions',
      '200MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Priority processing',
      '1 concurrent upload',
    ],
  },
};

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Get query params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan') || 'pro';
  
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>(
    (preSelectedPlan as keyof typeof PLANS) || 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [paypalLoaded, setPaypalLoaded] = useState(false);


  // Load PayPal SDK
  useEffect(() => {
    if (document.getElementById('paypal-sdk')) {
      setPaypalLoaded(true);
      return;
    }

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error('PayPal Client ID not configured');
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => console.error('Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, []);

  // Render PayPal button when plan or cycle changes
  useEffect(() => {
    if (!paypalLoaded) return;

    const plan = PLANS[selectedPlan];
    const planId = billingCycle === 'monthly' ? plan.monthly.planId : plan.yearly.planId;

    if (!planId) {
      console.error('Plan ID not configured for', selectedPlan, billingCycle);
      return;
    }

    console.log('🔍 Rendering PayPal button for plan:', planId);

    // Clear previous button
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    // @ts-ignore - PayPal SDK
    if (window.paypal) {
      // @ts-ignore
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
          height: 55,
        },
        createSubscription: function(data: any, actions: any) {
          // Use PayPal's official subscription creation
          return actions.subscription.create({
            plan_id: planId
          });
        },
        onApprove: async function(data: any, actions: any) {
          console.log('✅ Subscription approved:', data.subscriptionID);
          
          // Send to backend for activation
          try {
            const response = await fetch('/api/payment/paypal/subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                paypal_subscription_id: data.subscriptionID,
                billing: {
                  name: user?.email || '',
                  email: user?.email || ''
                }
              })
            });

            const result = await response.json();

            if (result.success) {
              // Success! Show message and redirect
              alert('Subscription activated successfully!');
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&subscription_id=${data.subscriptionID}`;
            } else {
              throw new Error(result.error || 'Activation failed');
            }
          } catch (error: any) {
            console.error('❌ Backend activation error:', error);
            // Even if backend fails, subscription was created
            alert('Subscription created! Please contact support if you don\'t see it in your account.');
            window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&subscription_id=${data.subscriptionID}`;
          }
        },
        onError: function(err: any) {
          console.error('❌ PayPal error:', err);
          alert('Payment failed. Please try again or contact support.');
        },
        onCancel: function() {
          console.log('⚠️ Payment cancelled by user');
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, selectedPlan, billingCycle, user]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const currentPlan = PLANS[selectedPlan];
  const currentPrice = billingCycle === 'monthly' 
    ? currentPlan.monthly.price 
    : currentPlan.yearly.price;
  const savings = billingCycle === 'yearly' ? currentPlan.yearly.savings : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your plan and billing cycle
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - Plan Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Subscription Type</h2>
            
            {/* Plan Cards */}
            <div className="space-y-4 mb-6">
              {Object.entries(PLANS).map(([key, plan]) => (
                <Card
                  key={key}
                  onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === key
                      ? 'border-2 border-blue-500 dark:border-blue-400 shadow-lg'
                      : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === key 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedPlan === key && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold dark:text-white">{plan.name}</h3>
                          {plan.popular && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {billingCycle === 'monthly' ? 'per month' : 'per year'}
                      </div>
                      <div className="text-2xl font-bold dark:text-white">
                        ${billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Billing Cycle Toggle */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold dark:text-white">
                    ${currentPrice} per {currentPlan.name} user
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors"
                  >
                    <div className={`absolute top-1 ${
                      billingCycle === 'yearly' ? 'right-1' : 'left-1'
                    } w-4 h-4 bg-white rounded-full transition-all`} />
                  </button>
                  <span className="text-sm font-medium dark:text-white">
                    {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
              </div>
              {savings > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  💰 Save ${savings}/year with yearly billing
                </p>
              )}
            </Card>

            {/* Features */}
            <div className="mt-6">
              <h3 className="font-bold mb-3 dark:text-white">What's included:</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE - Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Details */}
                <div className="space-y-3 pb-4 border-b dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      1x {currentPlan.name} subscription
                    </span>
                    <span className="font-medium dark:text-white">${currentPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Includes sales tax (if applicable)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      You'll be a {currentPlan.name} member until
                    </span>
                    <span className="font-medium dark:text-white">
                      {new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
                        .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-xl font-bold pb-4 border-b dark:border-gray-700">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">${currentPrice}</span>
                </div>

                {/* Payment Method */}
                <div className="pb-4 border-b dark:border-gray-700">
                  <p className="text-sm font-medium mb-2 dark:text-white">Payment method</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PayPal</p>
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  By purchasing you agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    terms of use
                  </a>
                  .
                </p>

                {/* PayPal Button */}
                <div id="paypal-button-container" className="mt-4"></div>

                {/* Loading state */}
                {!paypalLoaded && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Loading payment options...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
