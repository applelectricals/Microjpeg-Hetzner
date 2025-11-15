import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Check, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

export default function PaymentSuccess() {
  const { isDark, setIsDark } = useDarkMode();
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const subscriptionId = urlParams.get('subscription_id');
    const orderId = urlParams.get('order_id');
    const quantity = urlParams.get('quantity') || '1';

    setSubscriptionData({
      plan,
      subscriptionId,
      orderId,
      quantity
    });

    // Refresh user data to get updated subscription
    const refreshData = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error refreshing user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Wait a moment before refreshing to ensure backend has completed
    setTimeout(refreshData, 1000);
  }, [refreshUser]);

  const getPlanDisplayName = (plan: string | null) => {
    if (!plan) return 'Premium';
    const [tier] = plan.split('-');
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getPlanFeatures = (tier: string) => {
    const features: Record<string, string[]> = {
      'starter': [
        'Unlimited compressions',
        '75MB max file size',
        'All formats including RAW',
        'Unlimited conversions',
        'Standard processing',
        '1 concurrent upload'
      ],
      'pro': [
        'Unlimited compressions',
        '150MB max file size',
        'All formats including RAW',
        'Unlimited conversions',
        'Priority processing (2x faster)',
        '1 concurrent upload'
      ],
      'business': [
        'Unlimited compressions',
        '200MB max file size',
        'All formats including RAW',
        'Unlimited conversions',
        'Priority processing (2x faster)',
        '1 concurrent upload',
        'Priority support'
      ]
    };

    return features[tier.toLowerCase()] || features['starter'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
        <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Confirming your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  const planName = getPlanDisplayName(subscriptionData?.plan);
  const planTier = subscriptionData?.plan?.split('-')[0] || 'starter';
  const features = getPlanFeatures(planTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-gray-300">
            Welcome to MicroJPEG {planName}
          </p>
        </div>

        {/* Subscription Details Card */}
        <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-teal-500/20 rounded-lg">
              <Crown className="w-8 h-8 text-teal-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Your {planName} Plan is Active
              </h2>
              <p className="text-gray-300">
                {user?.email && `Confirmation email sent to ${user.email}`}
              </p>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Plan</p>
              <p className="text-white font-semibold">{planName}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-green-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Active
              </p>
            </div>
            {subscriptionData?.subscriptionId && (
              <div className="bg-gray-900/50 p-4 rounded-lg md:col-span-2">
                <p className="text-gray-400 text-sm mb-1">Subscription ID</p>
                <p className="text-gray-300 font-mono text-sm break-all">
                  {subscriptionData.subscriptionId}
                </p>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              What's Included
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-xl border-teal-500/50 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            🚀 What's Next?
          </h3>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>Start compressing images with your increased file size limits</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>Explore format conversion features (JPEG, PNG, WebP, AVIF)</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>Manage your subscription in your account dashboard</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>Check your email for detailed subscription information</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation('/compress')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          >
            Start Compressing Images
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            View Dashboard
          </Button>
        </div>

        {/* Support Note */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@microjpeg.com" className="text-teal-400 hover:text-teal-300">
              support@microjpeg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
