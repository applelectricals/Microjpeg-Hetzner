import { Request, Response, NextFunction } from 'express';
import { tierLimitService } from '../services/TierLimitService';

declare global {
  namespace Express {
    interface Request {
      tierLimits?: any;
      userTier?: string;
      isPaidUser?: boolean;
    }
  }
}

// ============================================================================
// 2-TIER STRUCTURE: Free + Starter
// ============================================================================

// Normalize any tier name to our 2-tier structure
function normalizeTier(tier: string): 'free' | 'starter' {
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

// Check if tier is paid
function isPaidTier(tier: string): boolean {
  return normalizeTier(tier) === 'starter';
}

// Get tier limits based on 2-tier structure
function getTierLimits(tier: string) {
  const normalizedTier = normalizeTier(tier);
  
  if (normalizedTier === 'starter') {
    return {
      // Compression/Conversion
      monthlyOperations: -1, // Unlimited
      maxFileSize: 75 * 1024 * 1024, // 75MB (shown as "Unlimited")
      maxRawFileSize: 100 * 1024 * 1024, // 100MB
      
      // AI Features
      bgRemovalLimit: 300,
      enhancementLimit: 300,
      maxUpscale: 8,
      faceEnhancement: true,
      allOutputFormats: true, // WebP, AVIF, PNG, JPG
      
      // API
      apiAccess: true,
      apiRateLimit: 1000,
      
      // Processing
      priorityProcessing: true,
      batchSize: 1,
    };
  }
  
  // Free tier
  return {
    // Compression/Conversion
    monthlyOperations: 30,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxRawFileSize: 10 * 1024 * 1024, // 10MB
    
    // AI Features
    bgRemovalLimit: 10,
    enhancementLimit: 10,
    maxUpscale: 2,
    faceEnhancement: false,
    allOutputFormats: false, // PNG only for AI
    
    // API
    apiAccess: false,
    apiRateLimit: 0,
    
    // Processing
    priorityProcessing: false,
    batchSize: 1,
  };
}

export async function attachTierLimits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let rawTierName = 'free';
    
    if (req.user && (req.user as any).subscriptionTier) {
      rawTierName = (req.user as any).subscriptionTier;
    } else if (req.user && (req.user as any).tier) {
      rawTierName = (req.user as any).tier;
    }

    const normalizedTier = normalizeTier(rawTierName);
    const limits = getTierLimits(rawTierName);
    
    req.tierLimits = limits;
    req.userTier = normalizedTier;
    req.isPaidUser = isPaidTier(rawTierName);

    next();
  } catch (error) {
    console.error('Error attaching tier limits:', error);
    // Default to free tier on error
    req.tierLimits = getTierLimits('free');
    req.userTier = 'free';
    req.isPaidUser = false;
    next();
  }
}

// Middleware to require paid tier (Starter)
export function requirePaidTier() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isPaidUser) {
      return res.status(403).json({
        error: 'Paid tier required',
        message: 'This feature requires the Starter plan',
        currentTier: req.userTier,
        upgradeUrl: '/pricing'
      });
    }
    next();
  };
}

// Legacy compatibility - maps old tier names to new structure
export function requireTier(minTier: string) {
  // In 2-tier structure, anything above 'free' means 'starter'
  const requiresPaid = minTier !== 'free';

  return (req: Request, res: Response, next: NextFunction) => {
    if (requiresPaid && !req.isPaidUser) {
      return res.status(403).json({
        error: 'Insufficient tier',
        message: 'This feature requires the Starter plan',
        currentTier: req.userTier,
        upgradeUrl: '/pricing'
      });
    }
    next();
  };
}

// Export helper functions for use in routes
export { normalizeTier, isPaidTier, getTierLimits };
