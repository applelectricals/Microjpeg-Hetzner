// ============================================================================
// REPLACEMENT FOR DynamicCompressPage.tsx - Lines 78-119
// Replace the getTierLimits, getTierPageIdentifier, and getTierDisplayName functions
// ============================================================================

// ============================================
// ✅ SIMPLIFIED 2-TIER STRUCTURE: Free + Starter
// ============================================
const getTierLimits = (tier: string) => {
  // Normalize tier name
  const normalizedTier = tier.toLowerCase().replace('-m', '-monthly').replace('-y', '-yearly');
  
  // Check if it's any Starter tier variant
  const isStarterTier = normalizedTier.includes('starter') || 
                        normalizedTier.includes('pro') || 
                        normalizedTier.includes('business') ||
                        normalizedTier.includes('premium');
  
  if (isStarterTier) {
    // Starter plan: "Unlimited" (actual 75MB)
    return { regular: 75, raw: 100, batch: 1 };
  }
  
  // Free tier limits
  return { regular: 5, raw: 10, batch: 1 };
};

// ✅ Maps tiers to legacy backend identifiers
const getTierPageIdentifier = (tier: string): string => {
  const normalizedTier = tier.toLowerCase();
  
  // Any paid tier maps to starter
  if (normalizedTier.includes('starter') || 
      normalizedTier.includes('pro') || 
      normalizedTier.includes('business') ||
      normalizedTier.includes('premium')) {
    return 'starter';
  }
  
  return 'free';
};

const getTierDisplayName = (tier: string) => {
  const normalizedTier = tier.toLowerCase();
  
  // Any paid tier displays as Starter
  if (normalizedTier.includes('starter') || 
      normalizedTier.includes('pro') || 
      normalizedTier.includes('business') ||
      normalizedTier.includes('premium')) {
    return 'Starter Plan - Unlimited';
  }
  
  return 'Free Plan';
};

// ============================================================================
// ADDITIONAL: Check if user is on paid tier
// ============================================================================
const isPaidTier = (tier: string): boolean => {
  const normalizedTier = tier.toLowerCase();
  return normalizedTier.includes('starter') || 
         normalizedTier.includes('pro') || 
         normalizedTier.includes('business') ||
         normalizedTier.includes('premium');
};
