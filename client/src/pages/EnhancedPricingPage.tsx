import { useState, useEffect } from 'react';
import { Check, X, Crown, ChevronDown, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import logoUrl from '@assets/mascot-logo-optimized.png';

// Add dark mode hook (same as other pages)
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
  pricing: { monthly: number; yearly: number };
  planIds: { monthly: string; yearly: string };
  features: {
    fileSize: string;
    concurrent: number;
    priority: boolean;
    analytics: boolean;
    api: boolean;
  };
}

// Feature comparison data
const featureComparison = [
  {
    name: 'Supported formats',
    free: 'JPEG, PNG, WebP, AVIF, RAW',
    starter: 'All formats',
    pro: 'All formats',
    business: 'All formats'
  },
  {
    name: 'Compress images',
    free: '250 per month',
    starter: '3,000 per month',
    pro: '15,000 per month',
    business: '50,000 per month'
  },
  {
    name: 'Upload file size',
    free: '10MB (25MB RAW)',
    starter: '75MB',
    pro: '100MB',
    business: '500MB'
  },
  {
    name: 'Convert format',
    free: '250 per month',
    starter: '3,000 per month',
    pro: '15,000 per month',
    business: 'Unlimited'
  },
  {
    name: 'Priority processing',
    free: false,
    starter: true,
    pro: true,
    business: true
  },
  {
    name: 'Usage analytics',
    free: false,
    starter: true,
    pro: true,
    business: true
  },
  {
    name: 'API access',
    free: false,
    starter: true,
    pro: true,
    business: true
  },
  {
    name: 'Team seats',
    free: '1',
    starter: '1',
    pro: '3',
    business: '10'
  }
];

// FAQ data
const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards and PayPal for everyone. Automatic renewals are currently only enabled for PayPal payments. You can also pay with debit/credit card as a guest without a PayPal account.'
  },
  {
    question: 'What are the differences between the paid subscriptions?',
    answer: 'The main differences are in monthly operation limits, file size limits, and advanced features. Starter is perfect for freelancers with 3,000 operations/month. Pro suits agencies with 15,000 operations and team features. Business is for enterprises with 50,000 operations and white-label options.'
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! You can use our Free tier with 250 operations per month without signing up. No credit card required. This lets you test the service before upgrading.'
  },
  {
    question: 'Will my subscription renew automatically?',
    answer: 'If you choose the PayPal subscription option, yes - it will renew automatically. If you choose the one-time payment option, you will need to renew manually when it expires.'
  },
  {
    question: 'Can I upgrade my plan at any time?',
    answer: 'Yes! You can upgrade to a higher tier at any time. The price difference will be prorated for the remaining period of your current subscription.'
  },
  {
    question: 'Do you offer team licenses? If so, how to set it up?',
    answer: 'Yes, Pro and Business plans include team seats (3 and 10 respectively). After subscribing, you can invite team members from your dashboard. Each member gets their own account with shared operation limits.'
  }
];

export default function EnhancedPricingPage() {
  const { isDark, setIsDark } = useDarkMode();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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

  const handleChoosePlan = (plan: Plan) => {
    if (!user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    
    // Go to checkout page with plan details
    window.location.href = `/checkout?tier=${plan.tier}&cycle=${billingCycle}`;
  };

  const getYearlySavings = (monthly: number, yearly: number) => {
    const savings = (monthly * 12) - yearly;
    const percent = Math.round((savings / (monthly * 12)) * 100);
    return { amount: savings, percent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl dark:text-white">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Choose the right plan for your needs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Whether you compress a few images or thousands, find a subscription that fits your needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
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

      {/* Comparison Table */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold dark:text-white">Features</th>
                <th className="p-4 w-48">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current subscription</div>
                    <div className="font-bold text-xl dark:text-white">Free</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Forever</div>
                  </div>
                </th>
                {plans.map((plan, idx) => {
                  const savings = getYearlySavings(plan.pricing.monthly, plan.pricing.yearly);
                  const price = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
                  const isPro = plan.tier === 'pro';

                  return (
                    <th key={plan.tier} className="p-4 w-48 relative">
                      {isPro && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Recommended
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Crown className="w-5 h-5 text-brand-gold" />
                          <span className="font-bold text-xl dark:text-white">{plan.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${price}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {billingCycle === 'yearly' ? 'per year' : 'per month'}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Save ${savings.amount}/year
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((feature, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 font-medium dark:text-gray-300">{feature.name}</td>
                  <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                    ) : (
                      feature.free
                    )}
                  </td>
                  {plans.map((plan) => {
                    const value = (feature as any)[plan.tier];
                    return (
                      <td key={plan.tier} className="p-4 text-center text-gray-600 dark:text-gray-400">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                <td className="p-4 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current plan</div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.tier} className="p-4 text-center">
                    <Button
                      onClick={() => handleChoosePlan(plan)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                    >
                      Get {plan.name}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {idx + 1 < 10 ? '0' : ''}{idx + 1}. {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === idx ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                <span className="text-xl font-bold font-poppins">MicroJPEG</span>
              </div>
              <p className="text-gray-600 font-opensans">
                The smartest way to compress and optimize your images for the web.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 font-opensans">
                <li><a href="/features" className="hover:text-black">Features</a></li>
                <li><a href="/pricing" className="hover:text-black">Pricing</a></li>
                <li><a href="/api-docs" className="hover:text-black">API</a></li>
                <li><a href="/api-docs" className="hover:text-black">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 font-opensans">
                <li><a href="/about" className="hover:text-black">About</a></li>
                <li><a href="/blog" className="hover:text-black">Blog</a></li>
                <li><a href="/contact" className="hover:text-black">Contact</a></li>
                <li><a href="/support" className="hover:text-black">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 font-opensans">
                <li><a href="/privacy-policy" className="hover:text-black">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-black">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-black">Cookie Policy</a></li>
                <li><a href="/cancellation-policy" className="hover:text-black">Cancellation Policy</a></li>
                <li><a href="/privacy-policy" className="hover:text-black">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-gray-500 font-opensans">
            <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
            <p className="text-xs mt-2 opacity-75">
              Background photo by <a href="https://www.pexels.com/photo/selective-focus-photo-of-white-petaled-flowers-96627/" target="_blank" rel="noopener noreferrer" className="hover:underline">AS Photography</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}