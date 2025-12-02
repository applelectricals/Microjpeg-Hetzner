/**
 * User Tier Routes - Backend API
 * 
 * Endpoints:
 * - GET /api/user/tier-info - Get user's current tier and subscription
 * - GET /api/user/subscription - Get subscription details
 * - GET /api/user/usage-stats - Get usage statistics
 * - POST /api/user/update-tier - Update tier after payment (internal)
 */

import { Router, Request, Response } from 'express';
import { storage } from './storage';

const router = Router();

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

const TIER_CONFIG: Record<string, {
  tierDisplay: string;
  maxFileSize: number;      // MB
  maxRawFileSize: number;   // MB
  maxBatchSize: number;
  operationsLimit: number;
  priority: boolean;
}> = {
  'free': {
    tierDisplay: 'Free',
    maxFileSize: 7,
    maxRawFileSize: 15,
    maxBatchSize: 1,
    operationsLimit: 500,
    priority: false,
  },
  'starter-m': {
    tierDisplay: 'Starter Monthly',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 5,
    operationsLimit: -1, // Unlimited
    priority: false,
  },
  'starter-y': {
    tierDisplay: 'Starter Annual',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 5,
    operationsLimit: -1,
    priority: false,
  },
  'pro-m': {
    tierDisplay: 'Pro Monthly',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 10,
    operationsLimit: -1,
    priority: true,
  },
  'pro-y': {
    tierDisplay: 'Pro Annual',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 10,
    operationsLimit: -1,
    priority: true,
  },
  'business-m': {
    tierDisplay: 'Business Monthly',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 20,
    operationsLimit: -1,
    priority: true,
  },
  'business-y': {
    tierDisplay: 'Business Annual',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 20,
    operationsLimit: -1,
    priority: true,
  },
};

// Helper to get user ID from session
function getUserId(req: Request): string | null {
  const session = req.session as any;
  return session?.userId || session?.user?.id || null;
}

// ============================================================================
// GET /api/user/tier-info
// Returns user's tier, limits, and subscription status
// ============================================================================

router.get('/tier-info', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Not authenticated - return free tier
    if (!userId) {
      return res.json({
        authenticated: false,
        tier: {
          tierName: 'free',
          tierDisplay: 'Free',
          maxFileSize: 7,
          maxRawFileSize: 15,
          maxBatchSize: 1,
          operationsLimit: 500,
          pageIdentifier: 'free',
        },
        subscription: null,
        user: null,
      });
    }

    // Get user from database
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.json({
        authenticated: true,
        tier: {
          tierName: 'free',
          tierDisplay: 'Free (Registered)',
          maxFileSize: 7,
          maxRawFileSize: 15,
          maxBatchSize: 1,
          operationsLimit: 500,
          pageIdentifier: 'free',
        },
        subscription: null,
        user: { userId, email: null },
      });
    }

    // Determine tier from subscription
    let tierName = 'free';
    const subTier = user.subscriptionTier?.toLowerCase();
    const subCycle = user.subscriptionBillingCycle?.toLowerCase();
    const subStatus = user.subscriptionStatus?.toLowerCase();

    // Check if subscription is active
    const isActive = subStatus === 'active';
    const isNotExpired = user.subscriptionEndDate 
      ? new Date(user.subscriptionEndDate) > new Date() 
      : false;

    if (isActive && isNotExpired && subTier) {
      // Map subscription tier + cycle to tier name
      if (subTier === 'starter') {
        tierName = subCycle === 'yearly' ? 'starter-y' : 'starter-m';
      } else if (subTier === 'pro') {
        tierName = subCycle === 'yearly' ? 'pro-y' : 'pro-m';
      } else if (subTier === 'business') {
        tierName = subCycle === 'yearly' ? 'business-y' : 'business-m';
      } else {
        // Direct tier name (e.g., 'starter-m', 'pro-y')
        tierName = subTier;
      }
    }

    // Get tier config
    const config = TIER_CONFIG[tierName] || TIER_CONFIG['free'];

    // Calculate days remaining
    let daysRemaining = 0;
    if (user.subscriptionEndDate) {
      const end = new Date(user.subscriptionEndDate);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Build response
    const response = {
      authenticated: true,
      tier: {
        tierName,
        tierDisplay: config.tierDisplay,
        maxFileSize: config.maxFileSize,
        maxRawFileSize: config.maxRawFileSize,
        maxBatchSize: config.maxBatchSize,
        operationsLimit: config.operationsLimit,
        pageIdentifier: tierName === 'free' ? 'free' : 
                        tierName.includes('business') ? 'enterprise-99' : 'premium-29',
        priority: config.priority,
      },
      subscription: tierName !== 'free' ? {
        status: user.subscriptionStatus || 'unknown',
        tier: user.subscriptionTier,
        billingCycle: user.subscriptionBillingCycle,
        startDate: user.subscriptionStartDate?.toISOString(),
        endDate: user.subscriptionEndDate?.toISOString(),
        daysRemaining,
        razorpaySubscriptionId: user.razorpaySubscriptionId,
        paypalSubscriptionId: user.paypalSubscriptionId,
      } : null,
      user: {
        userId,
        email: user.email,
        firstName: user.firstName,
      },
    };

    console.log(`📊 Tier info for ${userId}: ${tierName}`);
    res.json(response);

  } catch (error: any) {
    console.error('❌ Tier info error:', error);
    res.status(500).json({ error: 'Failed to get tier info' });
  }
});

// ============================================================================
// GET /api/user/subscription
// Returns detailed subscription information for dashboard
// ============================================================================

router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine tier
    let tier = 'free';
    const subTier = user.subscriptionTier?.toLowerCase();
    const subCycle = user.subscriptionBillingCycle?.toLowerCase();
    
    if (user.subscriptionStatus === 'active' && subTier) {
      if (subTier === 'starter') {
        tier = subCycle === 'yearly' ? 'starter-y' : 'starter-m';
      } else if (subTier === 'pro') {
        tier = subCycle === 'yearly' ? 'pro-y' : 'pro-m';
      } else if (subTier === 'business') {
        tier = subCycle === 'yearly' ? 'business-y' : 'business-m';
      } else {
        tier = subTier;
      }
    }

    res.json({
      tier,
      status: user.subscriptionStatus || 'free',
      billingCycle: user.subscriptionBillingCycle || null,
      startDate: user.subscriptionStartDate?.toISOString() || null,
      endDate: user.subscriptionEndDate?.toISOString() || null,
      razorpaySubscriptionId: user.razorpaySubscriptionId || null,
      paypalSubscriptionId: user.paypalSubscriptionId || null,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
    });

  } catch (error: any) {
    console.error('❌ Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// ============================================================================
// GET /api/user/usage-stats
// Returns usage statistics for dashboard
// ============================================================================

router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get usage stats from user record (or separate stats table)
    res.json({
      compressions: user.totalCompressions || 0,
      conversions: user.totalConversions || 0,
      totalSize: user.totalBytesProcessed || 0,
      avgCompression: user.avgCompressionRatio || 0,
      monthlyCompressions: user.monthlyCompressions || 0,
      monthlyLimit: user.subscriptionStatus === 'active' ? -1 : 500,
    });

  } catch (error: any) {
    console.error('❌ Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

// ============================================================================
// POST /api/user/activate-subscription
// Called after successful payment to activate subscription
// ============================================================================

router.post('/activate-subscription', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      tier,
      cycle,
      paymentId,
      subscriptionId,
      paymentMethod, // 'razorpay' or 'paypal'
      amount,
      currency,
    } = req.body;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Build update object
    const update: any = {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionBillingCycle: cycle,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      lastPaymentAmount: amount,
      lastPaymentCurrency: currency,
      lastPaymentDate: startDate,
      updatedAt: new Date(),
    };

    // Add payment-specific IDs
    if (paymentMethod === 'razorpay') {
      update.razorpaySubscriptionId = subscriptionId;
      update.razorpayPaymentId = paymentId;
    } else if (paymentMethod === 'paypal') {
      update.paypalSubscriptionId = subscriptionId;
      update.paypalPaymentId = paymentId;
    }

    await storage.updateUser(userId, update);

    console.log(`✅ Subscription activated: ${userId} → ${tier} (${cycle})`);

    res.json({
      success: true,
      message: 'Subscription activated',
      subscription: {
        tier,
        cycle,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('❌ Activate subscription error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

export default router;
