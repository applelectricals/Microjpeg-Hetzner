import { Request, Response } from 'express';
import { db } from './db';
import { users, subscriptions, paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// ==================== NEW PLAN CONFIGURATION ====================
export const PLANS = {
  // WEB PLANS
  free: {
    id: 'free',
    name: 'Free',
    type: 'web',
    priceMonthly: 0,
    priceYearly: 0,
    operations: 200, // 100 regular + 100 RAW
    maxFileSize: 7, // MB for regular
    maxFileSizeRAW: 15, // MB for RAW
    features: [
      '200 operations/month (100 regular + 100 RAW)',
      '7MB max per regular file',
      '15MB max per RAW file',
      'All formats (JPEG, PNG, WebP, AVIF, RAW)',
      'Standard processing speed',
      '1 concurrent upload'
    ]
  },
  'starter-monthly': {
    id: 'starter-monthly',
    name: 'Starter',
    type: 'web',
    priceMonthly: 9,
    priceYearly: 0,
    billingCycle: 'monthly',
    operations: -1, // Unlimited
    maxFileSize: 75,
    maxFileSizeRAW: 75,
    features: [
      'Unlimited compressions',
      '75MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload'
    ]
  },
  'starter-yearly': {
    id: 'starter-yearly',
    name: 'Starter',
    type: 'web',
    priceMonthly: 0,
    priceYearly: 49,
    billingCycle: 'yearly',
    operations: -1, // Unlimited
    maxFileSize: 75,
    maxFileSizeRAW: 75,
    features: [
      'Unlimited compressions',
      '75MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload',
      'Save $59/year'
    ]
  },
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Pro',
    type: 'web',
    priceMonthly: 19,
    priceYearly: 0,
    billingCycle: 'monthly',
    operations: -1, // Unlimited
    maxFileSize: 150,
    maxFileSizeRAW: 150,
    features: [
      'Unlimited compressions',
      '150MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload'
    ]
  },
  'pro-yearly': {
    id: 'pro-yearly',
    name: 'Pro',
    type: 'web',
    priceYearly: 149,
    priceMonthly: 0,
    billingCycle: 'yearly',
    operations: -1, // Unlimited
    maxFileSize: 150,
    maxFileSizeRAW: 150,
    features: [
      'Unlimited compressions',
      '150MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload',
      'Save $79/year'
    ]
  },
  'business-monthly': {
    id: 'business-monthly',
    name: 'Business',
    type: 'web',
    priceMonthly: 49,
    priceYearly: 0,
    billingCycle: 'monthly',
    operations: -1, // Unlimited
    maxFileSize: 200,
    maxFileSizeRAW: 200,
    features: [
      'Unlimited compressions',
      '200MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload'
    ]
  },
  'business-yearly': {
    id: 'business-yearly',
    name: 'Business',
    type: 'web',
    priceYearly: 349,
    priceMonthly: 0,
    billingCycle: 'yearly',
    operations: -1, // Unlimited
    maxFileSize: 200,
    maxFileSizeRAW: 200,
    features: [
      'Unlimited compressions',
      '200MB max file size',
      'All formats including RAW',
      'Unlimited conversions',
      'Standard processing',
      '1 concurrent upload',
      'Save $239/year'
    ]
  },

  // API PREPAID PACKAGES (One-time purchases)
  'api-10k': {
    id: 'api-10k',
    name: 'API 10K Package',
    type: 'api-prepaid',
    priceMonthly: 35,
    priceYearly: 0,
    operations: 10000,
    features: [
      '10,000 API operations',
      'Never expires',
      'All formats supported',
      'Save 30% vs pay-as-you-go'
    ]
  },
  'api-50k': {
    id: 'api-50k',
    name: 'API 50K Package',
    type: 'api-prepaid',
    priceMonthly: 125,
    priceYearly: 0,
    operations: 50000,
    features: [
      '50,000 API operations',
      'Never expires',
      'All formats supported',
      'Save 50% vs pay-as-you-go'
    ]
  },
  'api-100k': {
    id: 'api-100k',
    name: 'API 100K Package',
    type: 'api-prepaid',
    priceMonthly: 200,
    priceYearly: 0,
    operations: 100000,
    features: [
      '100,000 API operations',
      'Never expires',
      'All formats supported',
      'Save 60% vs pay-as-you-go'
    ]
  },

  // CDN PLANS
  'cdn-starter': {
    id: 'cdn-starter',
    name: 'CDN Starter',
    type: 'cdn',
    priceMonthly: 19,
    priceYearly: 0,
    bandwidth: 100, // GB
    domains: 1,
    features: [
      '100 GB bandwidth',
      '1 custom domain',
      'Auto WebP/AVIF conversion',
      'Image transformations',
      'Edge caching (global)',
      'Basic analytics',
      '$0.20/GB overage'
    ]
  },
  'cdn-business': {
    id: 'cdn-business',
    name: 'CDN Business',
    type: 'cdn',
    priceMonthly: 69,
    priceYearly: 0,
    bandwidth: 1000, // GB
    domains: 3,
    features: [
      '1000 GB bandwidth',
      '3 custom domains',
      'RAW format support',
      'Auto WebP/AVIF conversion',
      'Advanced image transformations',
      'Priority edge caching',
      'Advanced analytics',
      '$0.10/GB overage'
    ]
  },
  'cdn-enterprise': {
    id: 'cdn-enterprise',
    name: 'CDN Enterprise',
    type: 'cdn',
    priceMonthly: 199,
    priceYearly: 0,
    bandwidth: 3000, // GB
    domains: 10,
    features: [
      '3000 GB bandwidth',
      '10 custom domains',
      'RAW format support',
      'White-label option',
      'Custom integration',
      'Dedicated support',
      'SLA guarantee',
      '$0.05/GB overage'
    ]
  }
};

// Helper to get plan price
export function getPlanPrice(planId: string): number {
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) return 0;
  
  // Return the appropriate price based on billing cycle
  if (plan.priceYearly > 0) return plan.priceYearly;
  if (plan.priceMonthly > 0) return plan.priceMonthly;
  return 0;
}

// Helper to get plan duration
export function getPlanDuration(planId: string): number {
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) return 30; // Default 30 days
  
  // API prepaid packages don't expire
  if (plan.type === 'api-prepaid') return 36500; // 100 years = never expires
  
  // Yearly plans
  if (plan.billingCycle === 'yearly') return 365;
  
  // Monthly plans (default)
  return 30;
}

// ==================== PAYPAL PAYMENT PROCESSING ====================

export interface PaymentData {
  plan: string;
  paymentMethod: 'paypal';
  billing: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  paypal_subscription_id?: string;
  paypal_order_id?: string;
}

// Process PayPal subscription payment
export async function processPayPalSubscription(req: Request, res: Response) {
  try {
    const { plan, paypal_subscription_id, billing } = req.body;
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const planConfig = PLANS[plan as keyof typeof PLANS];
    const duration = getPlanDuration(plan);
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + duration);
    
    // Update user subscription
    await db.update(users)
      .set({
        subscriptionPlan: plan, // Use subscriptionPlan instead of subscriptionTier
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate,
        monthlyOperations: 0, // Reset operations count
        stripeSubscriptionId: paypal_subscription_id, // Store PayPal subscription ID
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Record payment transaction
    await db.insert(paymentTransactions).values({
      userId,
      amount: getPlanPrice(plan),
      currency: 'USD',
      paymentMethod: 'paypal',
      paymentId: paypal_subscription_id,
      status: 'completed',
      plan,
      billingDetails: JSON.stringify(billing),
    });
    
    // Get user info for confirmation
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (user?.email) {
      console.log(`✅ PayPal subscription activated for ${user.email} - Plan: ${planConfig.name}, Amount: $${getPlanPrice(plan)}`);
    }
    
    res.json({ 
      success: true, 
      message: 'PayPal subscription activated successfully',
      subscription: {
        plan: planConfig.name,
        operations: planConfig.operations,
        features: planConfig.features,
        endDate: subscriptionEndDate
      }
    });
    
  } catch (error: any) {
    console.error('PayPal subscription processing failed:', error);
    res.status(500).json({ 
      error: 'PayPal subscription processing failed',
      message: error.message 
    });
  }
}

// Process PayPal one-time payment (for API prepaid packages)
export async function processPayPalOneTime(req: Request, res: Response) {
  try {
    const { plan, paypal_order_id, billing } = req.body;
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const planConfig = PLANS[plan as keyof typeof PLANS];
    
    // For API prepaid packages, add credits to user account
    if (planConfig.type === 'api-prepaid') {
      await db.update(users)
        .set({
          purchasedCredits: planConfig.operations, // Add operations to prepaid balance
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
    
    // Record payment transaction
    await db.insert(paymentTransactions).values({
      userId,
      amount: getPlanPrice(plan),
      currency: 'USD',
      paymentMethod: 'paypal',
      paymentId: paypal_order_id,
      orderId: paypal_order_id,
      status: 'completed',
      plan,
      billingDetails: JSON.stringify(billing),
    });
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (user?.email) {
      console.log(`✅ PayPal one-time payment for ${user.email} - Package: ${planConfig.name}, Amount: $${getPlanPrice(plan)}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      package: {
        name: planConfig.name,
        operations: planConfig.operations,
        features: planConfig.features
      }
    });
    
  } catch (error: any) {
    console.error('PayPal one-time payment processing failed:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      message: error.message 
    });
  }
}

// Get subscription status
export async function getSubscriptionStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const plan = user.subscriptionPlan || 'free';
    const planConfig = PLANS[plan as keyof typeof PLANS] || PLANS.free;
    
    res.json({
      success: true,
      subscription: {
        plan: planConfig.name,
        status: user.subscriptionStatus || 'inactive',
        operations: planConfig.operations,
        operationsUsed: user.monthlyOperations || 0,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        features: planConfig.features,
        prepaidCredits: user.purchasedCredits || 0
      }
    });
    
  } catch (error: any) {
    console.error('Failed to get subscription status:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription status',
      message: error.message 
    });
  }
}

// Cancel subscription
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Update user to free tier
    await db.update(users)
      .set({
        subscriptionPlan: 'free',
        subscriptionStatus: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: 'Subscription cancelled successfully. You will retain access until the end of your current billing period.' 
    });
    
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message 
    });
  }
}
