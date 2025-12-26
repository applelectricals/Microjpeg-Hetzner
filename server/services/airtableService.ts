import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { CompressionEngine } from '../compressionEngine';
import { r2Service, R2_FOLDERS } from '../r2Service';

export interface AirtableCompressionResult {
    success: boolean;
    originalSize: number;
    compressedSize: number;
    ratio: number;
    cdnUrl?: string;
    error?: string;
}

export class AirtableService {
    /**
     * Compress an image from a URL and upload to R2
     */
    async compressFromUrl(url: string, quality: number = 75): Promise<AirtableCompressionResult> {
        const jobId = crypto.randomBytes(16).toString('hex');
        const tempDir = path.join(process.cwd(), 'temp', 'airtable');
        const inputPath = path.join(tempDir, `${jobId}_input`);
        const outputPath = path.join(tempDir, `${jobId}_output.jpg`);

        try {
            // Ensure temp directory exists
            await fs.mkdir(tempDir, { recursive: true });

            // 1. Download the image
            console.log(`📥 Downloading image from URL for Airtable: ${url}`);
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'arraybuffer',
                timeout: 30000, // 30s timeout
            });

            await fs.writeFile(inputPath, response.data);
            const originalStats = await fs.stat(inputPath);
            console.log(`✅ Downloaded: ${originalStats.size} bytes`);

            // 2. Compress the image
            console.log(`🗜️ Compressing image with quality: ${quality}`);
            const compressionResult = await CompressionEngine.compressWithAdvancedSettings(
                inputPath,
                outputPath,
                quality,
                'jpeg', // Default to JPEG for Airtable compatibility
                { webOptimized: true }
            );

            // 3. Upload to R2
            console.log(`📤 Uploading to R2...`);
            const r2Result = await r2Service.uploadFile(outputPath, `airtable_${jobId}.jpg`, {
                folder: R2_FOLDERS.COMPRESSED,
                contentType: 'image/jpeg',
            });

            const ratio = Math.round(((originalStats.size - compressionResult.finalSize) / originalStats.size) * 100);

            return {
                success: true,
                originalSize: originalStats.size,
                compressedSize: compressionResult.finalSize,
                ratio,
                cdnUrl: r2Result.cdnUrl,
            };

        } catch (error: any) {
            console.error('❌ Airtable compression failed:', error);
            return {
                success: false,
                originalSize: 0,
                compressedSize: 0,
                ratio: 0,
                error: error.message || 'Compression failed',
            };
        } finally {
            // Cleanup temp files
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });
        }
    }
}

export const airtableService = new AirtableService();
