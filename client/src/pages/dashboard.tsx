/**
 * User Dashboard - Subscription Management
 * 
 * Features:
 * - View current subscription status
 * - Usage statistics
 * - Cancel/pause subscription
 * - Update payment method (redirect to Razorpay/PayPal)
 * - Billing history
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Header from '@/components/header';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Download,
  BarChart3,
  Zap,
  ArrowUpRight,
  Loader2,
  XCircle,
  RefreshCw,
  Clock,
  FileImage,
  HardDrive
} from 'lucide-react';

// Types
interface SubscriptionInfo {
  tier: string;
  status: 'active' | 'cancelled' | 'halted' | 'paused' | 'free';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  razorpaySubscriptionId?: string;
  paypalSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
}

interface UsageStats {
  compressions: number;
  conversions: number;
  totalSize: number;
  avgCompression: number;
}

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  return { isDark, setIsDark: (v: boolean) => {
    localStorage.setItem('darkMode', String(v));
    document.documentElement.classList.toggle('dark', v);
    setIsDark(v);
  }};
}

// Plan limits
const PLAN_LIMITS = {
  free: { fileSize: '10MB', concurrent: 1, priority: false },
  starter: { fileSize: '75MB', concurrent: 1, priority: false },
  pro: { fileSize: '150MB', concurrent: 3, priority: true },
  business: { fileSize: '200MB', concurrent: 5, priority: true },
};

export default function Dashboard() {
  const { isDark, setIsDark } = useDarkMode();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch subscription info
  const { data: subscription, isLoading: subLoading, refetch: refetchSub } = useQuery<SubscriptionInfo>({
    queryKey: ['/api/user/subscription'],
    retry: false,
  });

  // Fetch usage stats
  const { data: usage, isLoading: usageLoading } = useQuery<UsageStats>({
    queryKey: ['/api/user/usage-stats'],
    retry: false,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/payment/razorpay/cancel-subscription', {
        cancel_at_cycle_end: true,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });
      setShowCancelDialog(false);
      refetchSub();
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    await cancelMutation.mutateAsync();
    setCancelLoading(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      case 'halted':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" /> Payment Failed
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" /> Paused
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">Free Plan</Badge>
        );
    }
  };

  const tier = subscription?.tier || 'free';
  const limits = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const isPremium = tier !== 'free';

  if (subLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Manage your subscription and view usage
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Badge className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30 px-4 py-2">
                <Crown className="w-4 h-4 mr-2 text-yellow-400" />
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Badge>
            ) : (
              <Badge variant="secondary" className="px-4 py-2">Free Plan</Badge>
            )}
          </div>
        </div>

        {/* Subscription Warning */}
        {subscription?.cancelAtPeriodEnd && (
          <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              Your subscription will end on {formatDate(subscription.endDate)}. 
              <button 
                onClick={() => setLocation('/pricing')}
                className="ml-2 underline hover:text-yellow-100"
              >
                Reactivate
              </button>
            </AlertDescription>
          </Alert>
        )}

        {subscription?.status === 'halted' && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Payment failed. Please update your payment method to continue using premium features.
              <button 
                onClick={() => setLocation('/checkout?plan=' + tier)}
                className="ml-2 underline hover:text-red-100"
              >
                Update Payment
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5 text-teal-400" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-semibold text-white flex items-center gap-2">
                      {isPremium && <Crown className="w-4 h-4 text-yellow-400" />}
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    {getStatusBadge(subscription?.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Billing Cycle</span>
                    <span className="text-white">
                      {subscription?.billingCycle === 'yearly' ? 'Annual' : 'Monthly'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {isPremium && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Started</span>
                        <span className="text-white">{formatDate(subscription?.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">
                          {subscription?.cancelAtPeriodEnd ? 'Ends On' : 'Next Billing'}
                        </span>
                        <span className="text-white">{formatDate(subscription?.endDate)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <FileImage className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {usage?.compressions?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-400">Compressions</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <RefreshCw className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {usage?.conversions?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-400">Conversions</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <HardDrive className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {formatBytes(usage?.totalSize || 0)}
                  </div>
                  <p className="text-xs text-gray-400">Processed</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {usage?.avgCompression || 0}%
                  </div>
                  <p className="text-xs text-gray-400">Avg Compression</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Features */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-teal-400" />
                Your Plan Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Max File Size</p>
                  <p className="text-xl font-bold text-white">{limits.fileSize}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Concurrent Uploads</p>
                  <p className="text-xl font-bold text-white">{limits.concurrent}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Priority Processing</p>
                  <p className="text-xl font-bold text-white">
                    {limits.priority ? (
                      <span className="text-green-400">✓ Enabled</span>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                  </p>
                </div>
              </div>

              {!isPremium && (
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-xl border border-teal-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Upgrade for More</p>
                      <p className="text-sm text-gray-400">Get larger files, priority processing, and more</p>
                    </div>
                    <Button 
                      onClick={() => setLocation('/pricing')}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      View Plans <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-teal-400" />
                Manage Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setLocation('/compress')}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Start Compressing
                </Button>

                {!isPremium ? (
                  <Button 
                    onClick={() => setLocation('/pricing')}
                    variant="outline"
                    className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                ) : (
                  <>
                    {subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd && (
                      <Button 
                        onClick={() => setShowCancelDialog(true)}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                    
                    {subscription?.cancelAtPeriodEnd && (
                      <Button 
                        onClick={() => setLocation('/pricing')}
                        variant="outline"
                        className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                      >
                        Reactivate Subscription
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Cancel Subscription?</DialogTitle>
              <DialogDescription className="text-gray-400">
                Your subscription will remain active until {formatDate(subscription?.endDate)}. 
                After that, your account will revert to the Free plan.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gray-900/50 rounded-lg p-4 my-4">
              <p className="text-sm text-gray-300">You'll lose access to:</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>• Large file uploads ({limits.fileSize})</li>
                <li>• Priority processing</li>
                <li>• {limits.concurrent} concurrent uploads</li>
              </ul>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(false)}
                className="border-gray-600"
              >
                Keep Subscription
              </Button>
              <Button 
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
