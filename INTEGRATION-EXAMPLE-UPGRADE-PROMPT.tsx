// ============================================================================
// EXAMPLE: How to integrate UpgradePrompt into your AI pages
// Add these snippets to your remove-background.tsx and enhance-image.tsx pages
// ============================================================================

// ============================================================================
// 1. IMPORTS - Add at top of file
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { 
  UpgradePrompt, 
  useUpgradePrompt, 
  UsageIndicator,
  LimitReachedBanner 
} from '@/components/UpgradePrompt';

// ============================================================================
// 2. FETCH USAGE DATA - Add inside your component
// ============================================================================

// For Remove Background page:
const { data: bgLimits } = useQuery({
  queryKey: ['/api/ai/bg-removal/limits'],
  retry: false,
});

// For Enhance Image page:
const { data: enhanceLimits } = useQuery({
  queryKey: ['/api/ai/enhance/limits'],
  retry: false,
});

// ============================================================================
// 3. SETUP UPGRADE PROMPT HOOK
// ============================================================================

// For Remove Background page:
const upgradePrompt = useUpgradePrompt({
  feature: 'background_removal',
  usageStats: bgLimits ? {
    used: bgLimits.limit - bgLimits.remaining,
    remaining: bgLimits.remaining,
    limit: bgLimits.limit,
  } : null,
  tierName: bgLimits?.tier || 'free',
});

// For Enhance Image page:
const upgradePrompt = useUpgradePrompt({
  feature: 'image_enhancement',
  usageStats: enhanceLimits ? {
    used: enhanceLimits.limit - enhanceLimits.remaining,
    remaining: enhanceLimits.remaining,
    limit: enhanceLimits.limit,
  } : null,
  tierName: enhanceLimits?.tier || 'free',
});

// ============================================================================
// 4. HANDLE PROCESSING RESULT - In your submit handler
// ============================================================================

const handleProcess = async () => {
  try {
    const response = await fetch('/api/remove-background', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Check if it's a limit or feature restriction error
      if (result.error === 'limit_reached' || result.showUpgradePrompt) {
        upgradePrompt.checkAndShowPrompt(result);
        return;
      }
      
      if (result.error === 'format_restricted') {
        upgradePrompt.showRestrictedFeaturePrompt(result.allowedFormats ? 
          `${formData.get('outputFormat')} output` : 'this feature');
        return;
      }
      
      if (result.error === 'scale_restricted') {
        upgradePrompt.showRestrictedFeaturePrompt(`${formData.get('scale')}x upscale`);
        return;
      }
      
      if (result.error === 'feature_restricted') {
        upgradePrompt.showRestrictedFeaturePrompt('Face Enhancement');
        return;
      }
      
      throw new Error(result.message || 'Processing failed');
    }
    
    // Success - check if we should show upgrade prompt
    if (result.usage?.showUpgradePrompt) {
      upgradePrompt.checkAndShowPrompt(result.usage);
    }
    
    // Continue with success handling...
    setResult(result);
    
  } catch (error) {
    console.error('Processing error:', error);
  }
};

// ============================================================================
// 5. ADD TO JSX - Place these in your component's return statement
// ============================================================================

// Add the usage indicator near the top of your page:
{bgLimits && (
  <UsageIndicator
    feature="background_removal"
    used={bgLimits.limit - bgLimits.remaining}
    limit={bgLimits.limit}
    onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
  />
)}

// Add limit reached banner if user has no remaining operations:
{bgLimits && bgLimits.remaining <= 0 && (
  <LimitReachedBanner
    feature="background_removal"
    onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
  />
)}

// Add the upgrade prompt modal at the end of your component (before closing tag):
<UpgradePrompt {...upgradePrompt.promptProps} />

// ============================================================================
// 6. DISABLE PROCESSING WHEN LIMIT REACHED
// ============================================================================

<Button
  onClick={handleProcess}
  disabled={!file || processing || (bgLimits?.remaining || 0) <= 0}
  className="w-full"
>
  {(bgLimits?.remaining || 0) <= 0 
    ? 'Limit Reached - Upgrade to Continue'
    : processing 
      ? 'Processing...' 
      : 'Remove Background'
  }
</Button>

// ============================================================================
// 7. FULL EXAMPLE COMPONENT STRUCTURE
// ============================================================================

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [, setLocation] = useLocation();

  // Fetch limits
  const { data: bgLimits, refetch: refetchLimits } = useQuery({
    queryKey: ['/api/ai/bg-removal/limits'],
  });

  // Setup upgrade prompt
  const upgradePrompt = useUpgradePrompt({
    feature: 'background_removal',
    usageStats: bgLimits ? {
      used: bgLimits.limit - bgLimits.remaining,
      remaining: bgLimits.remaining,
      limit: bgLimits.limit,
    } : null,
    tierName: bgLimits?.tier || 'free',
  });

  const handleProcess = async () => {
    if (!file) return;
    
    // Check limits before processing
    if (bgLimits && bgLimits.remaining <= 0) {
      upgradePrompt.setIsOpen(true);
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', selectedFormat);
      formData.append('quality', quality.toString());

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.showUpgradePrompt || data.error === 'limit_reached') {
          upgradePrompt.checkAndShowPrompt(data);
          return;
        }
        if (data.error === 'format_restricted') {
          upgradePrompt.showRestrictedFeaturePrompt(`${selectedFormat.toUpperCase()} output`);
          return;
        }
        throw new Error(data.message || 'Processing failed');
      }

      setResult(data.result);
      
      // Refetch limits to update UI
      refetchLimits();
      
      // Check if should show upgrade prompt after successful operation
      if (data.usage?.showUpgradePrompt) {
        // Small delay so user can see the result first
        setTimeout(() => {
          upgradePrompt.checkAndShowPrompt(data.usage);
        }, 1500);
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Usage Indicator */}
      {bgLimits && (
        <div className="mb-6">
          <UsageIndicator
            feature="background_removal"
            used={bgLimits.limit - bgLimits.remaining}
            limit={bgLimits.limit}
            onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
          />
        </div>
      )}

      {/* Limit Reached Banner */}
      {bgLimits && bgLimits.remaining <= 0 && (
        <LimitReachedBanner
          feature="background_removal"
          onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
        />
      )}

      {/* Your existing page content... */}
      <div className="max-w-4xl mx-auto">
        {/* Upload area */}
        {/* Options */}
        {/* Results */}
        
        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={!file || processing || (bgLimits?.remaining || 0) <= 0}
          className="w-full"
        >
          {(bgLimits?.remaining || 0) <= 0 
            ? 'Limit Reached - Upgrade to Continue'
            : processing 
              ? 'Processing...' 
              : 'Remove Background'
          }
        </Button>
      </div>

      {/* Upgrade Prompt Modal - MUST be at the end */}
      <UpgradePrompt {...upgradePrompt.promptProps} />
    </div>
  );
}

// ============================================================================
// 8. FOR ENHANCE IMAGE PAGE - Similar pattern with different feature type
// ============================================================================

export default function EnhanceImagePage() {
  // ... same pattern but with:
  // - feature: 'image_enhancement'
  // - queryKey: ['/api/ai/enhance/limits']
  // - endpoint: '/api/enhance-image'
  // - Handle scale_restricted and feature_restricted errors for 4x/8x and face enhancement
}
