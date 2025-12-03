/**
 * WordPress Plugin API Routes
 * 
 * Add this to your server to enable WordPress plugin functionality.
 * 
 * Endpoints:
 * - POST /api/compress - Compress an image (used by WordPress plugin)
 * 
 * Usage in your index.ts:
 *   import wordpressRoutes from './wordpressRoutes';
 *   app.use('/api', wordpressRoutes);
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { storage } from './storage';
import crypto from 'crypto';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max
  }
});

/**
 * Extract API key from Authorization header
 */
function extractApiKey(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7).trim();
  }
  return null;
}

/**
 * Validate API key and return user info
 */
async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  tier?: string;
  error?: string;
}> {
  if (!apiKey) {
    return { valid: false, error: 'No API key provided' };
  }

  try {
    // Hash the API key to look it up
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Look up in database - adjust this to match your storage implementation
    const apiKeyRecord = await storage.getApiKeyByKey(apiKey);
    
    if (!apiKeyRecord) {
      // Try by hash if direct lookup failed
      const apiKeyByHash = await storage.getApiKeyByHash(keyHash);
      if (!apiKeyByHash) {
        return { valid: false, error: 'Invalid API key' };
      }
      
      if (!apiKeyByHash.isActive) {
        return { valid: false, error: 'API key is disabled' };
      }
      
      const user = await storage.getUser(apiKeyByHash.userId);
      return {
        valid: true,
        userId: apiKeyByHash.userId,
        tier: user?.subscriptionTier || 'free'
      };
    }
    
    if (!apiKeyRecord.isActive) {
      return { valid: false, error: 'API key is disabled' };
    }
    
    const user = await storage.getUser(apiKeyRecord.userId);
    return {
      valid: true,
      userId: apiKeyRecord.userId,
      tier: user?.subscriptionTier || 'free'
    };
    
  } catch (error: any) {
    console.error('[WordPress API] Key validation error:', error);
    return { valid: false, error: 'Validation error' };
  }
}

/**
 * Get tier limits
 */
function getTierLimits(tier: string) {
  const limits: Record<string, { maxSize: number; maxRawSize: number }> = {
    'free': { maxSize: 7 * 1024 * 1024, maxRawSize: 15 * 1024 * 1024 },
    'starter': { maxSize: 75 * 1024 * 1024, maxRawSize: 75 * 1024 * 1024 },
    'pro': { maxSize: 150 * 1024 * 1024, maxRawSize: 150 * 1024 * 1024 },
    'business': { maxSize: 200 * 1024 * 1024, maxRawSize: 200 * 1024 * 1024 },
  };
  return limits[tier] || limits['free'];
}

/**
 * Check if file is RAW format
 */
function isRawFormat(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const rawExts = ['.cr2', '.cr3', '.crw', '.arw', '.nef', '.nrw', '.dng', '.orf', '.raf', '.rw2', '.pef', '.srw'];
  return rawExts.includes(ext);
}

/**
 * POST /api/compress
 * Main compression endpoint for WordPress plugin
 */
router.post('/compress', upload.single('image'), async (req: Request, res: Response) => {
  console.log('[WordPress API] /compress called');
  
  try {
    // Get API key
    const apiKey = extractApiKey(req);
    
    if (!apiKey) {
      console.log('[WordPress API] No API key provided');
      return res.status(401).json({
        success: false,
        message: 'API key required. Send in Authorization header as: Bearer YOUR_API_KEY'
      });
    }
    
    // Validate API key
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      console.log('[WordPress API] Invalid API key:', validation.error);
      return res.status(401).json({
        success: false,
        message: validation.error || 'Invalid API key'
      });
    }
    
    console.log('[WordPress API] API key valid. User:', validation.userId, 'Tier:', validation.tier);
    
    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    const file = req.file;
    const isRaw = isRawFormat(file.originalname);
    const tier = validation.tier || 'free';
    const limits = getTierLimits(tier);
    
    // Check file size
    const maxSize = isRaw ? limits.maxRawSize : limits.maxSize;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB for ${isRaw ? 'RAW' : 'regular'} files on ${tier} plan.`
      });
    }
    
    // Get compression settings
    const quality = Math.max(10, Math.min(100, parseInt(req.body.quality as string) || 85));
    let outputFormat = (req.body.outputFormat as string) || 'keep-original';
    
    // RAW files must be converted
    if (isRaw && (outputFormat === 'keep-original' || outputFormat === 'keep')) {
      outputFormat = 'jpeg';
    }
    
    console.log(`[WordPress API] Processing: ${file.originalname}, Size: ${file.size}, Quality: ${quality}, Format: ${outputFormat}`);
    
    // Process image with Sharp
    let sharpInstance = sharp(file.buffer);
    const metadata = await sharpInstance.metadata();
    
    // Determine output format
    let finalFormat = outputFormat;
    if (outputFormat === 'keep-original' || outputFormat === 'keep') {
      finalFormat = metadata.format || 'jpeg';
    }
    
    // Apply compression
    switch (finalFormat) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
        finalFormat = 'jpeg';
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
    
    // Return Base64 encoded data
    const base64Data = compressedBuffer.toString('base64');
    
    // Track usage (optional - implement if you want)
    // await storage.incrementApiUsage(validation.userId);
    
    return res.json({
      success: true,
      data: base64Data,
      originalSize,
      compressedSize,
      savingsPercent,
      outputFormat: finalFormat,
      message: `Compressed successfully. Saved ${savingsPercent}%`
    });
    
  } catch (error: any) {
    console.error('[WordPress API] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Compression failed'
    });
  }
});

export default router;
