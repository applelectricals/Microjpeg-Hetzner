import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Check, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
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

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan') || 'pro';
  
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>(
    (preSelectedPlan as keyof typeof PLANS) || 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [onetimeLoaded, setOnetimeLoaded] = useState(false);

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
    script.onload = () => setSubscriptionLoaded(true);
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
    script.onload = () => setOnetimeLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Render subscription button
  useEffect(() => {
    if (!subscriptionLoaded) return;

    const plan = PLANS[selectedPlan];
    const planId = billingCycle === 'monthly' ? plan.monthly.subscriptionPlanId : plan.yearly.subscriptionPlanId;
    const containerId = 'paypal-subscription-button';
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';

    // @ts-ignore
    if (window.paypal) {
      // @ts-ignore
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({ plan_id: planId });
        },
        onApprove: async function(data: any) {
          try {
            await fetch('/api/payment/paypal/subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                paypal_subscription_id: data.subscriptionID,
                billing: { name: user?.email || 'guest', email: user?.email || 'guest' }
              })
            });
          } catch (e) {}
          window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&subscription_id=${data.subscriptionID}`;
        }
      }).render(`#${containerId}`);
    }

    // Cleanup function
    return () => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
    };
  }, [subscriptionLoaded, selectedPlan, billingCycle, user]);

  // Render one-time button
  useEffect(() => {
    if (!onetimeLoaded) return;

    const plan = PLANS[selectedPlan];
    const price = billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price;
    const containerId = 'paypal-onetime-button';
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';

    // @ts-ignore
    if (window.paypal) {
      // @ts-ignore
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'pay' },
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: price.toFixed(2), currency_code: 'USD' },
              description: `${plan.name} - ${billingCycle === 'monthly' ? '1 Month' : '1 Year'}`
            }]
          });
        },
        onApprove: async function(data: any, actions: any) {
          const order = await actions.order.capture();
          try {
            await fetch('/api/payment/paypal/onetime', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${billingCycle}`,
                paypal_order_id: order.id,
                amount: price,
                duration: billingCycle === 'monthly' ? 30 : 365,
                billing: { name: user?.email || 'guest', email: user?.email || 'guest' }
              })
            });
          } catch (e) {}
          window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&order_id=${order.id}`;
        }
      }).render(`#${containerId}`);
    }

    // Cleanup function
    return () => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
    };
  }, [onetimeLoaded, selectedPlan, billingCycle, user]);

  const currentPlan = PLANS[selectedPlan];
  const currentPrice = billingCycle === 'monthly' ? currentPlan.monthly.price : currentPlan.yearly.price;
  const savings = billingCycle === 'yearly' ? currentPlan.yearly.savings : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Complete Your Subscription</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose your plan and payment method</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Subscription Type</h2>
            
            <div className="space-y-4 mb-6">
              {Object.entries(PLANS).map(([key, plan]) => (
                <Card key={key} onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                  className={`cursor-pointer transition-all ${selectedPlan === key ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200 hover:border-gray-300'}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === key ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {selectedPlan === key && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold dark:text-white">{plan.name}</h3>
                          {plan.popular && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{billingCycle === 'monthly' ? 'per month' : 'per year'}</div>
                      <div className="text-2xl font-bold dark:text-white">${billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-gray-50 dark:bg-gray-800 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold dark:text-white">${currentPrice} per {currentPlan.name} user</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${billingCycle === 'yearly' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 ${billingCycle === 'yearly' ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all`} />
                  </button>
                  <span className="text-sm font-medium dark:text-white">{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                </div>
              </div>
              {savings > 0 && <p className="text-sm text-green-600 dark:text-green-400 font-medium">💰 Save ${savings}/year</p>}
            </Card>

            <div>
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

          <div>
            <Card>
              <CardHeader><CardTitle>Choose Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold dark:text-white">PayPal Subscription</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Auto-renews {billingCycle === 'monthly' ? 'monthly' : 'yearly'}</p>
                    </div>
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">RECOMMENDED</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">✓ Automatic renewal<br/>✓ Cancel anytime<br/>✓ For PayPal accounts</p>
                  <div id="paypal-subscription-button"></div>
                  {!subscriptionLoaded && <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></div>}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="font-bold dark:text-white">Pay with Card</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">One-time for {billingCycle === 'monthly' ? '1 month' : '1 year'}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">✓ No auto-renewal<br/>✓ Renew manually<br/>✓ Visa, Mastercard, Amex</p>
                  <div id="paypal-onetime-button"></div>
                  {!onetimeLoaded && <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
