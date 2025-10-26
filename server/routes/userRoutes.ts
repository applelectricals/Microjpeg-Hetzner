// server/routes/userRoutes.ts
import { Router } from 'express';
import { pool } from '../db';

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
        tier: {
          ...TIER_CONFIGS['free'],
          pageIdentifier: 'free-no-auth' // Not authenticated
        }
      });
    }

    // Fetch user from database
    const result = await pool.query(
      'SELECT * FROM user_accounts WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        authenticated: true,
        tier: TIER_CONFIGS['free']
      });
    }

    const userData = result.rows[0];
    
    // Check if subscription is expired
    const now = new Date();
    const isExpired = userData.subscription_end_date && new Date(userData.subscription_end_date) < now;
    
    // If expired, downgrade to free
    let effectiveTier = userData.tier_name || 'free';
    if (isExpired && effectiveTier !== 'free') {
      // Auto-downgrade to free
      await pool.query(
        'UPDATE user_accounts SET tier_name = $1, subscription_status = $2 WHERE user_id = $3',
        ['free', 'expired', userData.user_id]
      );
      
      effectiveTier = 'free';
    }

    // Get tier config
    const tierConfig = TIER_CONFIGS[effectiveTier] || TIER_CONFIGS['free'];

    // Calculate days remaining
    let daysRemaining = null;
    if (userData.subscription_end_date) {
      const endDate = new Date(userData.subscription_end_date);
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    res.json({
      authenticated: true,
      tier: tierConfig,
      subscription: {
        status: userData.subscription_status,
        startDate: userData.subscription_start_date,
        endDate: userData.subscription_end_date,
        paymentAmount: userData.payment_amount,
        daysRemaining: daysRemaining
      },
      user: {
        email: userData.email,
        userId: userData.user_id
      }
    });

  } catch (error) {
    console.error('Error fetching tier info:', error);
    res.status(500).json({ error: 'Failed to fetch tier information' });
  }
});

export default router;
