import { useState, useEffect, useRef } from 'react';
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
    monthly: { price: 9, subscriptionPlanId: 'P-5H209209695PC6961949NEHOG2Q' },
    yearly: { price: 49, subscriptionPlanId: 'P-8RD90370JE5050614NEHPDGA', savings: 59 },
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');  // Changed default to 'monthly'
  const [quantity, setQuantity] = useState(1);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [onetimeLoaded, setOnetimeLoaded] = useState(false);

  const subscriptionContainerRef = useRef<HTMLDivElement>(null);
  const onetimeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPayPalSDK = () => {
      const script = document.createElement('script');
      script.src = \`https://www.paypal.com/sdk/js?client-id=\${PAYPAL_CLIENT_ID}&components=buttons&intent=subscription\`;
      script.async = true;
      script.onload = () => {
        initializePayPalButtons();
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    };

    const initializePayPalButtons = () => {
      if (window.PayPal) {
        const plan = PLANS[selectedPlan];
        const selectedPricing = plan[billingCycle];

        // Clear containers
        if (subscriptionContainerRef.current) {
          subscriptionContainerRef.current.innerHTML = '';
        }
        if (onetimeContainerRef.current) {
          onetimeContainerRef.current.innerHTML = '';
        }

        // Subscription button
        window.PayPal.Buttons({
          style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'subscribe',
            tagline: false,
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              plan_id: selectedPricing.subscriptionPlanId,
              quantity: quantity.toString(),
            });
          },
          onApprove: function(data, actions) {
            console.log('Subscription created:', data.subscriptionID);
            // Handle successful subscription
          },
          onError: function(err) {
            console.error('Subscription error:', err);
          },
        }).render(subscriptionContainerRef.current!);

        setSubscriptionLoaded(true);

        // One-time payment button
        window.PayPal.Buttons({
          style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
            tagline: false,
          },
          createOrder: function(data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: (selectedPricing.price * quantity).toFixed(2),
                },
              }],
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              console.log('One-time payment captured:', details);
              // Handle successful payment
            });
          },
          onError: function(err) {
            console.error('One-time payment error:', err);
          },
        }).render(onetimeContainerRef.current!);

        setOnetimeLoaded(true);
      }
    };

    loadPayPalSDK();

    return () => {
      // Cleanup
      if (subscriptionContainerRef.current) {
        subscriptionContainerRef.current.innerHTML = '';
      }
      if (onetimeContainerRef.current) {
        onetimeContainerRef.current.innerHTML = '';
      }
    };
  }, [selectedPlan, billingCycle, quantity]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <Header />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Plan
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Select the perfect plan for your image compression needs.
              </p>
            </CardHeader>

            {/* Plan Toggle */}
            <div className="flex justify-center mb-8">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('monthly')}
                className="rounded-r-none"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('yearly')}
                className="rounded-l-none"
              >
                Yearly (Save up to 50%)
              </Button>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-6 px-6 pb-8">
              {Object.entries(PLANS).map(([key, plan]) => {
                const pricing = plan[billingCycle];
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-shadow ${
                      selectedPlan === key
                        ? 'shadow-xl border-blue-500'
                        : 'shadow-md hover:shadow-lg'
                    } ${plan.popular ? 'border-2 border-blue-500 relative' : ''}`}
                    onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-2">
                        ${pricing.price}
                        <span className="text-sm font-normal text-gray-500">
                          /{billingCycle}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-green-600 mb-4">
                          Save ${pricing.savings}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center text-sm">
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Checkout */}
            <CardContent className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Quantity</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xl font-bold mb-6">
                Total: $
                {PLANS[selectedPlan][billingCycle].price * quantity}
              </div>

              <div className="space-y-6">
                {/* Pay with PayPal Subscription */}
                <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold dark:text-white">Pay with PayPal (Subscription)</h3>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">AUTO-RENEW</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    ✓ Cancel anytime<br/>
                    ✓ For PayPal accounts
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2 mb-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ Country specific - May not work if paying from India
                    </p>
                  </div>
                  
                  {/* Main container that will be cleared and repopulated */}
                  <div id="paypal-subscription-container"></div>
                  
                  {!subscriptionLoaded && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading PayPal...</p>
                    </div>
                  )}
                </div>

                {/* Pay with Card */}
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold dark:text-white">Pay with Card (One-time)</h3>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">RECOMMENDED</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    ✓ No auto-renewal<br/>
                    ✓ Renew manually<br/>
                    ✓ Works worldwide
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-2 mb-3">
                    <p className="text-xs text-green-800 dark:text-green-200">
                      ✓ Best option for India - Pay with Visa, Mastercard, Amex
                    </p>
                  </div>
                  
                  {/* Main container that will be cleared and repopulated */}
                  <div id="paypal-onetime-container"></div>
                  
                  {!onetimeLoaded && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading payment...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}