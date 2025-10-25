/**
 * TIER LIMIT SERVICE
 * 
 * Handles fetching and caching tier limits from database
 * Uses Upstash Redis for caching to reduce database load
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
  monthly_operations: number;
  daily_operations: number | null;
  hourly_operations: number | null;
  max_file_size_regular: number;
  max_file_size_raw: number;
  max_concurrent_uploads: number;
  max_batch_size: number;
  processing_timeout_seconds: number;
  priority_processing: boolean;
  api_calls_monthly: number;
  team_seats: number;
  has_analytics: boolean;
  has_webhooks: boolean;
  has_custom_profiles: boolean;
  has_white_label: boolean;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  is_visible_on_pricing: boolean;
}

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
          priority_processing,
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
        WHERE tier_name = $1 AND is_active = TRUE`,
        [tierName]
      );

      if (result.rows.length === 0) {
        // Default to free tier if not found
        console.warn(`[TierLimitService] Tier ${tierName} not found, defaulting to free`);
        return this.getTierLimits('free');
      }

      const tierLimits = result.rows[0];

      // Cache the result
      await redis.setex(cacheKey, this.CACHE_TTL, tierLimits);

      return tierLimits;
    } catch (error) {
      console.error('[TierLimitService] Error fetching tier limits:', error);
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
        `SELECT * FROM tier_limits 
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
