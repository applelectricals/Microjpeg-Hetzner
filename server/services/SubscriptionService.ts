import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface CreateSubscriptionData {
  userId: string;
  tierName: string;
  paymentProvider: 'paypal' | 'stripe';
  providerCustomerId: string;
  providerSubscriptionId: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  periodStart: Date;
  periodEnd: Date;
}

class SubscriptionService {
  async createSubscription(data: CreateSubscriptionData) {
    try {
      await db.execute(sql`
        INSERT INTO subscriptions (
          user_id, tier_name, payment_provider, 
          provider_customer_id, provider_subscription_id,
          billing_cycle, amount, status,
          current_period_start, current_period_end
        ) VALUES (
          ${data.userId}, ${data.tierName}, ${data.paymentProvider},
          ${data.providerCustomerId}, ${data.providerSubscriptionId},
          ${data.billingCycle}, ${data.amount}, 'active',
          ${data.periodStart}, ${data.periodEnd}
        )
      `);

      // Update user's tier
      await db.execute(sql`
        UPDATE users 
        SET tier = ${data.tierName}, 
            subscription_status = 'active'
        WHERE id = ${data.userId}
      `);

      console.log(`✅ Subscription created: User ${data.userId} → ${data.tierName}`);
    } catch (error) {
      console.error('❌ Failed to create subscription:', error);
      throw error;
    }
  }

  async getActiveSubscription(userId: string) {
    const result = await db.execute(sql`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId} 
      AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    return result.rows[0] || null;
  }

  async cancelSubscription(userId: string) {
    await db.execute(sql`
      UPDATE subscriptions 
      SET status = 'canceled', canceled_at = NOW()
      WHERE user_id = ${userId} AND status = 'active'
    `);

    await db.execute(sql`
      UPDATE users 
      SET tier = 'free', subscription_status = 'canceled'
      WHERE id = ${userId}
    `);

    console.log(`✅ Subscription canceled for user ${userId}`);
  }
}

export const subscriptionService = new SubscriptionService();