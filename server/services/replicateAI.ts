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

// Model options for background removal
const MODELS = {
  // Best quality - $0.00041 per run
  REMOVE_BG: 'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1',
  // Good quality, cheaper - $0.00036 per run
  REMBG: 'ilkerc/rembg:7fa358a133d92eec65e60d5f52b3c8db58f9f41e58e4b1f4c47b6097f5c62d51',
  // Enhanced quality - $0.002 per run
  REMBG_ENHANCE: 'smoretalk/rembg-enhance:4067ee2a58f6c161d434a9c077cfa012820b8e076efa2772aa171e26557da919',
};

export interface RemoveBackgroundOptions {
  model?: 'standard' | 'enhanced';
  outputFormat?: 'png' | 'webp' | 'avif';
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
 * Remove background from an image using Replicate AI
 * UNIQUE FEATURE: Output to WebP/AVIF (competitors only output PNG!)
 */
export async function removeBackground(
  inputPath: string,
  outputDir: string,
  options: RemoveBackgroundOptions = {}
): Promise<RemoveBackgroundResult> {
  const startTime = Date.now();
  
  const {
    model = 'standard',
    outputFormat = 'png',
    outputQuality = 90,
  } = options;

  try {
    // Validate input file exists
    const inputStats = await fs.stat(inputPath);
    if (!inputStats.isFile()) {
      throw new Error('Input file not found');
    }

    // Read input file and convert to base64
    const inputBuffer = await fs.readFile(inputPath);
    const base64Image = `data:image/png;base64,${inputBuffer.toString('base64')}`;

    // Select model based on quality preference
    const modelId = model === 'enhanced' ? MODELS.REMBG_ENHANCE : MODELS.REMOVE_BG;

    console.log(`🎨 Starting background removal with ${model} model...`);
    console.log(`📁 Input: ${inputPath} (${(inputStats.size / 1024).toFixed(2)} KB)`);

    // Call Replicate API
    const output = await replicate.run(modelId, {
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
        await sharpInstance
          .webp({ quality: outputQuality, alphaQuality: 100 })
          .toFile(outputPath);
        break;
      case 'avif':
        await sharpInstance
          .avif({ quality: outputQuality })
          .toFile(outputPath);
        break;
      case 'png':
      default:
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
    return {
      success: false,
      error: error.message || 'Unknown error',
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

    // Simple health check - list models
    const models = await replicate.models.list();
    return { healthy: true };
  } catch (error: any) {
    return { healthy: false, error: error.message };
  }
}

/**
 * Get estimated cost for background removal
 */
export function getEstimatedCost(model: 'standard' | 'enhanced' = 'standard'): {
  costPerImage: number;
  runsPerDollar: number;
} {
  if (model === 'enhanced') {
    return { costPerImage: 0.002, runsPerDollar: 500 };
  }
  return { costPerImage: 0.00041, runsPerDollar: 2439 };
}
