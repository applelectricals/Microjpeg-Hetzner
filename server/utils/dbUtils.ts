#!/usr/bin/env tsx

/**
 * Database utility script for user management
 * Run with: npx tsx server/utils/dbUtils.ts [command] [options]
 */

import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function checkUserVerification(email: string) {
  try {
    const user = await db
      .select({
        email: users.email,
        isEmailVerified: users.isEmailVerified,
        id: users.id
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return false;
    }

    const userData = user[0];
    console.log(`📧 User: ${userData.email}`);
    console.log(`✅ Email Verified: ${userData.isEmailVerified}`);
    console.log(`🆔 User ID: ${userData.id}`);
    return userData;
  } catch (error) {
    console.error('❌ Error checking user:', error);
    return false;
  }
}

async function verifyUserEmail(email: string) {
  try {
    const result = await db
      .update(users)
      .set({ 
        isEmailVerified: "true", 
        emailVerificationToken: null,
        emailVerificationExpires: null
      })
      .where(eq(users.email, email))
      .returning({
        email: users.email,
        isEmailVerified: users.isEmailVerified
      });

    if (result.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return false;
    }

    console.log(`✅ Email verification updated for: ${result[0].email}`);
    console.log(`✅ Verified status: ${result[0].isEmailVerified}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating user verification:', error);
    return false;
  }
}

async function listUsers() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        isEmailVerified: users.isEmailVerified,
        subscriptionTier: users.subscriptionTier,
        isPremium: users.isPremium
      })
      .from(users)
      .limit(10);

    console.log(`📋 Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Verified: ${user.isEmailVerified} - Tier: ${user.subscriptionTier} - Premium: ${user.isPremium}`);
    });
    
    return allUsers;
  } catch (error) {
    console.error('❌ Error listing users:', error);
    return [];
  }
}

async function togglePremiumStatus(email: string) {
  try {
    // First get current status
    const currentUser = await db
      .select({
        email: users.email,
        isPremium: users.isPremium
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (currentUser.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return false;
    }

    const newPremiumStatus = !currentUser[0].isPremium;

    const result = await db
      .update(users)
      .set({ 
        isPremium: newPremiumStatus,
        subscriptionStatus: newPremiumStatus ? 'active' : 'inactive'
      })
      .where(eq(users.email, email))
      .returning({
        email: users.email,
        isPremium: users.isPremium,
        subscriptionStatus: users.subscriptionStatus
      });

    console.log(`🎯 Premium status updated for: ${result[0].email}`);
    console.log(`✅ Premium: ${result[0].isPremium}`);
    console.log(`📊 Subscription: ${result[0].subscriptionStatus}`);
    return true;
  } catch (error) {
    console.error('❌ Error toggling premium status:', error);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  if (!command) {
    console.log(`
🛠️  Database Utility Commands:

  check <email>     - Check user verification status
  verify <email>    - Mark user email as verified
  list              - List all users
  premium <email>   - Toggle premium status for user

Examples:
  npx tsx server/utils/dbUtils.ts check testuser@gmail.com
  npx tsx server/utils/dbUtils.ts verify testuser@gmail.com
  npx tsx server/utils/dbUtils.ts list
  npx tsx server/utils/dbUtils.ts premium testuser@gmail.com
    `);
    process.exit(0);
  }

  switch (command) {
    case 'check':
      if (!email) {
        console.log('❌ Email required for check command');
        process.exit(1);
      }
      await checkUserVerification(email);
      break;

    case 'verify':
      if (!email) {
        console.log('❌ Email required for verify command');
        process.exit(1);
      }
      await verifyUserEmail(email);
      break;

    case 'list':
      await listUsers();
      break;

    case 'premium':
      if (!email) {
        console.log('❌ Email required for premium command');
        process.exit(1);
      }
      await togglePremiumStatus(email);
      break;

    default:
      console.log(`❌ Unknown command: ${command}`);
      process.exit(1);
  }

  process.exit(0);
}

// Run the main function
main().catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});