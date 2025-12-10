// Add these routes to server/routes.ts
// Background Removal API Endpoints

import { removeBackground, checkReplicateHealth, getEstimatedCost } from './services/replicateAI';

// ============================================================================
// AI BACKGROUND REMOVAL ROUTES
// Add these inside registerRoutes() function
// ============================================================================

// Health check for Replicate AI
app.get('/api/ai/health', async (req, res) => {
  try {
    const health = await checkReplicateHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ healthy: false, error: error.message });
  }
});

// Get pricing info
app.get('/api/ai/pricing', (req, res) => {
  res.json({
    backgroundRemoval: {
      standard: getEstimatedCost('standard'),
      enhanced: getEstimatedCost('enhanced'),
    },
    note: 'Costs are approximate and may vary based on image size',
  });
});

// Background removal endpoint
app.post('/api/remove-background', 
  checkConcurrentSessions, 
  upload.single('file'), 
  async (req, res) => {
    console.log('=== BACKGROUND REMOVAL REQUEST ===');
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse options from request
      const options = {
        model: (req.body.model || 'standard') as 'standard' | 'enhanced',
        outputFormat: (req.body.outputFormat || 'png') as 'png' | 'webp' | 'avif',
        outputQuality: parseInt(req.body.quality) || 90,
      };

      console.log(`📁 File: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`⚙️ Options:`, options);

      // Check user tier for access (premium feature)
      const user = req.user;
      const session = req.session as any;
      
      // For now, allow all users (you can restrict to paid tiers later)
      // if (!user || !user.isPremium) {
      //   return res.status(403).json({ 
      //     error: 'Premium feature', 
      //     message: 'Background removal requires a paid subscription' 
      //   });
      // }

      // Process background removal
      const result = await removeBackground(
        file.path,
        'compressed', // Output directory
        options
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      // Generate job ID for download
      const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));

      // Return result
      res.json({
        success: true,
        result: {
          id: jobId,
          originalName: file.originalname,
          originalSize: result.originalSize,
          processedSize: result.processedSize,
          format: result.format,
          processingTime: result.processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
      });

      // Cleanup original upload
      await fs.unlink(file.path).catch(() => {});

    } catch (error: any) {
      console.error('❌ Background removal error:', error);
      res.status(500).json({ error: error.message || 'Background removal failed' });
    }
  }
);

// Batch background removal
app.post('/api/remove-background/batch',
  checkConcurrentSessions,
  upload.array('files', 10), // Max 10 files at once
  async (req, res) => {
    console.log('=== BATCH BACKGROUND REMOVAL ===');
    
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const options = {
        model: (req.body.model || 'standard') as 'standard' | 'enhanced',
        outputFormat: (req.body.outputFormat || 'png') as 'png' | 'webp' | 'avif',
        outputQuality: parseInt(req.body.quality) || 90,
      };

      console.log(`📁 Processing ${files.length} files...`);
      console.log(`⚙️ Options:`, options);

      const results = [];
      const errors = [];

      // Process files in parallel (max 3 concurrent)
      const batchSize = 3;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              const result = await removeBackground(file.path, 'compressed', options);
              
              if (result.success) {
                const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
                return {
                  success: true,
                  originalName: file.originalname,
                  originalSize: result.originalSize,
                  processedSize: result.processedSize,
                  format: result.format,
                  processingTime: result.processingTime,
                  downloadUrl: `/api/download/${jobId}`,
                };
              } else {
                return {
                  success: false,
                  originalName: file.originalname,
                  error: result.error,
                };
              }
            } catch (err: any) {
              return {
                success: false,
                originalName: file.originalname,
                error: err.message,
              };
            } finally {
              // Cleanup
              await fs.unlink(file.path).catch(() => {});
            }
          })
        );
        
        results.push(...batchResults);
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.json({
        success: true,
        totalProcessed: files.length,
        successful: successful.length,
        failed: failed.length,
        results,
      });

    } catch (error: any) {
      console.error('❌ Batch background removal error:', error);
      res.status(500).json({ error: error.message || 'Batch processing failed' });
    }
  }
);
