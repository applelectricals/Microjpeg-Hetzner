/**
 * USER API ROUTES
 * 
 * Endpoints for user tier limits and usage data
 */

import { Router, Request, Response } from 'express';
import { tierLimitService } from '../services/TierLimitService';
import { usageTracker } from '../services/UsageTracker';

const router = Router();

// TEMPORARY: Auth disabled for testing - will fix with proper auth middleware
// const requireAuth = (req: Request, res: Response, next: any) => {
//   if (!req.user) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }
//   next();
// };

/**
 * GET /api/user/tier-limits
 * Fetch current user's tier limits
 * TEMP: No auth - returns default tier
 */
router.get('/tier-limits', async (req: Request, res: Response) => {
  try {
    // TEMP: Use hardcoded user or guest tier
    const user = req.user || { tier: 'starter' };
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Get user's tier (default to 'free' if not set)
    const tierName = user.tier || 'free';

    // Fetch tier limits from service (cached)
    const tierLimits = await tierLimitService.getTierLimits(tierName);

    return res.status(200).json({
      success: true,
      tierLimits: {
        tier_name: tierLimits.tier_name,
        tier_display_name: tierLimits.tier_display_name,
        tier_description: tierLimits.tier_description,
        monthly_operations: tierLimits.monthly_operations,
        daily_operations: tierLimits.daily_operations,
        hourly_operations: tierLimits.hourly_operations,
        max_file_size_regular: tierLimits.max_file_size_regular,
        max_file_size_raw: tierLimits.max_file_size_raw,
        max_concurrent_uploads: tierLimits.max_concurrent_uploads,
        max_batch_size: tierLimits.max_batch_size,
        processing_timeout_seconds: tierLimits.processing_timeout_seconds,
        priority_processing: tierLimits.priority_processing,
        api_calls_monthly: tierLimits.api_calls_monthly,
        team_seats: tierLimits.team_seats,
        has_analytics: tierLimits.has_analytics,
        has_webhooks: tierLimits.has_webhooks,
        has_custom_profiles: tierLimits.has_custom_profiles,
        has_white_label: tierLimits.has_white_label,
        price_monthly: tierLimits.price_monthly,
        price_yearly: tierLimits.price_yearly
      }
    });
  } catch (error: any) {
    console.error('Error fetching tier limits:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch tier limits'
    });
  }
});

/**
 * GET /api/user/usage
 * Fetch current user's usage statistics
 */
router.get('/usage',  async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Fetch usage data from UsageTracker
    const usage = await usageTracker.getUserUsage(user.id);

    return res.status(200).json({
      success: true,
      usage: {
        operations_used: usage.operations_used,
        operations_limit: usage.operations_limit,
        api_calls_used: usage.api_calls_used,
        api_calls_limit: usage.api_calls_limit,
        period_start: usage.period_start,
        period_end: usage.period_end
      }
    });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch usage data'
    });
  }
});

/**
 * GET /api/user/profile
 * Get user profile with subscription info
 */
router.get('/profile',  async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Get tier limits
    const tierLimits = await tierLimitService.getTierLimits(user.tier || 'free');

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        subscription_status: user.subscription_status,
        subscription_period_start: user.subscription_period_start,
        subscription_period_end: user.subscription_period_end,
        tier_display_name: tierLimits.tier_display_name,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch user profile'
    });
  }
});

/**
 * GET /api/user/can-operate
 * Check if user can perform operations
 */
router.get('/can-operate',  async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const fileCount = parseInt(req.query.fileCount as string) || 1;
    const ipAddress = req.ip || req.socket.remoteAddress || '';

    const result = await usageTracker.canPerformOperation(user.id, ipAddress, fileCount);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error checking operation permission:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to check operation permission'
    });
  }
});

/**
 * POST /api/user/invalidate-cache
 * Invalidate user's cache (for testing/debugging)
 */
router.post('/invalidate-cache',  async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    await usageTracker.invalidateUserCache(user.id);

    return res.status(200).json({
      success: true,
      message: 'Cache invalidated successfully'
    });
  } catch (error: any) {
    console.error('Error invalidating cache:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to invalidate cache'
    });
  }
});

export default router;
