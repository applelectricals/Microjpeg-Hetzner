// server/services/DualUsageTracker.ts

import { db } from '../db';
import { OPERATION_CONFIG, getFileType } from '../config/operationLimits';
import { userUsage, operationLog } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getAppSettings } from '../superuser';

export interface AuditContext {
  adminUserId?: string;
  bypassReason?: string;
  superBypass?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

// Simplified limits configuration
const LIMITS = {
  free: {
    regular: {
      monthly: 100,
      maxFileSize: 7 * 1024 * 1024 // 7MB
    },
    raw: {
      monthly: 100,
      maxFileSize: 15 * 1024 * 1024 // 15MB
    }
  },
  premium: { // premium29 / starter / test-premium
    maxFileSize: 75 * 1024 * 1024 // 75MB - unlimited operations
  },
  test_premium: { // Alias for test-premium (same as premium)
    maxFileSize: 75 * 1024 * 1024 // 75MB - unlimited operations
  },
  pro: {
    maxFileSize: 150 * 1024 * 1024 // 150MB - unlimited operations
  },
  business: {
    maxFileSize: 200 * 1024 * 1024 // 200MB - unlimited operations
  },
  enterprise: {
    maxFileSize: 200 * 1024 * 1024 // 200MB - unlimited operations
  }
};

export class DualUsageTracker {
  private userId?: string;
  private sessionId: string;
  private userType: 'anonymous' | 'free' | 'premium' | 'test_premium' | 'pro' | 'business' | 'enterprise';
  private auditContext?: AuditContext;

  constructor(
    userId: string | undefined,
    sessionId: string,
    userType: string,
    auditContext?: AuditContext
  ) {
    this.userId = userId;
    this.sessionId = sessionId;
    // Normalize tier names: test-premium -> test_premium
    const normalizedType = userType?.replace('-', '_') || 'anonymous';
    this.userType = normalizedType as any;
    this.auditContext = auditContext;
  }

async canPerformOperation(
  filename: string, 
  fileSize: number,
  pageIdentifier?: string
): Promise<{
  allowed: boolean;
  reason?: string;
  limits?: any;
  usage?: any;
  wasBypassed?: boolean;
  upgradeRequired?: boolean;
}> {
  const fileType = getFileType(filename);
  
  if (fileType === 'unknown') {
    return { 
      allowed: false, 
      reason: 'Unsupported file format' 
    };
  }

  // Check for superuser bypass
  if (this.auditContext?.superBypass) {
    console.log('🔓 Superuser bypass: Operation allowed without limit checks');
    return {
      allowed: true,
      reason: 'superuser_bypass',
      wasBypassed: true
    };
  }

  // Check global enforcement settings
  const appSettings = await getAppSettings();
  const enforceMonthly = appSettings.countersEnforcement.monthly;

  // If enforcement is disabled, allow operation
  if (!enforceMonthly) {
    console.log('⚠️ Global enforcement disabled: Operation allowed');
    return {
      allowed: true,
      reason: 'enforcement_disabled',
      wasBypassed: true
    };
  }

  // ==================================================
  // PAID USERS - UNLIMITED OPERATIONS
  // ==================================================
  const isPaidUser = [
  'premium', 
  'test_premium', 
  'starter-m',      // Starter Monthly
  'starter-y',      // Starter Yearly
  'pro-m',          // Pro Monthly
  'pro-y',          // Pro Yearly
  'business-m',     // Business Monthly
  'business-y',     // Business Yearly
  'pro', 
  'business', 
  'enterprise'
].includes(this.userType);
  
  if (isPaidUser) {
    console.log(`✅ Paid user (${this.userType}) - unlimited operations`);
    
    // Determine max file size based on plan
    let maxSize: number;
    
    switch(this.userType) {
  case 'premium':
  case 'test_premium':
  case 'starter-m':      // Starter Monthly
  case 'starter-y':      // Starter Yearly
    maxSize = 75 * 1024 * 1024; // 75MB
    break;
  case 'pro':
  case 'pro-m':          // Pro Monthly
  case 'pro-y':          // Pro Yearly
    maxSize = 150 * 1024 * 1024; // 150MB
    break;
  case 'business':
  case 'business-m':     // Business Monthly
  case 'business-y':     // Business Yearly
  case 'enterprise':
    maxSize = 200 * 1024 * 1024; // 200MB
    break;
      default:
        maxSize = 75 * 1024 * 1024; // Default to 75MB
    }
    
    // Check file size for paid users
    if (fileSize > maxSize) {
      return {
        allowed: false,
        reason: `File too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB for ${this.userType} plan.`
      };
    }
    
    return {
      allowed: true,
      usage: null, // No usage limits for paid users
      limits: { 
        unlimited: true,
        maxFileSize: Math.round(maxSize / 1024 / 1024) + 'MB'
      }
    };
  }

  // ==================================================
  // FREE USERS - MONTHLY LIMITS + FILE SIZE LIMITS
  // ==================================================
  
  console.log(`📊 Free user check - File type: ${fileType}, Size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
  
  // Check file size limit for free users
  const maxSize = fileType === 'raw' 
    ? LIMITS.free.raw.maxFileSize 
    : LIMITS.free.regular.maxFileSize;
  
  if (fileSize > maxSize) {
    return {
      allowed: false,
      reason: `File too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB for ${fileType} files on free plan. Upgrade to Premium for files up to 75MB!`,
      upgradeRequired: true
    };
  }

  // Get current usage for free users
  const usage = await this.getCurrentUsage();
  const monthlyLimit = fileType === 'raw' 
    ? LIMITS.free.raw.monthly 
    : LIMITS.free.regular.monthly;
  
  const currentUsage = fileType === 'raw' 
    ? usage.rawMonthly 
    : usage.regularMonthly;

  // Check monthly limit (only limit that exists for free users)
  if (currentUsage >= monthlyLimit) {
    return {
      allowed: false,
      reason: `You've reached your free monthly limit of ${monthlyLimit} ${fileType} operations. Upgrade to Premium for unlimited processing!`,
      usage,
      limits: { monthly: monthlyLimit },
      upgradeRequired: true
    };
  }

  console.log(`✅ Free user allowed - Usage: ${currentUsage}/${monthlyLimit}`);

  return { 
    allowed: true,
    usage,
    limits: { monthly: monthlyLimit }
  };
}



  // Record successful operation with audit trail
  async recordOperation(
    filename: string,
    fileSize: number,
    pageIdentifier: string
  ): Promise<void> {
    const fileType = getFileType(filename);
    
    if (fileType === 'unknown') {
      return;
    }
    
    // Validate fileSize
    const validFileSize = isNaN(fileSize) || fileSize < 0 ? 0 : fileSize;
    
    // Only increment usage for free users
    if (this.userType === 'free' || this.userType === 'anonymous') {
      await this.incrementUsage(fileType);
    }
    
    // Log operation with bypass information
    const wasBypassed = this.auditContext?.superBypass || false;
    
    await db.insert(operationLog).values({
      userId: this.userId || null,
      sessionId: this.sessionId,
      operationType: fileType,
      fileFormat: filename.split('.').pop() || '',
      fileSizeMb: Math.round(validFileSize / 1024 / 1024),
      pageIdentifier: pageIdentifier,
      wasBypassed: wasBypassed,
      bypassReason: this.auditContext?.bypassReason || null,
      actedByAdminId: this.auditContext?.adminUserId || null
    });

    if (wasBypassed) {
      console.log(`🔓 Operation logged with bypass: ${fileType} file by ${this.auditContext?.adminUserId || 'system'}`);
    }
  }

  // Get current usage with automatic reset
  private async getCurrentUsage(): Promise<any> {
    const now = new Date();
    
    // Try to get existing usage
    const usageResult = await db.select()
      .from(userUsage)
      .where(and(
        eq(userUsage.userId, this.userId || 'anonymous'),
        eq(userUsage.sessionId, this.sessionId)
      ))
      .limit(1);

    if (!usageResult || usageResult.length === 0) {
      // Create new usage record
      await db.insert(userUsage).values({
        userId: this.userId || 'anonymous',
        sessionId: this.sessionId
      });
      
      return {
        regularMonthly: 0,
        rawMonthly: 0
      };
    }

    const usage = usageResult[0];

    // Check and reset monthly counter if needed
    const monthlyReset = new Date(usage.monthlyResetAt || new Date());
    
    if (now.getTime() - monthlyReset.getTime() > 2592000000) { // 30 days
      await db.update(userUsage)
        .set({
          regularMonthly: 0,
          rawMonthly: 0,
          monthlyBandwidthMb: 0,
          monthlyResetAt: now,
          // Set daily/hourly to 0 for cleanliness (not used but kept in DB)
          regularDaily: 0,
          rawDaily: 0,
          regularHourly: 0,
          rawHourly: 0,
          hourlyResetAt: now,
          dailyResetAt: now
        })
        .where(and(
          eq(userUsage.userId, this.userId || 'anonymous'),
          eq(userUsage.sessionId, this.sessionId)
        ));
      
      usage.regularMonthly = 0;
      usage.rawMonthly = 0;
    }

    return usage;
  }

  // Increment usage counters (only monthly for free users)
  private async incrementUsage(fileType: 'regular' | 'raw'): Promise<void> {
    if (fileType === 'raw') {
      await db.update(userUsage)
        .set({
          rawMonthly: sql`${userUsage.rawMonthly} + 1`,
          updatedAt: new Date()
        })
        .where(and(
          eq(userUsage.userId, this.userId || 'anonymous'),
          eq(userUsage.sessionId, this.sessionId)
        ));
    } else {
      await db.update(userUsage)
        .set({
          regularMonthly: sql`${userUsage.regularMonthly} + 1`,
          updatedAt: new Date()
        })
        .where(and(
          eq(userUsage.userId, this.userId || 'anonymous'),
          eq(userUsage.sessionId, this.sessionId)
        ));
    }
  }

  // Get usage statistics for display
  async getUsageStats(hasLaunchOffer: boolean = false): Promise<any> {
    // Paid users have unlimited operations
    if (['premium', 'test_premium', 'starter-m', 'starter-y', 'pro-m', 'pro-y', 'business-m', 'business-y', 'pro', 'business', 'enterprise'].includes(this.userType)) {
      return {
        regular: {
          monthly: { used: 0, limit: null }, // null = unlimited
          daily: { used: 0, limit: null },
          hourly: { used: 0, limit: null }
        },
        raw: {
          monthly: { used: 0, limit: null },
          daily: { used: 0, limit: null },
          hourly: { used: 0, limit: null }
        },
        combined: {
          monthly: { used: 0, limit: null }
        },
        unlimited: true
      };
    }

    // Free users - only show monthly limits
    const usage = await this.getCurrentUsage();
    const regularLimit = LIMITS.free.regular.monthly + (hasLaunchOffer ? 100 : 0);
    const rawLimit = LIMITS.free.raw.monthly;

    return {
      regular: {
        monthly: { used: usage.regularMonthly, limit: regularLimit },
        daily: { used: 0, limit: null }, // No daily limits
        hourly: { used: 0, limit: null } // No hourly limits
      },
      raw: {
        monthly: { used: usage.rawMonthly, limit: rawLimit },
        daily: { used: 0, limit: null },
        hourly: { used: 0, limit: null }
      },
      combined: {
        monthly: {
          used: usage.regularMonthly + usage.rawMonthly,
          limit: regularLimit + rawLimit
        }
      },
      unlimited: false
    };
  }
}