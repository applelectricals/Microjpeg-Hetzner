// ✅ COMPREHENSIVE PAGE-SPECIFIC RULES CONFIGURATION
// This configuration defines all limits and rules for each page identifier
// CRITICAL: Never share counters between pages - each page gets its own usage bucket

export interface PageLimits {
  pageIdentifier: string;
  displayName: string;
  
  // Operation Limits
  monthly: number;
  daily: number;
  hourly: number;
  
  // File Constraints
  maxFileSize: number; // in bytes
  maxConcurrentUploads: number;
  
  // Format Support
  inputFormats: string[];
  outputFormats: string[];
  autoConversionFormat: string;
  
  // Access Control
  requiresAuth: boolean;
  requiresPayment: boolean;
  paymentAmount?: number; // in dollars
  subscriptionDuration?: number; // in days
  
  // Special Rules
  specialRules?: string[];
}

// ✅ COMPLETE PAGE-SPECIFIC RULES IMPLEMENTATION
export const PAGE_RULES: Record<string, PageLimits> = {
  // 1. Free Plan (Without Sign in) - Main Landing Page
  'free-no-auth': {
    pageIdentifier: 'free-no-auth',
    displayName: 'Free Plan (No Sign-in)',
    
    monthly: 500,
    daily: 25,
    hourly: 5,
    
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for returning users'
    ]
  },

  // 2. Free Plan (With Sign in) - /compress-free
  'free-auth': {
    pageIdentifier: 'free-auth',
    displayName: 'Free Plan (With Sign-in)',
    
    monthly: 500,
    daily: 25,
    hourly: 5,
    
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: false,
    
    specialRules: [
      'Authentication required',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for authenticated user'
    ]
  },

  // 3. Test Premium Plan - $1/month - /test-premium  
  'test-1-dollar': {
    pageIdentifier: 'test-1-dollar',
    displayName: 'Test Premium Plan ($1)',
    
    monthly: 300, // Actually 300 operations for 1 day (24 hours)
    daily: 300,
    hourly: 20,
    
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxConcurrentUploads: 3,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 1,
    subscriptionDuration: 1, // 24 hours
    
    specialRules: [
      'Authentication and PayPal payment confirmation ($1) required',
      'Subscription expires after 24 hours',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for authenticated user'
    ]
  },

  // 4. Premium Plan - $29/month - /compress-premium
  'premium-29': {
    pageIdentifier: 'premium-29',
    displayName: 'Premium Plan ($29)',
    
    //monthly: 10000,
    //daily: 334, // Roughly 10000/30 days
    //hourly: 100,
    
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxConcurrentUploads: 3,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 29,
    subscriptionDuration: 30, // 30 days
    
    specialRules: [
      'Authentication and PayPal payment confirmation ($29) required',
      'Subscription renews monthly',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality', 
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for authenticated user'
    ]
  },

  // 5. Enterprise Plan - $99/month - /compress-enterprise
  'enterprise-99': {
    pageIdentifier: 'enterprise-99',
    displayName: 'Enterprise Plan ($99)',
    
    //monthly: 50000,
    //daily: 1667, // Roughly 50000/30 days
    //hourly: 999999, // No rate limits
    
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 99,
    subscriptionDuration: 30, // 30 days
    
    specialRules: [
      'Authentication and PayPal payment confirmation ($99) required',
      'No rate limits (unlimited hourly operations)',
      'Subscription renews monthly',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for authenticated user'
    ]
  },

  // 6. CR2 to JPG (Without Sign In) - /convert/cr2-to-jpg
  'cr2-free': {
    pageIdentifier: 'cr2-free',
    displayName: 'CR2 to JPG Converter (Free)',
    
    monthly: 100,
    daily: 10,
    hourly: 5, // Reasonable hourly limit
    
    maxFileSize: 25 * 1024 * 1024, // 25MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['.cr2'], // Only CR2 files
    outputFormats: ['jpeg'], // Only JPG output
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'CR2 files only',
      'Auto-converts to JPG on upload',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for returning users'
    ]
  },

  // 7. CR2 to PNG (Without Sign In) - /convert/cr2-to-png
  'cr2-to-png': {
    pageIdentifier: 'cr2-to-png',
    displayName: 'CR2 to PNG Converter (Free)',
    
    monthly: 100,
    daily: 10,
    hourly: 5, // Reasonable hourly limit
    
    maxFileSize: 25 * 1024 * 1024, // 25MB for RAW files
    maxConcurrentUploads: 5,
    
    inputFormats: ['.cr2', '.cr3'], // CR2 and CR3 files
    outputFormats: ['png'], // Only PNG output
    autoConversionFormat: 'png',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'CR2 and CR3 files only',
      'Auto-converts to PNG on upload',
      'No file duplicates in output modal',
      'Files persist in output modal until browser refresh/close',
      'Download All as ZIP functionality',
      'Individual file downloads',
      'Session ID constant during session',
      'Usage stats maintained for returning users'
    ]
  },

  // ✅ NEW SEO-FRIENDLY URL STRUCTURE PAGE RULES
  
  // Main compress landing page - /compress (shows all options)
  '/compress': {
    pageIdentifier: '/compress',
    displayName: 'Main Compress Landing',

    
    maxFileSize: 150 * 1024 * 1024, // 150MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'Landing page showing all compression options',
      'Same limits as main landing page'
    ]
  },

  // Free compression - /compress/free
  '/compress/free': {
    pageIdentifier: '/compress/free',
    displayName: 'Free Compression (New URL)',
    
    monthly: 250,
    //daily: 25,
    //hourly: 5,
    
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: false,
    
    specialRules: [
      'Authentication required',
      'SEO-friendly URL structure',
      'Same features as /compress-free'
    ]
  },

  // Pro compression - /compress/pro  
  '/compress/pro': {
    pageIdentifier: '/compress/pro',
    displayName: 'Pro Compression (New URL)',
    
    monthly: 10000,
    //daily: 334,
    //hourly: 100,

    maxFileSize: 150 * 1024 * 1024, // 150MB
    maxConcurrentUploads: 3,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 29,
    subscriptionDuration: 30,
    
    specialRules: [
      'Authentication and payment required',
      'SEO-friendly URL structure',
      'Same features as /compress-premium'
    ]
  },

  // Enterprise compression - /compress/enterprise
  '/compress/enterprise': {
    pageIdentifier: '/compress/enterprise',
    displayName: 'Enterprise Compression (New URL)',
    
    monthly: 50000,
    //daily: 1667,
    //hourly: 999999,
    
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 99,
    subscriptionDuration: 30,
    
    specialRules: [
      'Authentication and payment required',
      'SEO-friendly URL structure', 
      'Same features as /compress-enterprise'
    ]
  },

  // Bulk processing - /compress/bulk
  '/compress/bulk': {
    pageIdentifier: '/compress/bulk',
    displayName: 'Bulk Image Compression (New URL)',
    
    monthly: 500,
    //daily: 25,
    //hourly: 5,
    
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 5,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'SEO-friendly URL structure',
      'Same features as /bulk-image-compression'
    ]
  },

  // RAW processing - /compress/raw
  '/compress/raw': {
    pageIdentifier: '/compress/raw',
    displayName: 'RAW File Compression (New URL)',
    
  
    
    maxFileSize: 25 * 1024 * 1024, // 25MB (larger for RAW files)
    maxConcurrentUploads: 1,
    
    inputFormats: ['.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'SEO-friendly URL structure',
      'Same features as /compress-raw-files',
      'Optimized for RAW file processing'
    ]
  },

  // NEW TIER SYSTEM - Dynamic Compress Page
  
  // Free tier - 200/month, 7MB regular, 15MB RAW, batch 3
  '/compress/free-tier': {
    pageIdentifier: '/compress/free-tier',
    displayName: 'Free Tier',
    
    monthly: 200,
    //daily: 10,
    //hourly: 3,
    
    maxFileSize: 7 * 1024 * 1024, // 7MB for regular files
    maxConcurrentUploads: 3,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'Free tier with 200 operations/month',
      'RAW files limited to 15MB',
      'Regular files limited to 7MB',
      'Batch upload: 3 files max'
    ]
  },

  // Starter Monthly - $9/month, 75MB, batch 10, unlimited
  '/compress/starter-monthly': {
    pageIdentifier: '/compress/starter-monthly',
    displayName: 'Starter Monthly ($9)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 75 * 1024 * 1024, // 75MB
    maxConcurrentUploads: 10,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 9,
    subscriptionDuration: 30,
    
    specialRules: [
      'Unlimited operations',
      '75MB file size limit',
      'Batch upload: 10 files',
      'Authentication and payment required'
    ]
  },

  // Starter Yearly - $49/year, 75MB, batch 10, unlimited
  '/compress/starter-yearly': {
    pageIdentifier: '/compress/starter-yearly',
    displayName: 'Starter Yearly ($49)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 75 * 1024 * 1024, // 75MB
    maxConcurrentUploads: 10,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 49,
    subscriptionDuration: 365,
    
    specialRules: [
      'Unlimited operations',
      '75MB file size limit',
      'Batch upload: 10 files',
      'Authentication and payment required',
      'Yearly billing'
    ]
  },

  // Pro Monthly - $19/month, 150MB, batch 20, unlimited
  '/compress/pro-monthly': {
    pageIdentifier: '/compress/pro-monthly',
    displayName: 'PRO Monthly ($19)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 150 * 1024 * 1024, // 150MB
    maxConcurrentUploads: 20,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 19,
    subscriptionDuration: 30,
    
    specialRules: [
      'Unlimited operations',
      '150MB file size limit',
      'Batch upload: 20 files',
      'Authentication and payment required'
    ]
  },

  // Pro Yearly - $149/year, 150MB, batch 20, unlimited
  '/compress/pro-yearly': {
    pageIdentifier: '/compress/pro-yearly',
    displayName: 'PRO Yearly ($149)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 150 * 1024 * 1024, // 150MB
    maxConcurrentUploads: 20,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 149,
    subscriptionDuration: 365,
    
    specialRules: [
      'Unlimited operations',
      '150MB file size limit',
      'Batch upload: 20 files',
      'Authentication and payment required',
      'Yearly billing'
    ]
  },

  // Business Monthly - $49/month, 200MB, batch 50, unlimited
  '/compress/business-monthly': {
    pageIdentifier: '/compress/business-monthly',
    displayName: 'BUSINESS Monthly ($49)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxConcurrentUploads: 50,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 49,
    subscriptionDuration: 30,
    
    specialRules: [
      'Unlimited operations',
      '200MB file size limit',
      'Batch upload: 50 files',
      'Authentication and payment required'
    ]
  },

  // Business Yearly - $399/year, 200MB, batch 50, unlimited
  '/compress/business-yearly': {
    pageIdentifier: '/compress/business-yearly',
    displayName: 'BUSINESS Yearly ($399)',
    
    monthly: 999999, // Unlimited
    daily: 999999,
    hourly: 999999,
    
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxConcurrentUploads: 50,
    
    inputFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                   'image/svg+xml', 'image/tiff', 'image/tif',
                   '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'],
    outputFormats: ['jpeg', 'png', 'webp', 'avif'],
    autoConversionFormat: 'jpeg',
    
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 399,
    subscriptionDuration: 365,
    
    specialRules: [
      'Unlimited operations',
      '200MB file size limit',
      'Batch upload: 50 files',
      'Authentication and payment required',
      'Yearly billing'
    ]
  },

  // CR2 to PNG conversion - /convert/cr2-to-png
  '/convert/cr2-to-png': {
    pageIdentifier: '/convert/cr2-to-png',
    displayName: 'CR2 to PNG Converter',
    
    monthly: 20,
    daily: 10,
    hourly: 5,
    
    maxFileSize: 25 * 1024 * 1024, // 25MB (larger for RAW files)
    maxConcurrentUploads: 5,
    
    inputFormats: ['.cr2', '.cr3'],
    outputFormats: ['png'],
    autoConversionFormat: 'png',
    
    requiresAuth: false,
    requiresPayment: false,
    
    specialRules: [
      'CR2/CR3 to PNG conversion only',
      'Quality and size controls available',
      'Uses dual-counter system for RAW operations'
    ]
  }
};

// ✅ ALLOWED PAGE IDENTIFIERS FOR VALIDATION
export const ALLOWED_PAGE_IDENTIFIERS = Object.keys(PAGE_RULES);

// ✅ UTILITY FUNCTIONS
export function getPageLimits(pageIdentifier: string): PageLimits | null {
  // Check if it's in the static rules
  if (PAGE_RULES[pageIdentifier]) {
    return PAGE_RULES[pageIdentifier];
  }
  
  // For dynamic conversion page identifiers, use free-no-auth limits
  if (pageIdentifier.match(/^[a-z0-9]+-to-[a-z0-9]+$/)) {
    return {
      ...PAGE_RULES['free-no-auth'],
      pageIdentifier: pageIdentifier,
      displayName: `${pageIdentifier.replace('-to-', ' to ').toUpperCase()} Converter`
    };
  }
  
  // For dynamic compression page identifiers (format-to-format where from equals to)
  if (pageIdentifier.match(/^[a-z0-9]+-to-[a-z0-9]+$/)) {
    const parts = pageIdentifier.split('-to-');
    if (parts.length === 2 && parts[0] === parts[1]) {
      return {
        ...PAGE_RULES['free-no-auth'],
        pageIdentifier: pageIdentifier,
        displayName: `${parts[0].toUpperCase()} Compressor`,
        specialRules: [
          ...PAGE_RULES['free-no-auth'].specialRules || [],
          'Compression operation (same input and output format)',
          'Quality and size optimization available'
        ]
      };
    }
  }
  
  return null;
}

export function isValidPageIdentifier(pageIdentifier: string): boolean {
  // Check if it's in the static list
  if (ALLOWED_PAGE_IDENTIFIERS.includes(pageIdentifier)) {
    return true;
  }
  
  // Check if it's a dynamic conversion page identifier (format: from-to-format)
  if (pageIdentifier.match(/^[a-z0-9]+-to-[a-z0-9]+$/)) {
    return true;
  }
  
  return false;
}

// Helper function to detect RAW file formats - FIXED VERSION
function isRawFile(filename: string): boolean {
  if (!filename) return false;
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const rawFormats = ['cr2', 'cr3', 'arw', 'srf', 'dng', 'nef', 'nrw', 'orf', 'raf', 'rw2', 'pef', 'srw', 'x3f', 'raw', 'crw'];
  return rawFormats.includes(extension);
}

export function validateFileSize(file: { size: number; originalname?: string }, pageIdentifier: string): { valid: boolean; error?: string } {
  const limits = getPageLimits(pageIdentifier);
  if (!limits) {
    return { valid: false, error: 'Invalid page identifier' };
  }
  
  const filename = file.originalname || '';
  const isRaw = isRawFile(filename);
  
  // Determine appropriate file size limit
  let maxFileSize = limits.maxFileSize; // Default limit from page rules
  
  // Apply 25MB limit for RAW files on ALL free and conversion pages
  const isFreeOrConversionPage = 
    pageIdentifier === 'free-no-auth' || 
    pageIdentifier === 'free-auth' ||
    pageIdentifier.startsWith('/compress') ||
    pageIdentifier.startsWith('/convert') ||
    pageIdentifier.includes('-to-');
  
  if (isRaw && isFreeOrConversionPage) {
    maxFileSize = 25 * 1024 * 1024; // 25MB for RAW files
  }
  
  if (file.size > maxFileSize) {
    const maxMB = Math.round(maxFileSize / (1024 * 1024));
    const actualMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = isRaw ? ' RAW' : '';
    return { 
      valid: false, 
      error: `File "${filename}" is too large. Maximum size for${fileType} files is ${maxMB}MB. Your file is ${actualMB}MB.` 
    };
  }
  
  return { valid: true };
}

export function validateFileFormat(filename: string, pageIdentifier: string): { valid: boolean; error?: string } {
  const limits = getPageLimits(pageIdentifier);
  if (!limits) {
    return { valid: false, error: 'Invalid page identifier' };
  }
  
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  const mimeType = filename.toLowerCase().includes('jpeg') || filename.toLowerCase().includes('jpg') ? 'image/jpeg' : 
                   filename.toLowerCase().includes('png') ? 'image/png' :
                   filename.toLowerCase().includes('webp') ? 'image/webp' :
                   filename.toLowerCase().includes('avif') ? 'image/avif' :
                   filename.toLowerCase().includes('svg') ? 'image/svg+xml' :
                   filename.toLowerCase().includes('tiff') || filename.toLowerCase().includes('tif') ? 'image/tiff' :
                   extension;
  
  const isSupported = limits.inputFormats.includes(mimeType) || limits.inputFormats.includes(extension);
  
  if (!isSupported) {
    return { 
      valid: false, 
      error: `File format not supported for ${limits.displayName}. Supported formats: ${limits.inputFormats.join(', ')}` 
    };
  }
  
  return { valid: true };
}

// ✅ USAGE VALIDATION FUNCTIONS
export function validateUsageLimits(
  currentUsage: { daily: number; hourly: number; monthly: number }, 
  pageIdentifier: string
): { canOperate: boolean; error?: string; limit?: string } {
  const limits = getPageLimits(pageIdentifier);
  if (!limits) {
    return { canOperate: false, error: 'Invalid page identifier' };
  }
  
  if (currentUsage.monthly >= limits.monthly) {
    return { canOperate: false, error: 'Monthly limit reached', limit: 'monthly' };
  }
  
  if (currentUsage.daily >= limits.daily) {
    return { canOperate: false, error: 'Daily limit reached', limit: 'daily' };
  }
  
  if (currentUsage.hourly >= limits.hourly) {
    return { canOperate: false, error: 'Hourly limit reached', limit: 'hourly' };
  }
  
  return { canOperate: true };
}