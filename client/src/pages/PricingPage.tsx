import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Moon, Sun } from 'lucide-react'; // Add Moon, Sun
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import { SubscribeButton } from '@/components/PayPalPaymentButton';

// ADD THIS HOOK (same as landing page)
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return saved ? saved === 'true' : prefersDark;
    }
    return false;
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

interface Plan {
  tier: string;
  name: string;
  description: string;
  monthlyOps: number;
  pricing: {
    monthly: number;
    yearly: number;
  };
  planIds: {
    monthly: string;
    yearly: string;
  };
  features: {
    fileSize: string;
    concurrent: number;
    priority: boolean;
    analytics: boolean;
    api: boolean;
  };
}

export default function PricingPage() {
  const { isDark, setIsDark } = useDarkMode(); // ADD THIS LINE
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  


  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const getYearlySavings = (monthly: number, yearly: number) => {
    const yearlyCost = monthly * 12;
    const savings = yearlyCost - yearly;
    const percent = Math.round((savings / yearlyCost) * 100);
    return { amount: savings, percent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-light">
        <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-light dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Choose Your <span className="text-brand-gold">Perfect Plan</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Upgrade to unlock more operations, larger files, and premium features
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-gold text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-brand-gold text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Save up to 35%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const savings = getYearlySavings(plan.pricing.monthly, plan.pricing.yearly);
              const price = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
              const isPro = plan.tier === 'pro';

              return (
                <Card
                  key={plan.tier}
                  className={`p-8 relative ${
                    isPro
                      ? 'border-4 border-brand-gold shadow-2xl scale-105'
                      : 'border-2 border-gray-200 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 transition-all hover:shadow-xl`}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-brand-gold text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 dark:text-white">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-brand-gold">${price}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Save ${savings.amount}/year ({savings.percent}% off)
                      </p>
                    )}
                  </div>

                  {user ? (
  <SubscribeButton
    planId={billingCycle === 'monthly' ? plan.planIds.monthly : plan.planIds.yearly}
    planName={`${plan.name} ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`}
    amount={price}
    variant={isPro ? 'default' : 'outline'}
  >
    Subscribe Now
  </SubscribeButton>
) : (
  <Button
    onClick={() => window.location.href = '/login?redirect=/pricing'}
    className={`w-full mb-6 ${
      isPro
        ? 'bg-brand-gold hover:bg-brand-gold-dark text-white'
        : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
    }`}
    size="lg"
  >
    Sign Up to Subscribe
  </Button>
)}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="dark:text-gray-300">
                        <strong>{plan.monthlyOps.toLocaleString()}</strong> operations/month
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="dark:text-gray-300">
                        Up to <strong>{plan.features.fileSize}</strong> per file
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="dark:text-gray-300">
                        <strong>{plan.features.concurrent}</strong> concurrent uploads
                      </span>
                    </div>
                    {plan.features.priority && (
                      <div className="flex items-center gap-3 text-sm">
                        <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <span className="dark:text-gray-300">Priority processing</span>
                      </div>
                    )}
                    {plan.features.analytics && (
                      <div className="flex items-center gap-3 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="dark:text-gray-300">Usage analytics dashboard</span>
                      </div>
                    )}
                    {plan.features.api && (
                      <div className="flex items-center gap-3 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="dark:text-gray-300">API access</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Tier Comparison */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
            <h3 className="text-2xl font-bold mb-4 text-center dark:text-white">
              Free Tier
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Perfect for trying out MicroJPEG - No credit card required
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="dark:text-gray-300">250 operations/month</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="dark:text-gray-300">10MB files (25MB RAW)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="dark:text-gray-300">3 concurrent uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="dark:text-gray-300">No sign-up required</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}