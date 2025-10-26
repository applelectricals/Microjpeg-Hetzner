// server/cron/checkExpiredSubscriptions.ts
import { db } from '../db';
import { userAccounts } from '../db/schema';
import { lt, eq, and } from 'drizzle-orm';

export async function checkExpiredSubscriptions() {
  console.log('Checking for expired subscriptions...');
  const now = new Date();
  
  try {
    // Find all users with expired subscriptions
    const expiredUsers = await db
      .select()
      .from(userAccounts)
      .where(
        and(
          lt(userAccounts.subscriptionEndDate, now),
          eq(userAccounts.subscriptionStatus, 'active')
        )
      );
    
    // Downgrade to free tier
    for (const user of expiredUsers) {
      await db
        .update(userAccounts)
        .set({
          tierName: 'free',
          subscriptionStatus: 'expired'
        })
        .where(eq(userAccounts.userId, user.userId));
      
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
