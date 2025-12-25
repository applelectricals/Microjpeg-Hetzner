import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Check, Loader2, Crown, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import logoUrl from '@assets/mascot-logo-optimized.png';

// Razorpay Subscription Button IDs
const RAZORPAY_BUTTON_IDS = {
  monthly: 'pl_RlaSYlOEgnhvGu',  // Starter Monthly
  yearly: 'pl_RlwkI8y1JWtyrV',   // Starter Yearly
};

const PAYPAL_CLIENT_ID = 'BAA6hsJNpHbcTBMWxqcfbZs22QgzO7knIaUhASkWYLR-u6AtMlYgibBGR9pInXEWV7kartihrWi0wTu9O8';

// Plan details for display
const PLAN_FEATURES = [
  'Compress/Convert: Unlimited',
  'File Size: Unlimited',
  'AI BG Removal: 300/month',
  'AI Enhancement: 300/month',
  'All Output Formats (WebP, AVIF, PNG, JPG)',
  'Max Upscale: 8x',
  'Face Enhancement',
  'Priority Processing',
  'Full API Access',
  'Priority Email Support',
];

const PLAN_PRICES = {
  monthly: 9,
  yearly: 49,
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

// Razorpay Button Component - Renders based on cycle prop
function RazorpayButton({ cycle }: { cycle: 'monthly' | 'yearly' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const buttonIdRef = useRef<string>('');

  useEffect(() => {
    if (!containerRef.current) return;
    
    const buttonId = RAZORPAY_BUTTON_IDS[cycle];
    
    // If same button, don't re-render
    if (buttonIdRef.current === buttonId) {
      return;
    }
    
    buttonIdRef.current = buttonId;
    setIsLoading(true);
    
    // Clear existing content
    containerRef.current.innerHTML = '';

    const form = document.createElement('form');
    form.id = `razorpay-form-${cycle}`;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/static/widget/subscription-button.js';
    script.setAttribute('data-subscription_button_id', buttonId);
    script.setAttribute('data-button_theme', 'brand-color');
    script.async = true;
    
    script.onload = () => {
      console.log(`✅ Razorpay ${cycle} button loaded`);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      console.error(`❌ Failed to load Razorpay ${cycle} button`);
      setIsLoading(false);
    };

    form.appendChild(script);
    containerRef.current.appendChild(form);
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [cycle]);

  return (
    <div className="relative min-h-[60px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`flex justify-center items-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get cycle from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cycle = params.get('cycle');
    if (cycle === 'monthly' || cycle === 'yearly') {
      setSelectedCycle(cycle);
    }
  }, []);

  // Load PayPal SDK
  useEffect(() => {
    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=capture&disable-funding=credit`;
    script.async = true;
    script.onload = () => {
      console.log('✅ PayPal SDK loaded');
      setPaypalLoaded(true);
    };
    script.onerror = () => console.error('❌ Failed to load PayPal SDK');
    document.body.appendChild(script);
  }, []);

  // Render PayPal button
  useEffect(() => {
    if (!paypalLoaded) return;

    const currentPrice = PLAN_PRICES[selectedCycle];
    const planName = `Starter ${selectedCycle === 'monthly' ? 'Monthly' : 'Yearly'}`;
    
    const containerId = `paypal-button-${selectedCycle}`;
    const mainContainer = document.getElementById('paypal-button-container');
    if (!mainContainer) return;
    
    mainContainer.innerHTML = '';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = containerId;
    mainContainer.appendChild(buttonContainer);
    
    // @ts-ignore
    if (window.paypal) {
      // @ts-ignore
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: planName,
              amount: {
                currency_code: 'USD',
                value: currentPrice.toString(),
              },
            }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsProcessing(true);
          try {
            const order = await actions.order.capture();
            console.log('✅ PayPal order completed:', order);
            
            // Send to backend to update user tier
            const response = await fetch('/api/payments/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                orderId: order.id,
                plan: 'starter',
                cycle: selectedCycle,
                amount: currentPrice,
              }),
            });
            
            if (response.ok) {
              // Redirect to premium tools page
              window.location.href = '/compress?welcome=true';
            } else {
              alert('Payment recorded but there was an issue. Please contact support.');
            }
          } catch (error) {
            console.error('PayPal capture error:', error);
            alert('Payment processing error. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again.');
        },
      }).render(`#${containerId}`);
    }
  }, [paypalLoaded, selectedCycle]);

  const currentPrice = PLAN_PRICES[selectedCycle];
  const savings = selectedCycle === 'yearly' ? '$59' : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Upgrade to Starter
          </h1>
          <p className="text-gray-300">
            Unlock unlimited compression, AI tools, and full API access
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left Column - Plan Details */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Starter Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PLAN_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-700 space-y-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>14-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Instant activation after payment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Billing Cycle Selection */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Select Billing Cycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Monthly Option */}
                <button
                  onClick={() => setSelectedCycle('monthly')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCycle === 'monthly'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Monthly</div>
                      <div className="text-gray-400 text-sm">Billed monthly</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">$9</div>
                      <div className="text-gray-400 text-sm">/month</div>
                    </div>
                  </div>
                </button>

                {/* Yearly Option */}
                <button
                  onClick={() => setSelectedCycle('yearly')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                    selectedCycle === 'yearly'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    SAVE 55%
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Yearly</div>
                      <div className="text-gray-400 text-sm">Billed annually</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">$49</div>
                      <div className="text-gray-400 text-sm">/year</div>
                      <div className="text-green-400 text-xs">~$4.08/month</div>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Razorpay Payment - Using key prop to force remount on cycle change */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-teal-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-center">
                  Pay with Razorpay
                </CardTitle>
                <p className="text-gray-400 text-sm text-center">
                  Cards, UPI, Net Banking • Recurring subscription
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Key prop forces component remount when cycle changes */}
                <RazorpayButton key={selectedCycle} cycle={selectedCycle} />
              </CardContent>
            </Card>

            {/* PayPal Alternative */}
            <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-center text-lg">
                  Or pay with <span className="text-[#0070BA]">PayPal</span>
                </CardTitle>
                <p className="text-gray-400 text-sm text-center">
                  One-time payment • Works worldwide
                </p>
              </CardHeader>
              <CardContent>
                <div id="paypal-button-container" className="min-h-[50px]"></div>
                {!paypalLoaded && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-500 mx-auto animate-spin" />
                    <p className="text-gray-400 text-sm mt-2">Loading PayPal...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Starter Plan ({selectedCycle})</span>
                <span className="text-white font-semibold">${currentPrice}</span>
              </div>
              {savings && (
                <div className="flex justify-between items-center text-green-400 text-sm">
                  <span>You save</span>
                  <span>{savings}/year</span>
                </div>
              )}
              <div className="border-t border-gray-700 mt-3 pt-3 flex justify-between items-center">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-teal-400">${currentPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Pricing Link */}
        <div className="text-center mt-8">
          <a href="/pricing" className="text-gray-400 hover:text-teal-400 transition-colors">
            ← Back to pricing
          </a>
        </div>
      </div>
    </div>
  );
}
