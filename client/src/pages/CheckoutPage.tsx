import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, User, Building, Mail, MapPin, CreditCard, Moon, Sun } from 'lucide-react';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import PayPalButton from '@/components/PayPalButton';
import logoUrl from '@assets/mascot-logo-optimized.png';

// Add dark mode hook (same code as above)
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
  pricing: { monthly: number; yearly: number };
  planIds: { monthly: string; yearly: string };
}

export default function CheckoutPage() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedTier, setSelectedTier] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    country: 'United States',
    companyName: '',
    companyAddress: '',
    billingEmail: ''
  });

  useEffect(() => {
    // Get tier and cycle from URL
    const params = new URLSearchParams(window.location.search);
    const tier = params.get('tier') || 'pro';
    const cycle = params.get('cycle') as 'monthly' | 'yearly' || 'yearly';
    
    setSelectedTier(tier);
    setBillingCycle(cycle);
    
    // Fetch plans
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const selectedPlan = plans.find(p => p.tier === selectedTier);
  const basePrice = selectedPlan 
    ? (billingCycle === 'monthly' ? selectedPlan.pricing.monthly : selectedPlan.pricing.yearly)
    : 0;
  const totalPrice = basePrice * seats;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Complete your purchase</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Type */}
              <Card className="p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Subscription type</h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {plans.map((plan) => (
                    <button
                      key={plan.tier}
                      onClick={() => setSelectedTier(plan.tier)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedTier === plan.tier
                          ? 'border-brand-gold bg-brand-gold/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-brand-gold" />
                        <span className="font-bold dark:text-white">{plan.name}</span>
                      </div>
                      <div className="text-sm text-brand-teal font-medium mb-1">
                        {plan.tier === 'starter' ? 'COMPRESS' : 'COMPRESS & CONVERT'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Billing Cycle and Seats */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold dark:text-white">
                      ${basePrice} per {selectedPlan.name} user
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-3 py-1 rounded text-sm ${
                          billingCycle === 'monthly' 
                            ? 'bg-brand-gold text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-3 py-1 rounded text-sm ${
                          billingCycle === 'yearly' 
                            ? 'bg-brand-gold text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>

                  {/* Seats Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                      >
                        −
                      </button>
                      <span className="font-bold w-8 text-center dark:text-white">{seats}</span>
                      <button
                        onClick={() => setSeats(seats + 1)}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Personal information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      <User className="inline w-4 h-4 mr-1" />
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option>United States</option>
                      <option>India</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Invoice Details (Optional) */}
              <Card className="p-6 dark:bg-gray-800">
                <button
                  onClick={() => setShowInvoice(!showInvoice)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-bold dark:text-white">
                    <Building className="inline w-5 h-5 mr-2" />
                    Add invoice details (optional)
                  </h2>
                  <span className="text-2xl dark:text-white">{showInvoice ? '−' : '+'}</span>
                </button>

                {showInvoice && (
                  <div className="mt-4 space-y-4">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Company name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      placeholder="Company address"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="email"
                      name="billingEmail"
                      value={formData.billingEmail}
                      onChange={handleInputChange}
                      placeholder="Billing email address"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </Card>

              {/* Payment Method */}
              <Card className="p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  <CreditCard className="inline w-5 h-5 mr-2" />
                  Payment method
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg ${
                      paymentMethod === 'card'
                        ? 'border-brand-gold bg-brand-gold/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 dark:text-white" />
                    <div className="font-semibold text-sm dark:text-white">Credit card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg ${
                      paymentMethod === 'paypal'
                        ? 'border-brand-gold bg-brand-gold/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-semibold text-sm dark:text-white">PayPal</div>
                  </button>
                </div>

                {/* PayPal Buttons */}
                <PayPalButton
                  type="order"
                  amount={totalPrice}
                  description={`MicroJPEG ${selectedPlan.name} - ${billingCycle} (${seats} seat${seats > 1 ? 's' : ''})`}
                  userId={user?.id || ''}
                  tier={selectedTier}
                  cycle={billingCycle}
                  onSuccess={() => {
                    window.location.href = '/subscription/success';
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    alert('Payment failed. Please try again.');
                  }}
                />
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 dark:bg-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Order summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {seats}x {selectedPlan.name} subscription
                    </span>
                    <span className="font-semibold dark:text-white">${basePrice * seats}</span>
                  </div>
                  
                  {billingCycle === 'yearly' && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Yearly discount</span>
                      <span>−${((basePrice * 12 * seats) - totalPrice).toFixed(0)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="dark:text-white">Total</span>
                    <span className="text-brand-gold">${totalPrice}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Includes sales tax (if applicable)
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  By purchasing you agree to the{' '}
                  <a href="/terms" className="text-brand-teal hover:underline">
                    terms of use
                  </a>
                  .
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

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