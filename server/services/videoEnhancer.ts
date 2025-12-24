// server/services/videoEnhancer.ts
// AI Video Enhancement/Upscaling Service using Replicate API

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Real-ESRGAN Video model
// Correct model for video upscaling: lucataco/real-esrgan-video
const VIDEO_ENHANCE_MODEL = 'lucataco/real-esrgan-video:614a9388df675f0a28965f3d53a948283626154625bcccab8a5209c1584c3bc3';

export interface EnhanceVideoOptions {
    upscale?: 2 | 4;
    faceEnhance?: boolean;
}

export interface EnhanceVideoResult {
    success: boolean;
    outputPath?: string;
    originalSize?: number;
    processedSize?: number;
    format?: string;
    error?: string;
    processingTime?: number;
}

/**
 * Enhance/Upscale a video using AI
 */
export async function enhanceVideo(
    inputPath: string,
    outputDir: string,
    options: EnhanceVideoOptions = {}
): Promise<EnhanceVideoResult> {
    const startTime = Date.now();

    const {
        upscale = 2,
        faceEnhance = false,
    } = options;

    try {
        // Validate input file exists
        const inputStats = await fs.stat(inputPath);
        if (!inputStats.isFile()) {
            throw new Error('Input file not found');
        }

        console.log(`🎬 Starting video enhancement...`);
        console.log(`📁 Input: ${inputPath} (${(inputStats.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`📐 Upscale: ${upscale}x | Face enhance: ${faceEnhance}`);

        // Call Replicate API
        // Note: Video processing can take several minutes. Replicate handles this async.
        // For simplicity in this demo, we wait for completion. In production, consider a webhook/polling architecture.
        const output = await replicate.run(VIDEO_ENHANCE_MODEL, {
            input: {
                video: await fs.readFile(inputPath),
                upscale: upscale,
                face_enhance: faceEnhance,
            },
        });

        if (!output || typeof output !== 'string') {
            throw new Error('Unexpected output from Replicate API');
        }

        console.log(`📥 Downloaded result URL: ${output}`);

        // Download the result
        const response = await fetch(output);
        if (!response.ok) {
            throw new Error(`Failed to download result: ${response.status}`);
        }
        const resultBuffer = Buffer.from(await response.arrayBuffer());

        // Generate output filename
        const jobId = `video_enhance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const outputFilename = `${jobId}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Save output
        await fs.writeFile(outputPath, resultBuffer);

        const outputStats = await fs.stat(outputPath);
        const processingTime = Date.now() - startTime;

        console.log(`✅ Video enhanced successfully!`);
        console.log(`📁 Output: ${outputPath} (${(outputStats.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`⏱️ Processing time: ${processingTime}ms`);

        return {
            success: true,
            outputPath,
            originalSize: inputStats.size,
            processedSize: outputStats.size,
            format: 'MP4',
            processingTime,
        };

    } catch (error: any) {
        console.error('❌ Video enhancement failed:', error.message);
        return {
            success: false,
            error: error.message || 'Unknown error',
            processingTime: Date.now() - startTime,
        };
    }
}
