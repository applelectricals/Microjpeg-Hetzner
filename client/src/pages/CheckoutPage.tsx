import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';

// Razorpay Subscription Button IDs
const RAZORPAY_BUTTON_IDS = {
  monthly: 'pl_RlaSYlOEgnhvGu',  // Monthly plans + one-time
  yearly: 'pl_RlwkI8y1JWtyrV',   // Yearly plans + one-time
};

// Plan details for display
const PLAN_FEATURES = {
  starter: ['Unlimited compressions', '75MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Standard processing', '1 concurrent upload'],
  pro: ['Unlimited compressions', '150MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Priority processing', '1 concurrent upload'],
  business: ['Unlimited compressions', '200MB max file size', 'All formats including RAW', 'Unlimited conversions', 'Priority processing', '1 concurrent upload'],
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

// Razorpay Monthly Button Component
function RazorpayMonthlyButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/static/widget/subscription-button.js';
    script.setAttribute('data-subscription_button_id', RAZORPAY_BUTTON_IDS.monthly);
    script.setAttribute('data-button_theme', 'brand-color');
    script.async = true;

    form.appendChild(script);
    containerRef.current.appendChild(form);

    console.log('✅ Monthly button loaded');
  }, []);

  return <div ref={containerRef} className="min-h-[50px] flex justify-center items-center" />;
}

// Razorpay Yearly Button Component
function RazorpayYearlyButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/static/widget/subscription-button.js';
    script.setAttribute('data-subscription_button_id', RAZORPAY_BUTTON_IDS.yearly);
    script.setAttribute('data-button_theme', 'brand-color');
    script.async = true;

    form.appendChild(script);
    containerRef.current.appendChild(form);

    console.log('✅ Yearly button loaded');
  }, []);

  return <div ref={containerRef} className="min-h-[50px] flex justify-center items-center" />;
}

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'business'>('pro');
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Plan prices
  const planPrices = {
    starter: { monthly: 9, yearly: 49 },
    pro: { monthly: 19, yearly: 149 },
    business: { monthly: 49, yearly: 349 },
  };

  const currentPrice = planPrices[selectedPlan][selectedCycle];
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-300">Select monthly or yearly subscription</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Payment Buttons Section */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Monthly Plans */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Monthly Plans</CardTitle>
                <p className="text-gray-400 text-sm">Subscription or One-time Payment</p>
                <div className="mt-4 space-y-2">
                  <div className="text-gray-300">
                    <span className="font-semibold text-teal-400">Starter:</span> $9/month
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-teal-400">Pro:</span> $19/month
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-teal-400">Business:</span> $49/month
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <RazorpayMonthlyButton />
              </CardContent>
            </Card>

            {/* Yearly Plans */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-yellow-500">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Yearly Plans</CardTitle>
                <p className="text-gray-400 text-sm">Subscription or One-time Payment</p>
                <div className="mt-4 space-y-2">
                  <div className="text-gray-300">
                    <span className="font-semibold text-yellow-400">Starter:</span> $49/year
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-yellow-400">Pro:</span> $149/year
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-yellow-400">Business:</span> $349/year
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <RazorpayYearlyButton />
              </CardContent>
            </Card>
          </div>

          {/* Number of Users */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">Number of Users</h3>
                  <p className="text-sm text-gray-400">Adjust quantity as needed</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-xl text-gray-300 hover:border-teal-500 disabled:opacity-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-white min-w-[4ch] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-xl text-gray-300 hover:border-teal-500 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included Section */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold text-teal-400 mb-3">Starter</h4>
                  <ul className="space-y-2">
                    {PLAN_FEATURES.starter.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-teal-400 mb-3">Pro</h4>
                  <ul className="space-y-2">
                    {PLAN_FEATURES.pro.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-teal-400 mb-3">Business</h4>
                  <ul className="space-y-2">
                    {PLAN_FEATURES.business.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary - Bottom */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-gray-400 text-sm">
                  After selecting your plan in the Razorpay button above, your order summary will reflect the chosen option.
                </p>
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Number of Users:</span>
                    <span className="font-bold text-white">{quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    💡 Tip: Select your preferred plan (Starter, Pro, or Business) and billing cycle (Monthly or Yearly) from the Razorpay payment button above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}