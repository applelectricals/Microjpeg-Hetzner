import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { subscriptionService } from '../services/SubscriptionService';

const router = Router();

// Get plan details
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.execute(
      sql`SELECT * FROM tier_limits WHERE tier_name != 'free' AND is_visible_on_pricing = true ORDER BY price_monthly`
    );

    const formatted = plans.rows.map((plan: any) => ({
      tier: plan.tier_name,
      name: plan.tier_display_name,
      description: plan.tier_description,
      monthlyOps: plan.monthly_operations,
      pricing: {
        monthly: parseFloat(plan.price_monthly),
        yearly: parseFloat(plan.price_yearly)
      },
      planIds: {
        monthly: process.env[`PAYPAL_PLAN_${plan.tier_name.toUpperCase()}_MONTHLY`],
        yearly: process.env[`PAYPAL_PLAN_${plan.tier_name.toUpperCase()}_YEARLY`]
      },
      features: {
        fileSize: `${plan.max_file_size_regular}MB`,
        concurrent: plan.max_concurrent_uploads,
        priority: plan.priority_processing,
        analytics: plan.has_analytics,
        api: plan.api_calls_monthly > 0
      }
    }));

    res.json({ plans: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
router.post('/create', async (req, res) => {
  try {
    const { subscriptionId, planId, userId } = req.body;

    // TODO: Verify subscription with PayPal
    // TODO: Create subscription in database
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;