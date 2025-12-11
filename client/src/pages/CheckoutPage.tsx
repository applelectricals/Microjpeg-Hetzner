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

// Razorpay Plan IDs for reference
const RAZORPAY_PLAN_IDS = {
  'starter-monthly': 'plan_Rkbt8vVdqEAWtB',   // $9
  'starter-yearly': 'plan_RkdJ0gPYJrRvtH',    // $49
  'pro-monthly': 'plan_RlaBnfeyayAq2V',       // $19
  'pro-yearly': 'plan_RlaGdSwbmfKxfO',        // $149
  'business-monthly': 'plan_RlaI1OibtE9gaB',  // $49
  'business-yearly': 'plan_RlaJ3zyeHm24ML',   // $349
};

const PAYPAL_CLIENT_ID = 'BAA6hsJNpHbcTBMWxqcfbZs22QgzO7knIaUhASkWYLR-u6AtMlYgibBGR9pInXEWV7kartihrWi0wTu9O8';

// Plan details for display
const PLAN_FEATURES = {
  starter: [
    'Compress/Convert: UNLIMITED',
    'File Size: UNLIMITED',
    'AI BG Removal: 200/month',
    'BG Output Formats: WEBP, AVIF, PNG, JPG',
    'AI Enhancement: 200/month',
    'Max Upscale: 8x',
    'Face Enhancement: Yes',
    'Priority Processing: No',
    'API Access: Basic',
    'Support: Email'
  ],
  pro: [
    'Compress/Convert: UNLIMITED',
    'File Size: UNLIMITED',
    'AI BG Removal: 500/month',
    'BG Output Formats: WEBP, AVIF, PNG, JPG',
    'AI Enhancement: 500/month',
    'Max Upscale: 8x',
    'Face Enhancement: Yes',
    'Priority Processing: Yes',
    'API Access: Full',
    'Support: Priority'
  ],
  business: [
    'Compress/Convert: UNLIMITED',
    'File Size: UNLIMITED',
    'AI BG Removal: 1000/month',
    'BG Output Formats: WEBP, AVIF, PNG, JPG',
    'AI Enhancement: 1000/month',
    'Max Upscale: 8x',
    'Face Enhancement: Yes',
    'Priority Processing: Yes',
    'API Access: Full',
    'Support: Priority'
  ],
};

const PLAN_PRICES = {
  starter: { monthly: 9, yearly: 49 },
  pro: { monthly: 19, yearly: 149 },
  business: { monthly: 49, yearly: 349 },
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
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalRendered = useRef(false);

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

    const currentPrice = PLAN_PRICES[selectedPlan][selectedCycle];
    const totalPrice = currentPrice * quantity;
    const planName = `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} ${selectedCycle === 'monthly' ? 'Monthly' : 'Yearly'}`;
    
    const containerId = `paypal-button-${selectedPlan}-${selectedCycle}-${quantity}`;
    const mainContainer = document.getElementById('paypal-button-container');
    if (!mainContainer) return;
    
    mainContainer.innerHTML = '';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.id = containerId;
    mainContainer.appendChild(buttonContainer);
    
    paypalRendered.current = false;

    // @ts-ignore
    if (window.paypal && !paypalRendered.current) {
      // @ts-ignore
      window.paypal.Buttons({
        style: { 
          shape: 'rect', 
          color: 'blue', 
          layout: 'vertical', 
          label: 'pay',
          height: 45
        },
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalPrice.toString() },
              description: `${planName} (${quantity} user${quantity > 1 ? 's' : ''})`
            }]
          });
        },
        onApprove: async function(data: any, actions: any) {
          setIsProcessing(true);
          
          try {
            const details = await actions.order.capture();
            
            const response = await fetch('/api/payment/paypal/onetime', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                plan: `${selectedPlan}-${selectedCycle}`,
                quantity,
                order_id: data.orderID,
                billing: { name: details.payer.name.given_name, email: details.payer.email_address }
              })
            });

            if (!response.ok) throw new Error('Failed');
            
            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${selectedCycle}&order_id=${data.orderID}&quantity=${quantity}`;
            }, 1000);
            
          } catch (error) {
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
          }
        },
        onError: function(err: any) {
          setIsProcessing(false);
          alert('Payment failed. Please try again.');
        }
      }).render(`#${containerId}`).then(() => {
        paypalRendered.current = true;
      });
    }

    return () => {
      if (mainContainer) mainContainer.innerHTML = '';
      paypalRendered.current = false;
    };
  }, [paypalLoaded, selectedPlan, selectedCycle, quantity, user]);

  const currentPrice = PLAN_PRICES[selectedPlan][selectedCycle];
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

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-300 mb-4">Please wait...</p>
            </div>
          </div>
        )}

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

          {/* PayPal One-time Payment */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-blue-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Alternative Payment: <span className="text-3xl italic text-[#0070BA]">PayPal</span>
              </CardTitle>
              <p className="text-gray-400 text-sm">One-time payment • Works worldwide</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Number of Users */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">Number of Users</h3>
                    <p className="text-sm text-gray-400">Adjust quantity as needed</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-xl text-gray-300 hover:border-blue-500 disabled:opacity-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-3xl font-bold text-white min-w-[4ch] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center font-bold text-xl text-gray-300 hover:border-blue-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-white mb-3">Select Plan & Billing Cycle</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Choose Plan</label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value as 'starter' | 'pro' | 'business')}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Billing Cycle</label>
                    <select
                      value={selectedCycle}
                      onChange={(e) => setSelectedCycle(e.target.value as 'monthly' | 'yearly')}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PayPal Button */}
              <div id="paypal-button-container" className="min-h-[50px]"></div>
              {!paypalLoaded && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 text-blue-500 mx-auto animate-spin" />
                  <p className="text-gray-400 text-sm mt-2">Loading PayPal...</p>
                </div>
              )}

              {/* Estimated Order Summary */}
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                <h4 className="font-bold text-white mb-3 text-center">Estimated Order Summary</h4>
                
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center mb-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    ${totalPrice}
                  </div>
                  <div className="text-sm text-gray-300">
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} {selectedCycle === 'monthly' ? 'Monthly' : 'Yearly'} × {quantity} user{quantity > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-semibold text-teal-400 mb-2 text-sm">Monthly Plans</h5>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Starter:</span>
                        <span className="font-medium">${PLAN_PRICES.starter.monthly} × {quantity} = ${PLAN_PRICES.starter.monthly * quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pro:</span>
                        <span className="font-medium">${PLAN_PRICES.pro.monthly} × {quantity} = ${PLAN_PRICES.pro.monthly * quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business:</span>
                        <span className="font-medium">${PLAN_PRICES.business.monthly} × {quantity} = ${PLAN_PRICES.business.monthly * quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-400 mb-2 text-sm">Yearly Plans</h5>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Starter:</span>
                        <span className="font-medium">${PLAN_PRICES.starter.yearly} × {quantity} = ${PLAN_PRICES.starter.yearly * quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pro:</span>
                        <span className="font-medium">${PLAN_PRICES.pro.yearly} × {quantity} = ${PLAN_PRICES.pro.yearly * quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business:</span>
                        <span className="font-medium">${PLAN_PRICES.business.yearly} × {quantity} = ${PLAN_PRICES.business.yearly * quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  💡 Your charge: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan at ${currentPrice}/{selectedCycle === 'monthly' ? 'mo' : 'yr'} for {quantity} user{quantity > 1 ? 's' : ''}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* What's Included Section - Bottom, Full Width */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold text-teal-400 mb-3 text-lg">Starter</h4>
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
                  <h4 className="font-bold text-teal-400 mb-3 text-lg">Pro</h4>
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
                  <h4 className="font-bold text-teal-400 mb-3 text-lg">Business</h4>
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

        </div>
      </div>
    </div>
  );
}