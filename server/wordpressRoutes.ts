/**
 * WordPress Plugin API Routes
 * 
 * Provides endpoints for the MicroJPEG WordPress plugin.
 * 
 * Add to your server/index.ts:
 *   import wordpressRoutes from './wordpressRoutes';
 *   app.use('/api', wordpressRoutes);
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import { db } from './db';
import { apiKeys, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

/**
 * Extract Bearer token from Authorization header
 */
function extractApiKey(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7).trim();
  }
  return null;
}

/**
 * Validate API key against database
 * API keys are stored as SHA-256 hash in keyHash column
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
    // Hash the incoming API key to compare with stored hash
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    console.log('[WordPress API] Looking up key hash:', keyHash.substring(0, 16) + '...');
    
    // Find API key by hash
    const [apiKeyRecord] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);
    
    if (!apiKeyRecord) {
      console.log('[WordPress API] API key not found in database');
      return { valid: false, error: 'Invalid API key' };
    }
    
    if (!apiKeyRecord.isActive) {
      console.log('[WordPress API] API key is disabled');
      return { valid: false, error: 'API key is disabled' };
    }
    
    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, apiKeyRecord.userId))
      .limit(1);
    
    if (!user) {
      return { valid: false, error: 'User not found' };
    }
    
    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ 
        lastUsedAt: new Date(),
        usageCount: (apiKeyRecord.usageCount || 0) + 1
      })
      .where(eq(apiKeys.id, apiKeyRecord.id));
    
    console.log('[WordPress API] API key valid. User:', user.id, 'Tier:', user.subscriptionTier);
    
    return {
      valid: true,
      userId: user.id,
      tier: user.subscriptionTier || 'free'
    };
    
  } catch (error: any) {
    console.error('[WordPress API] Validation error:', error);
    return { valid: false, error: 'Database error' };
  }
}

/**
 * Get file size limits based on subscription tier
 */
function getTierLimits(tier: string): { maxSize: number; maxRawSize: number } {
  // Normalize tier name (handle both 'starter' and 'starter-m' formats)
  const baseTier = tier?.split('-')[0] || 'free';
  
  const limits: Record<string, { maxSize: number; maxRawSize: number }> = {
    'free': { maxSize: 7 * 1024 * 1024, maxRawSize: 15 * 1024 * 1024 },
    'free_registered': { maxSize: 7 * 1024 * 1024, maxRawSize: 15 * 1024 * 1024 },
    'free_anonymous': { maxSize: 7 * 1024 * 1024, maxRawSize: 15 * 1024 * 1024 },
    'starter': { maxSize: 75 * 1024 * 1024, maxRawSize: 75 * 1024 * 1024 },
    'pro': { maxSize: 150 * 1024 * 1024, maxRawSize: 150 * 1024 * 1024 },
    'business': { maxSize: 200 * 1024 * 1024, maxRawSize: 200 * 1024 * 1024 },
  };
  
  return limits[baseTier] || limits['free'];
}

/**
 * Check if file is RAW format
 */
function isRawFormat(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const rawExts = ['.cr2', '.cr3', '.crw', '.arw', '.nef', '.nrw', '.dng', '.orf', '.raf', '.rw2', '.pef', '.srw'];
  return rawExts.includes(ext);
}

// ============================================
// POST /api/compress
// Main compression endpoint for WordPress plugin
// ============================================
router.post('/compress', upload.single('image'), async (req: Request, res: Response) => {
  console.log('[WordPress API] POST /api/compress');
  
  try {
    // Get API key from header
    const apiKey = extractApiKey(req);
    
    if (!apiKey) {
      console.log('[WordPress API] No Authorization header');
      return res.status(401).json({
        success: false,
        message: 'API key required. Include header: Authorization: Bearer YOUR_API_KEY'
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
    
    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Send as multipart/form-data with field name "image"'
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
        message: `File too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB for ${isRaw ? 'RAW' : 'regular'} files on your plan.`
      });
    }
    
    // Get settings
    const quality = Math.max(10, Math.min(100, parseInt(req.body.quality as string) || 85));
    let outputFormat = (req.body.outputFormat as string) || 'keep-original';
    
    // RAW files must convert
    if (isRaw && (outputFormat === 'keep-original' || outputFormat === 'keep')) {
      outputFormat = 'jpeg';
    }
    
    console.log(`[WordPress API] Processing: ${file.originalname}, Size: ${file.size}, Quality: ${quality}, Format: ${outputFormat}`);
    
    // Process with Sharp
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
    const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
    
    console.log(`[WordPress API] Done: ${originalSize} → ${compressedSize} (${savingsPercent}% saved)`);
    
    // Return as Base64
    return res.json({
      success: true,
      data: compressedBuffer.toString('base64'),
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

// ============================================
// GET /api/wordpress/validate-key
// Endpoint specifically for WordPress plugin to validate API key
// ============================================
router.get('/wordpress/validate-key', async (req: Request, res: Response) => {
  console.log('[WordPress API] GET /api/wordpress/validate-key');
  
  const apiKey = extractApiKey(req);
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  const validation = await validateApiKey(apiKey);
  
  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      message: validation.error
    });
  }
  
  return res.json({
    success: true,
    tier: validation.tier,
    message: 'API key is valid'
  });
});

export default router;
