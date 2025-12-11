// ============================================================================
// AI FEATURE API ROUTES
// Add these routes to server/routes.ts
// ============================================================================

import { tierLimitService } from './services/TierLimitService';
import { removeBackground } from './services/replicateAI';
import { enhanceImage } from './services/imageEnhancer';
import { emailService } from './emailService';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

// ============================================================================
// HELPER: Get user's tier from session/auth
// ============================================================================

async function getUserTierInfo(req: any): Promise<{
  userId: string | null;
  sessionId: string | null;
  tierName: string;
  email: string | null;
  firstName: string | null;
}> {
  // Check if user is authenticated
  if (req.user?.id) {
    const user = req.user;
    return {
      userId: user.id,
      sessionId: null,
      tierName: user.subscriptionTier || 'free_registered',
      email: user.email || null,
      firstName: user.firstName || user.email?.split('@')[0] || null,
    };
  }
  
  // Anonymous user - use session
  const sessionId = req.sessionID || req.cookies?.sessionId || 
    `anon_${crypto.createHash('md5').update(req.ip || 'unknown').digest('hex').slice(0, 12)}_${Date.now()}`;
  
  return {
    userId: null,
    sessionId,
    tierName: 'free',
    email: null,
    firstName: null,
  };
}

// ============================================================================
// AI USAGE TRACKING ENDPOINTS
// ============================================================================

// Get combined AI usage statistics (for dashboard)
app.get('/api/ai/usage', async (req, res) => {
  try {
    const { userId, sessionId, tierName, email } = await getUserTierInfo(req);
    
    const [bgLimits, enhanceLimits, tierLimits] = await Promise.all([
      tierLimitService.canUseBgRemoval(userId, sessionId, tierName),
      tierLimitService.canUseEnhancement(userId, sessionId, tierName),
      tierLimitService.getTierLimits(tierName),
    ]);
    
    const bgUsed = bgLimits.limit - bgLimits.remaining;
    const enhanceUsed = enhanceLimits.limit - enhanceLimits.remaining;
    
    res.json({
      tier: tierName,
      tierDisplayName: tierLimits.tier_display_name,
      backgroundRemoval: {
        used: bgUsed,
        remaining: bgLimits.remaining,
        limit: bgLimits.limit,
        percentUsed: bgLimits.limit > 0 ? Math.round((bgUsed / bgLimits.limit) * 100) : 0,
        outputFormats: bgLimits.outputFormats,
        maxFileSize: tierLimits.ai_bg_max_file_size,
      },
      imageEnhancement: {
        used: enhanceUsed,
        remaining: enhanceLimits.remaining,
        limit: enhanceLimits.limit,
        percentUsed: enhanceLimits.limit > 0 ? Math.round((enhanceUsed / enhanceLimits.limit) * 100) : 0,
        maxUpscale: enhanceLimits.maxUpscale,
        faceEnhancement: enhanceLimits.faceEnhancement,
        maxFileSize: tierLimits.ai_enhance_max_file_size,
      },
      features: {
        priorityProcessing: tierLimits.priority_processing,
        apiAccess: tierLimits.api_access_level,
        supportLevel: tierLimits.support_level,
      },
      upgradeUrl: tierName === 'free' || tierName === 'free_registered' ? '/pricing' : null,
    });
  } catch (error: any) {
    console.error('Error getting AI usage:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Get background removal specific limits
app.get('/api/ai/bg-removal/limits', async (req, res) => {
  try {
    const { userId, sessionId, tierName } = await getUserTierInfo(req);
    const limits = await tierLimitService.canUseBgRemoval(userId, sessionId, tierName);
    const tierLimits = await tierLimitService.getTierLimits(tierName);
    
    res.json({
      ...limits,
      tier: tierName,
      maxFileSize: tierLimits.ai_bg_max_file_size,
    });
  } catch (error: any) {
    console.error('Error checking BG removal limits:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
});

// Get enhancement specific limits
app.get('/api/ai/enhance/limits', async (req, res) => {
  try {
    const { userId, sessionId, tierName } = await getUserTierInfo(req);
    const limits = await tierLimitService.canUseEnhancement(userId, sessionId, tierName);
    const tierLimits = await tierLimitService.getTierLimits(tierName);
    
    res.json({
      ...limits,
      tier: tierName,
      maxFileSize: tierLimits.ai_enhance_max_file_size,
    });
  } catch (error: any) {
    console.error('Error checking enhancement limits:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
});

// ============================================================================
// AI BACKGROUND REMOVAL ENDPOINT
// ============================================================================

app.post('/api/remove-background',
  upload.single('file'),
  async (req, res) => {
    console.log('=== AI BACKGROUND REMOVAL REQUEST ===');
    const startTime = Date.now();
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get user tier and check limits
      const { userId, sessionId, tierName, email, firstName } = await getUserTierInfo(req);
      const limits = await tierLimitService.canUseBgRemoval(userId, sessionId, tierName);
      const tierLimits = await tierLimitService.getTierLimits(tierName);
      
      console.log(`📊 User: ${email || sessionId}, Tier: ${tierName}, Remaining: ${limits.remaining}/${limits.limit}`);

      // Check if user has remaining operations
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'limit_reached',
          message: `You've used all ${limits.limit} background removals this month.`,
          limit: limits.limit,
          remaining: 0,
          upgradeUrl: '/pricing',
          showUpgradePrompt: true,
        });
      }

      // Check output format permission
      const outputFormat = (req.body.outputFormat || 'png').toLowerCase();
      if (!limits.outputFormats.includes(outputFormat)) {
        return res.status(403).json({
          error: 'format_restricted',
          message: `${outputFormat.toUpperCase()} output requires a paid plan.`,
          allowedFormats: limits.outputFormats,
          upgradeUrl: '/pricing',
          showUpgradePrompt: true,
        });
      }

      // Check file size
      const maxFileSize = tierLimits.ai_bg_max_file_size * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'file_too_large',
          message: `Max file size is ${tierLimits.ai_bg_max_file_size}MB for your plan.`,
          maxSize: tierLimits.ai_bg_max_file_size,
          upgradeUrl: '/pricing',
        });
      }

      // Process image
      const result = await removeBackground(file.path, 'compressed', {
        outputFormat: outputFormat as 'png' | 'webp' | 'avif' | 'jpg',
        outputQuality: parseInt(req.body.quality) || 90,
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Increment usage AFTER successful processing
      await tierLimitService.incrementBgRemovalUsage(userId, sessionId);

      // Calculate new remaining count
      const newRemaining = limits.remaining - 1;
      const usagePercent = Math.round(((limits.limit - newRemaining) / limits.limit) * 100);

      // Send email notifications for limit warnings
      if (email && userId) {
        await sendAILimitNotifications(email, firstName, 'background_removal', usagePercent, newRemaining, limits.limit, tierName);
      }

      // Generate job ID for download
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        result: {
          id: jobId,
          originalName: file.originalname,
          originalSize: result.originalSize,
          processedSize: result.processedSize,
          format: result.format,
          hasTransparency: result.hasTransparency,
          processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
        usage: {
          used: limits.limit - newRemaining,
          remaining: newRemaining,
          limit: limits.limit,
          percentUsed: usagePercent,
          // Trigger upgrade prompt when limit is hit or nearly hit
          showUpgradePrompt: newRemaining <= 0 || (tierName === 'free' && usagePercent >= 80),
        },
      });

      // Cleanup original upload
      await fs.unlink(file.path).catch(() => {});

    } catch (error: any) {
      console.error('❌ Background removal error:', error);
      res.status(500).json({ error: error.message || 'Processing failed' });
    }
  }
);

// ============================================================================
// AI IMAGE ENHANCEMENT ENDPOINT
// ============================================================================

app.post('/api/enhance-image',
  upload.single('file'),
  async (req, res) => {
    console.log('=== AI IMAGE ENHANCEMENT REQUEST ===');
    const startTime = Date.now();
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get user tier and check limits
      const { userId, sessionId, tierName, email, firstName } = await getUserTierInfo(req);
      const limits = await tierLimitService.canUseEnhancement(userId, sessionId, tierName);
      const tierLimits = await tierLimitService.getTierLimits(tierName);
      
      console.log(`📊 User: ${email || sessionId}, Tier: ${tierName}, Remaining: ${limits.remaining}/${limits.limit}`);

      // Check if user has remaining operations
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'limit_reached',
          message: `You've used all ${limits.limit} image enhancements this month.`,
          limit: limits.limit,
          remaining: 0,
          upgradeUrl: '/pricing',
          showUpgradePrompt: true,
        });
      }

      // Parse options
      const requestedScale = parseInt(req.body.scale) || 2;
      const faceEnhance = req.body.faceEnhance === 'true';

      // Check scale permission
      if (requestedScale > limits.maxUpscale) {
        return res.status(403).json({
          error: 'scale_restricted',
          message: `${requestedScale}x upscale requires a paid plan. Your plan allows up to ${limits.maxUpscale}x.`,
          maxUpscale: limits.maxUpscale,
          upgradeUrl: '/pricing',
          showUpgradePrompt: true,
        });
      }

      // Check face enhancement permission
      if (faceEnhance && !limits.faceEnhancement) {
        return res.status(403).json({
          error: 'feature_restricted',
          message: 'Face enhancement requires a paid plan.',
          upgradeUrl: '/pricing',
          showUpgradePrompt: true,
        });
      }

      // Check file size
      const maxFileSize = tierLimits.ai_enhance_max_file_size * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'file_too_large',
          message: `Max file size is ${tierLimits.ai_enhance_max_file_size}MB for your plan.`,
          maxSize: tierLimits.ai_enhance_max_file_size,
          upgradeUrl: '/pricing',
        });
      }

      // Process image
      const result = await enhanceImage(file.path, 'compressed', {
        scale: requestedScale as 2 | 4 | 8,
        faceEnhance,
        outputFormat: (req.body.outputFormat || 'png') as 'png' | 'webp' | 'avif' | 'jpg',
        outputQuality: parseInt(req.body.quality) || 90,
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Increment usage AFTER successful processing
      await tierLimitService.incrementEnhanceUsage(userId, sessionId);

      // Calculate new remaining count
      const newRemaining = limits.remaining - 1;
      const usagePercent = Math.round(((limits.limit - newRemaining) / limits.limit) * 100);

      // Send email notifications for limit warnings
      if (email && userId) {
        await sendAILimitNotifications(email, firstName, 'image_enhancement', usagePercent, newRemaining, limits.limit, tierName);
      }

      // Generate job ID for download
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        result: {
          id: jobId,
          originalName: file.originalname,
          originalSize: result.originalSize,
          processedSize: result.processedSize,
          originalDimensions: result.originalDimensions,
          inputDimensions: result.inputDimensions,
          newDimensions: result.newDimensions,
          format: result.format,
          scale: result.scale,
          wasResized: result.wasResized,
          processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
        usage: {
          used: limits.limit - newRemaining,
          remaining: newRemaining,
          limit: limits.limit,
          percentUsed: usagePercent,
          // Trigger upgrade prompt when limit is hit or nearly hit
          showUpgradePrompt: newRemaining <= 0 || (tierName === 'free' && usagePercent >= 80),
        },
      });

      // Cleanup original upload
      await fs.unlink(file.path).catch(() => {});

    } catch (error: any) {
      console.error('❌ Image enhancement error:', error);
      res.status(500).json({ error: error.message || 'Processing failed' });
    }
  }
);

// ============================================================================
// EMAIL NOTIFICATION HELPER FOR AI LIMITS
// ============================================================================

async function sendAILimitNotifications(
  email: string,
  firstName: string | null,
  featureType: 'background_removal' | 'image_enhancement',
  usagePercent: number,
  remaining: number,
  limit: number,
  tierName: string
) {
  const featureName = featureType === 'background_removal' ? 'Background Removal' : 'Image Enhancement';
  
  try {
    // Send warning at 80% usage
    if (usagePercent >= 80 && usagePercent < 100) {
      await emailService.sendAILimitWarning(email, firstName || 'there', featureName, usagePercent, remaining, limit, tierName);
      console.log(`AI limit warning email sent to ${email} (${featureName}: ${usagePercent}%)`);
    }
    
    // Send limit reached notification at 100%
    if (remaining <= 0) {
      await emailService.sendAILimitExhausted(email, firstName || 'there', featureName, tierName);
      console.log(`AI limit exhausted email sent to ${email} (${featureName})`);
    }
  } catch (emailError) {
    console.error('Failed to send AI limit notification email:', emailError);
  }
}

// ============================================================================
// API v1 ROUTES (For external API access with API keys)
// ============================================================================

// Middleware to validate API key
async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'unauthorized',
      message: 'API key required. Include X-API-Key header.'
    });
  }
  
  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const result = await db.query(`
      SELECT ak.*, u.subscription_tier, u.id as user_id, u.email, u.first_name
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key_hash = $1 AND ak.is_active = TRUE
    `, [keyHash]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'invalid_api_key', message: 'Invalid or inactive API key' });
    }
    
    const keyData = result.rows[0];
    
    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'api_key_expired', message: 'API key has expired' });
    }
    
    // Check if user has API access
    const tierLimits = await tierLimitService.getTierLimits(keyData.subscription_tier || 'free');
    if (tierLimits.api_access_level === 'none') {
      return res.status(403).json({ 
        error: 'api_access_denied', 
        message: 'Your plan does not include API access. Upgrade to Starter or higher.',
        upgradeUrl: '/pricing'
      });
    }
    
    // Attach user info to request
    req.apiUser = {
      userId: keyData.user_id,
      email: keyData.email,
      firstName: keyData.first_name,
      tier: keyData.subscription_tier || 'free',
      apiKeyId: keyData.id,
      permissions: keyData.permissions,
      apiAccessLevel: tierLimits.api_access_level,
    };
    
    // Update last used timestamp
    await db.query(
      'UPDATE api_keys SET last_used_at = NOW(), usage_count = usage_count + 1 WHERE id = $1',
      [keyData.id]
    );
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'auth_error', message: 'Authentication failed' });
  }
}

// API v1: Background Removal
app.post('/api/v1/remove-background',
  validateApiKey,
  upload.single('file'),
  async (req, res) => {
    try {
      const { userId, tier, email, firstName } = req.apiUser;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'no_file', message: 'No file provided' });
      }
      
      const limits = await tierLimitService.canUseBgRemoval(userId, null, tier);
      const tierLimits = await tierLimitService.getTierLimits(tier);
      
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'rate_limit',
          message: `Monthly limit of ${limits.limit} background removals reached`,
          limit: limits.limit,
          remaining: 0,
        });
      }
      
      const outputFormat = (req.body.outputFormat || 'png').toLowerCase();
      if (!limits.outputFormats.includes(outputFormat)) {
        return res.status(403).json({
          error: 'format_restricted',
          message: `Your plan only allows: ${limits.outputFormats.join(', ')}`,
          allowedFormats: limits.outputFormats,
        });
      }
      
      const maxFileSize = tierLimits.ai_bg_max_file_size * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'file_too_large',
          message: `Max file size is ${tierLimits.ai_bg_max_file_size}MB`,
        });
      }
      
      const result = await removeBackground(file.path, 'compressed', {
        outputFormat: outputFormat as any,
        outputQuality: parseInt(req.body.quality) || 90,
      });
      
      if (!result.success) {
        return res.status(500).json({ error: 'processing_failed', message: result.error });
      }
      
      await tierLimitService.incrementBgRemovalUsage(userId, null);
      
      const newRemaining = limits.remaining - 1;
      const usagePercent = Math.round(((limits.limit - newRemaining) / limits.limit) * 100);
      
      // Send email notifications
      if (email) {
        await sendAILimitNotifications(email, firstName, 'background_removal', usagePercent, newRemaining, limits.limit, tier);
      }
      
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
      
      res.json({
        success: true,
        data: {
          id: jobId,
          downloadUrl: `/api/download/${jobId}`,
          originalSize: result.originalSize,
          processedSize: result.processedSize,
          format: result.format,
          hasTransparency: result.hasTransparency,
        },
        usage: {
          remaining: newRemaining,
          limit: limits.limit,
        },
      });
      
      await fs.unlink(file.path).catch(() => {});
      
    } catch (error: any) {
      console.error('API v1 BG removal error:', error);
      res.status(500).json({ error: 'server_error', message: error.message });
    }
  }
);

// API v1: Image Enhancement
app.post('/api/v1/enhance',
  validateApiKey,
  upload.single('file'),
  async (req, res) => {
    try {
      const { userId, tier, email, firstName } = req.apiUser;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'no_file', message: 'No file provided' });
      }
      
      const limits = await tierLimitService.canUseEnhancement(userId, null, tier);
      const tierLimits = await tierLimitService.getTierLimits(tier);
      
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'rate_limit',
          message: `Monthly limit of ${limits.limit} enhancements reached`,
          limit: limits.limit,
          remaining: 0,
        });
      }
      
      const scale = parseInt(req.body.scale) || 2;
      const faceEnhance = req.body.faceEnhance === 'true';
      
      if (scale > limits.maxUpscale) {
        return res.status(403).json({
          error: 'scale_restricted',
          message: `Your plan allows up to ${limits.maxUpscale}x upscale`,
          maxUpscale: limits.maxUpscale,
        });
      }
      
      if (faceEnhance && !limits.faceEnhancement) {
        return res.status(403).json({
          error: 'feature_restricted',
          message: 'Face enhancement requires a higher tier plan',
        });
      }
      
      const maxFileSize = tierLimits.ai_enhance_max_file_size * 1024 * 1024;
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'file_too_large',
          message: `Max file size is ${tierLimits.ai_enhance_max_file_size}MB`,
        });
      }
      
      const result = await enhanceImage(file.path, 'compressed', {
        scale: scale as 2 | 4 | 8,
        faceEnhance,
        outputFormat: (req.body.outputFormat || 'png') as any,
        outputQuality: parseInt(req.body.quality) || 90,
      });
      
      if (!result.success) {
        return res.status(500).json({ error: 'processing_failed', message: result.error });
      }
      
      await tierLimitService.incrementEnhanceUsage(userId, null);
      
      const newRemaining = limits.remaining - 1;
      const usagePercent = Math.round(((limits.limit - newRemaining) / limits.limit) * 100);
      
      // Send email notifications
      if (email) {
        await sendAILimitNotifications(email, firstName, 'image_enhancement', usagePercent, newRemaining, limits.limit, tier);
      }
      
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
      
      res.json({
        success: true,
        data: {
          id: jobId,
          downloadUrl: `/api/download/${jobId}`,
          originalDimensions: result.originalDimensions,
          newDimensions: result.newDimensions,
          scale: result.scale,
          format: result.format,
        },
        usage: {
          remaining: newRemaining,
          limit: limits.limit,
        },
      });
      
      await fs.unlink(file.path).catch(() => {});
      
    } catch (error: any) {
      console.error('API v1 enhance error:', error);
      res.status(500).json({ error: 'server_error', message: error.message });
    }
  }
);

// API v1: Check Usage
app.get('/api/v1/usage', validateApiKey, async (req, res) => {
  try {
    const { userId, tier } = req.apiUser;
    
    const [bgLimits, enhanceLimits, tierLimits] = await Promise.all([
      tierLimitService.canUseBgRemoval(userId, null, tier),
      tierLimitService.canUseEnhancement(userId, null, tier),
      tierLimitService.getTierLimits(tier),
    ]);
    
    res.json({
      tier,
      backgroundRemoval: {
        used: bgLimits.limit - bgLimits.remaining,
        remaining: bgLimits.remaining,
        limit: bgLimits.limit,
        outputFormats: bgLimits.outputFormats,
      },
      imageEnhancement: {
        used: enhanceLimits.limit - enhanceLimits.remaining,
        remaining: enhanceLimits.remaining,
        limit: enhanceLimits.limit,
        maxUpscale: enhanceLimits.maxUpscale,
        faceEnhancement: enhanceLimits.faceEnhancement,
      },
      compression: {
        limit: tierLimits.monthly_operations === 999999 ? 'unlimited' : tierLimits.monthly_operations,
        maxFileSize: tierLimits.max_file_size_regular,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// API v1: Get Pricing Info
app.get('/api/v1/pricing', async (req, res) => {
  try {
    const tiers = await tierLimitService.getAllTierLimits();
    
    const pricing = tiers.map(tier => ({
      tier: tier.tier_name,
      displayName: tier.tier_display_name,
      priceMonthly: tier.price_monthly / 100,
      priceYearly: tier.price_yearly / 100,
      features: {
        compression: {
          operations: tier.monthly_operations === 999999 ? 'unlimited' : tier.monthly_operations,
          maxFileSize: tier.max_file_size_regular,
        },
        backgroundRemoval: {
          limit: tier.ai_bg_removal_monthly,
          outputFormats: tier.ai_bg_output_formats.split(','),
        },
        imageEnhancement: {
          limit: tier.ai_enhance_monthly,
          maxUpscale: tier.ai_enhance_max_upscale,
          faceEnhancement: tier.ai_enhance_face_enhancement,
        },
        apiAccess: tier.api_access_level,
        priorityProcessing: tier.priority_processing,
      },
    }));
    
    res.json(pricing);
  } catch (error: any) {
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});
