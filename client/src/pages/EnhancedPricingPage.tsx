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
  Choose the right plan for your needs
</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional image compression with RAW support. From individuals to enterprises.
          </p>
        </div>

        {/* Main Tabs */}
        {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-800/50 backdrop-blur-xl rounded-xl p-2 border border-gray-700/50">
            <TabsTrigger value="web" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Web
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              WordPress
            </TabsTrigger>
            <TabsTrigger value="cdn" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              CDN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="web">
            <WebPricing billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
          </TabsContent>

          <TabsContent value="api">
            <APIPricing />
          </TabsContent>

          <TabsContent value="wordpress">
            <WordPressPricing billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
          </TabsContent>

          <TabsContent value="cdn">
            <CDNPricing />
          </TabsContent>
        </Tabs> */}

        {/* Direct Web Pricing Display */}
        <WebPricing billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}

// ==================== WEB PRICING ====================
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
        'Compress/Convert: 200/month',
        'File Size: 7MB Regular/15MB RAW',
        'AI BG Removal: 5/month',
        'BG Output Formats: PNG only',
        'AI Enhancement: 3/month',
        'Max Upscale: 2x',
        'Face Enhancement: No',
        'Priority Processing: No',
        'API Access: None'
        'Support: Community'
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
      description: 'For freelancers',
      features: [
        'Compress/Convert: UNLIMITED',
        'File Size: UNLIMITED',
        'AI BG Removal: 200/month',
        'BG Output Formats: WEBP, AVIF, PNG, JPG',
        'AI Enhancement: 200/month',
        'Max Upscale: 8x',
        'Face Enhancement: Yes',
        'Priority Processing: No',
        'API Access: Basic'
        'Support: Email'
      ],
      cta: 'Get Starter',
      popular: false,
    },
    {
      name: 'Pro',
      priceMonthly: '$19',
      priceYearly: '$149',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $79/year' : null,
      description: 'For professionals',
      features: [
        'Compress/Convert: UNLIMITED',
        'File Size: UNLIMITED',
        'AI BG Removal: 500/month',
        'BG Output Formats: WEBP, AVIF, PNG, JPG',
        'AI Enhancement: 500/month',
        'Max Upscale: 8x',
        'Face Enhancement: Yes',
        'Priority Processing: Yes',
        'API Access: Full'
        'Support: Priority'
      ],
      cta: 'Get Pro',
      popular: true,
    },
    {
      name: 'Business',
      priceMonthly: '$49',
      priceYearly: '$349',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'yearly' ? 'Save $239/year' : null,
      description: 'For teams',
      features: [
        'Compress/Convert: UNLIMITED',
        'File Size: UNLIMITED',
        'AI BG Removal: 1000/month',
        'BG Output Formats: WEBP, AVIF, PNG, JPG',
        'AI Enhancement: 1000/month',
        'Max Upscale: 8x',
        'Face Enhancement: Yes',
        'Priority Processing: Yes',
        'API Access: Full'
        'Support: Priority'
      ],
      cta: 'Get Business',
      popular: false,
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
              Save 25%
            </span>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
  Most Popular
</span>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
              <p className="text-sm text-gray-400">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  {plan.priceMonthly && billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly || plan.price}
                </span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
                {plan.savings && (
                  <p className="text-green-500 text-sm mt-1">{plan.savings}</p>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
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
  onClick={() => window.location.href = `/checkout?plan=${plan.name.toLowerCase()}`}
  className={`w-full ${plan.popular 
    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all' 
    : 'border-2 border-teal-400/50 text-teal-400 hover:bg-teal-400/10 backdrop-blur-sm'
  }`}
  variant={plan.popular ? 'default' : 'outline'}
>
  {plan.cta}
</Button>
)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== API PRICING ====================
function APIPricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [operations, setOperations] = useState([5000]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(true);

  // Get tier-based limits and permissions
  const getTierInfo = () => {
    if (!user) {
      return {
        tier: 'Guest',
        monthlyLimit: 0,
        rateLimit: 0,
        maxFileSize: '0MB',
        permissions: [],
        color: 'gray'
      };
    }

    const tier = user.subscriptionTier || 'free';

    switch (tier.toLowerCase()) {
      case 'starter':
      case 'starter-monthly':
      case 'starter-yearly':
        return {
          tier: 'Starter',
          monthlyLimit: 500,
          rateLimit: 500,
          maxFileSize: '30MB regular, 75MB RAW',
          permissions: ['compress', 'convert', 'batch'],
          color: 'blue'
        };
      case 'pro':
      case 'pro-monthly':
      case 'pro-yearly':
        return {
          tier: 'Pro',
          monthlyLimit: 500,
          rateLimit: 2000,
          maxFileSize: '50MB regular, 100MB RAW',
          permissions: ['compress', 'convert', 'batch', 'webhook', 'priority'],
          color: 'purple'
        };
      case 'business':
      case 'business-monthly':
      case 'business-yearly':
        return {
          tier: 'Business',
          monthlyLimit: 500,
          rateLimit: 10000,
          maxFileSize: '100MB regular, 200MB RAW',
          permissions: ['compress', 'convert', 'batch', 'webhook', 'priority', 'whitelabel'],
          color: 'indigo'
        };
      default: // free
        return {
          tier: 'Free',
          monthlyLimit: 500,
          rateLimit: 100,
          maxFileSize: '10MB regular, 50MB RAW',
          permissions: ['compress', 'convert'],
          color: 'green'
        };
    }
  };

  const tierInfo = getTierInfo();

  // Fetch API keys
  const { data: apiKeys } = useQuery({
    queryKey: ['/api/keys'],
    refetchInterval: 30000,
  }) as { data: { apiKeys: any[] } | undefined };

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (keyData: { name: string }) => {
      const response = await apiRequest('POST', '/api/keys', {
        name: keyData.name
      });
      return response;
    },
    onSuccess: async (response: any) => {
      let data;
      if (response instanceof Response) {
        data = await response.json();
      } else {
        data = response;
      }

      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });

      const fullKey = data.fullKey || data.apiKey?.fullKey || data.key;
      if (fullKey) {
        setCreatedKey(fullKey);
        setShowCreatedKey(true);
      }

      setIsCreateDialogOpen(false);
      setNewKeyName('');

      toast({
        title: '✅ API Key Created Successfully!',
        description: 'Your API key is ready to use.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  const calculateCost = (ops: number) => {
    if (ops <= 500) return 0;
    
    let cost = 0;
    let remaining = ops;
    
    // First 500 free
    remaining -= 500;
    
    // Next 4,500 at $0.005
    if (remaining > 0) {
      const tier1 = Math.min(remaining, 4500);
      cost += tier1 * 0.005;
      remaining -= tier1;
    }
    
    // Next 45,000 at $0.003
    if (remaining > 0) {
      const tier2 = Math.min(remaining, 45000);
      cost += tier2 * 0.003;
      remaining -= tier2;
    }
    
    // Over 50,000 at $0.002
    if (remaining > 0) {
      cost += remaining * 0.002;
    }
    
    return cost;
  };

  const prepaidPackages = [
    { ops: 10000, price: 35, perOp: 0.0035, savings: '30%' },
    { ops: 50000, price: 125, perOp: 0.0025, savings: '50%' },
    { ops: 100000, price: 200, perOp: 0.002, savings: '60%' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Developer API Pricing</h2>
        <p className="text-xl text-gray-300">
          Pay only for what you use. No monthly fees. 500 free operations every month.
        </p>
      </div>

      {/* Get API Key Section */}
      {createdKey ? (
        <Card className="mb-12 bg-green-50 dark:bg-green-900/10 border-2 border-green-500">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  ✅ API Key Created Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Save your API key securely. You won't be able to see it again.
                </p>
              </div>
              <div className="p-4 bg-gray-900 dark:bg-black rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 break-all">
                    {showCreatedKey ? createdKey : createdKey.replace(/(?<=sk_test_).+/, '••••••••••••••••')}
                  </span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(createdKey);
                      toast({
                        title: 'Copied!',
                        description: 'API key copied to clipboard',
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    Copy
                  </Button>
                </div>
                <button
                  onClick={() => setShowCreatedKey(!showCreatedKey)}
                  className="mt-2 text-gray-400 hover:text-gray-300 flex items-center gap-1"
                >
                  {showCreatedKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCreatedKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <Button onClick={() => setCreatedKey(null)} variant="outline" className="w-full">
                Create Another Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-12 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 shadow-lg shadow-teal-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">
  🔑 Get Your Free API Key
</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start with 500 free operations • No credit card required
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
  size="lg"
  className="ml-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
  onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = '/login?redirect=/pricing';
                        return;
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Get API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <p className="text-sm text-gray-400">
                      API keys automatically inherit your {tierInfo.tier} plan limits
                    </p>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Tier Info Display */}
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h4 className="font-medium mb-2 dark:text-white">{tierInfo.tier} Plan Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div><span className="font-medium">Monthly:</span> {tierInfo.monthlyLimit.toLocaleString()} ops</div>
                        <div><span className="font-medium">Rate:</span> {tierInfo.rateLimit.toLocaleString()}/hour</div>
                        <div><span className="font-medium">File Size:</span> {tierInfo.maxFileSize}</div>
                        <div><span className="font-medium">Formats:</span> All formats</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">API Permissions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tierInfo.permissions.map((permission) => (
                              <span key={permission} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production API, Mobile App"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => createKeyMutation.mutate({ name: newKeyName || `${tierInfo.tier} API Key` })}
                      disabled={createKeyMutation.isPending}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium"
                    >
                      {createKeyMutation.isPending ? 'Creating...' : `Create ${tierInfo.tier} API Key`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Calculator */}
      <Card className="mb-12 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 shadow-lg shadow-teal-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Pay-as-you-go Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4 text-white">Operations per month</label>
              <Slider
                value={operations}
                onValueChange={setOperations}
                min={500}
                max={100000}
                step={500}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span className="text-gray-300">500</span>
<span className="text-2xl font-bold text-white">
  {operations[0].toLocaleString()}
</span>
<span className="text-gray-300">100,000</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 bg-gray-900/50 rounded-lg border border-teal-500/30">
  <span className="text-gray-300">Estimated monthly cost</span>
              <span className="text-4xl font-bold text-green-500">
                ${calculateCost(operations[0]).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card className="mb-12 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
        <CardHeader>
          <CardTitle>Pay-as-you-go Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <div>
                <p className="font-medium text-white">First 500 operations</p>
                <p className="text-sm text-gray-400">Every month</p>
              </div>
              <span className="text-2xl font-bold text-green-500">FREE</span>
            </div>
            
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <div>
                <p className="font-medium text-white">Operations 501 - 5,000</p>
                <p className="text-sm text-gray-400">Per operation</p>
              </div>
              <span className="text-2xl font-bold text-white">$0.005</span>
            </div>
            
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <div>
                <p className="font-medium text-white">Operations 5,001 - 50,000</p>
                <p className="text-sm text-gray-400">Per operation</p>
              </div>
              <span className="text-2xl font-bold text-white">$0.003</span>
            </div>
            
            <div className="flex justify-between items-center p-4">
              <div>
                <p className="font-medium text-white">Over 50,000 operations</p>
                <p className="text-sm text-gray-400">Per operation</p>
              </div>
              <span className="text-2xl font-bold text-white">$0.002</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prepaid Packages */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Prepaid Packages (Best Value)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prepaidPackages.map((pkg) => (
            <Card key={pkg.ops} className="bg-gray-800/50 backdrop-blur-xl border-2 border-gray-700/50 hover:border-teal-500/50 transition-all shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">{(pkg.ops / 1000).toFixed(0)}K Operations</CardTitle>
<div className="text-3xl font-bold mt-2 text-white">${pkg.price}</div>
                <p className="text-sm text-gray-300">
                  ${pkg.perOp.toFixed(4)} per operation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Save {pkg.savings}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">Never expires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">All formats supported</span>
                  </div>
                </div>
                <Button
  onClick={() => window.location.href = `/checkout?plan=api-${pkg.ops / 1000}k&amount=${pkg.price}`}
  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
>
  Buy Package
</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
  <Zap className="w-6 h-6 text-teal-400" />
</div>
              <h4 className="font-bold text-white">Pay per use</h4>
            </div>
            <p className="text-sm text-gray-300">
              Only pay for successful operations. No monthly fees or hidden charges.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white">RESTful API</h4>
            </div>
            <p className="text-sm text-gray-300">
              Simple HTTP API with libraries for Node.js, Python, Ruby, PHP, and more.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-bold text-white">99.9% Uptime</h4>
            </div>
            <p className="text-sm text-gray-300">
              Enterprise-grade reliability with global CDN delivery and automatic failover.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== WORDPRESS PRICING ====================
function WordPressPricing({ billingCycle, setBillingCycle }: { 
  billingCycle: 'monthly' | 'yearly', 
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void 
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">WordPress Plugin Pricing</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Automatically compress and optimize images in your WordPress media library
        </p>
      </div>

      <Card className="mb-8 bg-gray-800/50 backdrop-blur-xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Boxes className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-white">Same Pricing as Web Plans</h3>
<p className="text-gray-400 mb-4">
                The WordPress plugin uses your Web subscription. Choose any Web plan above and use the plugin automatically!
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">Automatic compression on upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">Bulk optimize existing images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">RAW file support (DNG, CR2, NEF, ARW)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">Auto WebP & AVIF conversion</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
  size="lg" 
  className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
  onClick={() => window.open('https://wordpress.org/plugins/microjpeg/', '_blank')}
>
          Download Plugin
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Compatible with WordPress 5.0+
        </p>
      </div>
    </div>
  );
}

// ==================== CDN PRICING ====================
function CDNPricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      description: 'For small websites',
      bandwidth: '100 GB',
      features: [
        '100 GB bandwidth included',
        '1 custom domain',
        'Auto WebP/AVIF conversion',
        'Image transformations',
        'Edge caching (global)',
        'Basic analytics',
        '$0.20/GB overage',
      ],
      cta: 'Get Started',
    },
    {
      name: 'Business',
      price: '$69',
      period: '/month',
      description: 'For growing businesses',
      bandwidth: '1000 GB',
      popular: true,
      features: [
        '1000 GB bandwidth included',
        '3 custom domains',
        'RAW format support',
        'Auto WebP/AVIF conversion',
        'Advanced image transformations',
        'Priority edge caching',
        'Advanced analytics',
        '$0.10/GB overage',
      ],
      cta: 'Get Business',
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For high-traffic sites',
      bandwidth: '3000 GB',
      features: [
        '3000 GB bandwidth included',
        '10 custom domains',
        'RAW format support',
        'White-label option',
        'Custom integration',
        'Dedicated support',
        'SLA guarantee',
        '$0.05/GB overage',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">CDN Pricing</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Lightning-fast global image delivery with automatic optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader>
<CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
              <p className="text-sm text-gray-400">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>
              <p className="text-sm font-medium text-teal-400 mt-2">
                {plan.bandwidth} bandwidth
              </p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.name === 'Enterprise' ? (
  <Button
    className="w-full"
    variant="outline"
    onClick={() => window.location.href = 'mailto:support@microjpeg.com?subject=CDN%20Enterprise%20Inquiry'}
  >
    {plan.cta}
  </Button>
) : (
  <Button
  onClick={() => window.location.href = `/checkout?plan=cdn-${plan.name.toLowerCase()}`}
  className={`w-full ${plan.popular 
    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all' 
    : 'border-2 border-teal-400/50 text-teal-400 hover:bg-teal-400/10 backdrop-blur-sm'
  }`}
  variant={plan.popular ? 'default' : 'outline'}
>
    {plan.cta}
  </Button>
)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CDN Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
  <Globe className="w-6 h-6 text-teal-400" />
</div>
              <h4 className="font-bold text-white">Global Edge Network</h4>
            </div>
            <p className="text-sm text-gray-300">
              Deliver images from 200+ edge locations worldwide for maximum speed.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-white">Auto Optimization</h4>
            </div>
            <p className="text-sm text-gray-300">
              Automatic WebP/AVIF conversion based on browser support.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Crown className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              
             <h4 className="font-bold text-white">RAW Support</h4>
            </div>
            <p className="text-sm text-gray-300">
              Serve RAW files as optimized JPEG/WebP/AVIF on-the-fly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== FAQ SECTION ====================
function FAQSection() {
  const faqs = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. All payments are processed securely through Stripe.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing cycle.',
    },
    {
      question: 'What RAW formats do you support?',
      answer: 'We support all major RAW formats: Canon (CR2, CR3), Nikon (NEF), Sony (ARW), Adobe (DNG), Olympus (ORF), Fujifilm (RAF), and more.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! The Free plan is completely free forever with 200 operations per month. No credit card required. Perfect for testing the service.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied within the first 14 days, contact us for a full refund.',
    },
    {
      question: 'How does the API pricing work?',
      answer: 'API pricing is pay-as-you-go with 500 free operations per month. After that, you pay per operation ($0.005-$0.002 depending on volume) or buy prepaid packages for better rates.',
    },
  ];

  return (
    <>
      <div className="mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all">
                <CardHeader>
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
