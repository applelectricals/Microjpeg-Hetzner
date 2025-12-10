// Add these routes to server/routes.ts
// AI Image Enhancement API Endpoints

import { enhanceImage, getEnhancementCost, calculateOutputDimensions } from './services/imageEnhancer';

// ============================================================================
// AI IMAGE ENHANCEMENT ROUTES
// Add these inside registerRoutes() function
// ============================================================================

// Get enhancement pricing info
app.get('/api/ai/enhance-pricing', (req, res) => {
  res.json({
    imageEnhancement: getEnhancementCost(),
    scales: {
      '2x': 'Double resolution - Fast',
      '4x': 'Quadruple resolution - Recommended',
      '8x': '8x resolution - Best quality (slower)',
    },
    note: 'Costs are approximate and may vary based on image size',
  });
});

// Calculate output dimensions preview
app.post('/api/ai/enhance-preview', express.json(), (req, res) => {
  const { width, height, scale } = req.body;
  
  if (!width || !height || !scale) {
    return res.status(400).json({ error: 'Missing width, height, or scale' });
  }
  
  const validScales = [2, 4, 8];
  if (!validScales.includes(scale)) {
    return res.status(400).json({ error: 'Scale must be 2, 4, or 8' });
  }
  
  const result = calculateOutputDimensions(width, height, scale as 2 | 4 | 8);
  res.json(result);
});

// Image enhancement endpoint
app.post('/api/enhance-image', 
  checkConcurrentSessions, 
  upload.single('file'), 
  async (req, res) => {
    console.log('=== IMAGE ENHANCEMENT REQUEST ===');
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse options from request
      const scale = parseInt(req.body.scale) || 4;
      const validScales = [2, 4, 8];
      
      if (!validScales.includes(scale)) {
        return res.status(400).json({ error: 'Scale must be 2, 4, or 8' });
      }

      const options = {
        scale: scale as 2 | 4 | 8,
        faceEnhance: req.body.faceEnhance === 'true',
        outputFormat: (req.body.outputFormat || 'png') as 'png' | 'webp' | 'avif' | 'jpg',
        outputQuality: parseInt(req.body.quality) || 90,
      };

      console.log(`📁 File: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`⚙️ Options:`, options);

      // File size limit check (10MB for enhancement)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File too large', 
          message: 'Maximum file size for enhancement is 10MB' 
        });
      }

      // Process image enhancement
      const result = await enhanceImage(
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
          originalDimensions: result.originalDimensions,
          newDimensions: result.newDimensions,
          format: result.format,
          scale: result.scale,
          processingTime: result.processingTime,
          downloadUrl: `/api/download/${jobId}`,
        },
      });

      // Cleanup original upload
      await fs.unlink(file.path).catch(() => {});

    } catch (error: any) {
      console.error('❌ Image enhancement error:', error);
      res.status(500).json({ error: error.message || 'Image enhancement failed' });
    }
  }
);

// Batch image enhancement
app.post('/api/enhance-image/batch',
  checkConcurrentSessions,
  upload.array('files', 5), // Max 5 files at once for enhancement
  async (req, res) => {
    console.log('=== BATCH IMAGE ENHANCEMENT ===');
    
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const scale = parseInt(req.body.scale) || 4;
      const validScales = [2, 4, 8];
      
      if (!validScales.includes(scale)) {
        return res.status(400).json({ error: 'Scale must be 2, 4, or 8' });
      }

      const options = {
        scale: scale as 2 | 4 | 8,
        faceEnhance: req.body.faceEnhance === 'true',
        outputFormat: (req.body.outputFormat || 'png') as 'png' | 'webp' | 'avif' | 'jpg',
        outputQuality: parseInt(req.body.quality) || 90,
      };

      console.log(`📁 Processing ${files.length} files...`);
      console.log(`⚙️ Options:`, options);

      const results = [];

      // Process files sequentially (enhancement is resource-intensive)
      for (const file of files) {
        try {
          const result = await enhanceImage(file.path, 'compressed', options);
          
          if (result.success) {
            const jobId = path.basename(result.outputPath!, path.extname(result.outputPath!));
            results.push({
              success: true,
              originalName: file.originalname,
              originalSize: result.originalSize,
              processedSize: result.processedSize,
              originalDimensions: result.originalDimensions,
              newDimensions: result.newDimensions,
              format: result.format,
              scale: result.scale,
              processingTime: result.processingTime,
              downloadUrl: `/api/download/${jobId}`,
            });
          } else {
            results.push({
              success: false,
              originalName: file.originalname,
              error: result.error,
            });
          }
        } catch (err: any) {
          results.push({
            success: false,
            originalName: file.originalname,
            error: err.message,
          });
        } finally {
          // Cleanup
          await fs.unlink(file.path).catch(() => {});
        }
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
      console.error('❌ Batch enhancement error:', error);
      res.status(500).json({ error: error.message || 'Batch processing failed' });
    }
  }
);
