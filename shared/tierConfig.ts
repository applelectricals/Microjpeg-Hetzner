// ============================================================================
// TIER CONFIGURATION - Single Source of Truth
// ============================================================================
// This file defines the 2-tier structure: Free + Starter
// Use this in both frontend and backend for consistency
// ============================================================================

export interface TierConfig {
  name: string;
  displayName: string;
  
  // Pricing
  priceMonthly: number;
  priceYearly: number;
  
  // Compression/Conversion
  monthlyOperations: number; // -1 = unlimited
  maxFileSize: number; // in MB, display as "Unlimited" for paid
  maxRawFileSize: number; // in MB
  
  // AI Features
  bgRemovalLimit: number;
  enhancementLimit: number;
  maxUpscale: number;
  faceEnhancement: boolean;
  allOutputFormats: boolean; // true = WebP, AVIF, PNG, JPG; false = PNG only
  
  // API
  apiAccess: boolean;
  apiRateLimit: number; // requests per hour
  
  // Processing
  priorityProcessing: boolean;
  batchSize: number;
  
  // Support
  supportLevel: 'community' | 'email' | 'priority';
}

export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    
    // Pricing
    priceMonthly: 0,
    priceYearly: 0,
    
    // Compression/Conversion
    monthlyOperations: 30,
    maxFileSize: 5,
    maxRawFileSize: 10,
    
    // AI Features
    bgRemovalLimit: 10,
    enhancementLimit: 10,
    maxUpscale: 2,
    faceEnhancement: false,
    allOutputFormats: false,
    
    // API
    apiAccess: false,
    apiRateLimit: 0,
    
    // Processing
    priorityProcessing: false,
    batchSize: 1,
    
    // Support
    supportLevel: 'community',
  },
  
  starter: {
    name: 'starter',
    displayName: 'Starter',
    
    // Pricing
    priceMonthly: 9,
    priceYearly: 49,
    
    // Compression/Conversion
    monthlyOperations: -1, // Unlimited
    maxFileSize: 75, // Display as "Unlimited"
    maxRawFileSize: 100,
    
    // AI Features
    bgRemovalLimit: 300,
    enhancementLimit: 300,
    maxUpscale: 8,
    faceEnhancement: true,
    allOutputFormats: true,
    
    // API
    apiAccess: true,
    apiRateLimit: 1000,
    
    // Processing
    priorityProcessing: true,
    batchSize: 1,
    
    // Support
    supportLevel: 'priority',
  },
};

// ============================================================================
// RAZORPAY PLAN MAPPING
// ============================================================================

export const RAZORPAY_PLANS = {
  'starter-monthly': {
    planId: 'plan_Rkbt8vVdqEAWtB',
    buttonId: 'pl_RlaSYlOEgnhvGu',
    price: 9,
    tier: 'starter',
    cycle: 'monthly',
  },
  'starter-yearly': {
    planId: 'plan_RkdJ0gPYJrRvtH',
    buttonId: 'pl_RlwkI8y1JWtyrV',
    price: 49,
    tier: 'starter',
    cycle: 'yearly',
  },
};

// Map Razorpay plan ID to tier name
export function getTierFromRazorpayPlan(planId: string): string {
  for (const [key, config] of Object.entries(RAZORPAY_PLANS)) {
    if (config.planId === planId) {
      return config.tier;
    }
  }
  return 'free';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize any tier name to our 2-tier structure
 * Maps legacy tier names (pro, business, premium, etc.) to 'starter'
 */
export function normalizeTierName(tier: string): 'free' | 'starter' {
  if (!tier) return 'free';
  
  const normalizedTier = tier.toLowerCase();
  
  // Any paid tier variant maps to 'starter'
  if (normalizedTier.includes('starter') || 
      normalizedTier.includes('pro') || 
      normalizedTier.includes('business') ||
      normalizedTier.includes('premium') ||
      normalizedTier.includes('paid')) {
    return 'starter';
  }
  
  return 'free';
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier: string): TierConfig {
  const normalizedTier = normalizeTierName(tier);
  return TIER_CONFIG[normalizedTier];
}

/**
 * Check if tier is a paid tier
 */
export function isPaidTier(tier: string): boolean {
  return normalizeTierName(tier) === 'starter';
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: string): string {
  const config = getTierConfig(tier);
  if (config.monthlyOperations === -1) {
    return `${config.displayName} Plan - Unlimited`;
  }
  return `${config.displayName} Plan`;
}

/**
 * Get file size limits in bytes
 */
export function getFileSizeLimits(tier: string): { regular: number; raw: number } {
  const config = getTierConfig(tier);
  return {
    regular: config.maxFileSize * 1024 * 1024,
    raw: config.maxRawFileSize * 1024 * 1024,
  };
}

/**
 * Check if user can use a specific feature
 */
export function canUseFeature(tier: string, feature: string): boolean {
  const config = getTierConfig(tier);
  
  switch (feature) {
    case 'api':
      return config.apiAccess;
    case 'faceEnhancement':
      return config.faceEnhancement;
    case 'allOutputFormats':
      return config.allOutputFormats;
    case 'priorityProcessing':
      return config.priorityProcessing;
    case '8xUpscale':
      return config.maxUpscale >= 8;
    case '4xUpscale':
      return config.maxUpscale >= 4;
    default:
      return true;
  }
}

/**
 * Get remaining operations for a feature
 */
export function getRemainingOperations(
  tier: string, 
  feature: 'compression' | 'bgRemoval' | 'enhancement',
  used: number
): { limit: number; remaining: number; isUnlimited: boolean } {
  const config = getTierConfig(tier);
  
  let limit: number;
  switch (feature) {
    case 'compression':
      limit = config.monthlyOperations;
      break;
    case 'bgRemoval':
      limit = config.bgRemovalLimit;
      break;
    case 'enhancement':
      limit = config.enhancementLimit;
      break;
    default:
      limit = 0;
  }
  
  const isUnlimited = limit === -1;
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - used);
  
  return { limit, remaining, isUnlimited };
}
