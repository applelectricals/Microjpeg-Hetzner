// server/conversionMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { getUnifiedPlan } from './unifiedPlanConfig';
import { DualUsageTracker, type AuditContext } from './services/DualUsageTracker';
import { hasSuperuserBypass } from './superuser';
// Removed PageIdentifierOperationCounter - using DualUsageTracker only

// Define page types and their configurations
export const PAGE_CONFIGS = {
  // Universal Format Pages (auto-convert to JPG)
  '/': {
    type: 'universal',
    requiresAuth: false,
    requiresPayment: false,
    planName: 'free',
    autoOutput: 'jpg',
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      monthlyLimit: 500,
      dailyLimit: 25,
      hourlyLimit: 5,
      concurrent: 1
    },
    allowedOutputs: ['jpg', 'png', 'webp', 'avif', 'tiff']
  },
  '/compress-free': {
    type: 'universal',
    requiresAuth: true,
    requiresPayment: false,
    planName: 'free-authenticated',
    autoOutput: 'jpg',
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      monthlyLimit: 500,
      dailyLimit: 25,
      hourlyLimit: 5,
      concurrent: 1
    },
    allowedOutputs: ['jpg', 'png', 'webp', 'avif']
  },
  '/test-premium': {
    type: 'universal',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 1,
    planName: 'test-premium',
    autoOutput: 'jpg',
    limits: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      dailyLimit: 300, // 300 operations for 1 day only
      hourlyLimit: 20,
      concurrent: 3
    },
    allowedOutputs: ['jpg', 'png', 'webp', 'avif']
  },
  '/compress-premium': {
    type: 'universal',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 29,
    planName: 'premium',
    autoOutput: 'jpg',
    limits: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      monthlyLimit: 10000,
      hourlyLimit: 100,
      concurrent: 3
    },
    allowedOutputs: ['jpg', 'png', 'webp', 'avif']
  },
  '/compress-enterprise': {
    type: 'universal',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 99,
    planName: 'enterprise',
    autoOutput: 'jpg',
    limits: {
      maxFileSize: 200 * 1024 * 1024, // 200MB
      monthlyLimit: 50000,
      concurrent: 5
    },
    allowedOutputs: ['jpg', 'png', 'webp', 'avif']
  }
} as const;

// Define all valid conversion routes (78 single conversion pages)
export const CONVERSION_MATRIX = {
  // JPG outputs
  'avif-to-jpg': { input: 'avif', output: 'jpg', type: 'convert' },
  'jpg-to-jpg': { input: 'jpg', output: 'jpg', type: 'compress' },
  'png-to-jpg': { input: 'png', output: 'jpg', type: 'convert' },
  'arw-to-jpg': { input: 'arw', output: 'jpg', type: 'convert' },
  'cr2-to-jpg': { input: 'cr2', output: 'jpg', type: 'convert' },
  'crw-to-jpg': { input: 'crw', output: 'jpg', type: 'convert' },
  'dng-to-jpg': { input: 'dng', output: 'jpg', type: 'convert' },
  'nef-to-jpg': { input: 'nef', output: 'jpg', type: 'convert' },
  'orf-to-jpg': { input: 'orf', output: 'jpg', type: 'convert' },
  'raf-to-jpg': { input: 'raf', output: 'jpg', type: 'convert' },
  'tiff-to-jpg': { input: 'tiff', output: 'jpg', type: 'convert' },
  'svg-to-jpg': { input: 'svg', output: 'jpg', type: 'convert' },
  'webp-to-jpg': { input: 'webp', output: 'jpg', type: 'convert' },

  // PNG outputs
  'avif-to-png': { input: 'avif', output: 'png', type: 'convert' },
  'jpg-to-png': { input: 'jpg', output: 'png', type: 'convert' },
  'png-to-png': { input: 'png', output: 'png', type: 'compress' },
  'arw-to-png': { input: 'arw', output: 'png', type: 'convert' },
  'cr2-to-png': { input: 'cr2', output: 'png', type: 'convert' },
  'crw-to-png': { input: 'crw', output: 'png', type: 'convert' },
  'dng-to-png': { input: 'dng', output: 'png', type: 'convert' },
  'nef-to-png': { input: 'nef', output: 'png', type: 'convert' },
  'orf-to-png': { input: 'orf', output: 'png', type: 'convert' },
  'raf-to-png': { input: 'raf', output: 'png', type: 'convert' },
  'tiff-to-png': { input: 'tiff', output: 'png', type: 'convert' },
  'svg-to-png': { input: 'svg', output: 'png', type: 'convert' },
  'webp-to-png': { input: 'webp', output: 'png', type: 'convert' },

  // TIFF outputs
  'avif-to-tiff': { input: 'avif', output: 'tiff', type: 'convert' },
  'jpg-to-tiff': { input: 'jpg', output: 'tiff', type: 'convert' },
  'png-to-tiff': { input: 'png', output: 'tiff', type: 'convert' },
  'arw-to-tiff': { input: 'arw', output: 'tiff', type: 'convert' },
  'cr2-to-tiff': { input: 'cr2', output: 'tiff', type: 'convert' },
  'crw-to-tiff': { input: 'crw', output: 'tiff', type: 'convert' },
  'dng-to-tiff': { input: 'dng', output: 'tiff', type: 'convert' },
  'nef-to-tiff': { input: 'nef', output: 'tiff', type: 'convert' },
  'orf-to-tiff': { input: 'orf', output: 'tiff', type: 'convert' },
  'raf-to-tiff': { input: 'raf', output: 'tiff', type: 'convert' },
  'tiff-to-tiff': { input: 'tiff', output: 'tiff', type: 'compress' },
  'svg-to-tiff': { input: 'svg', output: 'tiff', type: 'convert' },
  'webp-to-tiff': { input: 'webp', output: 'tiff', type: 'convert' },

  // WebP outputs
  'avif-to-webp': { input: 'avif', output: 'webp', type: 'convert' },
  'jpg-to-webp': { input: 'jpg', output: 'webp', type: 'convert' },
  'png-to-webp': { input: 'png', output: 'webp', type: 'convert' },
  'arw-to-webp': { input: 'arw', output: 'webp', type: 'convert' },
  'cr2-to-webp': { input: 'cr2', output: 'webp', type: 'convert' },
  'crw-to-webp': { input: 'crw', output: 'webp', type: 'convert' },
  'dng-to-webp': { input: 'dng', output: 'webp', type: 'convert' },
  'nef-to-webp': { input: 'nef', output: 'webp', type: 'convert' },
  'orf-to-webp': { input: 'orf', output: 'webp', type: 'convert' },
  'raf-to-webp': { input: 'raf', output: 'webp', type: 'convert' },
  'tiff-to-webp': { input: 'tiff', output: 'webp', type: 'convert' },
  'svg-to-webp': { input: 'svg', output: 'webp', type: 'convert' },
  'webp-to-webp': { input: 'webp', output: 'webp', type: 'compress' },

  // AVIF outputs
  'avif-to-avif': { input: 'avif', output: 'avif', type: 'compress' },
  'jpg-to-avif': { input: 'jpg', output: 'avif', type: 'convert' },
  'png-to-avif': { input: 'png', output: 'avif', type: 'convert' },
  'arw-to-avif': { input: 'arw', output: 'avif', type: 'convert' },
  'cr2-to-avif': { input: 'cr2', output: 'avif', type: 'convert' },
  'crw-to-avif': { input: 'crw', output: 'avif', type: 'convert' },
  'dng-to-avif': { input: 'dng', output: 'avif', type: 'convert' },
  'nef-to-avif': { input: 'nef', output: 'avif', type: 'convert' },
  'orf-to-avif': { input: 'orf', output: 'avif', type: 'convert' },
  'raf-to-avif': { input: 'raf', output: 'avif', type: 'convert' },
  'tiff-to-avif': { input: 'tiff', output: 'avif', type: 'convert' },
  'svg-to-avif': { input: 'svg', output: 'avif', type: 'convert' },
  'webp-to-avif': { input: 'webp', output: 'avif', type: 'convert' },

  // SVG outputs
  'avif-to-svg': { input: 'avif', output: 'svg', type: 'convert' },
  'jpg-to-svg': { input: 'jpg', output: 'svg', type: 'convert' },
  'png-to-svg': { input: 'png', output: 'svg', type: 'convert' },
  'arw-to-svg': { input: 'arw', output: 'svg', type: 'convert' },
  'cr2-to-svg': { input: 'cr2', output: 'svg', type: 'convert' },
  'crw-to-svg': { input: 'crw', output: 'svg', type: 'convert' },
  'dng-to-svg': { input: 'dng', output: 'svg', type: 'convert' },
  'nef-to-svg': { input: 'nef', output: 'svg', type: 'convert' },
  'orf-to-svg': { input: 'orf', output: 'svg', type: 'convert' },
  'raf-to-svg': { input: 'raf', output: 'svg', type: 'convert' },
  'tiff-to-svg': { input: 'tiff', output: 'svg', type: 'convert' },
  'svg-to-svg': { input: 'svg', output: 'svg', type: 'compress' },
  'webp-to-svg': { input: 'webp', output: 'svg', type: 'convert' }
} as const;

// Type definitions
export type ConversionRoute = keyof typeof CONVERSION_MATRIX;
export type FileFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'svg' | 
                        'cr2' | 'cr3' | 'arw' | 'crw' | 'dng' | 'nef' | 'orf' | 'raf' | 'rw2';

// Format classifications
export const FORMAT_TYPES = {
  RAW: ['arw', 'cr2', 'cr3', 'crw', 'dng', 'nef', 'orf', 'raf', 'rw2'],
  REGULAR: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'svg'],
  LOSSLESS: ['png', 'tiff', 'svg'],
  LOSSY: ['jpg', 'jpeg', 'webp', 'avif']
};

// MIME type mapping
export const MIME_TYPES: Record<string, string[]> = {
  'jpg': ['image/jpeg', 'image/jpg'],
  'jpeg': ['image/jpeg', 'image/jpg'],
  'png': ['image/png'],
  'webp': ['image/webp'],
  'avif': ['image/avif'],
  'tiff': ['image/tiff', 'image/tif'],
  'svg': ['image/svg+xml'],
  'cr2': ['image/x-canon-cr2', 'image/cr2', 'application/octet-stream'],
  'cr3': ['image/x-canon-cr3', 'image/cr3', 'application/octet-stream'],
  'arw': ['image/x-sony-arw', 'image/arw', 'application/octet-stream'],
  'crw': ['image/x-canon-crw', 'image/crw', 'application/octet-stream'],
  'dng': ['image/x-adobe-dng', 'image/dng', 'application/octet-stream'],
  'nef': ['image/x-nikon-nef', 'image/nef', 'application/octet-stream'],
  'orf': ['image/x-olympus-orf', 'image/orf', 'application/octet-stream'],
  'raf': ['image/x-fuji-raf', 'image/raf', 'application/octet-stream'],
  'rw2': ['image/x-panasonic-rw2', 'image/rw2', 'application/octet-stream']
};

// Limits for 78 single conversion pages (same for all users)
export const SINGLE_CONVERSION_LIMITS = {
  RAW: {
    maxFileSize: 25 * 1024 * 1024, // 25MB for RAW files
    monthlyLimit: 100,
    dailyLimit: 10,
    hourlyLimit: 5,
    concurrent: 1
  },
  REGULAR: {
    maxFileSize: 10 * 1024 * 1024, // 10MB for regular files
    monthlyLimit: 500,
    dailyLimit: 25,
    hourlyLimit: 5,
    concurrent: 1
  }
};

// Extended request interface
interface ConversionRequest extends Request {
  conversionRoute?: ConversionRoute;
  conversionConfig?: typeof CONVERSION_MATRIX[ConversionRoute];
  pageConfig?: typeof PAGE_CONFIGS[keyof typeof PAGE_CONFIGS];
  pageIdentifier?: string;
  formatType?: 'RAW' | 'REGULAR';
  isUniversalFormatPage?: boolean;
  autoOutputFormat?: string;
  allowedOutputFormats?: string[];
}

/**
 * Authentication and payment gating middleware
 */
export const planGatingMiddleware = async (
  req: ConversionRequest,
  res: Response,
  next: NextFunction
) => {
  const path = req.path;
  const pageConfig = PAGE_CONFIGS[path as keyof typeof PAGE_CONFIGS];

  // If it's not a universal format page, skip this middleware
  if (!pageConfig) {
    return next();
  }

  // Attach page config to request
  req.pageConfig = pageConfig;
  req.isUniversalFormatPage = true;
  req.autoOutputFormat = pageConfig.autoOutput;
  req.allowedOutputFormats = [...pageConfig.allowedOutputs];

  // Check authentication requirement
  if (pageConfig.requiresAuth) {
    const session = req.session as any;
    if (!session?.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access this plan',
        redirectUrl: '/auth/signin'
      });
    }
  }

  // Check payment requirement
  if (pageConfig.requiresPayment) {
    const session = req.session as any;
    const hasValidPayment = await checkPaymentStatus(
      session?.userId!,
      pageConfig.paymentAmount!,
      pageConfig.planName
    );

    if (!hasValidPayment) {
      return res.status(402).json({
        error: 'Payment required',
        message: `Please complete payment of $${pageConfig.paymentAmount} to access this plan`,
        paymentUrl: `/payment/confirm?plan=${pageConfig.planName}&amount=${pageConfig.paymentAmount}`
      });
    }

    // For test-premium, check if 24 hours have passed since payment
    if (pageConfig.planName === 'test-premium') {
      const session = req.session as any;
      const paymentDate = session?.paymentDate;
      if (paymentDate) {
        const hoursSincePayment = (Date.now() - new Date(paymentDate).getTime()) / (1000 * 60 * 60);
        if (hoursSincePayment >= 24) {
          return res.status(403).json({
            error: 'Plan expired',
            message: 'Your test premium plan has expired after 24 hours',
            redirectUrl: '/simple-pricing'
          });
        }
      }
    }

    // For monthly plans, check if subscription is still active
    if (pageConfig.planName === 'premium' || pageConfig.planName === 'enterprise') {
      const session = req.session as any;
      const planExpiry = session?.planExpiry;
      if (planExpiry && new Date(planExpiry) < new Date()) {
        return res.status(403).json({
          error: 'Subscription expired',
          message: 'Your monthly subscription has expired. Please renew to continue.',
          paymentUrl: `/payment/renew?plan=${pageConfig.planName}`
        });
      }
    }
  }

  next();
};

/**
 * Main middleware for handling conversion pages
 */
export const conversionPageMiddleware = async (
  req: ConversionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const path = req.path;

    // Check if it's a universal format page
    if (PAGE_CONFIGS[path as keyof typeof PAGE_CONFIGS]) {
      // Already handled by planGatingMiddleware
      return next();
    }

    // Check if it's one of the 78 conversion pages
    const pathMatch = req.path.match(/^\/(convert|compress)\/([a-z0-9]+-to-[a-z0-9]+)$/);
    
    if (!pathMatch) {
      return next(); // Not a conversion page
    }

    const [, operationType, conversionKey] = pathMatch;
    const route = conversionKey as ConversionRoute;

    // Validate route exists
    if (!CONVERSION_MATRIX[route]) {
      return res.status(404).json({
        error: 'Invalid conversion route',
        message: `Conversion ${route} is not supported`
      });
    }

    const config = CONVERSION_MATRIX[route];
    
    // Attach conversion info to request
    req.conversionRoute = route;
    req.conversionConfig = config;
    req.pageIdentifier = `/${operationType}/${route}`;
    req.formatType = FORMAT_TYPES.RAW.includes(config.input) ? 'RAW' : 'REGULAR';
    req.autoOutputFormat = config.output; // For single conversion pages, auto-convert to the specified output
    req.allowedOutputFormats = [config.output]; // Only one output format allowed

    // Log the conversion request
    console.log(`[ConversionMiddleware] Processing ${req.pageIdentifier} - ${config.type}: ${config.input} -> ${config.output}`);

    next();
  } catch (error) {
    console.error('[ConversionMiddleware] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process conversion request'
    });
  }
};

/**
 * Validation middleware for all conversion operations
 */
export const conversionValidationMiddleware = async (
  req: ConversionRequest,
  res: Response,
  next: NextFunction
) => {
  // Determine limits based on page type
  let limits;
  
  if (req.isUniversalFormatPage && req.pageConfig) {
    // Universal format page - use page-specific limits
    limits = req.pageConfig.limits;
  } else if (req.conversionConfig) {
    // Single conversion page - use standard limits
    const { input } = req.conversionConfig;
    limits = FORMAT_TYPES.RAW.includes(input) ? SINGLE_CONVERSION_LIMITS.RAW : SINGLE_CONVERSION_LIMITS.REGULAR;
  } else {
    return next(); // Not a conversion request
  }

  // Validate files if present
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      // Check file size
      if (file.size > limits.maxFileSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `Maximum file size is ${limits.maxFileSize / (1024 * 1024)}MB`
        });
      }

      // For single conversion pages, check file format matches input
      if (req.conversionConfig && 'originalname' in file) {
        const { input } = req.conversionConfig;
        const fileExt = file.originalname.split('.').pop()?.toLowerCase();
        if (fileExt !== input && !(input === 'jpg' && fileExt === 'jpeg')) {
          return res.status(400).json({
            error: 'Invalid file format',
            message: `This page only accepts ${input.toUpperCase()} files`
          });
        }
      }
    }
  }

  // Check usage limits using enhanced DualUsageTracker with bypass support
  const sessionId = req.sessionID;
  const session = req.session as any;
  const userId = session?.userId;
  const identifier = req.pageIdentifier || req.path;

  try {
    // Determine user type for DualUsageTracker
    let userType = 'anonymous';
    if (userId) {
      // Get user from storage to determine actual subscription tier
      const storage = (global as any).storage; // Access storage from global
      const user = await storage?.getUser(userId);
      userType = user?.subscriptionTier || 'free';
    }

    // Check for superuser bypass
    let auditContext: AuditContext | undefined;
    const isSuperuserBypass = await hasSuperuserBypass(req);
    
    if (isSuperuserBypass) {
      auditContext = {
        adminUserId: userId,
        superBypass: true,
        bypassReason: session.superBypassReason || 'admin_testing',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      console.log(`🔓 Superuser bypass active for ${userId || 'session ' + sessionId}`);
    }

    // Create DualUsageTracker with audit context
    const tracker = new DualUsageTracker(userId, sessionId, userType, auditContext);

    // Check if operation is allowed for each file
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await tracker.canPerformOperation(
          file.originalname || 'unknown.jpg',
          file.size,
          identifier
        );

        if (!result.allowed && !isSuperuserBypass) {
          let retryAfter: number | undefined;
          if (result.reason?.includes('Hourly')) retryAfter = 3600;
          else if (result.reason?.includes('Daily')) retryAfter = 86400;

          return res.status(429).json({
            error: result.reason?.includes('limit') ? 'Usage limit exceeded' : 'Operation not allowed',
            message: result.reason,
            retryAfter,
            upgradeUrl: result.reason?.includes('Monthly') ? '/simple-pricing' : undefined,
            limits: result.limits,
            usage: result.usage
          });
        }
        
        // Log bypass if limits would have been exceeded
        if (!result.allowed && isSuperuserBypass) {
          console.log(`🔓 Superuser bypass: Allowing operation despite limits for ${file.originalname}`);
        }

        // Log bypass if active
        if (result.wasBypassed) {
          console.log(`⚠️ Operation bypassed: ${result.reason} for ${file.originalname}`);
        }
      }
    } else {
      // For requests without files, check with a default filename
      const defaultFilename = req.autoOutputFormat ? `test.${req.autoOutputFormat}` : 'test.jpg';
      const result = await tracker.canPerformOperation(
        defaultFilename,
        1024 * 1024, // 1MB default size
        identifier
      );

      if (!result.allowed && !isSuperuserBypass) {
        let retryAfter: number | undefined;
        if (result.reason?.includes('Hourly')) retryAfter = 3600;
        else if (result.reason?.includes('Daily')) retryAfter = 86400;

        return res.status(429).json({
          error: result.reason?.includes('limit') ? 'Usage limit exceeded' : 'Operation not allowed',
          message: result.reason,
          retryAfter,
          upgradeUrl: result.reason?.includes('Monthly') ? '/simple-pricing' : undefined,
          limits: result.limits,
          usage: result.usage
        });
      }
      
      // Log bypass if limits would have been exceeded
      if (!result.allowed && isSuperuserBypass) {
        console.log(`🔓 Superuser bypass: Allowing operation despite limits for default request`);
      }

      // Log bypass if active
      if (result.wasBypassed) {
        console.log(`⚠️ Operation bypassed: ${result.reason}`);
      }
    }

    // Store tracker in request for use in actual processing
    (req as any).usageTracker = tracker;
    
  } catch (error) {
    console.error('[ConversionValidation] Error checking limits:', error);
    // For superuser bypass, continue anyway - use async version for security
    if (await hasSuperuserBypass(req)) {
      console.log('🔓 Bypass active - ignoring limit check failure');
    } else {
      return res.status(500).json({
        error: 'Usage validation error',
        message: 'Failed to validate operation limits'
      });
    }
  }

  next();
};

/**
 * Helper function to check payment status
 */
async function checkPaymentStatus(
  userId: string,
  requiredAmount: number,
  planName: string
): Promise<boolean> {
  // This should integrate with your PayPal payment verification system
  // For now, returning a placeholder implementation
  
  try {
    // Check database for payment confirmation
    // const payment = await db.query(
    //   'SELECT * FROM payments WHERE user_id = ? AND plan_name = ? AND amount = ? AND status = ?',
    //   [userId, planName, requiredAmount, 'confirmed']
    // );
    
    // return payment && payment.length > 0;
    
    // Placeholder - implement actual payment check
    return true;
  } catch (error) {
    console.error('[PaymentCheck] Error:', error);
    return false;
  }
}

/**
 * SEO metadata generator for conversion pages
 */
export const generateConversionMetadata = (route: ConversionRoute) => {
  const config = CONVERSION_MATRIX[route];
  if (!config) return null;

  const { input, output, type } = config;
  
  // Brand names for RAW formats
  const BRAND_NAMES: Record<string, string> = {
    'cr2': 'Canon',
    'cr3': 'Canon',
    'crw': 'Canon',
    'arw': 'Sony',
    'nef': 'Nikon',
    'dng': 'Adobe',
    'orf': 'Olympus',
    'raf': 'Fujifilm',
    'rw2': 'Panasonic'
  };

  const brand = BRAND_NAMES[input] || '';
  const action = type === 'compress' ? 'Compress' : 'Convert';
  const isRaw = FORMAT_TYPES.RAW.includes(input);
  const limit = isRaw ? '100' : '500';
  
  return {
    title: `${action} ${input.toUpperCase()} to ${output.toUpperCase()} Online - Free ${brand} ${isRaw ? 'RAW ' : ''}Converter | MicroJPEG`,
    description: `${action} ${brand} ${input.toUpperCase()} ${isRaw ? 'RAW ' : ''}files to ${output.toUpperCase()} instantly. Free up to ${limit} conversions/month. Preserve quality, batch process, API access available.`,
    keywords: `${input} to ${output}, ${brand} ${input} converter, image converter, ${action.toLowerCase()} ${input}, MicroJPEG`,
    canonicalUrl: `https://microjpeg.com/${type}/${route}`
  };
};

/**
 * Route registration helper
 */
export const registerConversionRoutes = (app: any) => {
  // Register universal format pages
  Object.keys(PAGE_CONFIGS).forEach(path => {
    console.log(`[ConversionRoutes] Registering universal format page: ${path}`);
    
    app.get(path,
      planGatingMiddleware,
      conversionPageMiddleware,
      (req: Request, res: Response, next: any) => {
        next(); // Let Vite handle the file serving
      }
    );
    
    app.post(`/api${path}`,
      planGatingMiddleware,
      conversionPageMiddleware,
      conversionValidationMiddleware,
      (req: ConversionRequest, res: Response) => {
        res.json({ 
          message: 'Processing conversion',
          autoOutput: req.autoOutputFormat,
          allowedOutputs: req.allowedOutputFormats
        });
      }
    );
  });

  // Register all 78 single conversion routes
  Object.keys(CONVERSION_MATRIX).forEach(route => {
    const config = CONVERSION_MATRIX[route as ConversionRoute];
    const path = `/${config.type}/${route}`;
    
    console.log(`[ConversionRoutes] Registering single conversion page: ${path}`);
    
    app.get(path, 
      conversionPageMiddleware,
      (req: Request, res: Response, next: any) => {
        next(); // Let Vite handle the file serving
      }
    );
    
    app.post(`/api${path}`,
      conversionPageMiddleware,
      conversionValidationMiddleware,
      (req: ConversionRequest, res: Response) => {
        res.json({ 
          message: 'Processing conversion',
          route: path,
          autoOutput: req.autoOutputFormat
        });
      }
    );
  });
};

// Export for use in main server file
export default {
  planGatingMiddleware,
  conversionPageMiddleware,
  conversionValidationMiddleware,
  generateConversionMetadata,
  registerConversionRoutes,
  PAGE_CONFIGS,
  CONVERSION_MATRIX,
  FORMAT_TYPES,
  MIME_TYPES,
  SINGLE_CONVERSION_LIMITS
};