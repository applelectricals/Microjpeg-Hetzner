// server/index.ts - FIXED VERSION
import 'dotenv/config';

import userTierRoutes from './routes/user-tier-routes';
import userRoutes from './routes/userRoutes';
import sequentialBatchRoutes from './sequentialBatchRoutes';
import express, { type Request, Response, NextFunction } from "express";
import path from 'path';
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { safeServeStatic } from "./safe-static";
import { TestPremiumExpiryManager } from "./testPremiumExpiry";
import { initializeQueueService, shutdownQueueService } from "./queueService";
import { seedSuperuser } from "./superuser";
import paymentRouter from './paymentRoutes';
import paypalPaymentRoutes from './routes/paypalPaymentRoutes';
import instamojoRoutes from './routes/instamojoRoutes';
//import wordpressApiRoutes from './wordpressApiRoutes';
import wordpressRoutes from './wordpressRoutes';
import { botDetectionMiddleware, seoDebugEndpoint } from './middleware/bot-detector.js';

// Global error handlers
process.on('unhandledRejection', (error: any) => {
  console.error('⚠️  Unhandled rejection (non-fatal):', error?.message || error);
});

process.on('uncaughtException', (error: any) => {
  console.error('⚠️  Uncaught exception (non-fatal):', error?.message || error);
});

console.log('🛡️  Global error handlers installed');

const app = express();

app.set('etag', false);

// ============================================================================
// CRITICAL FIX: Body parsers MUST come BEFORE routes
// ============================================================================
// Parse JSON bodies (exclude multipart for file uploads)
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next(); // Skip body parsing for multipart - let multer handle it
  }
  express.json({ limit: '200mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next(); // Skip body parsing for multipart - let multer handle it
  }
  express.urlencoded({ extended: true, limit: '200mb' })(req, res, next);
});

// Timeout settings
app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// ============================================================================
// NOW mount routes (AFTER body parsers)
// ============================================================================
// Note: paymentRouter routes are defined as /payment/razorpay/...
// So we mount at /api (not /api/payment) to avoid /api/payment/payment/...
app.use('/api', wordpressRoutes);
app.use('/api', instamojoRoutes);
app.use('/api', paypalPaymentRoutes);
app.use('/api', paymentRouter);  // Routes will be /api/payment/razorpay/...
//app.use('/api', wordpressApiRoutes);  // WordPress plugin API routes

// Security headers + request logging
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const queueInitialized = await initializeQueueService();
    if (!queueInitialized) {
      console.warn('⚠️  Queue service failed to initialize');
    }
  } catch (error) {
    console.error('❌ Queue service initialization error:', error);
  }

  try {
    await seedSuperuser();
    console.log('✅ Superuser seeded successfully');
  } catch (error: any) {
    console.error('❌ Failed to seed superuser (non-fatal):', error.message);
  }

  // 301 redirects
  app.use((req, res, next) => {
    const normalizedPath = req.path.endsWith('/') && req.path !== '/' ? req.path.slice(0, -1) : req.path;
    
    const redirectMap: Record<string, string> = {
      '/compress-premium': '/premium', 
      '/compress-enterprise': '/enterprise',
      '/wordpress/details': '/wordpress-plugin',
      '/wordpress/installation': '/wordpress-plugin/install',
      '/wordpress-installation': '/wordpress-plugin/install',
      '/wordpress/development': '/wordpress-plugin/development',
      '/wordpress-development': '/wordpress-plugin/development',
      '/wordpress-image-plugin': '/wordpress-plugin',
      '/web/overview': '/tools',
      '/web/compress': '/tools',
      '/web/convert': '/tools',
      '/compress-raw-files': '/tools',
      '/bulk-image-compression': '/tools',
      '/terms-of-service': '/legal/terms',
      '/privacy-policy': '/legal/privacy',
      '/cookie-policy': '/legal/cookies',
      '/cancellation-policy': '/legal/cancellation',
      '/payment-protection': '/legal/payment-protection'
    };

    const redirectTo = redirectMap[normalizedPath];
    if (redirectTo) {
      const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      return res.redirect(301, redirectTo + queryString);
    }
    
    next();
  });

  const server = await registerRoutes(app);

  app.use('/api/user', userTierRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/sequential-batch', sequentialBatchRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Debug endpoint
  app.get('/__seo-debug', seoDebugEndpoint);

   // TEMPORARILY DISABLE BOT DETECTOR DURING SEO GENERATION
   const isSeoGenerationMode = process.env.NODE_ENV === 'development' && process.env.PORT === '10000';
   if (!isSeoGenerationMode) {
     app.use(botDetectionMiddleware);
   } else {
     console.log('⚠️  Bot detector DISABLED - SEO generation mode (PORT=10000)');
   }

  // Static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    safeServeStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  server.listen({
    port,
    host: "0.0.0.0",
    ...(isDevelopment ? {} : { reusePort: true }),
  }, () => {
    log(`serving on port ${port}`);
    console.log('✅ Razorpay endpoint: /api/payment/razorpay/create-order');
    console.log('⏭️  Skipping test-premium expiry checker');
  });

  process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    await shutdownQueueService();
    server.close(() => {
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('🔄 Received SIGINT, shutting down gracefully...');
    await shutdownQueueService();
    server.close(() => {
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    });
  });
})();
