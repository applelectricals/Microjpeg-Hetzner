/**
 * TIER LIMIT SERVICE
 * 
 * Handles fetching and caching tier limits from database
 * Uses Upstash Redis for caching to reduce database load
 * 
 * UPDATED: Added AI Background Removal and AI Enhancement limits
 */

import { Redis } from '@upstash/redis';
import { Pool } from 'pg';

// Initialize Redis client (Upstash)
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

export interface TierLimits {
  tier_name: string;
  tier_display_name: string;
  tier_description: string | null;
  
  // Compress/Convert limits
  monthly_operations: number;
  daily_operations: number | null;
  hourly_operations: number | null;
  max_file_size_regular: number;
  max_file_size_raw: number;
  max_concurrent_uploads: number;
  max_batch_size: number;
  processing_timeout_seconds: number;
  
  // AI Background Removal limits (NEW)
  ai_bg_removal_monthly: number;
  ai_bg_output_formats: string; // 'png' or 'png,webp,avif,jpg'
  ai_bg_max_file_size: number;
  
  // AI Image Enhancement limits (NEW)
  ai_enhance_monthly: number;
  ai_enhance_max_upscale: number; // 2, 4, or 8
  ai_enhance_face_enhancement: boolean;
  ai_enhance_max_file_size: number;
  
  // Other features
  priority_processing: boolean;
  api_access_level: string; // 'none', 'basic', 'full'
  support_level: string; // 'community', 'email', 'priority', 'dedicated'
  
  // Legacy fields
  api_calls_monthly: number;
  team_seats: number;
  has_analytics: boolean;
  has_webhooks: boolean;
  has_custom_profiles: boolean;
  has_white_label: boolean;
  
  // Pricing
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  razorpay_plan_id_monthly: string | null;
  razorpay_plan_id_yearly: string | null;
  paypal_plan_id_monthly: string | null;
  paypal_plan_id_yearly: string | null;
  
  // Status
  is_active: boolean;
  is_visible_on_pricing: boolean;
}

// Default free tier limits (fallback)
const DEFAULT_FREE_LIMITS: TierLimits = {
  tier_name: 'free',
  tier_display_name: 'Free',
  tier_description: 'Basic access for casual users',
  monthly_operations: 200,
  daily_operations: 50,
  hourly_operations: 10,
  max_file_size_regular: 7,
  max_file_size_raw: 15,
  max_concurrent_uploads: 1,
  max_batch_size: 1,
  processing_timeout_seconds: 60,
  ai_bg_removal_monthly: 5,
  ai_bg_output_formats: 'png',
  ai_bg_max_file_size: 10,
  ai_enhance_monthly: 3,
  ai_enhance_max_upscale: 2,
  ai_enhance_face_enhancement: false,
  ai_enhance_max_file_size: 10,
  priority_processing: false,
  api_access_level: 'none',
  support_level: 'community',
  api_calls_monthly: 0,
  team_seats: 1,
  has_analytics: false,
  has_webhooks: false,
  has_custom_profiles: false,
  has_white_label: false,
  price_monthly: 0,
  price_yearly: 0,
  stripe_price_id_monthly: null,
  stripe_price_id_yearly: null,
  razorpay_plan_id_monthly: null,
  razorpay_plan_id_yearly: null,
  paypal_plan_id_monthly: null,
  paypal_plan_id_yearly: null,
  is_active: true,
  is_visible_on_pricing: true,
};

class TierLimitService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_KEY_PREFIX = 'tier_limits:';

  /**
   * Get tier limits with caching
   */
  async getTierLimits(tierName: string): Promise<TierLimits> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${tierName}`;

    try {
      // Try to get from cache first
      const cached = await redis.get<TierLimits>(cacheKey);
      
      if (cached) {
        console.log(`[TierLimitService] Cache HIT for tier: ${tierName}`);
        return cached;
      }

      console.log(`[TierLimitService] Cache MISS for tier: ${tierName}`);

      // Fetch from database
      const result = await pool.query<TierLimits>(
        `SELECT 
          tier_name,
          tier_display_name,
          tier_description,
          monthly_operations,
          daily_operations,
          hourly_operations,
          max_file_size_regular,
          max_file_size_raw,
          max_concurrent_uploads,
          max_batch_size,
          processing_timeout_seconds,
          COALESCE(ai_bg_removal_monthly, 0) as ai_bg_removal_monthly,
          COALESCE(ai_bg_output_formats, 'png') as ai_bg_output_formats,
          COALESCE(ai_bg_max_file_size, 10) as ai_bg_max_file_size,
          COALESCE(ai_enhance_monthly, 0) as ai_enhance_monthly,
          COALESCE(ai_enhance_max_upscale, 2) as ai_enhance_max_upscale,
          COALESCE(ai_enhance_face_enhancement, FALSE) as ai_enhance_face_enhancement,
          COALESCE(ai_enhance_max_file_size, 10) as ai_enhance_max_file_size,
          COALESCE(priority_processing, FALSE) as priority_processing,
          COALESCE(api_access_level, 'none') as api_access_level,
          COALESCE(support_level, 'community') as support_level,
          api_calls_monthly,
          team_seats,
          has_analytics,
          has_webhooks,
          has_custom_profiles,
          has_white_label,
          price_monthly,
          price_yearly,
          stripe_price_id_monthly,
          stripe_price_id_yearly,
          razorpay_plan_id_monthly,
          razorpay_plan_id_yearly,
          paypal_plan_id_monthly,
          paypal_plan_id_yearly,
          is_active,
          is_visible_on_pricing
        FROM tier_limits
        WHERE tier_name = $1 AND is_active = TRUE`,
        [tierName]
      );

      if (result.rows.length === 0) {
        // Default to free tier if not found
        console.warn(`[TierLimitService] Tier ${tierName} not found, using defaults`);
        
        if (tierName === 'free' || tierName === 'free_registered') {
          return DEFAULT_FREE_LIMITS;
        }
        
        return this.getTierLimits('free');
      }

      const tierLimits = result.rows[0];

      // Cache the result
      await redis.setex(cacheKey, this.CACHE_TTL, tierLimits);

      return tierLimits;
    } catch (error) {
      console.error('[TierLimitService] Error fetching tier limits:', error);
      
      // Return defaults on error
      if (tierName === 'free' || tierName === 'free_registered') {
        return DEFAULT_FREE_LIMITS;
      }
      
      throw new Error('Failed to fetch tier limits');
    }
  }

  /**
   * Get all active tier limits (for pricing page)
   */
  async getAllTierLimits(): Promise<TierLimits[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}all`;

    try {
      // Try cache first
      const cached = await redis.get<TierLimits[]>(cacheKey);
      
      if (cached) {
        console.log('[TierLimitService] Cache HIT for all tiers');
        return cached;
      }

      console.log('[TierLimitService] Cache MISS for all tiers');

      // Fetch from database
      const result = await pool.query<TierLimits>(
        `SELECT 
          tier_name,
          tier_display_name,
          tier_description,
          monthly_operations,
          daily_operations,
          hourly_operations,
          max_file_size_regular,
          max_file_size_raw,
          max_concurrent_uploads,
          max_batch_size,
          processing_timeout_seconds,
          COALESCE(ai_bg_removal_monthly, 0) as ai_bg_removal_monthly,
          COALESCE(ai_bg_output_formats, 'png') as ai_bg_output_formats,
          COALESCE(ai_bg_max_file_size, 10) as ai_bg_max_file_size,
          COALESCE(ai_enhance_monthly, 0) as ai_enhance_monthly,
          COALESCE(ai_enhance_max_upscale, 2) as ai_enhance_max_upscale,
          COALESCE(ai_enhance_face_enhancement, FALSE) as ai_enhance_face_enhancement,
          COALESCE(ai_enhance_max_file_size, 10) as ai_enhance_max_file_size,
          COALESCE(priority_processing, FALSE) as priority_processing,
          COALESCE(api_access_level, 'none') as api_access_level,
          COALESCE(support_level, 'community') as support_level,
          api_calls_monthly,
          team_seats,
          has_analytics,
          has_webhooks,
          has_custom_profiles,
          has_white_label,
          price_monthly,
          price_yearly,
          stripe_price_id_monthly,
          stripe_price_id_yearly,
          is_active,
          is_visible_on_pricing
        FROM tier_limits 
        WHERE is_active = TRUE AND is_visible_on_pricing = TRUE
        ORDER BY price_monthly ASC`
      );

      const tierLimits = result.rows;

      // Cache the result
      await redis.setex(cacheKey, this.CACHE_TTL, tierLimits);

      return tierLimits;
    } catch (error) {
      console.error('[TierLimitService] Error fetching all tier limits:', error);
      throw new Error('Failed to fetch all tier limits');
    }
  }

  /**
   * Check if user can use AI Background Removal
   */
  async canUseBgRemoval(userId: string | null, sessionId: string | null, tierName: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    outputFormats: string[];
  }> {
    const limits = await this.getTierLimits(tierName);
    const usage = await this.getAIUsage(userId, sessionId);
    
    const remaining = Math.max(0, limits.ai_bg_removal_monthly - usage.bg_removal_used);
    const outputFormats = limits.ai_bg_output_formats.split(',').map(f => f.trim());
    
    return {
      allowed: remaining > 0,
      remaining,
      limit: limits.ai_bg_removal_monthly,
      outputFormats,
    };
  }

  /**
   * Check if user can use AI Enhancement
   */
  async canUseEnhancement(userId: string | null, sessionId: string | null, tierName: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    maxUpscale: number;
    faceEnhancement: boolean;
  }> {
    const limits = await this.getTierLimits(tierName);
    const usage = await this.getAIUsage(userId, sessionId);
    
    const remaining = Math.max(0, limits.ai_enhance_monthly - usage.enhance_used);
    
    return {
      allowed: remaining > 0,
      remaining,
      limit: limits.ai_enhance_monthly,
      maxUpscale: limits.ai_enhance_max_upscale,
      faceEnhancement: limits.ai_enhance_face_enhancement,
    };
  }

  /**
   * Get AI usage for user/session
   */
  async getAIUsage(userId: string | null, sessionId: string | null): Promise<{
    bg_removal_used: number;
    enhance_used: number;
    period_start: Date;
  }> {
    try {
      let query: string;
      let params: (string | null)[];

      if (userId) {
        query = `SELECT bg_removal_monthly_used, enhance_monthly_used, current_period_start 
                 FROM ai_usage WHERE user_id = $1`;
        params = [userId];
      } else if (sessionId) {
        query = `SELECT bg_removal_monthly_used, enhance_monthly_used, current_period_start 
                 FROM ai_usage WHERE session_id = $1`;
        params = [sessionId];
      } else {
        return { bg_removal_used: 0, enhance_used: 0, period_start: new Date() };
      }

      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        return { bg_removal_used: 0, enhance_used: 0, period_start: new Date() };
      }

      const row = result.rows[0];
      
      // Check if we need to reset (new month)
      const periodStart = new Date(row.current_period_start);
      const now = new Date();
      
      if (periodStart.getMonth() !== now.getMonth() || periodStart.getFullYear() !== now.getFullYear()) {
        // Reset counters for new month
        await this.resetAIUsage(userId, sessionId);
        return { bg_removal_used: 0, enhance_used: 0, period_start: now };
      }

      return {
        bg_removal_used: row.bg_removal_monthly_used || 0,
        enhance_used: row.enhance_monthly_used || 0,
        period_start: periodStart,
      };
    } catch (error) {
      console.error('[TierLimitService] Error getting AI usage:', error);
      return { bg_removal_used: 0, enhance_used: 0, period_start: new Date() };
    }
  }

  /**
   * Increment AI Background Removal usage
   */
  async incrementBgRemovalUsage(userId: string | null, sessionId: string | null): Promise<void> {
    try {
      if (userId) {
        await pool.query(`
          INSERT INTO ai_usage (user_id, bg_removal_monthly_used)
          VALUES ($1, 1)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            bg_removal_monthly_used = ai_usage.bg_removal_monthly_used + 1,
            updated_at = CURRENT_TIMESTAMP
        `, [userId]);
      } else if (sessionId) {
        await pool.query(`
          INSERT INTO ai_usage (session_id, bg_removal_monthly_used)
          VALUES ($1, 1)
          ON CONFLICT (session_id) 
          DO UPDATE SET 
            bg_removal_monthly_used = ai_usage.bg_removal_monthly_used + 1,
            updated_at = CURRENT_TIMESTAMP
        `, [sessionId]);
      }
    } catch (error) {
      console.error('[TierLimitService] Error incrementing BG removal usage:', error);
    }
  }

  /**
   * Increment AI Enhancement usage
   */
  async incrementEnhanceUsage(userId: string | null, sessionId: string | null): Promise<void> {
    try {
      if (userId) {
        await pool.query(`
          INSERT INTO ai_usage (user_id, enhance_monthly_used)
          VALUES ($1, 1)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            enhance_monthly_used = ai_usage.enhance_monthly_used + 1,
            updated_at = CURRENT_TIMESTAMP
        `, [userId]);
      } else if (sessionId) {
        await pool.query(`
          INSERT INTO ai_usage (session_id, enhance_monthly_used)
          VALUES ($1, 1)
          ON CONFLICT (session_id) 
          DO UPDATE SET 
            enhance_monthly_used = ai_usage.enhance_monthly_used + 1,
            updated_at = CURRENT_TIMESTAMP
        `, [sessionId]);
      }
    } catch (error) {
      console.error('[TierLimitService] Error incrementing enhance usage:', error);
    }
  }

  /**
   * Reset AI usage for new month
   */
  async resetAIUsage(userId: string | null, sessionId: string | null): Promise<void> {
    try {
      if (userId) {
        await pool.query(`
          UPDATE ai_usage 
          SET bg_removal_monthly_used = 0, 
              enhance_monthly_used = 0,
              current_period_start = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId]);
      } else if (sessionId) {
        await pool.query(`
          UPDATE ai_usage 
          SET bg_removal_monthly_used = 0, 
              enhance_monthly_used = 0,
              current_period_start = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE session_id = $1
        `, [sessionId]);
      }
    } catch (error) {
      console.error('[TierLimitService] Error resetting AI usage:', error);
    }
  }

  /**
   * Invalidate cache for a specific tier
   */
  async invalidateCache(tierName: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${tierName}`;
      await redis.del(cacheKey);
      
      // Also invalidate the "all tiers" cache
      await redis.del(`${this.CACHE_KEY_PREFIX}all`);
      
      console.log(`[TierLimitService] Cache invalidated for tier: ${tierName}`);
    } catch (error) {
      console.error('[TierLimitService] Error invalidating cache:', error);
    }
  }

  /**
   * Invalidate all tier caches
   */
  async invalidateAllCaches(): Promise<void> {
    try {
      const pattern = `${this.CACHE_KEY_PREFIX}*`;
      
      // Get all keys matching pattern
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        // Delete all matching keys
        await Promise.all(keys.map(key => redis.del(key)));
        console.log(`[TierLimitService] Invalidated ${keys.length} cache entries`);
      }
    } catch (error) {
      console.error('[TierLimitService] Error invalidating all caches:', error);
    }
  }

  /**
   * Update tier limits (admin function)
   */
  async updateTierLimits(
    tierName: string,
    updates: Partial<TierLimits>,
    updatedBy: string,
    changeNotes?: string
  ): Promise<TierLimits> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current values for audit log
      const current = await this.getTierLimits(tierName);

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'tier_name') {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      // Add metadata
      updateFields.push(`updated_by = $${paramIndex}`);
      updateValues.push(updatedBy);
      paramIndex++;

      updateFields.push(`change_notes = $${paramIndex}`);
      updateValues.push(changeNotes || null);
      paramIndex++;

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      updateValues.push(tierName);

      // Execute update
      const updateQuery = `
        UPDATE tier_limits
        SET ${updateFields.join(', ')}
        WHERE tier_name = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query<TierLimits>(updateQuery, updateValues);

      // Log changes to audit table
      for (const [key, newValue] of Object.entries(updates)) {
        if (newValue !== undefined && key !== 'tier_name') {
          const oldValue = (current as any)[key];
          
          if (oldValue !== newValue) {
            await client.query(
              `INSERT INTO tier_audit_log 
               (tier_name, changed_field, old_value, new_value, changed_by, change_reason)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                tierName,
                key,
                String(oldValue),
                String(newValue),
                updatedBy,
                changeNotes
              ]
            );
          }
        }
      }

      await client.query('COMMIT');

      // Invalidate cache
      await this.invalidateCache(tierName);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[TierLimitService] Error updating tier limits:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get tier audit history
   */
  async getTierAuditHistory(tierName: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM tier_audit_log
         WHERE tier_name = $1
         ORDER BY changed_at DESC
         LIMIT $2`,
        [tierName, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('[TierLimitService] Error fetching audit history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tierLimitService = new TierLimitService();

export default tierLimitService;
