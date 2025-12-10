// server/services/replicateAI.ts
// AI Background Removal Service using Replicate API

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Model for background removal - using only the standard model
// Enhanced model (rembg-enhance) causes CUDA out of memory errors
const REMOVE_BG_MODEL = 'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1';

export interface RemoveBackgroundOptions {
  outputFormat?: 'png' | 'webp' | 'avif' | 'jpg';
  outputQuality?: number;
}

export interface RemoveBackgroundResult {
  success: boolean;
  outputPath?: string;
  outputUrl?: string;
  originalSize?: number;
  processedSize?: number;
  format?: string;
  error?: string;
  processingTime?: number;
}

/**
 * Convert input image to PNG for Replicate API
 * Replicate can't handle AVIF or HEIC, so we convert first
 */
async function prepareInputImage(inputPath: string): Promise<{ buffer: Buffer; cleanup?: string }> {
  const ext = inputPath.split('.').pop()?.toLowerCase();
  
  // Check if we need to convert the input
  const needsConversion = ['avif', 'heic', 'heif'].includes(ext || '');
  
  if (needsConversion) {
    // Convert to PNG first using Sharp
    console.log(`Converting ${ext} to PNG for AI processing...`);
    const pngBuffer = await sharp(inputPath)
      .png()
      .toBuffer();
    return { buffer: pngBuffer };
  }
  
  // Read the file directly
  const buffer = await fs.readFile(inputPath);
  return { buffer };
}

/**
 * Remove background from an image using Replicate AI
 * UNIQUE FEATURE: Output to WebP/AVIF/JPG (competitors only output PNG!)
 */
export async function removeBackground(
  inputPath: string,
  outputDir: string,
  options: RemoveBackgroundOptions = {}
): Promise<RemoveBackgroundResult> {
  const startTime = Date.now();
  
  const {
    outputFormat = 'png',
    outputQuality = 90,
  } = options;

  try {
    // Validate input file exists
    const inputStats = await fs.stat(inputPath);
    if (!inputStats.isFile()) {
      throw new Error('Input file not found');
    }

    // Prepare input image (convert if necessary)
    const { buffer: inputBuffer } = await prepareInputImage(inputPath);
    const base64Image = `data:image/png;base64,${inputBuffer.toString('base64')}`;

    console.log(`🎨 Starting background removal...`);
    console.log(`📁 Input: ${inputPath} (${(inputStats.size / 1024).toFixed(2)} KB)`);
    console.log(`📤 Output format: ${outputFormat}`);

    // Call Replicate API
    const output = await replicate.run(REMOVE_BG_MODEL, {
      input: {
        image: base64Image,
      },
    });

    if (!output) {
      throw new Error('No output from Replicate API');
    }

    // Download the result (comes as URL or ReadableStream)
    let resultBuffer: Buffer;
    
    if (typeof output === 'string') {
      // Output is a URL - fetch it
      const response = await fetch(output);
      if (!response.ok) {
        throw new Error(`Failed to download result: ${response.status}`);
      }
      resultBuffer = Buffer.from(await response.arrayBuffer());
    } else if (output instanceof ReadableStream) {
      // Output is a stream
      const chunks: Uint8Array[] = [];
      const reader = output.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      resultBuffer = Buffer.concat(chunks);
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    // Generate output filename
    const jobId = `rmbg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputFilename = `${jobId}.${outputFormat}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Convert to desired format using Sharp
    // THIS IS OUR UNIQUE ADVANTAGE - competitors only output PNG!
    let sharpInstance = sharp(resultBuffer);

    switch (outputFormat) {
      case 'webp':
        // WebP with alpha channel for transparency
        await sharpInstance
          .webp({ quality: outputQuality, alphaQuality: 100 })
          .toFile(outputPath);
        break;
        
      case 'avif':
        // AVIF with alpha channel for transparency
        await sharpInstance
          .avif({ quality: outputQuality })
          .toFile(outputPath);
        break;
        
      case 'jpg':
      case 'jpeg':
        // JPG doesn't support transparency - flatten with white background
        await sharpInstance
          .flatten({ background: { r: 255, g: 255, b: 255 } })
          .jpeg({ quality: outputQuality })
          .toFile(outputPath);
        break;
        
      case 'png':
      default:
        // PNG with full transparency support
        await sharpInstance
          .png({ compressionLevel: 8 })
          .toFile(outputPath);
        break;
    }

    // Get output file stats
    const outputStats = await fs.stat(outputPath);
    const processingTime = Date.now() - startTime;

    console.log(`✅ Background removed successfully!`);
    console.log(`📁 Output: ${outputPath} (${(outputStats.size / 1024).toFixed(2)} KB)`);
    console.log(`⏱️ Processing time: ${processingTime}ms`);

    return {
      success: true,
      outputPath,
      originalSize: inputStats.size,
      processedSize: outputStats.size,
      format: outputFormat.toUpperCase(),
      processingTime,
    };

  } catch (error: any) {
    console.error('❌ Background removal failed:', error.message);
    
    // Provide better error messages
    let errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('CUDA out of memory')) {
      errorMessage = 'Image is too large to process. Please try a smaller image or use Standard model.';
    } else if (errorMessage.includes('cannot identify image file')) {
      errorMessage = 'This image format is not supported. Please use JPG, PNG, or WebP.';
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
 * Check if Replicate API is configured and working
 */
export async function checkReplicateHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return { healthy: false, error: 'REPLICATE_API_TOKEN not configured' };
    }

    // Simple validation - token format check
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token.startsWith('r8_') && !token.startsWith('r8-')) {
      return { healthy: false, error: 'Invalid API token format' };
    }

    return { healthy: true };
  } catch (error: any) {
    return { healthy: false, error: error.message };
  }
}

/**
 * Get estimated cost for background removal
 */
export function getEstimatedCost(): {
  costPerImage: number;
  runsPerDollar: number;
} {
  // Standard model pricing
  return { costPerImage: 0.00041, runsPerDollar: 2439 };
}
