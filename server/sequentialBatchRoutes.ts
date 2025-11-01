/**
 * Sequential Batch Processing Routes
 * Endpoints for submitting and monitoring batch file processing jobs
 */

import { Router, Request, Response } from 'express';
import { v4 as randomUUID } from 'uuid';
import path from 'path';
import os from 'os';
import { sequentialBatchQueue } from './queueConfig';
import {
  SequentialBatchJob,
  getBatchProgress,
  cancelBatchProcessing,
  processSequentialBatch,
} from './sequentialProcessor';

const router = Router();

/**
 * POST /api/sequential-batch/submit
 * Submit multiple files for sequential batch processing
 *
 * Body:
 * {
 *   files: Array<{ id, filePath, fileName, fileSize, options? }>,
 *   outputFormat?: 'jpg' | 'png' | 'webp' | 'avif' | 'tiff',
 *   userTier: 'free' | 'pro' | 'enterprise' | etc
 * }
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { files, outputFormat = 'jpg', userTier = 'free' } = req.body;
    const session = (req as any).session;

    // Validation
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'files array is required and must not be empty',
      });
    }

    if (files.length > 50) {
      return res.status(400).json({
        error: 'Batch size exceeded',
        message: 'Maximum 50 files per batch',
        maxFiles: 50,
        submittedFiles: files.length,
      });
    }

    // Create batch ID
    const batchId = randomUUID();

    // Create output directory
    const outputDir = path.join(os.tmpdir(), `microjpeg-batch-${batchId}`);

    // Prepare batch job
    const batchJob: SequentialBatchJob = {
      batchId,
      files: files.map((f: any) => ({
        id: f.id || randomUUID(),
        filePath: f.filePath,
        fileName: f.fileName,
        fileSize: f.fileSize,
        options: f.options || {
          quality: 80,
          format: outputFormat,
        },
      })),
      sessionId: session?.id || 'anonymous',
      userId: session?.userId,
      userTier,
      outputFormat,
      outputDirPath: outputDir,
      totalFiles: files.length,
    };

    console.log(`📋 Batch Job Created - ID: ${batchId}`);
    console.log(`   Total Files: ${files.length}`);
    console.log(`   Output Format: ${outputFormat}`);
    console.log(`   User Tier: ${userTier}`);

    // Submit to queue with priority based on user tier
    const priority = getPriorityForTier(userTier);

    const job = await sequentialBatchQueue.add(batchJob, {
      priority,
      jobId: batchId,
      attempts: 1, // No retries for batch jobs - fail safely
      removeOnComplete: 24 * 60 * 60 * 1000, // Remove after 24 hours
    });

    console.log(`✅ Job added to queue - Job ID: ${job.id}`);

    res.json({
      success: true,
      batchId,
      jobId: job.id,
      totalFiles: files.length,
      outputFormat,
      statusUrl: `/api/sequential-batch/status/${batchId}`,
      message: 'Batch job submitted for sequential processing',
    });
  } catch (error: any) {
    console.error('❌ Failed to submit batch job:', error);
    res.status(500).json({
      error: 'Failed to submit batch job',
      message: error.message,
    });
  }
});

/**
 * GET /api/sequential-batch/status/:batchId
 * Get current processing status of a batch
 */
router.get('/status/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    // Get progress from in-memory store
    const progress = getBatchProgress(batchId);

    if (!progress) {
      // Try to get from Bull queue
      const job = await sequentialBatchQueue.getJob(batchId);

      if (!job) {
        return res.status(404).json({
          error: 'Batch not found',
          message: `Batch ${batchId} not found or has completed`,
        });
      }

      // Job exists in queue
      const state = await job.getState();
      const progress_percent = job.progress();

      return res.json({
        batchId,
        status: state,
        progress: progress_percent,
        message: `Batch in ${state} state`,
      });
    }

    // Return detailed progress
    res.json({
      success: true,
      batchId: progress.batchId,
      status: 'processing',
      progress: {
        current: progress.processedFiles,
        total: progress.totalFiles,
        percentage: progress.progressPercentage,
      },
      currentFile: {
        index: progress.currentFileIndex + 1,
        name: progress.currentFileName,
        total: progress.totalFiles,
      },
      timing: {
        startedAt: new Date(progress.startedAt),
        elapsedSeconds: Math.round((Date.now() - progress.startedAt) / 1000),
        estimatedRemainingSeconds: progress.estimatedTimeRemaining,
      },
      results: {
        successful: progress.results.filter((r) => r.status === 'success').length,
        failed: progress.failedFiles.length,
        pending: progress.totalFiles - progress.processedFiles,
      },
      files: progress.results.map((r) => ({
        id: r.fileId,
        name: r.fileName,
        status: r.status,
        size:
          r.originalSize && r.compressedSize
            ? {
                original: r.originalSize,
                compressed: r.compressedSize,
                reduction: r.compressionRatio ? `${r.compressionRatio.toFixed(1)}%` : null,
              }
            : null,
        processingTime: r.processingTime ? `${r.processingTime}s` : null,
        downloadUrl: r.downloadUrl,
        error: r.error,
      })),
    });
  } catch (error: any) {
    console.error('❌ Failed to get batch status:', error);
    res.status(500).json({
      error: 'Failed to get batch status',
      message: error.message,
    });
  }
});

/**
 * POST /api/sequential-batch/cancel/:batchId
 * Cancel a batch operation
 */
router.post('/cancel/:batchId', async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    // Try to cancel in queue
    const job = await sequentialBatchQueue.getJob(batchId);

    if (job) {
      const state = await job.getState();

      if (state === 'active') {
        // Mark for cancellation (job will check this)
        await job.update({
          ...job.data,
          _cancelRequested: true,
        });
      }

      // Remove from queue
      await job.remove();
    }

    // Cancel in progress tracker
    await cancelBatchProcessing(batchId);

    res.json({
      success: true,
      message: `Batch ${batchId} cancelled`,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Batch not found',
        message: `Batch ${batchId} not found`,
      });
    }

    console.error('❌ Failed to cancel batch:', error);
    res.status(500).json({
      error: 'Failed to cancel batch',
      message: error.message,
    });
  }
});

/**
 * GET /api/sequential-batch/queue-stats
 * Get overall queue statistics
 */
router.get('/queue-stats', async (req: Request, res: Response) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      sequentialBatchQueue.getWaitingCount(),
      sequentialBatchQueue.getActiveCount(),
      sequentialBatchQueue.getCompletedCount(),
      sequentialBatchQueue.getFailedCount(),
    ]);

    res.json({
      success: true,
      queue: {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
      },
      message: 'Sequential batch queue statistics',
    });
  } catch (error: any) {
    console.error('❌ Failed to get queue stats:', error);
    res.status(500).json({
      error: 'Failed to get queue statistics',
      message: error.message,
    });
  }
});

/**
 * Helper function to get priority based on user tier
 */
function getPriorityForTier(tier: string): number {
  const priorities: Record<string, number> = {
    enterprise: 1,
    premium: 2,
    pro: 2,
    test_premium: 3,
    free: 10,
    anonymous: 15,
  };

  return priorities[tier.toLowerCase()] || 10;
}

export default router;
