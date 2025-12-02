/**
 * Subscription Success Page
 * 
 * Displayed after successful payment from Razorpay or PayPal
 * Shows plan details and redirects to compress page
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Check, Crown, ArrowRight, Mail, Calendar, CreditCard, Loader2, Download, Settings, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  return { isDark, setIsDark };
}

const PLAN_DETAILS: Record<string, {
  name: string;
  period: string;
  price: number;
  maxFileSize: string;
  features: string[];
}> = {
  'starter-monthly': {
    name: 'Starter',
    period: 'Monthly',
    price: 9,
    maxFileSize: '75MB',
    features: ['Unlimited compressions', '75MB max file size', 'All formats including RAW', 'Email support'],
  },
  'starter-yearly': {
    name: 'Starter',
    period: 'Annual',
    price: 49,
    maxFileSize: '75MB',
    features: ['Unlimited compressions', '75MB max file size', 'All formats including RAW', 'Email support', '2 months free'],
  },
  'pro-monthly': {
    name: 'Pro',
    period: 'Monthly',
    price: 19,
    maxFileSize: '150MB',
    features: ['Unlimited compressions', '150MB max file size', 'Priority processing', 'Priority support'],
  },
  'pro-yearly': {
    name: 'Pro',
    period: 'Annual',
    price: 149,
    maxFileSize: '150MB',
    features: ['Unlimited compressions', '150MB max file size', 'Priority processing', 'Priority support', '2 months free'],
  },
  'business-monthly': {
    name: 'Business',
    period: 'Monthly',
    price: 49,
    maxFileSize: '200MB',
    features: ['Unlimited compressions', '200MB max file size', 'API access', 'Dedicated support'],
  },
  'business-yearly': {
    name: 'Business',
    period: 'Annual',
    price: 349,
    maxFileSize: '200MB',
    features: ['Unlimited compressions', '200MB max file size', 'API access', 'Dedicated support', '2 months free'],
  },
};

export default function SubscriptionSuccessPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user, refetch: refetchUser } = useAuth();
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'starter-monthly';
  const subscriptionId = urlParams.get('subscription_id') || urlParams.get('razorpay_subscription_id');
  const paymentId = urlParams.get('payment_id') || urlParams.get('razorpay_payment_id');
  const paypalOrderId = urlParams.get('paypal_order_id');
  
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS['starter-monthly'];
  const transactionId = subscriptionId || paymentId || paypalOrderId;
  const paymentMethod = paypalOrderId ? 'PayPal' : 'Razorpay';

  // Refresh user data
  useEffect(() => {
    const refresh = async () => {
      try { await refetchUser?.(); } catch (e) {}
      setIsLoading(false);
    };
    refresh();
  }, [refetchUser]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setLocation('/compress');
    }
  }, [countdown, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/20 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-teal-500/30 rounded-full blur-xl animate-ping" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/50">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-4 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Welcome to {planDetails.name}! 🎉
            </h1>
            
            <p className="text-xl text-gray-300">
              Your subscription is now active
            </p>
          </div>

          {/* Subscription Card */}
          <Card className="mb-6 bg-gray-800/60 backdrop-blur-xl border-2 border-teal-500/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Subscription Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="text-lg font-bold text-white">{planDetails.name} - {planDetails.period}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Amount Paid</p>
                    <p className="text-lg font-bold text-white">${planDetails.price}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-lg font-bold text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Active
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confirmation Sent</p>
                    <p className="text-lg font-bold text-white truncate max-w-[200px]">
                      {user?.email || 'Your email'}
                    </p>
                  </div>
                </div>
              </div>

              {transactionId && (
                <div className="pt-4 border-t border-gray-700/50 text-xs text-gray-500">
                  <p>Transaction: {transactionId}</p>
                  <p>Payment: {paymentMethod}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Unlocked */}
          <Card className="mb-6 bg-gray-800/40 border border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Features Unlocked
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {planDetails.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <p className="text-teal-400 font-semibold">
                  Max File Size: {planDetails.maxFileSize}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/compress')}
              className="w-full py-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-teal-500/30"
            >
              <Download className="w-5 h-5 mr-2" />
              Start Compressing Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              className="w-full py-5 bg-gray-800/50 border-gray-700 text-white rounded-xl"
            >
              <Settings className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Countdown */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Redirecting in <span className="font-bold text-teal-400">{countdown}</span>s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
