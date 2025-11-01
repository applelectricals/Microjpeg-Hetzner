/**
 * Sequential Processing Manager
 * Ensures files are processed ONE AT A TIME (sequentially) to:
 * 1. Prevent resource exhaustion from parallel processing
 * 2. Ensure predictable performance and memory usage
 * 3. Provide accurate progress tracking for users
 * 4. Handle large batch operations reliably
 */

import { Job } from 'bull';
import { imageQueue, bulkQueue } from './queueConfig';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { r2Service, R2_FOLDERS } from './r2Service';

/**
 * Sequential Batch Job Structure
 * Processes multiple files one-by-one from a single batch submission
 */
export interface SequentialBatchJob {
  batchId: string;
  files: Array<{
    id: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    options?: {
      quality?: number;
      width?: number;
      height?: number;
      format?: string;
      outputFormat?: string;
    };
  }>;
  sessionId: string;
  userId?: string;
  userTier: string;
  outputFormat?: string;
  outputDirPath: string;
  totalFiles: number;
}

/**
 * Batch Processing Progress Tracker
 */
export interface BatchProgressData {
  batchId: string;
  totalFiles: number;
  processedFiles: number;
  currentFileIndex: number;
  currentFileName: string;
  results: BatchFileResult[];
  failedFiles: string[];
  estimatedTimeRemaining: number;
  startedAt: number;
  progressPercentage: number;
}

/**
 * Individual file result in batch
 */
export interface BatchFileResult {
  fileId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'skipped';
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  processingTime?: number;
  downloadUrl?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
}

// In-memory storage for batch progress (use Redis in production)
const batchProgress = new Map<string, BatchProgressData>();

/**
 * Main Sequential Batch Processor
 * Processes each file in the batch sequentially
 */
export async function processSequentialBatch(
  job: Job<SequentialBatchJob>
): Promise<{
  success: boolean;
  batchId: string;
  results: BatchFileResult[];
  totalTime: number;
  successCount: number;
  failureCount: number;
}> {
  const { batchId, files, sessionId, userId, userTier, outputDirPath, totalFiles } = job.data;

  console.log(`\n📦 Starting Sequential Batch Processing - Batch ID: ${batchId}`);
  console.log(`📋 Total files: ${totalFiles}`);
  console.log(`👤 User Tier: ${userTier}`);
  console.log(`─────────────────────────────────────────`);

  const batchStartTime = Date.now();
  const results: BatchFileResult[] = [];
  const failedFiles: string[] = [];

  // Initialize batch progress tracker
  batchProgress.set(batchId, {
    batchId,
    totalFiles,
    processedFiles: 0,
    currentFileIndex: 0,
    currentFileName: '',
    results: [],
    failedFiles: [],
    estimatedTimeRemaining: 0,
    startedAt: batchStartTime,
    progressPercentage: 0,
  });

  try {
    // ============================================================
    // SEQUENTIAL PROCESSING LOOP - ONE FILE AT A TIME
    // ============================================================
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileStartTime = Date.now();

      console.log(
        `\n[${i + 1}/${totalFiles}] Processing: ${file.fileName} (${(file.fileSize / 1024 / 1024).toFixed(2)}MB)`
      );

      const fileResult: BatchFileResult = {
        fileId: file.id,
        fileName: file.fileName,
        status: 'pending',
        startTime: fileStartTime,
      };

      try {
        // Update progress before processing
        updateBatchProgress(batchId, {
          currentFileIndex: i,
          currentFileName: file.fileName,
          progressPercentage: Math.round((i / totalFiles) * 100),
        });

        // Update job progress for Bull
        await job.progress(Math.round((i / totalFiles) * 100));

        // ============================================================
        // PROCESS SINGLE FILE
        // ============================================================
        fileResult.status = 'processing';

        if (!fs.existsSync(file.filePath)) {
          throw new Error(`File not found: ${file.filePath}`);
        }

        // Get original file stats
        const originalStats = await fs.promises.stat(file.filePath);
        fileResult.originalSize = originalStats.size;

        // Perform compression/conversion
        console.log(`  🔄 Converting to ${file.options?.format || 'JPG'}...`);

        const compressionResult = await performFileCompression(
          file.filePath,
          file.fileName,
          outputDirPath,
          file.options || {}
        );

        fileResult.compressedSize = compressionResult.compressedSize;
        fileResult.compressionRatio = compressionResult.compressionRatio;
        fileResult.processingTime = Math.round((Date.now() - fileStartTime) / 1000);

        // Upload to R2 CDN
        console.log(`  📤 Uploading to R2...`);

        const uploadResult = await uploadFileToR2(
          compressionResult.outputPath,
          file.fileName,
          userTier,
          userId,
          sessionId
        );

        fileResult.downloadUrl = uploadResult.cdnUrl;
        fileResult.status = 'success';

        console.log(`  ✅ Success! (${fileResult.processingTime}s)`);
        console.log(
          `     Size: ${(fileResult.originalSize / 1024 / 1024).toFixed(2)}MB → ${(fileResult.compressedSize / 1024 / 1024).toFixed(2)}MB (${fileResult.compressionRatio.toFixed(1)}% reduction)`
        );

        // Clean up local file
        try {
          await fs.promises.unlink(compressionResult.outputPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      } catch (error: any) {
        console.error(`  ❌ Failed: ${error.message}`);

        fileResult.status = 'failed';
        fileResult.error = error.message;
        fileResult.processingTime = Math.round((Date.now() - fileStartTime) / 1000);
        failedFiles.push(file.fileName);
      }

      // Store result
      results.push(fileResult);

      // Update batch progress
      updateBatchProgress(batchId, {
        processedFiles: i + 1,
        results,
        failedFiles,
        estimatedTimeRemaining: estimateRemainingTime(batchStartTime, i + 1, totalFiles),
        progressPercentage: Math.round(((i + 1) / totalFiles) * 100),
      });

      console.log(`  [${i + 1}/${totalFiles}] Complete`);
    }

    // ============================================================
    // BATCH COMPLETION
    // ============================================================
    const totalTime = Math.round((Date.now() - batchStartTime) / 1000);
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'failed').length;

    console.log(`\n─────────────────────────────────────────`);
    console.log(`✅ Batch Complete! Batch ID: ${batchId}`);
    console.log(`📊 Results: ${successCount} success, ${failureCount} failed`);
    console.log(`⏱️  Total Time: ${totalTime}s`);
    console.log(`─────────────────────────────────────────\n`);

    // Clear progress tracker
    batchProgress.delete(batchId);

    return {
      success: failureCount === 0,
      batchId,
      results,
      totalTime,
      successCount,
      failureCount,
    };
  } catch (error: any) {
    console.error(`\n❌ Batch processing error: ${error.message}`);

    // Mark all remaining files as skipped
    for (let i = results.length; i < files.length; i++) {
      results.push({
        fileId: files[i].id,
        fileName: files[i].fileName,
        status: 'skipped',
        error: 'Batch processing halted due to critical error',
      });
    }

    batchProgress.delete(batchId);

    throw error;
  }
}

/**
 * Compress a single file using Sharp
 */
async function performFileCompression(
  inputPath: string,
  fileName: string,
  outputDir: string,
  options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: string;
  }
): Promise<{ outputPath: string; compressedSize: number; compressionRatio: number }> {
  const { quality = 80, width, height, format = 'jpeg' } = options;

  // Create output filename
  const ext = format.toLowerCase() === 'jpg' ? 'jpg' : format.toLowerCase();
  const baseNameWithoutExt = path.parse(fileName).name;
  const outputFileName = `${baseNameWithoutExt}.${ext}`;
  const outputPath = path.join(outputDir, outputFileName);

  // Ensure output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Get original file size
  const originalStats = await fs.promises.stat(inputPath);
  const originalSize = originalStats.size;

  // Create Sharp pipeline
  let pipeline = sharp(inputPath, {
    unlimited: true,
    sequentialRead: true,
    failOnError: false,
  });

  // Apply resizing if specified
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Apply format-specific compression
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
        optimizeScans: true,
        trellisQuantisation: true,
        overshootDeringing: true,
      });
      break;

    case 'png':
      pipeline = pipeline.png({
        quality: Math.floor(quality / 10),
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true,
      });
      break;

    case 'webp':
      pipeline = pipeline.webp({
        quality,
        effort: 6,
        smartSubsample: true,
      });
      break;

    case 'avif':
      pipeline = pipeline.avif({
        quality: Math.floor(quality * 0.8),
        effort: 2,
        chromaSubsampling: '4:2:0',
      });
      break;

    case 'tiff':
      pipeline = pipeline.tiff({
        compression: 'jpeg',
        quality: Math.floor(quality * 0.85),
      });
      break;

    default:
      pipeline = pipeline.jpeg({ quality, progressive: true });
  }

  // Write to output file
  await pipeline.toFile(outputPath);

  // Get compressed file size
  const compressedStats = await fs.promises.stat(outputPath);
  const compressedSize = compressedStats.size;
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

  return {
    outputPath,
    compressedSize,
    compressionRatio,
  };
}

/**
 * Upload processed file to R2 CDN
 */
async function uploadFileToR2(
  filePath: string,
  fileName: string,
  userTier: string,
  userId: string | undefined,
  sessionId: string
): Promise<{ cdnUrl: string; r2Key: string }> {
  const fileExt = path.extname(fileName).toLowerCase();
  const contentType = getContentType(fileExt);

  const uploadResult = await r2Service.uploadFile(filePath, fileName, {
    folder: R2_FOLDERS.COMPRESSED,
    contentType,
    metadata: {
      userTier,
      userId: userId || 'anonymous',
      sessionId,
      processedAt: new Date().toISOString(),
      uploadedBy: 'sequential-processor',
    },
  });

  return {
    cdnUrl: uploadResult.cdnUrl,
    r2Key: uploadResult.r2Key,
  };
}

/**
 * Get MIME type for file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.tiff': 'image/tiff',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Update batch progress information
 */
function updateBatchProgress(
  batchId: string,
  updates: Partial<BatchProgressData>
): void {
  const current = batchProgress.get(batchId);
  if (!current) return;

  Object.assign(current, updates);
  batchProgress.set(batchId, current);
}

/**
 * Get current batch progress
 */
export function getBatchProgress(batchId: string): BatchProgressData | null {
  return batchProgress.get(batchId) || null;
}

/**
 * Estimate remaining processing time
 */
function estimateRemainingTime(
  startTime: number,
  processedCount: number,
  totalCount: number
): number {
  if (processedCount === 0) return 0;

  const elapsedTime = Date.now() - startTime;
  const averageTimePerFile = elapsedTime / processedCount;
  const remainingFiles = totalCount - processedCount;

  return Math.round((averageTimePerFile * remainingFiles) / 1000); // Return in seconds
}

/**
 * Cancel batch processing
 */
export async function cancelBatchProcessing(batchId: string): Promise<void> {
  const progress = batchProgress.get(batchId);
  if (!progress) {
    throw new Error(`Batch ${batchId} not found`);
  }

  // Mark remaining files as cancelled
  for (let i = progress.processedFiles; i < progress.totalFiles; i++) {
    if (progress.results[i]) {
      progress.results[i].status = 'skipped';
      progress.results[i].error = 'Batch cancelled by user';
    }
  }

  batchProgress.delete(batchId);
  console.log(`🛑 Batch ${batchId} cancelled`);
}
