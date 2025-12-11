import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { X, Crown, Zap, Check, ArrowRight, Sparkles, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'background_removal' | 'image_enhancement';
  usageStats: {
    used: number;
    remaining: number;
    limit: number;
    percentUsed: number;
  };
  restrictedFeature?: string;
  tierName: string;
}

export function UpgradePrompt({ 
  isOpen, 
  onClose, 
  feature, 
  usageStats, 
  restrictedFeature,
  tierName 
}: UpgradePromptProps) {
  const [, setLocation] = useLocation();
  const isLimitReached = usageStats.remaining <= 0;

  const featureConfig = {
    background_removal: {
      icon: Eraser,
      name: 'Background Removal',
      gradient: 'from-pink-500 to-rose-500',
      benefits: [
        { free: '5/month', paid: '200-1000/month' },
        { free: 'PNG only', paid: 'PNG, WebP, AVIF, JPG' },
        { free: '10MB max', paid: 'Up to 25MB' },
      ],
    },
    image_enhancement: {
      icon: Sparkles,
      name: 'Image Enhancement',
      gradient: 'from-violet-500 to-purple-500',
      benefits: [
        { free: '3/month', paid: '200-1000/month' },
        { free: '2x upscale', paid: 'Up to 8x upscale' },
        { free: 'No face enhance', paid: 'Face enhancement included' },
      ],
    },
  };

  const config = featureConfig[feature];
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isLimitReached 
                  ? `${config.name} Limit Reached` 
                  : restrictedFeature 
                    ? `Unlock ${restrictedFeature}`
                    : `Running Low on ${config.name}`
                }
              </h2>
              <p className="text-white/80 text-sm">
                {isLimitReached 
                  ? `You've used all ${usageStats.limit} operations this month`
                  : restrictedFeature
                    ? `This feature requires a paid plan`
                    : `${usageStats.remaining} of ${usageStats.limit} remaining`
                }
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          {!restrictedFeature && (
            <div className="mt-4">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(usageStats.percentUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{usageStats.used} used</span>
                <span>{usageStats.remaining} remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Upgrade to unlock:
          </h3>
          
          <div className="space-y-3 mb-6">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-slate-400 line-through text-sm">{benefit.free}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-medium">{benefit.paid}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
              className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              onClick={() => setLocation('/pricing?plan=starter')}
            >
              <div className="text-lg font-bold text-slate-900 dark:text-white">$9</div>
              <div className="text-xs text-slate-500">Starter/mo</div>
              <div className="text-xs text-blue-600 mt-1">200 ops</div>
            </button>
            <button 
              className="text-center p-3 border-2 border-blue-500 rounded-xl bg-blue-50 dark:bg-blue-950/30 relative"
              onClick={() => setLocation('/pricing?plan=pro')}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                Popular
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">$19</div>
              <div className="text-xs text-slate-500">Pro/mo</div>
              <div className="text-xs text-blue-600 mt-1">500 ops</div>
            </button>
            <button 
              className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              onClick={() => setLocation('/pricing?plan=business')}
            >
              <div className="text-lg font-bold text-slate-900 dark:text-white">$49</div>
              <div className="text-xs text-slate-500">Business/mo</div>
              <div className="text-xs text-blue-600 mt-1">1000 ops</div>
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation('/pricing')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade Now
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-shrink-0"
            >
              Maybe Later
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-slate-500 mt-4">
            Limits reset on the 1st of each month. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK TO MANAGE UPGRADE PROMPTS
// ============================================================================

interface UseUpgradePromptOptions {
  feature: 'background_removal' | 'image_enhancement';
  usageStats: {
    used: number;
    remaining: number;
    limit: number;
  } | null;
  tierName: string;
}

export function useUpgradePrompt({ feature, usageStats, tierName }: UseUpgradePromptOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState<string | undefined>();
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  const percentUsed = usageStats && usageStats.limit > 0 
    ? Math.round((usageStats.used / usageStats.limit) * 100) 
    : 0;

  // Check if should show prompt after operation
  const checkAndShowPrompt = (operationResult?: { showUpgradePrompt?: boolean }) => {
    if (hasShownThisSession) return;

    if (operationResult?.showUpgradePrompt) {
      setIsOpen(true);
      setHasShownThisSession(true);
      return;
    }

    if (usageStats && usageStats.remaining <= 0) {
      setIsOpen(true);
      setHasShownThisSession(true);
      return;
    }

    // Show when hitting free tier limits
    const isFreeTier = tierName === 'free' || tierName === 'free_registered';
    if (isFreeTier && usageStats) {
      const threshold = feature === 'background_removal' ? 5 : 3;
      if (usageStats.used >= threshold && usageStats.remaining === 0) {
        setIsOpen(true);
        setHasShownThisSession(true);
      }
    }
  };

  const showRestrictedFeaturePrompt = (featureName: string) => {
    setRestrictedFeature(featureName);
    setIsOpen(true);
  };

  const closePrompt = () => {
    setIsOpen(false);
    setRestrictedFeature(undefined);
  };

  return {
    isOpen,
    setIsOpen,
    restrictedFeature,
    percentUsed,
    checkAndShowPrompt,
    showRestrictedFeaturePrompt,
    closePrompt,
    promptProps: {
      isOpen,
      onClose: closePrompt,
      feature,
      usageStats: usageStats ? { ...usageStats, percentUsed } : { used: 0, remaining: 0, limit: 0, percentUsed: 0 },
      restrictedFeature,
      tierName,
    },
  };
}

// ============================================================================
// USAGE INDICATOR COMPONENT
// ============================================================================

interface UsageIndicatorProps {
  feature: 'background_removal' | 'image_enhancement';
  used: number;
  limit: number;
  onUpgradeClick: () => void;
}

export function UsageIndicator({ feature, used, limit, onUpgradeClick }: UsageIndicatorProps) {
  const remaining = limit - used;
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;
  
  const isLow = percentUsed >= 60;
  const isCritical = percentUsed >= 80;
  const isExhausted = remaining <= 0;

  if (limit === 0) return null;

  const featureName = feature === 'background_removal' ? 'removals' : 'enhancements';

  return (
    <div className={`
      flex items-center gap-3 px-4 py-2 rounded-lg text-sm
      ${isExhausted 
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
        : isCritical 
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          : isLow
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
      }
    `}>
      <div className="flex-1">
        <span className="font-medium">{remaining}</span>
        <span className="mx-1">/</span>
        <span>{limit}</span>
        <span className="ml-1">{featureName} left</span>
      </div>
      
      {(isCritical || isExhausted) && (
        <button
          onClick={onUpgradeClick}
          className={`
            px-3 py-1 rounded-md text-xs font-medium transition-colors
            ${isExhausted 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
            }
          `}
        >
          {isExhausted ? 'Upgrade' : 'Get More'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// LIMIT REACHED BANNER (for showing at top of AI pages)
// ============================================================================

interface LimitReachedBannerProps {
  feature: 'background_removal' | 'image_enhancement';
  onUpgradeClick: () => void;
}

export function LimitReachedBanner({ feature, onUpgradeClick }: LimitReachedBannerProps) {
  const featureName = feature === 'background_removal' ? 'background removal' : 'image enhancement';
  
  return (
    <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-3 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded">
            <X className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium">Monthly {featureName} limit reached</p>
            <p className="text-sm text-white/80">Upgrade to continue processing images</p>
          </div>
        </div>
        <Button
          onClick={onUpgradeClick}
          className="bg-white text-red-600 hover:bg-white/90 gap-2"
        >
          <Crown className="w-4 h-4" />
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// FEATURE RESTRICTED TOOLTIP
// ============================================================================

interface FeatureRestrictedProps {
  featureName: string;
  children: React.ReactNode;
  onUpgradeClick: () => void;
}

export function FeatureRestricted({ featureName, children, onUpgradeClick }: FeatureRestrictedProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="opacity-50 cursor-not-allowed"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onUpgradeClick}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
          <div className="flex items-center gap-2">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{featureName} requires upgrade</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
