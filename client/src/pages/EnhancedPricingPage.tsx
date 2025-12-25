import { useDarkMode } from '@/hooks/useDarkMode';
import { useState, useEffect } from 'react';
import { Check, X, Crown, Zap, Code, Globe, Boxes, Calculator, ArrowRight, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function CompletePricingPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [activeTab, setActiveTab] = useState('web');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Direct Web Pricing Display */}
        <WebPricing billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}

// ==================== WEB PRICING (2-TIER: FREE + STARTER) ====================
function WebPricing({ billingCycle, setBillingCycle }: { 
  billingCycle: 'monthly' | 'yearly', 
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void 
}) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out',
      features: [
        'Compress/Convert: 30/month',
        'File Size: 5MB Regular / 10MB RAW',
        'AI BG Removal: 10/month',
        'AI Enhancement: 10/month',
        'BG Output Formats: PNG only',
        'Max Upscale: 2x',
        'Face Enhancement: No',
        'Priority Processing: No',
        'API Access: No',
        'Support: Community',
      ],
      cta: 'Current Plan',
      popular: false,
      disabled: true,
    },
    {
      name: 'Starter',
      priceMonthly: '$9',
      priceYearly: '$49',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $59/year' : null,
      description: 'For professionals & teams',
      features: [
        'Compress/Convert: Unlimited',
        'File Size: Unlimited',
        'AI BG Removal: 300/month',
        'AI Enhancement: 300/month',
        'BG Output Formats: All (WebP, AVIF, PNG, JPG)',
        'Max Upscale: 8x',
        'Face Enhancement: Yes',
        'Priority Processing: Yes',
        'API Access: Full',
        'Support: Priority Email',
      ],
      cta: 'Get Started',
      popular: true,
    },
  ];

  return (
    <div>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-xl rounded-xl p-2 border border-gray-700/50">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setBillingCycle('monthly')}
            className="rounded-md"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            onClick={() => setBillingCycle('yearly')}
            className="rounded-md relative"
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              Save 55%
            </span>
          </Button>
        </div>
      </div>

      {/* Pricing Cards - 2 columns centered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative bg-gray-800/50 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
              plan.popular
                ? 'border-2 border-teal-500 shadow-lg shadow-teal-500/50 scale-105'
                : 'border border-gray-700/50 hover:border-teal-500/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-teal-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-teal-500/50">
                  Recommended
                </span>
              </div>
            )}
            
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                {plan.name}
                {plan.popular && <Crown className="w-5 h-5 text-yellow-400" />}
              </CardTitle>
              <p className="text-sm text-gray-400">{plan.description}</p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">
                  {plan.priceMonthly && billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly || plan.price}
                </span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
                {plan.savings && (
                  <p className="text-green-500 text-sm mt-1 font-semibold">{plan.savings}</p>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => {
                  const isNegative = feature.includes(': No') || feature.includes(': PNG only') || feature.includes(': 2x') || feature.includes(': Community');
                  return (
                    <li key={idx} className="flex items-start gap-2">
                      {plan.popular || !isNegative ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${isNegative && !plan.popular ? 'text-gray-500' : 'text-gray-300'}`}>
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
              
              {plan.disabled ? (
                <Button
                  className="w-full"
                  disabled={true}
                  variant="outline"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.href = `/checkout?plan=starter&cycle=${billingCycle}`}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-lg py-6"
                >
                  {plan.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-4xl mx-auto mb-12">
        <h3 className="text-2xl font-bold text-center text-white mb-8">Full Feature Comparison</h3>
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-300 font-semibold">Feature</th>
                <th className="text-center p-4 text-gray-300 font-semibold">Free</th>
                <th className="text-center p-4 text-teal-400 font-semibold">Starter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              <tr>
                <td className="p-4 text-gray-300">Compress & Convert</td>
                <td className="p-4 text-center text-gray-400">30/month</td>
                <td className="p-4 text-center text-white font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Max File Size</td>
                <td className="p-4 text-center text-gray-400">5MB / 10MB RAW</td>
                <td className="p-4 text-center text-white font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">AI Background Removal</td>
                <td className="p-4 text-center text-gray-400">10/month</td>
                <td className="p-4 text-center text-white font-semibold">300/month</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">AI Image Enhancement</td>
                <td className="p-4 text-center text-gray-400">10/month</td>
                <td className="p-4 text-center text-white font-semibold">300/month</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Output Formats (AI)</td>
                <td className="p-4 text-center text-gray-400">PNG only</td>
                <td className="p-4 text-center text-white font-semibold">All formats</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Max Upscale</td>
                <td className="p-4 text-center text-gray-400">2x</td>
                <td className="p-4 text-center text-white font-semibold">8x</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Face Enhancement</td>
                <td className="p-4 text-center"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Priority Processing</td>
                <td className="p-4 text-center"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">API Access</td>
                <td className="p-4 text-center"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-300">Support</td>
                <td className="p-4 text-center text-gray-400">Community</td>
                <td className="p-4 text-center text-white font-semibold">Priority Email</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>14-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Secure payment via Razorpay</span>
        </div>
      </div>
    </div>
  );
}

// ==================== FAQ SECTION ====================
function FAQSection() {
  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking through Razorpay. International payments via PayPal are also supported.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can upgrade anytime and the change takes effect immediately. If you need to downgrade or cancel, changes take effect at the end of your billing cycle.',
    },
    {
      question: 'What RAW formats do you support?',
      answer: 'We support all major RAW formats: Canon (CR2, CR3), Nikon (NEF), Sony (ARW), Adobe (DNG), Olympus (ORF), Fujifilm (RAF), Panasonic (RW2), and more.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! The Free plan is completely free forever with 30 operations per month. No credit card required. Perfect for testing the service before upgrading.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied within the first 14 days, contact us for a full refund.',
    },
    {
      question: 'What does "Unlimited" file size mean?',
      answer: 'Starter plan users can process files up to 75MB for regular images and 100MB for RAW files. We call this "Unlimited" because it covers virtually all professional use cases.',
    },
    {
      question: 'How does the API work?',
      answer: 'Starter plan includes full API access. Generate an API key from your dashboard and use our REST API to integrate image processing into your applications. Comprehensive documentation and code examples are provided.',
    },
    {
      question: 'What happens when my limits reset?',
      answer: 'All usage limits reset on the 1st of each month. Your AI operations (background removal, enhancement) counter resets to zero, giving you a fresh allocation.',
    },
  ];

  return (
    <>
      <div className="mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-teal-600/20 to-yellow-600/20 rounded-2xl p-8 border border-teal-500/30 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
          <p className="text-gray-300 mb-6">
            Join thousands of professionals who trust MicroJPEG for their image optimization needs.
          </p>
          <Button
            onClick={() => window.location.href = '/checkout?plan=starter&cycle=yearly'}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-6 text-lg shadow-lg shadow-teal-500/50"
          >
            Get Starter Plan - $49/year
          </Button>
          <p className="text-gray-500 text-sm mt-4">14-day money-back guarantee</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-screen relative left-[calc(-50vw+50%)] bg-gray-800/50 backdrop-blur-xl border-t border-teal-500/30 text-white py-12 relative z-10 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                <span className="text-xl font-bold">MicroJPEG</span>
              </div>
              <p className="text-gray-300">
                The smartest way to compress and optimize your images for the web.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</a></li>
                <li><a href="/api-docs" className="hover:text-teal-400 transition-colors">API</a></li>
                <li><a href="/api-docs" className="hover:text-teal-400 transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-teal-400 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="/support" className="hover:text-teal-400 transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</a></li>
                <li><a href="/cancellation-policy" className="hover:text-teal-400 transition-colors">Cancellation Policy</a></li>
                <li><a href="/privacy-policy" className="hover:text-teal-400 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
