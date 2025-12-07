// imageWorker.ts - Worker thread for CPU-intensive image processing
import { parentPort, workerData } from 'worker_threads';
import sharp from 'sharp';
import { createHash } from 'crypto';

interface WorkerTask {
  buffer: Buffer;
  settings: {
    quality: number;
    outputFormat: string;
    resizeWidth?: number;
    resizeHeight?: number;
    compressionAlgorithm: string;
  };
  originalName: string;
  originalSize: number;
}

// Listen for tasks from the main thread
parentPort?.on('message', async (task: WorkerTask) => {
  try {
    const { buffer, settings, originalName, originalSize } = task;

    // Create hash for caching
    const imageHash = createHash('sha256').update(buffer).digest('hex');
    const cacheKey = `${imageHash}-${settings.outputFormat}-${settings.quality}`;

    let transformer = sharp(buffer, {
      // Optimize Sharp for speed
      sequentialRead: true, // Read images sequentially for better performance
      limitInputPixels: 268402689 // Limit to ~16k x 16k images (safety)
    });

    // Apply resize if specified (resize before compression for speed)
    if (settings.resizeWidth || settings.resizeHeight) {
      transformer = transformer.resize(settings.resizeWidth, settings.resizeHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format-specific optimizations
    let compressedBuffer: Buffer;
    
    switch (settings.outputFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        compressedBuffer = await transformer
          .jpeg({
            quality: settings.quality,
            mozjpeg: false, // Faster than mozjpeg
            progressive: false, // Disable progressive for speed
            optimizeScans: false, // Skip scan optimization for speed
            trellisQuantisation: false, // Skip advanced quantisation
            overshootDeringing: false, // Skip deringing
            optimizeQuantizationTable: false // Skip table optimization
          })
          .toBuffer();
        break;

      case 'png':
        compressedBuffer = await transformer
          .png({
            compressionLevel: 6, // Balance speed/size (0=fastest, 9=smallest)
            adaptiveFiltering: false, // Faster
            palette: true, // Use palette for smaller files
            effort: 1 // Minimum effort (1-10, lower=faster)
          })
          .toBuffer();
        break;

      case 'webp':
        compressedBuffer = await transformer
          .webp({
            quality: settings.quality,
            effort: 2, // Lower effort for speed (0-6, default 4)
            smartSubsample: false, // Disable for speed
            nearLossless: false // Disable for speed
          })
          .toBuffer();
        break;

      case 'avif':
        compressedBuffer = await transformer
          .avif({
            quality: settings.quality,
            effort: 2, // Lower effort for speed (0-9, default 4)
            chromaSubsampling: '4:2:0' // Faster subsampling
          })
          .toBuffer();
        break;

      case 'tiff':
        compressedBuffer = await transformer
          .tiff({
            quality: settings.quality,
            compression: 'lzw', // Fast compression
            predictor: 'horizontal' // Optimize for typical images
          })
          .toBuffer();
        break;

      default:
        throw new Error(`Unsupported format: ${settings.outputFormat}`);
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    // Send result back to main thread
    parentPort?.postMessage({
      success: true,
      data: {
        buffer: compressedBuffer,
        cacheKey,
        originalName,
        originalSize,
        compressedSize,
        compressionRatio,
        outputFormat: settings.outputFormat
      }
    });

  } catch (error) {
    // Send error back to main thread
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Signal that worker is ready
parentPort?.postMessage({ ready: true });