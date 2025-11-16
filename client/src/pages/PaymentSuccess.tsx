import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, Crown, ArrowRight, Mail, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const PLAN_DETAILS = {
  'starter-monthly': { name: 'Starter', period: 'Monthly', price: 9 },
  'starter-yearly': { name: 'Starter', period: 'Yearly', price: 49 },
  'pro-monthly': { name: 'Pro', period: 'Monthly', price: 19 },
  'pro-yearly': { name: 'Pro', period: 'Yearly', price: 149 },
  'business-monthly': { name: 'Business', period: 'Monthly', price: 49 },
  'business-yearly': { name: 'Business', period: 'Yearly', price: 349 },
};

export default function PaymentSuccessPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(10);

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'pro-monthly';
  const subscriptionId = urlParams.get('subscription_id');
  const orderId = urlParams.get('order_id');

  const planDetails = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS] || PLAN_DETAILS['pro-monthly'];

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setLocation('/compress');
    }
  }, [countdown, setLocation]);

  const handleStartNow = () => {
    setLocation('/compress');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-teal-500 to-green-500 mb-6 animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-gray-300 mb-2">
              Welcome to MicroJPEG {planDetails.name}! 🎉
            </p>
            
            <p className="text-gray-400">
              Your subscription is now active and ready to use
            </p>
          </div>

          {/* Subscription Details Card */}
          <Card className="mb-6 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 shadow-lg shadow-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Subscription Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="text-lg font-bold text-white">{planDetails.name} - {planDetails.period}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Amount Paid</p>
                    <p className="text-lg font-bold text-white">${planDetails.price}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-lg font-bold text-green-400">● Active</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Confirmation Sent</p>
                    <p className="text-lg font-bold text-white">{user?.email || 'Your email'}</p>
                  </div>
                </div>
              </div>

              {(subscriptionId || orderId) && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Transaction ID: {subscriptionId || orderId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What's Next Card */}
          <Card className="mb-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">🚀 What's Next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Check Your Email</p>
                    <p className="text-sm text-gray-400">
                      We've sent a confirmation email with your subscription details and receipt
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Start Compressing Images</p>
                    <p className="text-sm text-gray-400">
                      Your {planDetails.name} plan is active with unlimited compressions and all premium features
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-teal-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Manage Your Subscription</p>
                    <p className="text-sm text-gray-400">
                      View usage, update billing, or cancel anytime from your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleStartNow}
              className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-teal-500/50 flex items-center justify-center gap-2"
            >
              <span>Start Compressing Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setLocation('/dashboard')}
              className="w-full py-4 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Redirecting to compress page in <span className="font-bold text-teal-400">{countdown}</span> seconds...
            </p>
          </div>

          {/* Support */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@microjpeg.com" className="text-teal-400 hover:text-teal-300">
                support@microjpeg.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
