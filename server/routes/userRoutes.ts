// server/routes/userRoutes.ts
import { Router } from 'express';
import { db } from '../db';
import { userAccounts } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Tier configuration mapping
const TIER_CONFIGS = {
  'free': {
    tierName: 'free',
    tierDisplay: 'Free',
    maxFileSize: 7,
    maxRawFileSize: 15,
    maxBatchSize: 3,
    operationsLimit: 200,
    pageIdentifier: 'free-auth'
  },
  'starter-m': {
    tierName: 'starter-m',
    tierDisplay: 'Starter Monthly',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 10,
    operationsLimit: 999999,
    pageIdentifier: 'premium-29'
  },
  'starter-y': {
    tierName: 'starter-y',
    tierDisplay: 'Starter Yearly',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 10,
    operationsLimit: 999999,
    pageIdentifier: 'premium-29'
  },
  'pro-m': {
    tierName: 'pro-m',
    tierDisplay: 'PRO Monthly',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 20,
    operationsLimit: 999999,
    pageIdentifier: 'premium-29'
  },
  'pro-y': {
    tierName: 'pro-y',
    tierDisplay: 'PRO Yearly',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 20,
    operationsLimit: 999999,
    pageIdentifier: 'premium-29'
  },
  'business-m': {
    tierName: 'business-m',
    tierDisplay: 'BUSINESS Monthly',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 50,
    operationsLimit: 999999,
    pageIdentifier: 'enterprise-99'
  },
  'business-y': {
    tierName: 'business-y',
    tierDisplay: 'BUSINESS Yearly',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 50,
    operationsLimit: 999999,
    pageIdentifier: 'enterprise-99'
  }
};

// GET /api/user/tier-info
router.get('/tier-info', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session?.userId) {
      return res.json({
        authenticated: false,
        tier: TIER_CONFIGS['free']
      });
    }

    // Fetch user from database
    const user = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.userId, req.session.userId))
      .limit(1);

    if (!user || user.length === 0) {
      return res.json({
        authenticated: true,
        tier: TIER_CONFIGS['free']
      });
    }

    const userData = user[0];
    
    // Check if subscription is expired
    const now = new Date();
    const isExpired = userData.subscriptionEndDate && new Date(userData.subscriptionEndDate) < now;
    
    // If expired, downgrade to free
    let effectiveTier = userData.tierName || 'free';
    if (isExpired && effectiveTier !== 'free') {
      // Auto-downgrade to free
      await db
        .update(userAccounts)
        .set({ 
          tierName: 'free',
          subscriptionStatus: 'expired'
        })
        .where(eq(userAccounts.userId, userData.userId));
      
      effectiveTier = 'free';
    }

    // Get tier config
    const tierConfig = TIER_CONFIGS[effectiveTier] || TIER_CONFIGS['free'];

    res.json({
      authenticated: true,
      tier: tierConfig,
      subscription: {
        status: userData.subscriptionStatus,
        startDate: userData.subscriptionStartDate,
        endDate: userData.subscriptionEndDate,
        paymentAmount: userData.paymentAmount,
        daysRemaining: userData.subscriptionEndDate 
          ? Math.max(0, Math.ceil((new Date(userData.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null
      },
      user: {
        email: userData.email,
        userId: userData.userId
      }
    });

  } catch (error) {
    console.error('Error fetching tier info:', error);
    res.status(500).json({ error: 'Failed to fetch tier information' });
  }
});

export default router;
