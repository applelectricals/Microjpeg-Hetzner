// server/services/imageEnhancer.ts
// AI Image Enhancement/Upscaling Service using Replicate API

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Models for image enhancement
// Real-ESRGAN: ~$0.0025 per run (400 runs per $1) - Best for general upscaling
// Includes GFPGAN for face enhancement
const REAL_ESRGAN_MODEL = 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa';

export interface EnhanceImageOptions {
  scale?: 2 | 4 | 8;  // Upscale factor
  faceEnhance?: boolean;  // Use GFPGAN for face enhancement
  outputFormat?: 'png' | 'webp' | 'avif' | 'jpg';
  outputQuality?: number;
}

export interface EnhanceImageResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  processedSize?: number;
  originalDimensions?: { width: number; height: number };
  newDimensions?: { width: number; height: number };
  format?: string;
  scale?: number;
  error?: string;
  processingTime?: number;
}

/**
 * Enhance/Upscale an image using Real-ESRGAN AI
 * Supports 2x, 4x, and 8x upscaling with optional face enhancement
 */
export async function enhanceImage(
  inputPath: string,
  outputDir: string,
  options: EnhanceImageOptions = {}
): Promise<EnhanceImageResult> {
  const startTime = Date.now();
  
  const {
    scale = 4,
    faceEnhance = false,
    outputFormat = 'png',
    outputQuality = 90,
  } = options;

  try {
    // Validate input file exists
    const inputStats = await fs.stat(inputPath);
    if (!inputStats.isFile()) {
      throw new Error('Input file not found');
    }

    // Get original image dimensions
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Check if image is too large for the requested scale
    const maxInputPixels = 2048 * 2048; // ~4MP limit for safety
    const inputPixels = originalWidth * originalHeight;
    
    if (inputPixels > maxInputPixels && scale > 2) {
      throw new Error(`Image too large for ${scale}x upscale. Please use 2x for images larger than 2048x2048.`);
    }

    // Read input file and convert to base64
    const inputBuffer = await fs.readFile(inputPath);
    const base64Image = `data:image/${metadata.format || 'png'};base64,${inputBuffer.toString('base64')}`;

    console.log(`🔍 Starting image enhancement...`);
    console.log(`📁 Input: ${inputPath} (${originalWidth}x${originalHeight}, ${(inputStats.size / 1024).toFixed(2)} KB)`);
    console.log(`📐 Scale: ${scale}x | Face enhance: ${faceEnhance}`);

    // Call Replicate API with Real-ESRGAN
    const output = await replicate.run(REAL_ESRGAN_MODEL, {
      input: {
        image: base64Image,
        scale: scale,
        face_enhance: faceEnhance,
      },
    });

    if (!output) {
      throw new Error('No output from Replicate API');
    }

    // Download the result
    let resultBuffer: Buffer;
    
    if (typeof output === 'string') {
      const response = await fetch(output);
      if (!response.ok) {
        throw new Error(`Failed to download result: ${response.status}`);
      }
      resultBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    // Generate output filename
    const jobId = `enhance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputFilename = `${jobId}.${outputFormat}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Convert to desired format using Sharp
    let sharpInstance = sharp(resultBuffer);

    switch (outputFormat) {
      case 'webp':
        await sharpInstance
          .webp({ quality: outputQuality })
          .toFile(outputPath);
        break;
        
      case 'avif':
        await sharpInstance
          .avif({ quality: outputQuality })
          .toFile(outputPath);
        break;
        
      case 'jpg':
      case 'jpeg':
        await sharpInstance
          .jpeg({ quality: outputQuality })
          .toFile(outputPath);
        break;
        
      case 'png':
      default:
        await sharpInstance
          .png({ compressionLevel: 8 })
          .toFile(outputPath);
        break;
    }

    // Get output file stats and dimensions
    const outputStats = await fs.stat(outputPath);
    const outputMetadata = await sharp(outputPath).metadata();
    const processingTime = Date.now() - startTime;

    const newWidth = outputMetadata.width || originalWidth * scale;
    const newHeight = outputMetadata.height || originalHeight * scale;

    console.log(`✅ Image enhanced successfully!`);
    console.log(`📁 Output: ${outputPath} (${newWidth}x${newHeight}, ${(outputStats.size / 1024).toFixed(2)} KB)`);
    console.log(`⏱️ Processing time: ${processingTime}ms`);

    return {
      success: true,
      outputPath,
      originalSize: inputStats.size,
      processedSize: outputStats.size,
      originalDimensions: { width: originalWidth, height: originalHeight },
      newDimensions: { width: newWidth, height: newHeight },
      format: outputFormat.toUpperCase(),
      scale,
      processingTime,
    };

  } catch (error: any) {
    console.error('❌ Image enhancement failed:', error.message);
    
    let errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('CUDA out of memory')) {
      errorMessage = 'Image is too large to process. Please try a smaller image or lower scale factor.';
    } else if (errorMessage.includes('Invalid API token')) {
      errorMessage = 'AI service configuration error. Please contact support.';
    }
    
    return {
      success: false,
      error: errorMessage,
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Get estimated cost for image enhancement
 */
export function getEnhancementCost(): {
  costPerImage: number;
  runsPerDollar: number;
} {
  // Real-ESRGAN pricing
  return { costPerImage: 0.0025, runsPerDollar: 400 };
}

/**
 * Calculate estimated output dimensions
 */
export function calculateOutputDimensions(
  width: number, 
  height: number, 
  scale: 2 | 4 | 8
): { width: number; height: number; megapixels: string } {
  const newWidth = width * scale;
  const newHeight = height * scale;
  const megapixels = ((newWidth * newHeight) / 1000000).toFixed(1);
  
  return { width: newWidth, height: newHeight, megapixels };
}
