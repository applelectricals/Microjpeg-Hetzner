/**
 * USAGE TRACKER SERVICE
 * 
 * Tracks user operations and enforces tier limits
 * Works for both authenticated and anonymous users
 */

import { Pool } from 'pg';
import { Redis } from '@upstash/redis';
import { tierLimitService } from './TierLimitService';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Initialize PostgreSQL pool
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface UsageData {
  operations_used: number;
  operations_limit: number;
  api_calls_used: number;
  api_calls_limit: number;
  period_start: string;
  period_end: string;
}

export interface TrackingOptions {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  operationType: 'compress' | 'convert' | 'api_call';
  fileCount: number;
  totalBytes: number;
  inputFormat?: string;
  outputFormat?: string;
  compressionQuality?: number;
  processingTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  pageIdentifier?: string;
}

class UsageTracker {
  private readonly CACHE_TTL = 60; // 1 minute cache for usage data

  /**
   * Get user's current usage for their billing period
   */
  async getUserUsage(userId: string): Promise<UsageData> {
    const cacheKey = `usage:${userId}`;

    try {
      // Try cache first
      const cached = await redis.get<UsageData>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Fetch from database using the helper function
      const result = await pool.query(
        'SELECT * FROM get_user_usage($1)',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Unable to fetch user usage');
      }

      const usage: UsageData = {
        operations_used: parseInt(result.rows[0].operations_used),
        operations_limit: result.rows[0].operations_limit,
        api_calls_used: parseInt(result.rows[0].api_calls_used),
        api_calls_limit: result.rows[0].api_calls_limit,
        period_start: result.rows[0].period_start,
        period_end: result.rows[0].period_end
      };

      // Cache for 1 minute
      await redis.setex(cacheKey, this.CACHE_TTL, usage);

      return usage;
    } catch (error) {
      console.error('[UsageTracker] Error fetching user usage:', error);
      throw new Error('Failed to fetch usage data');
    }
  }

  /**
   * Get anonymous user's usage (IP-based for monthly limit)
   */
  async getAnonymousUsage(ipAddress: string): Promise<UsageData> {
    const cacheKey = `usage:ip:${ipAddress}`;

    try {
      // Try cache first
      const cached = await redis.get<UsageData>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get current month boundaries
      const periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Count operations for this IP in current month
      const result = await pool.query(
        `SELECT COUNT(*) as operations_used
         FROM usage_tracking
         WHERE ip_address = $1
         AND created_at >= $2
         AND created_at < $3
         AND page_identifier = 'free-no-auth'`,
        [ipAddress, periodStart, periodEnd]
      );

      const usage: UsageData = {
        operations_used: parseInt(result.rows[0].operations_used),
        operations_limit: 200, // Free tier limit for anonymous users
        api_calls_used: 0,
        api_calls_limit: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      };

      // Cache for 1 minute
      await redis.setex(cacheKey, this.CACHE_TTL, usage);

      return usage;
    } catch (error) {
      console.error('[UsageTracker] Error fetching anonymous usage:', error);
      throw new Error('Failed to fetch anonymous usage data');
    }
  }

  /**
   * Check if user/IP can perform operation
   */
  async canPerformOperation(
    userId: string | null,
    ipAddress: string,
    fileCount: number = 1
  ): Promise<{ allowed: boolean; reason?: string; usage?: UsageData }> {
    try {
      let usage: UsageData;

      if (userId) {
        // Check authenticated user
        usage = await this.getUserUsage(userId);
      } else {
        // Check anonymous user by IP
        usage = await this.getAnonymousUsage(ipAddress);
      }

      const allowed = (usage.operations_used + fileCount) <= usage.operations_limit;

      if (!allowed) {
        return {
          allowed: false,
          reason: userId 
            ? 'You have reached your monthly operation limit. Please upgrade your plan.'
            : 'You have reached the monthly limit for free users. Please sign in or upgrade.',
          usage
        };
      }

      return { allowed: true, usage };
    } catch (error) {
      console.error('[UsageTracker] Error checking operation permission:', error);
      // In case of error, allow the operation but log it
      return { allowed: true };
    }
  }

  /**
   * Track an operation
   */
  async trackOperation(options: TrackingOptions): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO usage_tracking (
          user_id, session_id, operation_type, file_count, total_bytes_processed,
          input_format, output_format, compression_quality, processing_time_ms,
          success, error_message, ip_address, user_agent, page_identifier
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          options.userId || null,
          options.sessionId || null,
          options.operationType,
          options.fileCount,
          options.totalBytes,
          options.inputFormat || null,
          options.outputFormat || null,
          options.compressionQuality || null,
          options.processingTimeMs || null,
          options.success,
          options.errorMessage || null,
          options.ipAddress || null,
          options.userAgent || null,
          options.pageIdentifier || null
        ]
      );

      // Invalidate usage cache
      if (options.userId) {
        await redis.del(`usage:${options.userId}`);
      }
      if (options.ipAddress) {
        await redis.del(`usage:ip:${options.ipAddress}`);
      }

      console.log(`[UsageTracker] Tracked ${options.operationType}: ${options.fileCount} files`);
    } catch (error) {
      console.error('[UsageTracker] Error tracking operation:', error);
      // Don't throw - we don't want tracking failures to break the app
    }
  }

  /**
   * Track API call
   */
  async trackApiCall(
    userId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    operationsCount: number = 1,
    bytesProcessed: number = 0,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO api_usage (
          user_id, endpoint, method, status_code, response_time_ms,
          operations_count, bytes_processed, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          endpoint,
          method,
          statusCode,
          responseTimeMs,
          operationsCount,
          bytesProcessed,
          ipAddress || null,
          userAgent || null
        ]
      );

      // Invalidate usage cache
      await redis.del(`usage:${userId}`);

      console.log(`[UsageTracker] Tracked API call: ${method} ${endpoint}`);
    } catch (error) {
      console.error('[UsageTracker] Error tracking API call:', error);
    }
  }

  /**
   * Get usage statistics for admin dashboard
   */
  async getUsageStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalOperations: number;
    totalUsers: number;
    totalBytes: number;
    byTier: Record<string, number>;
    byOperationType: Record<string, number>;
  }> {
    try {
      // Total operations
      const opsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_operations,
          COUNT(DISTINCT user_id) as total_users,
          SUM(total_bytes_processed) as total_bytes
         FROM usage_tracking
         WHERE created_at >= $1 AND created_at <= $2`,
        [startDate, endDate]
      );

      // By tier
      const tierResult = await pool.query(
        `SELECT u.tier, COUNT(ut.id) as count
         FROM usage_tracking ut
         JOIN users u ON u.id = ut.user_id
         WHERE ut.created_at >= $1 AND ut.created_at <= $2
         GROUP BY u.tier`,
        [startDate, endDate]
      );

      // By operation type
      const typeResult = await pool.query(
        `SELECT operation_type, COUNT(*) as count
         FROM usage_tracking
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY operation_type`,
        [startDate, endDate]
      );

      const byTier: Record<string, number> = {};
      tierResult.rows.forEach(row => {
        byTier[row.tier] = parseInt(row.count);
      });

      const byOperationType: Record<string, number> = {};
      typeResult.rows.forEach(row => {
        byOperationType[row.operation_type] = parseInt(row.count);
      });

      return {
        totalOperations: parseInt(opsResult.rows[0].total_operations),
        totalUsers: parseInt(opsResult.rows[0].total_users),
        totalBytes: parseInt(opsResult.rows[0].total_bytes || '0'),
        byTier,
        byOperationType
      };
    } catch (error) {
      console.error('[UsageTracker] Error fetching usage stats:', error);
      throw new Error('Failed to fetch usage statistics');
    }
  }

  /**
   * Invalidate usage cache for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      await redis.del(`usage:${userId}`);
    } catch (error) {
      console.error('[UsageTracker] Error invalidating cache:', error);
    }
  }
}

// Export singleton instance
export const usageTracker = new UsageTracker();

export default usageTracker;
