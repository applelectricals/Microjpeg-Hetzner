// server/cron/checkExpiredSubscriptions.ts
import { pool } from '../db';

export async function checkExpiredSubscriptions() {
  console.log('Checking for expired subscriptions...');
  const now = new Date();
  
  try {
    // Find all users with expired subscriptions
    const result = await pool.query(`
      SELECT user_id, email, tier_name, subscription_end_date
      FROM user_accounts
      WHERE subscription_end_date < $1
        AND subscription_status = 'active'
        AND tier_name != 'free'
    `, [now]);
    
    const expiredUsers = result.rows;
    
    // Downgrade to free tier
    for (const user of expiredUsers) {
      await pool.query(`
        UPDATE user_accounts
        SET tier_name = 'free', subscription_status = 'expired'
        WHERE user_id = $1
      `, [user.user_id]);
      
      console.log(`✓ User ${user.email} downgraded to free tier (subscription expired)`);
    }
    
    console.log(`Processed ${expiredUsers.length} expired subscriptions`);
    return expiredUsers.length;
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return 0;
  }
}

// Auto-run function - import and call in server/index.ts
export function startSubscriptionChecker() {
  // Check immediately on startup
  checkExpiredSubscriptions();
  
  // Then check every hour
  setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);
  
  console.log('✓ Subscription expiry checker started (runs hourly)');
}
