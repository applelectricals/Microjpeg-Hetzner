// server/services/imageEnhancer.ts
// AI Image Enhancement/Upscaling Service using Replicate API
// Fixed: Handle all Replicate output formats properly

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
  inputDimensions?: { width: number; height: number };
  newDimensions?: { width: number; height: number };
  format?: string;
  scale?: number;
  wasResized?: boolean;
  error?: string;
  processingTime?: number;
}

/**
 * Resize image if it exceeds GPU memory limits
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
  
  if (newWidth > MAX_INPUT_DIMENSION || newHeight > MAX_INPUT_DIMENSION) {
    const ratio = Math.min(MAX_INPUT_DIMENSION / newWidth, MAX_INPUT_DIMENSION / newHeight);
    newWidth = Math.floor(newWidth * ratio);
    newHeight = Math.floor(newHeight * ratio);
  }
  
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
    .png()
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
 * Download result from Replicate - handles all output formats
 */
async function downloadReplicateOutput(output: any): Promise<Buffer> {
  console.log('📥 Replicate output type:', typeof output);
  console.log('📥 Replicate output:', JSON.stringify(output).substring(0, 200));

  // Case 1: Output is a URL string
  if (typeof output === 'string') {
    console.log('📥 Output is URL string, fetching...');
    const response = await fetch(output);
    if (!response.ok) {
      throw new Error(`Failed to download result: ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  // Case 2: Output is an array (some models return array of URLs)
  if (Array.isArray(output)) {
    console.log('📥 Output is array, fetching first element...');
    if (output.length === 0) {
      throw new Error('Replicate returned empty array');
    }
    const url = output[0];
    if (typeof url === 'string') {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download result: ${response.status}`);
      }
      return Buffer.from(await response.arrayBuffer());
    }
    throw new Error('Array element is not a URL string');
  }

  // Case 3: Output is a ReadableStream
  if (output instanceof ReadableStream) {
    console.log('📥 Output is ReadableStream, reading...');
    const chunks: Uint8Array[] = [];
    const reader = output.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  // Case 4: Output is an object with a URL property
  if (typeof output === 'object' && output !== null) {
    console.log('📥 Output is object, checking properties...');
    
    // Check common property names
    const urlProps = ['url', 'output', 'image', 'result', 'uri'];
    for (const prop of urlProps) {
      if (output[prop] && typeof output[prop] === 'string') {
        console.log(`📥 Found URL in property: ${prop}`);
        const response = await fetch(output[prop]);
        if (!response.ok) {
          throw new Error(`Failed to download result: ${response.status}`);
        }
        return Buffer.from(await response.arrayBuffer());
      }
    }

    // Check if it's a Buffer-like object
    if (output.type === 'Buffer' && Array.isArray(output.data)) {
      console.log('📥 Output is Buffer-like object');
      return Buffer.from(output.data);
    }
  }

  // Case 5: Output might be base64 encoded
  if (typeof output === 'string' && output.length > 100) {
    try {
      // Try to decode as base64
      const buffer = Buffer.from(output, 'base64');
      if (buffer.length > 0) {
        console.log('📥 Output decoded as base64');
        return buffer;
      }
    } catch (e) {
      // Not base64
    }
  }

  console.error('📥 Unhandled output format:', output);
  throw new Error(`Unexpected output format from Replicate: ${typeof output}`);
}

/**
 * Enhance/Upscale an image using Real-ESRGAN AI
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
    console.log(`📁 Input: ${inputPath} (${width}x${height}, ${(buffer.length / 1024).toFixed(2)} KB)`);
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

    // Download the result using flexible handler
    const resultBuffer = await downloadReplicateOutput(output);
    
    console.log(`📥 Downloaded result: ${resultBuffer.length} bytes`);

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
    console.error('❌ Full error:', error);
    
    let errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('total number of pixels') || errorMessage.includes('GPU memory')) {
      errorMessage = 'Image is too large for the AI model. Please try a smaller image (under 1500x1500 pixels).';
    } else if (errorMessage.includes('CUDA out of memory')) {
      errorMessage = 'GPU memory exceeded. Please try a smaller image or lower scale.';
    } else if (errorMessage.includes('Invalid API token')) {
      errorMessage = 'AI service configuration error. Please contact support.';
    } else if (errorMessage.includes('Unexpected output format')) {
      errorMessage = 'AI service returned unexpected response. Please try again.';
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

  if (pixels > MAX_INPUT_PIXELS || width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) {
    needsResize = true;
    
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
