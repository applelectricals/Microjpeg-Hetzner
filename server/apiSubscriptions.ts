/**
 * API Subscription Tiers and Pricing Configuration
 * 
 * This module defines API pricing tiers and usage tracking for MicroJPEG API
 * Aligned with Web subscription tiers: free, starter, pro, business
 */

import { db } from './db';
import { apiUsage, users } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// API Tier Configuration
export interface ApiTierConfig {
  id: string;
  name: string;
  displayName: string;
  pricePerOperation: number; // Base price per operation
  monthlyFreeOps: number; // Free operations included per month
  rateLimit: number; // Requests per hour
  maxFileSize: {
    regular: number; // MB
    raw: number; // MB
  };
  features: string[];
  permissions: string[];
  requiresPayment: boolean;
}

// Pay-as-you-go pricing tiers
export const PAY_AS_YOU_GO_TIERS = [
  {
    from: 0,
    to: 500,
    price: 0, // Free
  },
  {
    from: 501,
    to: 5000,
    price: 0.005, // $0.005 per operation
  },
  {
    from: 5001,
    to: 50000,
    price: 0.003, // $0.003 per operation
  },
  {
    from: 50001,
    to: Infinity,
    price: 0.002, // $0.002 per operation
  },
];

// Prepaid package options
export const PREPAID_PACKAGES = [
  {
    id: 'api_10k',
    name: '10K Operations',
    operations: 10000,
    price: 35, // $35 = $0.0035 per op
    pricePerOp: 0.0035,
  },
  {
    id: 'api_50k',
    name: '50K Operations',
    operations: 50000,
    price: 125, // $125 = $0.0025 per op
    pricePerOp: 0.0025,
  },
  {
    id: 'api_100k',
    name: '100K Operations',
    operations: 100000,
    price: 200, // $200 = $0.002 per op
    pricePerOp: 0.002,
  },
];

// API tier configurations based on Web subscription plans
export const API_TIERS: Record<string, ApiTierConfig> = {
  // Free tier (anonymous/no subscription)
  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    pricePerOperation: 0,
    monthlyFreeOps: 500, // 500 free operations per month
    rateLimit: 100, // 100 requests per hour
    maxFileSize: {
      regular: 10, // 10MB for regular images
      raw: 50, // 50MB for RAW files
    },
    features: [
      '500 free operations per month',
      'Pay-as-you-go after free tier',
      'All image formats',
      'Basic support',
    ],
    permissions: ['compress', 'convert'],
    requiresPayment: false,
  },

  // Starter tier (Web Starter subscription)
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    pricePerOperation: 0.004, // Average starting price
    monthlyFreeOps: 500, // Same 500 free ops
    rateLimit: 500, // 500 requests per hour
    maxFileSize: {
      regular: 30, // 30MB
      raw: 75, // 75MB
    },
    features: [
      '500 free operations per month',
      'Pay-as-you-go pricing',
      'Higher rate limits',
      'All formats including RAW',
      'Email support',
    ],
    permissions: ['compress', 'convert', 'batch'],
    requiresPayment: false, // Pay per use, not subscription
  },

  // Pro tier (Web Pro subscription)
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    pricePerOperation: 0.003, // Better pricing
    monthlyFreeOps: 500,
    rateLimit: 2000, // 2000 requests per hour
    maxFileSize: {
      regular: 50, // 50MB
      raw: 100, // 100MB
    },
    features: [
      '500 free operations per month',
      'Discounted pay-as-you-go',
      'Priority processing',
      'Webhook support',
      'Advanced analytics',
      'Priority support',
    ],
    permissions: ['compress', 'convert', 'batch', 'webhook', 'priority'],
    requiresPayment: false, // Pay per use
  },

  // Business tier (Web Business subscription)
  business: {
    id: 'business',
    name: 'business',
    displayName: 'Business',
    pricePerOperation: 0.002, // Best pricing
    monthlyFreeOps: 500,
    rateLimit: 10000, // 10000 requests per hour
    maxFileSize: {
      regular: 100, // 100MB
      raw: 200, // 200MB
    },
    features: [
      '500 free operations per month',
      'Best pay-as-you-go rates',
      'Priority processing',
      'Webhook support',
      'White-label option',
      'Dedicated support',
      'Custom integration',
    ],
    permissions: ['compress', 'convert', 'batch', 'webhook', 'priority', 'whitelabel'],
    requiresPayment: false, // Pay per use
  },
};

/**
 * Get API tier configuration based on user's subscription plan
 */
export function getUserApiTier(subscriptionPlan: string | null): ApiTierConfig {
  // Default to free tier if no subscription
  if (!subscriptionPlan) {
    return API_TIERS.free;
  }

  // Map Web subscription plans to API tiers
  const planToTierMap: Record<string, string> = {
    free: 'free',
    starter: 'starter',
    'starter-monthly': 'starter',
    'starter-yearly': 'starter',
    pro: 'pro',
    'pro-monthly': 'pro',
    'pro-yearly': 'pro',
    business: 'business',
    'business-monthly': 'business',
    'business-yearly': 'business',
  };

  const tierKey = planToTierMap[subscriptionPlan.toLowerCase()] || 'free';
  return API_TIERS[tierKey];
}

/**
 * Calculate cost for operations based on pay-as-you-go pricing
 */
export function calculatePayAsYouGoCost(operations: number): {
  cost: number;
  breakdown: Array<{ from: number; to: number; ops: number; price: number; total: number }>;
} {
  let remainingOps = operations;
  let totalCost = 0;
  const breakdown: Array<{ from: number; to: number; ops: number; price: number; total: number }> =
    [];

  for (const tier of PAY_AS_YOU_GO_TIERS) {
    if (remainingOps <= 0) break;

    const tierCapacity = tier.to - tier.from + 1;
    const opsInThisTier = Math.min(remainingOps, tierCapacity);
    const tierCost = opsInThisTier * tier.price;

    breakdown.push({
      from: tier.from,
      to: Math.min(tier.to, tier.from + remainingOps - 1),
      ops: opsInThisTier,
      price: tier.price,
      total: tierCost,
    });

    totalCost += tierCost;
    remainingOps -= opsInThisTier;
  }

  return { cost: totalCost, breakdown };
}

/**
 * Get monthly usage for a user
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await db
    .select({
      total: sql<number>`COUNT(*)`,
    })
    .from(apiUsage)
    .where(and(eq(apiUsage.userId, userId), gte(apiUsage.createdAt, startOfMonth)));

  return usage[0]?.total || 0;
}

/**
 * Validate API access based on tier limits
 */
export function validateApiAccess(
  tierConfig: ApiTierConfig,
  monthlyUsage: number,
  currentRatePerMinute: number
): {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: string;
} {
  // Check rate limit (requests per hour converted to per minute)
  const maxPerMinute = tierConfig.rateLimit / 60;
  if (currentRatePerMinute > maxPerMinute) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. Maximum ${tierConfig.rateLimit} requests per hour.`,
      upgradeRequired: getUpgradeTier(tierConfig.id),
    };
  }

  // Pay-as-you-go: Allow usage (will be billed)
  // No monthly cap for API - only Web has monthly limits
  return { allowed: true };
}

/**
 * Track API usage for billing
 */
export async function trackApiUsage(
  userId: string,
  apiKeyId: string,
  endpoint: string,
  operationCount: number = 1
): Promise<void> {
  try {
    // Get user's current monthly usage
    const monthlyUsage = await getMonthlyUsage(userId);
    const newUsage = monthlyUsage + operationCount;

    // Get user's tier
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      console.error('User not found for usage tracking:', userId);
      return;
    }

    const tierConfig = getUserApiTier(user.subscriptionPlan);

    // Calculate cost
    let cost = 0;

    if (newUsage > tierConfig.monthlyFreeOps) {
      // Operations beyond free tier
      const billableOps = operationCount;
      const pricingResult = calculatePayAsYouGoCost(billableOps);
      cost = pricingResult.cost;
    }

    // Log usage in database
    await db.insert(apiUsage).values({
      userId,
      apiKeyId,
      endpoint,
      method: 'POST',
      statusCode: 200,
      responseTime: 0,
      operationCount,
      cost, // Cost for this operation
    });

    console.log(`✅ Tracked ${operationCount} API operations for user ${userId}, cost: $${cost.toFixed(4)}`);
  } catch (error) {
    console.error('Failed to track API usage:', error);
    throw error;
  }
}

/**
 * Get recommended upgrade tier
 */
function getUpgradeTier(currentTier: string): string {
  const upgradePath: Record<string, string> = {
    free: 'starter',
    starter: 'pro',
    pro: 'business',
    business: 'business', // Already at top tier
  };

  return upgradePath[currentTier] || 'starter';
}

/**
 * Get prepaid package by ID
 */
export function getPrepaidPackage(packageId: string) {
  return PREPAID_PACKAGES.find((pkg) => pkg.id === packageId);
}

/**
 * Calculate savings vs pay-as-you-go for prepaid packages
 */
export function calculatePrepaidSavings(packageId: string): {
  package: typeof PREPAID_PACKAGES[0];
  payAsYouGoCost: number;
  savings: number;
  savingsPercent: number;
} | null {
  const pkg = getPrepaidPackage(packageId);
  if (!pkg) return null;

  const payAsYouGo = calculatePayAsYouGoCost(pkg.operations);
  const savings = payAsYouGo.cost - pkg.price;
  const savingsPercent = (savings / payAsYouGo.cost) * 100;

  return {
    package: pkg,
    payAsYouGoCost: payAsYouGo.cost,
    savings,
    savingsPercent,
  };
}

/**
 * Check if user has prepaid credits available
 */
export async function getPrepaidBalance(userId: string): Promise<number> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) return 0;

  // Assuming you have a prepaidCredits field in users table
  return user.purchasedCredits || 0;
}

/**
 * Deduct prepaid credits
 */
export async function deductPrepaidCredits(
  userId: string,
  operations: number
): Promise<boolean> {
  const balance = await getPrepaidBalance(userId);

  if (balance < operations) {
    return false; // Insufficient credits
  }

  await db
    .update(users)
    .set({
      purchasedCredits: sql`${users.purchasedCredits} - ${operations}`,
    })
    .where(eq(users.id, userId));

  return true;
}
