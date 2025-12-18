import express from 'express';
import multer from 'multer';
import { authenticateWordPressKey } from '../middleware/auth';
import { compressImage } from '../services/compressionService';
import { removeBackground } from '../services/backgroundRemovalService';
import { enhanceImage } from '../services/enhancementService';
import { getUserTier, checkLimit, incrementUsage } from '../services/subscriptionService';
import { logWordPressRequest } from '../services/analyticsService';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Validate API Key
 */
router.get('/validate-key', authenticateWordPressKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const tier = await getUserTier(userId);

    res.json({
      success: true,
      tier: tier.name,
      limits: {
        regular_images: tier.regularImageLimit,
        raw_files: tier.rawFileLimit,
        operations: tier.operations,
        bg_removals: tier.bgRemovals,
        enhancements: tier.enhancements,
        max_upscale: tier.maxUpscale
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate API key'
    });
  }
});

/**
 * Compress Image
 */
router.post('/compress', authenticateWordPressKey, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { quality, outputFormat } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check operation limit
    const canProcess = await checkLimit(userId, 'operations');
    if (!canProcess) {
      return res.status(429).json({
        success: false,
        message: 'Monthly operation limit reached'
      });
    }

    // Compress the image
    const result = await compressImage(file.path, {
      quality: parseInt(quality) || 85,
      outputFormat: outputFormat || 'keep-original'
    });

    // Increment usage counter
    await incrementUsage(userId, 'operations');
    await logWordPressRequest(userId, 'compress', file.size);

    res.json({
      success: true,
      data: result.base64Data,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      savingsPercent: result.savingsPercent,
      outputFormat: result.outputFormat
    });

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      message: 'Image compression failed'
    });
  }
});

/**
 * Remove Background (AI)
 */
router.post('/remove-background', authenticateWordPressKey, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { format } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check BG removal limit
    const canRemoveBg = await checkLimit(userId, 'bg_removals');
    if (!canRemoveBg) {
      return res.status(429).json({
        success: false,
        message: 'Monthly background removal limit reached'
      });
    }

    // Validate format for user's tier
    const tier = await getUserTier(userId);
    const allowedFormats = tier.bgFormats || ['png'];
    const outputFormat = format || 'png';

    if (!allowedFormats.includes(outputFormat)) {
      return res.status(403).json({
        success: false,
        message: `Format ${outputFormat} not available in your plan. Allowed: ${allowedFormats.join(', ')}`
      });
    }

    // Remove background
    const result = await removeBackground(file.path, outputFormat);

    // Increment usage counter
    await incrementUsage(userId, 'bg_removals');
    await logWordPressRequest(userId, 'remove-background', file.size);

    res.json({
      success: true,
      data: result.base64Data,
      format: outputFormat,
      originalSize: result.originalSize,
      processedSize: result.processedSize
    });

  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({
      success: false,
      message: 'Background removal failed'
    });
  }
});

/**
 * Enhance Image (AI)
 */
router.post('/enhance-image', authenticateWordPressKey, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { options } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Parse options
    const enhanceOptions = typeof options === 'string' ? JSON.parse(options) : options;
    const upscaleLevel = enhanceOptions.upscale || 2;

    // Check enhancement limit
    const canEnhance = await checkLimit(userId, 'enhancements');
    if (!canEnhance) {
      return res.status(429).json({
        success: false,
        message: 'Monthly enhancement limit reached'
      });
    }

    // Validate upscale level for user's tier
    const tier = await getUserTier(userId);
    if (upscaleLevel > tier.maxUpscale) {
      return res.status(403).json({
        success: false,
        message: `Maximum upscale for your plan is ${tier.maxUpscale}x`
      });
    }

    // Enhance image
    const result = await enhanceImage(file.path, enhanceOptions);

    // Increment usage counter
    await incrementUsage(userId, 'enhancements');
    await logWordPressRequest(userId, 'enhance-image', file.size);

    res.json({
      success: true,
      data: result.base64Data,
      originalSize: result.originalSize,
      enhancedSize: result.enhancedSize,
      upscale: upscaleLevel
    });

  } catch (error) {
    console.error('Image enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Image enhancement failed'
    });
  }
});

/**
 * Get Usage Statistics
 */
router.get('/usage', authenticateWordPressKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserUsageStats(userId);

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage statistics'
    });
  }
});

/**
 * Download Plugin
 */
router.get('/download-plugin', async (req, res) => {
  try {
    const pluginPath = path.join(__dirname, '../../wordpress-plugin/micro-jpeg.zip');
    
    if (!fs.existsSync(pluginPath)) {
      return res.status(404).json({
        success: false,
        message: 'Plugin file not found'
      });
    }

    res.download(pluginPath, 'micro-jpeg.zip');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download plugin'
    });
  }
});

export default router;