import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';

// Razorpay Plan Button IDs (from Razorpay Dashboard)
const RAZORPAY_PLAN_BUTTONS = {
  starter: 'plan_Rkbt8vVdqEAWtB',  // ✅ Starter Monthly USD
  pro: 'plan_RlaBnfeyayAq2V',      // ⚠️ Replace with your Pro button ID
  business: 'plan_RlaI1OibtE9gaB', // ⚠️ Replace with your Business button ID
};

const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers',
    price: 9,
    features: [
      'Unlimited compressions',
      '75MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    price: 19,
    features: [
      'Unlimited compressions',
      '150MB max file size',
      'All formats including RAW',
      'Priority processing',
      'Priority support',
    ],
    popular: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For teams',
    price: 49,
    features: [
      'Unlimited compressions',
      '200MB max file size',
      'All formats including RAW',
      'Priority processing',
      'API access',
      'Dedicated support',
    ],
  },
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

// Razorpay Subscription Button Component
function RazorpayButton({ planId }: { planId: 'starter' | 'pro' | 'business' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonIdFromMap = RAZORPAY_PLAN_BUTTONS[planId];

  useEffect(() => {
    if (!containerRef.current || !buttonIdFromMap) return;

    containerRef.current.innerHTML = '';

    const form = document.createElement('form');
    const script = document.createElement('script');
    
    script.src = 'https://cdn.razorpay.com/static/widget/subscription-button.js';
    script.setAttribute('data-subscription_button_id', buttonIdFromMap);
    script.setAttribute('data-button_theme', 'brand-color');
    script.async = true;

    form.appendChild(script);
    containerRef.current.appendChild(form);

    console.log('✅ Razorpay button loaded:', buttonIdFromMap);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [buttonIdFromMap]);

  if (!buttonIdFromMap || buttonIdFromMap.startsWith('pl_YOUR_')) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3 text-center">
        <p className="text-yellow-200 text-xs">
          ⚠️ {planId.toUpperCase()} plan not configured in Razorpay Dashboard
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[60px]" />;
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

  const currentPlan = PLANS[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-5xl">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/pricing')}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
            Subscribe to {currentPlan.name}
          </h1>
          <p className="text-xl text-gray-300">
            ${currentPlan.price}/month • Monthly billing • Cancel anytime
          </p>
        </div>

        {/* Login Warning */}
        {!user && (
          <div className="mb-8 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-200 text-center">
              Please <a href="/login" className="underline font-semibold">log in</a> to continue with your subscription
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Plan Selection */}
          <div className="space-y-6">
            
            {/* Plan Selector */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Select Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS.starter][]).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPlan === key
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">{plan.name}</span>
                          {plan.popular && (
                            <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${plan.price}</div>
                        <div className="text-gray-400 text-sm">/month</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                💳 <strong className="text-white">Secure payment</strong> powered by Razorpay<br/>
                🔄 <strong className="text-white">Auto-renews monthly</strong> - cancel anytime<br/>
                🌍 <strong className="text-white">Works worldwide</strong> - automatic currency conversion
              </p>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div>
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Complete Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Order Summary */}
                <div className="space-y-3 pb-6 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{currentPlan.name} Plan</span>
                    <span className="font-medium text-white">${currentPlan.price}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Monthly billing • Cancel anytime
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-b border-gray-700">
                  <span className="text-xl font-bold text-white">Total</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">${currentPlan.price}</div>
                    <div className="text-gray-400 text-sm">per month</div>
                  </div>
                </div>

                {/* Razorpay Payment Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Secure payment via Razorpay</span>
                  </div>

                  {/* Payment Methods Info */}
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Credit/Debit Cards (Visa, Mastercard, RuPay)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>UPI (Google Pay, PhonePe, Paytm)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Net Banking & Wallets</span>
                    </div>
                  </div>

                  {/* Razorpay Button */}
                  <div className="pt-2">
                    {user ? (
                      <RazorpayButton planId={selectedPlan} />
                    ) : (
                      <Button
                        onClick={() => setLocation('/login?redirect=/checkout?plan=' + selectedPlan)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 text-lg"
                      >
                        Log in to Subscribe
                      </Button>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="text-center text-gray-500 text-xs space-y-1 pt-4">
                    <p>🔒 256-bit SSL encrypted payment</p>
                    <p>✓ PCI DSS compliant</p>
                    <p>✓ Cancel anytime, no questions asked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}