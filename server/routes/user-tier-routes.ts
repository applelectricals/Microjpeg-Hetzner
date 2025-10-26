/**
 * SIMPLIFIED USER TIER API ROUTES
 * 
 * Endpoints for user tier info and usage
 * - GET /api/user/usage - Get user's tier and limits
 * - POST /api/user/check-operation - Check if user can perform operation
 * - POST /api/user/increment-usage - Increment usage counter
 */

import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * GET /api/user/usage
 * Get user's tier information and usage/usage summary
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    // Get user email from session/auth
    const userEmail = req.user?.email || 'richngrand@gmail.com'; // Default for testing
    
    const result = await pool.query(
      'SELECT * FROM user_tier_info WHERE user_email = $1',
      [userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No tier found for user',
        message: 'Please contact support to activate your subscription'
      });
    }

    const tierInfo = result.rows[0];

    res.json({
      success: true,
      tier: {
        name: tierInfo.tier_name,
        displayName: tierInfo.tier_display_name,
        billingPeriod: tierInfo.billing_period,
        maxFileSizeMb: tierInfo.max_file_size_mb,
        maxBatchUploads: tierInfo.max_batch_uploads,
        operationsLimit: tierInfo.operations_per_period,
        operationsUsed: tierInfo.operations_used,
        operationsRemaining: tierInfo.operations_remaining,
        usagePercentage: parseFloat(tierInfo.usage_percentage),
        periodStart: tierInfo.period_start,
        periodEnd: tierInfo.period_end,
        paymentConfirmed: tierInfo.payment_confirmed,
        isActive: tierInfo.is_active
      }
    });
  } catch (error) {
    console.error('Error fetching tier info:', error);
    res.status(500).json({
      error: 'Failed to fetch tier information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/user/check-operation
 * Check if user can perform an operation
 * Body: { fileSizeMb: number, batchSize: number }
 */
router.post('/check-operation', async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email || 'richngrand@gmail.com';
    const { fileSizeMb, batchSize } = req.body;

    const result = await pool.query(
      'SELECT * FROM check_user_can_operate($1, $2, $3)',
      [userEmail, fileSizeMb || 0, batchSize || 1]
    );

    const check = result.rows[0];

    res.json({
      success: true,
      canOperate: check.can_operate,
      reason: check.reason,
      operationsRemaining: check.operations_remaining
    });
  } catch (error) {
    console.error('Error checking operation:', error);
    res.status(500).json({
      error: 'Failed to check operation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/user/increment-usage
 * Increment user's usage counter
 * Body: { count: number }
 */
router.post('/increment-usage', async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email || 'richngrand@gmail.com';
    const { count = 1 } = req.body;

    const result = await pool.query(
      'SELECT increment_user_operations($1, $2) as success',
      [userEmail, count]
    );

    res.json({
      success: result.rows[0].success,
      message: result.rows[0].success ? 'Usage updated' : 'Failed to update usage'
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({
      error: 'Failed to increment usage',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/grant-tier
 * Grant tier to user (admin only)
 * Body: { userEmail: string, tierName: string }
 */
router.post('/admin/grant-tier', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin check
    const { userEmail, tierName } = req.body;

    if (!userEmail || !tierName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userEmail and tierName are required'
      });
    }

    // Get tier ID
    const tierResult = await pool.query(
      'SELECT tier_id, billing_period FROM tier_definitions WHERE tier_name = $1',
      [tierName]
    );

    if (tierResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Tier not found',
        message: `Tier ${tierName} does not exist`
      });
    }

    const { tier_id, billing_period } = tierResult.rows[0];
    
    // Calculate period end
    const periodEnd = billing_period === 'monthly' 
      ? "CURRENT_TIMESTAMP + INTERVAL '1 month'"
      : "CURRENT_TIMESTAMP + INTERVAL '1 year'";

    // Insert or update grant
    await pool.query(`
      INSERT INTO user_tier_grants (user_email, tier_id, payment_confirmed, payment_confirmation_date, period_end)
      VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, ${periodEnd})
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        tier_id = $2,
        payment_confirmed = TRUE,
        payment_confirmation_date = CURRENT_TIMESTAMP,
        period_end = ${periodEnd},
        is_active = TRUE,
        operations_used = 0
    `, [userEmail, tier_id]);

    res.json({
      success: true,
      message: `Granted ${tierName} tier to ${userEmail}`
    });
  } catch (error) {
    console.error('Error granting tier:', error);
    res.status(500).json({
      error: 'Failed to grant tier',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
