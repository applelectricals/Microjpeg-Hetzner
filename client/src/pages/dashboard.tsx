import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  X,
  Settings,
  Download,
  BarChart3,
  Zap,
  Eraser,
  Sparkles,
  Image,
  TrendingUp,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface SubscriptionInfo {
  isPremium: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface AIUsageStats {
  tier: string;
  tierDisplayName: string;
  backgroundRemoval: {
    used: number;
    remaining: number;
    limit: number;
    percentUsed: number;
    outputFormats: string[];
    maxFileSize: number;
  };
  imageEnhancement: {
    used: number;
    remaining: number;
    limit: number;
    percentUsed: number;
    maxUpscale: number;
    faceEnhancement: boolean;
    maxFileSize: number;
  };
  features: {
    priorityProcessing: boolean;
    apiAccess: string;
    supportLevel: string;
  };
  upgradeUrl: string | null;
}

interface CompressionStats {
  compressions: number;
  limit: number;
  isPremium: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  // Fetch subscription information
  const { data: subscriptionInfo, isLoading: subscriptionLoading } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/subscription-info"],
    retry: false,
  });

  // Fetch AI usage statistics
  const { data: aiUsage, isLoading: aiLoading, refetch: refetchAI } = useQuery<AIUsageStats>({
    queryKey: ["/api/ai/usage"],
    retry: false,
  });

  // Fetch compression statistics
  const { data: compressionStats, isLoading: compressionLoading } = useQuery<CompressionStats>({
    queryKey: ["/api/compression-limits"],
    retry: false,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cancel-subscription");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-info"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCancelSubscription = () => {
    setCancellingSubscription(true);
    cancelSubscriptionMutation.mutate();
    setCancellingSubscription(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Active</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>;
      case "past_due":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Past Due</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getTierBadgeColor = (tier: string) => {
    if (tier.includes('business')) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (tier.includes('pro')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (tier.includes('starter')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  if (subscriptionLoading || aiLoading || compressionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFreeTier = aiUsage?.tier === 'free' || aiUsage?.tier === 'free_registered';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor your usage and manage your subscription
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getTierBadgeColor(aiUsage?.tier || 'free')}>
                {aiUsage?.tier === 'free' || aiUsage?.tier === 'free_registered' ? (
                  'Free Plan'
                ) : (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    {aiUsage?.tierDisplayName || 'Premium'}
                  </>
                )}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAI()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Upgrade Banner for Free Users */}
          {isFreeTier && (
            <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Unlock More AI Features</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get 200+ AI operations, all output formats, 8x upscaling & more
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setLocation("/pricing")}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    Upgrade from $9/mo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Usage Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Background Removal Usage */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                      <Eraser className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    Background Removal
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {aiUsage?.backgroundRemoval.remaining}/{aiUsage?.backgroundRemoval.limit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Monthly Usage</span>
                      <span className={`font-medium ${
                        (aiUsage?.backgroundRemoval.percentUsed || 0) >= 80 
                          ? 'text-red-600' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {aiUsage?.backgroundRemoval.percentUsed || 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getProgressColor(aiUsage?.backgroundRemoval.percentUsed || 0)}`}
                        style={{ width: `${Math.min(aiUsage?.backgroundRemoval.percentUsed || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">
                        {aiUsage?.backgroundRemoval.used || 0}
                      </div>
                      <div className="text-xs text-slate-500">Used</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {aiUsage?.backgroundRemoval.remaining || 0}
                      </div>
                      <div className="text-xs text-slate-500">Remaining</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-500">Output formats:</span>
                      {aiUsage?.backgroundRemoval.outputFormats.map(format => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setLocation("/remove-background")}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    disabled={(aiUsage?.backgroundRemoval.remaining || 0) <= 0}
                  >
                    {(aiUsage?.backgroundRemoval.remaining || 0) <= 0 
                      ? 'Limit Reached - Upgrade' 
                      : 'Remove Background'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Enhancement Usage */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    Image Enhancement
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {aiUsage?.imageEnhancement.remaining}/{aiUsage?.imageEnhancement.limit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Monthly Usage</span>
                      <span className={`font-medium ${
                        (aiUsage?.imageEnhancement.percentUsed || 0) >= 80 
                          ? 'text-red-600' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {aiUsage?.imageEnhancement.percentUsed || 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getProgressColor(aiUsage?.imageEnhancement.percentUsed || 0)}`}
                        style={{ width: `${Math.min(aiUsage?.imageEnhancement.percentUsed || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-violet-600">
                        {aiUsage?.imageEnhancement.used || 0}
                      </div>
                      <div className="text-xs text-slate-500">Used</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {aiUsage?.imageEnhancement.remaining || 0}
                      </div>
                      <div className="text-xs text-slate-500">Remaining</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Max upscale:</span>
                      <Badge variant="secondary">{aiUsage?.imageEnhancement.maxUpscale}x</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Face enhancement:</span>
                      {aiUsage?.imageEnhancement.faceEnhancement ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setLocation("/enhance-image")}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    disabled={(aiUsage?.imageEnhancement.remaining || 0) <= 0}
                  >
                    {(aiUsage?.imageEnhancement.remaining || 0) <= 0 
                      ? 'Limit Reached - Upgrade' 
                      : 'Enhance Image'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compression & Plan Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Compression Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Compression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-blue-600">
                    {compressionStats?.compressions?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Total Compressions</div>
                </div>
                <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {aiUsage?.tier?.includes('free') ? '200/month limit' : 'Unlimited'}
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Compress Images
                </Button>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Plan</span>
                    <span className="font-semibold">{aiUsage?.tierDisplayName || 'Free'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    {getStatusBadge(subscriptionInfo?.subscriptionStatus)}
                  </div>
                  {subscriptionInfo?.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Renews</span>
                      <span className="text-sm">{formatDate(subscriptionInfo.currentPeriodEnd)}</span>
                    </div>
                  )}
                  {subscriptionInfo?.cancelAtPeriodEnd && (
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs">
                        Cancels on {formatDate(subscriptionInfo.currentPeriodEnd)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Priority Processing</span>
                    {aiUsage?.features.priorityProcessing ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">API Access</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {aiUsage?.features.apiAccess || 'none'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Support</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {aiUsage?.features.supportLevel || 'community'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Manage Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {isFreeTier ? (
                  <Button 
                    onClick={() => setLocation("/pricing")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                ) : (
                  <>
                    {!subscriptionInfo?.cancelAtPeriodEnd && (
                      <Button 
                        onClick={handleCancelSubscription}
                        variant="outline"
                        disabled={cancellingSubscription}
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
                      </Button>
                    )}
                  </>
                )}
                <Button 
                  onClick={() => setLocation("/")}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Start Processing
                </Button>
                <Button 
                  onClick={() => setLocation("/api-keys")}
                  variant="outline"
                  disabled={aiUsage?.features.apiAccess === 'none'}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  API Keys
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Reset Notice */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            Usage limits reset on the 1st of each month
          </div>
        </div>
      </div>
    </div>
  );
}
