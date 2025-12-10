// server/services/imageEnhancer.ts
// AI Image Enhancement/Upscaling Service using Replicate API
// Updated: Auto-resize large images to fit GPU memory limits

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Real-ESRGAN model
const REAL_ESRGAN_MODEL = 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa';

// GPU memory limits - Replicate's T4 GPU has ~2MP limit
const MAX_INPUT_PIXELS = 2000000; // 2 megapixels max input
const MAX_INPUT_DIMENSION = 1500; // Max dimension on either side

export interface EnhanceImageOptions {
  scale?: 2 | 4 | 8;
  faceEnhance?: boolean;
  outputFormat?: 'png' | 'webp' | 'avif' | 'jpg';
  outputQuality?: number;
}

export interface EnhanceImageResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  processedSize?: number;
  originalDimensions?: { width: number; height: number };
  inputDimensions?: { width: number; height: number }; // After resize (if needed)
  newDimensions?: { width: number; height: number };
  format?: string;
  scale?: number;
  wasResized?: boolean;
  error?: string;
  processingTime?: number;
}

/**
 * Resize image if it exceeds GPU memory limits
 * Returns the resized buffer and new dimensions
 */
async function prepareImageForEnhancement(
  inputPath: string
): Promise<{ buffer: Buffer; width: number; height: number; wasResized: boolean; originalWidth: number; originalHeight: number }> {
  
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;
  const pixels = originalWidth * originalHeight;

  console.log(`📐 Original dimensions: ${originalWidth}x${originalHeight} (${(pixels / 1000000).toFixed(2)} MP)`);

  // Check if resize is needed
  if (pixels <= MAX_INPUT_PIXELS && originalWidth <= MAX_INPUT_DIMENSION && originalHeight <= MAX_INPUT_DIMENSION) {
    // No resize needed
    const buffer = await fs.readFile(inputPath);
    return { 
      buffer, 
      width: originalWidth, 
      height: originalHeight, 
      wasResized: false,
      originalWidth,
      originalHeight
    };
  }

  // Calculate new dimensions while maintaining aspect ratio
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  // First, check if any dimension exceeds the max
  if (newWidth > MAX_INPUT_DIMENSION || newHeight > MAX_INPUT_DIMENSION) {
    const ratio = Math.min(MAX_INPUT_DIMENSION / newWidth, MAX_INPUT_DIMENSION / newHeight);
    newWidth = Math.floor(newWidth * ratio);
    newHeight = Math.floor(newHeight * ratio);
  }
  
  // Then check total pixels
  const newPixels = newWidth * newHeight;
  if (newPixels > MAX_INPUT_PIXELS) {
    const ratio = Math.sqrt(MAX_INPUT_PIXELS / newPixels);
    newWidth = Math.floor(newWidth * ratio);
    newHeight = Math.floor(newHeight * ratio);
  }

  console.log(`📏 Resizing for GPU: ${originalWidth}x${originalHeight} → ${newWidth}x${newHeight}`);

  // Resize image
  const buffer = await sharp(inputPath)
    .resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png() // Use PNG for best quality during processing
    .toBuffer();

  return { 
    buffer, 
    width: newWidth, 
    height: newHeight, 
    wasResized: true,
    originalWidth,
    originalHeight
  };
}

/**
 * Enhance/Upscale an image using Real-ESRGAN AI
 * Automatically resizes large images to fit GPU memory
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

    // Prepare image (resize if needed)
    const { buffer, width, height, wasResized, originalWidth, originalHeight } = 
      await prepareImageForEnhancement(inputPath);

    if (wasResized) {
      console.log(`⚠️ Image was resized from ${originalWidth}x${originalHeight} to ${width}x${height} to fit GPU memory`);
    }

    // Convert to base64
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    console.log(`🔍 Starting image enhancement...`);
    console.log(`📁 Input: ${inputPath} (${width}x${height}, ${(inputStats.size / 1024).toFixed(2)} KB)`);
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

    const newWidth = outputMetadata.width || width * scale;
    const newHeight = outputMetadata.height || height * scale;

    console.log(`✅ Image enhanced successfully!`);
    console.log(`📁 Output: ${outputPath} (${newWidth}x${newHeight}, ${(outputStats.size / 1024).toFixed(2)} KB)`);
    console.log(`⏱️ Processing time: ${processingTime}ms`);

    return {
      success: true,
      outputPath,
      originalSize: inputStats.size,
      processedSize: outputStats.size,
      originalDimensions: { width: originalWidth, height: originalHeight },
      inputDimensions: wasResized ? { width, height } : undefined,
      newDimensions: { width: newWidth, height: newHeight },
      format: outputFormat.toUpperCase(),
      scale,
      wasResized,
      processingTime,
    };

  } catch (error: any) {
    console.error('❌ Image enhancement failed:', error.message);
    
    let errorMessage = error.message || 'Unknown error';
    
    // Parse Replicate error messages
    if (errorMessage.includes('total number of pixels') || errorMessage.includes('GPU memory')) {
      errorMessage = 'Image is too large for the AI model. Please try a smaller image (under 1500x1500 pixels).';
    } else if (errorMessage.includes('CUDA out of memory')) {
      errorMessage = 'GPU memory exceeded. Please try a smaller image or lower scale.';
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
  return { costPerImage: 0.0025, runsPerDollar: 400 };
}

/**
 * Calculate estimated output dimensions
 */
export function calculateOutputDimensions(
  width: number, 
  height: number, 
  scale: 2 | 4 | 8
): { width: number; height: number; megapixels: string; needsResize: boolean; resizedTo?: { width: number; height: number } } {
  
  const pixels = width * height;
  let inputWidth = width;
  let inputHeight = height;
  let needsResize = false;

  // Check if resize will be needed
  if (pixels > MAX_INPUT_PIXELS || width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) {
    needsResize = true;
    
    // Calculate resized dimensions
    if (width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) {
      const ratio = Math.min(MAX_INPUT_DIMENSION / width, MAX_INPUT_DIMENSION / height);
      inputWidth = Math.floor(width * ratio);
      inputHeight = Math.floor(height * ratio);
    }
    
    const newPixels = inputWidth * inputHeight;
    if (newPixels > MAX_INPUT_PIXELS) {
      const ratio = Math.sqrt(MAX_INPUT_PIXELS / newPixels);
      inputWidth = Math.floor(inputWidth * ratio);
      inputHeight = Math.floor(inputHeight * ratio);
    }
  }

  const outputWidth = inputWidth * scale;
  const outputHeight = inputHeight * scale;
  const megapixels = ((outputWidth * outputHeight) / 1000000).toFixed(1);
  
  return { 
    width: outputWidth, 
    height: outputHeight, 
    megapixels,
    needsResize,
    resizedTo: needsResize ? { width: inputWidth, height: inputHeight } : undefined
  };
}

/**
 * Get maximum input dimensions info
 */
export function getInputLimits() {
  return {
    maxPixels: MAX_INPUT_PIXELS,
    maxDimension: MAX_INPUT_DIMENSION,
    recommendation: 'For best results, use images under 1500x1500 pixels. Larger images will be automatically resized.'
  };
}
