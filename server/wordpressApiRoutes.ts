/**
 * WordPress Plugin API Routes
 * 
 * These endpoints are specifically for the WordPress plugin.
 * Mount at /api in your Express app.
 * 
 * Endpoints:
 * - POST /api/compress - Compress an image (multipart/form-data)
 * - GET /api/user/tier-info - Get user tier (used by plugin to validate API key)
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { storage } from './storage';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max (for RAW files)
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      // Standard formats
      '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.tiff', '.tif', '.bmp', '.ico',
      // RAW formats
      '.cr2', '.cr3', '.crw', '.arw', '.dng', '.nef', '.nrw', '.orf', '.raf', '.rw2', '.pef', '.srw'
    ];
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  }
});

// Helper to extract API key from Authorization header
function getApiKey(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper to validate API key and get user
async function validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; tier?: string }> {
  if (!apiKey) {
    return { valid: false };
  }
  
  try {
    // Look up API key in database
    const keyData = await storage.getApiKeyByHash(apiKey);
    
    if (!keyData || !keyData.isActive) {
      return { valid: false };
    }
    
    // Get user tier
    const user = await storage.getUser(keyData.userId);
    
    return {
      valid: true,
      userId: keyData.userId,
      tier: user?.subscriptionTier || 'free'
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false };
  }
}

// Get file size limits based on tier
function getTierLimits(tier: string) {
  const limits: Record<string, { maxSize: number; maxRawSize: number }> = {
    'free': { maxSize: 7 * 1024 * 1024, maxRawSize: 15 * 1024 * 1024 },
    'starter': { maxSize: 75 * 1024 * 1024, maxRawSize: 75 * 1024 * 1024 },
    'pro': { maxSize: 150 * 1024 * 1024, maxRawSize: 150 * 1024 * 1024 },
    'business': { maxSize: 200 * 1024 * 1024, maxRawSize: 200 * 1024 * 1024 },
  };
  return limits[tier] || limits['free'];
}

// Check if file is RAW format
function isRawFormat(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const rawExtensions = ['.cr2', '.cr3', '.crw', '.arw', '.dng', '.nef', '.nrw', '.orf', '.raf', '.rw2', '.pef', '.srw'];
  return rawExtensions.includes(ext);
}

/**
 * POST /api/compress
 * Main compression endpoint for WordPress plugin
 */
router.post('/compress', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const apiKey = getApiKey(req);
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required. Include in Authorization header as: Bearer YOUR_API_KEY'
      });
    }
    
    // Validate API key
    const keyValidation = await validateApiKey(apiKey);
    
    if (!keyValidation.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Send as multipart/form-data with field name "image"'
      });
    }
    
    const file = req.file;
    const isRaw = isRawFormat(file.originalname);
    const tier = keyValidation.tier || 'free';
    const limits = getTierLimits(tier);
    
    // Check file size against tier limits
    const maxSize = isRaw ? limits.maxRawSize : limits.maxSize;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB for ${isRaw ? 'RAW' : 'regular'} files on your plan.`
      });
    }
    
    // Get compression settings from request
    const quality = Math.max(10, Math.min(100, parseInt(req.body.quality) || 85));
    let outputFormat = req.body.outputFormat || 'keep-original';
    
    // RAW files must be converted
    if (isRaw && outputFormat === 'keep-original') {
      outputFormat = 'jpeg';
    }
    
    console.log(`[WordPress API] Compressing: ${file.originalname}, Size: ${file.size}, Quality: ${quality}, Output: ${outputFormat}`);
    
    // Process the image
    let sharpInstance = sharp(file.buffer);
    const metadata = await sharpInstance.metadata();
    
    // Determine actual output format
    let finalFormat = outputFormat;
    if (outputFormat === 'keep-original') {
      finalFormat = metadata.format || 'jpeg';
    }
    
    // Configure output
    switch (finalFormat) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: Math.round(quality / 10), compressionLevel: 9 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'avif':
        sharpInstance = sharpInstance.avif({ quality });
        break;
      default:
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
        finalFormat = 'jpeg';
    }
    
    // Compress
    const compressedBuffer = await sharpInstance.toBuffer();
    const compressedSize = compressedBuffer.length;
    const originalSize = file.size;
    const savingsPercent = Math.round((1 - compressedSize / originalSize) * 100);
    
    console.log(`[WordPress API] Compressed: ${originalSize} → ${compressedSize} (${savingsPercent}% savings)`);
    
    // Return as Base64 (what WordPress plugin expects)
    const base64Data = compressedBuffer.toString('base64');
    
    // Track API usage
    if (keyValidation.userId) {
      // Increment usage count (implement in your storage)
      // await storage.incrementApiUsage(keyValidation.userId);
    }
    
    res.json({
      success: true,
      data: base64Data,
      originalSize,
      compressedSize,
      savingsPercent,
      outputFormat: finalFormat,
      message: `Compressed successfully. Saved ${savingsPercent}%`
    });
    
  } catch (error: any) {
    console.error('[WordPress API] Compression error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Compression failed'
    });
  }
});

/**
 * GET /api/v1/status (for backward compatibility)
 * Used by older versions of the plugin to validate API key
 */
router.get('/v1/status', async (req: Request, res: Response) => {
  const apiKey = getApiKey(req);
  
  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API key required' });
  }
  
  const keyValidation = await validateApiKey(apiKey);
  
  if (!keyValidation.valid) {
    return res.status(401).json({ success: false, message: 'Invalid API key' });
  }
  
  res.json({
    success: true,
    tier: keyValidation.tier,
    message: 'API key is valid'
  });
});

/**
 * POST /api/v1/compress (for backward compatibility)
 * Alias for /api/compress
 */
router.post('/v1/compress', upload.single('image'), async (req: Request, res: Response) => {
  // Forward to main compress endpoint
  req.url = '/compress';
  router.handle(req, res, () => {});
});

export default router;
