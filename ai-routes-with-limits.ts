// ============================================================================
// AI FEATURE ROUTES WITH TIER LIMIT ENFORCEMENT
// Add these routes to server/routes.ts
// ============================================================================

import { tierLimitService } from './services/TierLimitService';
import { removeBackground } from './services/replicateAI';
import { enhanceImage } from './services/imageEnhancer';

// ============================================================================
// HELPER: Get user's tier from session/auth
// ============================================================================

async function getUserTier(req: any): Promise<{
  userId: string | null;
  sessionId: string | null;
  tierName: string;
}> {
  // Check if user is authenticated
  if (req.user?.id) {
    const user = req.user;
    return {
      userId: user.id,
      sessionId: null,
      tierName: user.subscriptionTier || 'free_registered',
    };
  }
  
  // Anonymous user - use session
  const sessionId = req.sessionID || req.cookies?.sessionId || 
    `anon_${req.ip}_${Date.now()}`;
  
  return {
    userId: null,
    sessionId,
    tierName: 'free',
  };
}

// ============================================================================
// AI BACKGROUND REMOVAL ROUTES
// ============================================================================

// Check AI BG removal limits before processing
app.get('/api/ai/bg-removal/limits', async (req, res) => {
  try {
    const { userId, sessionId, tierName } = await getUserTier(req);
    const limits = await tierLimitService.canUseBgRemoval(userId, sessionId, tierName);
    
    res.json({
      ...limits,
      tier: tierName,
    });
  } catch (error: any) {
    console.error('Error checking BG removal limits:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
});

// AI Background Removal endpoint with limit enforcement
app.post('/api/remove-background',
  checkConcurrentSessions,
  upload.single('file'),
  async (req, res) => {
    console.log('=== AI BACKGROUND REMOVAL REQUEST ===');
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get user tier and check limits
      const { userId, sessionId, tierName } = await getUserTier(req);
      const limits = await tierLimitService.canUseBgRemoval(userId, sessionId, tierName);
      
      console.log(`📊 User tier: ${tierName}, Remaining: ${limits.remaining}/${limits.limit}`);

      // Check if user has remaining operations
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'Monthly limit reached',
          message: `You've used all ${limits.limit} background removals this month. Upgrade for more.`,
          limit: limits.limit,
          remaining: 0,
          upgradeUrl: '/pricing',
        });
      }

      // Check output format permission
      const outputFormat = (req.body.outputFormat || 'png').toLowerCase();
      if (!limits.outputFormats.includes(outputFormat)) {
        return res.status(403).json({
          error: 'Format not available',
          message: `${outputFormat.toUpperCase()} output is not available on your plan. Upgrade to access all formats.`,
          allowedFormats: limits.outputFormats,
          upgradeUrl: '/pricing',
        });
      }

      // Get tier limits for file size check
      const tierLimits = await tierLimitService.getTierLimits(tierName);
      const maxFileSize = tierLimits.ai_bg_max_file_size * 1024 * 1024;
      
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `Max file size is ${tierLimits.ai_bg_max_file_size}MB for your plan.`,
          maxSize: tierLimits.ai_bg_max_file_size,
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

      // Generate job ID for download
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));

      res.json({
        success: true,
        result: {
          id: jobId,
          originalName: file.originalname,
          originalSize: result.originalSize,
          processedSize: result.processedSize,
          format: result.format,
          hasTransparency: result.hasTransparency,
          processingTime: result.processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
        usage: {
          remaining: limits.remaining - 1,
          limit: limits.limit,
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
// AI IMAGE ENHANCEMENT ROUTES
// ============================================================================

// Check AI enhancement limits before processing
app.get('/api/ai/enhance/limits', async (req, res) => {
  try {
    const { userId, sessionId, tierName } = await getUserTier(req);
    const limits = await tierLimitService.canUseEnhancement(userId, sessionId, tierName);
    
    res.json({
      ...limits,
      tier: tierName,
    });
  } catch (error: any) {
    console.error('Error checking enhancement limits:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
});

// AI Image Enhancement endpoint with limit enforcement
app.post('/api/enhance-image',
  checkConcurrentSessions,
  upload.single('file'),
  async (req, res) => {
    console.log('=== AI IMAGE ENHANCEMENT REQUEST ===');
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get user tier and check limits
      const { userId, sessionId, tierName } = await getUserTier(req);
      const limits = await tierLimitService.canUseEnhancement(userId, sessionId, tierName);
      
      console.log(`📊 User tier: ${tierName}, Remaining: ${limits.remaining}/${limits.limit}`);

      // Check if user has remaining operations
      if (!limits.allowed) {
        return res.status(429).json({
          error: 'Monthly limit reached',
          message: `You've used all ${limits.limit} image enhancements this month. Upgrade for more.`,
          limit: limits.limit,
          remaining: 0,
          upgradeUrl: '/pricing',
        });
      }

      // Parse options
      const requestedScale = parseInt(req.body.scale) || 4;
      const faceEnhance = req.body.faceEnhance === 'true';

      // Check scale permission
      if (requestedScale > limits.maxUpscale) {
        return res.status(403).json({
          error: 'Scale not available',
          message: `${requestedScale}x upscale is not available on your plan. Max is ${limits.maxUpscale}x.`,
          maxUpscale: limits.maxUpscale,
          upgradeUrl: '/pricing',
        });
      }

      // Check face enhancement permission
      if (faceEnhance && !limits.faceEnhancement) {
        return res.status(403).json({
          error: 'Face enhancement not available',
          message: 'Face enhancement is not available on your plan. Upgrade to access this feature.',
          upgradeUrl: '/pricing',
        });
      }

      // Get tier limits for file size check
      const tierLimits = await tierLimitService.getTierLimits(tierName);
      const maxFileSize = tierLimits.ai_enhance_max_file_size * 1024 * 1024;
      
      if (file.size > maxFileSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `Max file size is ${tierLimits.ai_enhance_max_file_size}MB for your plan.`,
          maxSize: tierLimits.ai_enhance_max_file_size,
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

      // Generate job ID for download
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));

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
          processingTime: result.processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
        usage: {
          remaining: limits.remaining - 1,
          limit: limits.limit,
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
// COMBINED AI USAGE ENDPOINT (for dashboard)
// ============================================================================

app.get('/api/ai/usage', async (req, res) => {
  try {
    const { userId, sessionId, tierName } = await getUserTier(req);
    
    const [bgLimits, enhanceLimits, tierLimits] = await Promise.all([
      tierLimitService.canUseBgRemoval(userId, sessionId, tierName),
      tierLimitService.canUseEnhancement(userId, sessionId, tierName),
      tierLimitService.getTierLimits(tierName),
    ]);
    
    res.json({
      tier: tierName,
      tierDisplayName: tierLimits.tier_display_name,
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
      upgradeUrl: tierName === 'free' || tierName === 'free_registered' ? '/pricing' : null,
    });
  } catch (error: any) {
    console.error('Error getting AI usage:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

// ============================================================================
// PRICING INFO ENDPOINT (for AI features pricing display)
// ============================================================================

app.get('/api/ai/pricing', async (req, res) => {
  try {
    const tiers = await tierLimitService.getAllTierLimits();
    
    const aiPricing = tiers.map(tier => ({
      tier: tier.tier_name,
      displayName: tier.tier_display_name,
      priceMonthly: tier.price_monthly / 100, // Convert cents to dollars
      priceYearly: tier.price_yearly / 100,
      backgroundRemoval: {
        limit: tier.ai_bg_removal_monthly,
        outputFormats: tier.ai_bg_output_formats.split(','),
        maxFileSize: tier.ai_bg_max_file_size,
      },
      imageEnhancement: {
        limit: tier.ai_enhance_monthly,
        maxUpscale: tier.ai_enhance_max_upscale,
        faceEnhancement: tier.ai_enhance_face_enhancement,
        maxFileSize: tier.ai_enhance_max_file_size,
      },
      priorityProcessing: tier.priority_processing,
      apiAccess: tier.api_access_level,
      support: tier.support_level,
    }));
    
    res.json(aiPricing);
  } catch (error: any) {
    console.error('Error getting AI pricing:', error);
    res.status(500).json({ error: 'Failed to get pricing' });
  }
});
