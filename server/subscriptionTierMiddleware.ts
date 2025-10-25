import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "@shared/schema";

/**
 * Automatic subscription tier access control middleware
 * Applies restrictions based on user's subscription_tier without manual configuration
 */
export const subscriptionTierAccessControl: RequestHandler = async (req, res, next) => {
  try {
    const session = req.session as any;
    const path = req.path;

    // Skip for non-authenticated users on public routes
    if (!session?.userId) {
      return next();
    }

    // Get user's subscription tier from database
    const [user] = await db
      .select({ subscriptionTier: users.subscriptionTier, subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return next();
    }

    const { subscriptionTier, subscriptionStatus } = user;

    // Define restricted routes for each tier
    const tierRestrictions = {
      test_premium: {
        blockedRoutes: ['/premium', '/enterprise', '/api/premium', '/api/enterprise'],
        redirectRoute: '/test-premium',
        allowedRoutes: ['/test-premium', '/free', '/', '/api/test-premium', '/api/free']
      },
      free: {
        blockedRoutes: ['/premium', '/enterprise', '/test-premium', '/api/premium', '/api/enterprise', '/api/test-premium'],
        redirectRoute: '/free',
        allowedRoutes: ['/free', '/', '/api/free']
      }
    };

    // Apply automatic restrictions based on subscription tier
    if (subscriptionTier === 'test_premium' && subscriptionStatus === 'active') {
      const restrictions = tierRestrictions.test_premium;
      
      // Block access to premium/enterprise pages
      if (restrictions.blockedRoutes.some(route => path.startsWith(route))) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Your Test Premium plan does not include access to this feature',
          subscriptionTier: 'test_premium',
          redirectUrl: restrictions.redirectRoute,
          upgradeRequired: true
        });
      }

      // Auto-redirect from free routes to test premium routes
      if (path === '/free' || path === '/compress-free') {
        return res.redirect(302, restrictions.redirectRoute);
      }
    }

    if (subscriptionTier === 'free' || !subscriptionTier) {
      const restrictions = tierRestrictions.free;
      
      // Block access to premium/enterprise/test-premium pages
      if (restrictions.blockedRoutes.some(route => path.startsWith(route))) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Please upgrade your subscription to access this feature',
          subscriptionTier: subscriptionTier || 'free',
          redirectUrl: restrictions.redirectRoute,
          upgradeRequired: true
        });
      }
    }

    // Continue to next middleware
    next();

  } catch (error) {
    console.error('Subscription tier access control error:', error);
    next(); // Continue on error to avoid breaking the app
  }
};

/**
 * Automatic page routing based on subscription tier
 * Redirects users to appropriate pages based on their tier
 */
export const tierBasedRouting: RequestHandler = async (req, res, next) => {
  try {
    const session = req.session as any;
    const path = req.path;

    // Only apply to authenticated users on landing/dashboard routes
    if (!session?.userId || !['/', '/dashboard', '/home'].includes(path)) {
      return next();
    }

    // Get user's subscription tier
    const [user] = await db
      .select({ subscriptionTier: users.subscriptionTier, subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return next();
    }

    const { subscriptionTier, subscriptionStatus } = user;

    // Automatic routing based on subscription tier
    if (subscriptionTier === 'test_premium' && subscriptionStatus === 'active') {
      // Redirect test premium users to test premium page
      return res.redirect(302, '/test-premium');
    }

    if (subscriptionTier === 'pro' && subscriptionStatus === 'active') {
      // Redirect premium users to premium page
      return res.redirect(302, '/premium');
    }

    if (subscriptionTier === 'enterprise' && subscriptionStatus === 'active') {
      // Redirect enterprise users to enterprise page
      return res.redirect(302, '/enterprise');
    }

    // Free or unsubscribed users go to free page
    if (path === '/dashboard') {
      return res.redirect(302, '/free');
    }
    // Allow / to load normally - don't redirect home page

    next();

  } catch (error) {
    console.error('Tier-based routing error:', error);
    next(); // Continue on error
  }
};

/**
 * API endpoint access control based on subscription tier
 */
export const apiTierAccessControl: RequestHandler = async (req, res, next) => {
  try {
    const session = req.session as any;
    const path = req.path;

    // Only apply to API endpoints that require tier checking
    if (!path.startsWith('/api/') || !session?.userId) {
      return next();
    }

    // Get user's subscription tier
    const [user] = await db
      .select({ subscriptionTier: users.subscriptionTier, subscriptionStatus: users.subscriptionStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return next();
    }

    const { subscriptionTier, subscriptionStatus } = user;

    // Define API access rules per tier
    const apiAccessRules = {
      test_premium: {
        allowedEndpoints: ['/api/compress', '/api/convert', '/api/test-premium', '/api/free', '/api/auth', '/api/universal-usage-stats'],
        blockedEndpoints: ['/api/premium', '/api/enterprise', '/api/bulk', '/api/priority']
      },
      free: {
        allowedEndpoints: ['/api/compress', '/api/convert', '/api/free', '/api/auth', '/api/universal-usage-stats'],
        blockedEndpoints: ['/api/premium', '/api/enterprise', '/api/test-premium', '/api/bulk', '/api/priority']
      }
    };

    // Apply API restrictions based on tier
    if (subscriptionTier === 'test_premium' && subscriptionStatus === 'active') {
      const rules = apiAccessRules.test_premium;
      if (rules.blockedEndpoints.some(endpoint => path.startsWith(endpoint))) {
        return res.status(403).json({
          error: 'API access denied',
          message: 'Your Test Premium plan does not include access to this API endpoint',
          subscriptionTier: 'test_premium',
          upgradeRequired: true
        });
      }
    }

    if ((subscriptionTier === 'free' || !subscriptionTier) && subscriptionStatus !== 'active') {
      const rules = apiAccessRules.free;
      if (rules.blockedEndpoints.some(endpoint => path.startsWith(endpoint))) {
        return res.status(403).json({
          error: 'API access denied',
          message: 'Please upgrade your subscription to access this API endpoint',
          subscriptionTier: subscriptionTier || 'free',
          upgradeRequired: true
        });
      }
    }

    next();

  } catch (error) {
    console.error('API tier access control error:', error);
    next(); // Continue on error
  }
};