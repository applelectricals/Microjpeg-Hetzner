// ✅ COMPREHENSIVE PAGE-SPECIFIC RULES CONFIGURATION
// Clean, streamlined version with only required configurations

export interface PageLimits {
  pageIdentifier: string;
  displayName: string;
  
  // Operation Limits
  monthly: number;
  
  // File Constraints
  maxFileSize: number; // in bytes (for standard formats)
  maxFileSizeRaw?: number; // in bytes (for RAW formats)
  maxConcurrentUploads: number;
  
  // Format Support
  inputFormats: string[];
  outputFormats: string[];
  autoConversionFormat: string;
  
  // Access Control
  requiresAuth: boolean;
  requiresPayment: boolean;
  paymentAmount?: number;
  subscriptionDuration?: number;
}

// Helper constants
const MB = 1024 * 1024;
const UNLIMITED = 999999;

// Standard format lists
const STANDARD_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/tiff', 'image/tif'];
const RAW_FORMATS = ['.cr2', '.crw', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'];
const ALL_INPUT_FORMATS = [...STANDARD_FORMATS, ...RAW_FORMATS];
const OUTPUT_FORMATS = ['jpeg', 'png', 'webp', 'avif'];

// ✅ CLEAN PAGE RULES CONFIGURATION
export const PAGE_RULES: Record<string, PageLimits> = {
  
  // 1. Free Plan (No Sign-in) - Main Landing Page
  'free-no-auth': {
    pageIdentifier: 'free-no-auth',
    displayName: 'Free Plan (No Sign-in)',
    monthly: 200,
    maxFileSize: 7 * MB,
    maxFileSizeRaw: 15 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: false,
    requiresPayment: false,
  },

  // 4. Premium Plan - $29/month
  'premium-29': {
    pageIdentifier: 'premium-29',
    displayName: 'Premium Plan ($29)',
    monthly: UNLIMITED,
    maxFileSize: 75 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 29,
    subscriptionDuration: 30,
  },

  // 5. Enterprise Plan - $99/month
  'enterprise-99': {
    pageIdentifier: 'enterprise-99',
    displayName: 'Enterprise Plan ($99)',
    monthly: UNLIMITED,
    maxFileSize: 150 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 99,
    subscriptionDuration: 30,
  },

  // 6. CR2 to JPG (Free)
  'cr2-free': {
    pageIdentifier: 'cr2-free',
    displayName: 'CR2 to JPG Converter (Free)',
    monthly: 200,
    maxFileSize: 15 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ['.cr2'],
    outputFormats: ['jpeg'],
    autoConversionFormat: 'jpeg',
    requiresAuth: false,
    requiresPayment: false,
  },

  // 7. CR2 to PNG (Free)
  'cr2-to-png': {
    pageIdentifier: 'cr2-to-png',
    displayName: 'CR2 to PNG Converter (Free)',
    monthly: 200,
    maxFileSize: 15 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ['.cr2', '.cr3'],
    outputFormats: ['png'],
    autoConversionFormat: 'png',
    requiresAuth: false,
    requiresPayment: false,
  },

  // 8. Free Compression (New URL)
  '/compress/free': {
    pageIdentifier: '/compress/free',
    displayName: 'Free Compression',
    monthly: 200,
    maxFileSize: 7 * MB,
    maxFileSizeRaw: 15 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: false,
  },

  // 9. Pro Compression
  '/compress/pro': {
    pageIdentifier: '/compress/pro',
    displayName: 'Pro Compression',
    monthly: UNLIMITED,
    maxFileSize: 150 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 29,
    subscriptionDuration: 30,
  },

  // 10. Enterprise Compression
  '/compress/enterprise': {
    pageIdentifier: '/compress/enterprise',
    displayName: 'Enterprise Compression',
    monthly: UNLIMITED,
    maxFileSize: 200 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 99,
    subscriptionDuration: 30,
  },

  // 13. Starter Monthly - $9/month
  '/compress/starter-monthly': {
    pageIdentifier: '/compress/starter-monthly',
    displayName: 'Starter Monthly ($9)',
    monthly: UNLIMITED,
    maxFileSize: 75 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 9,
    subscriptionDuration: 30,
  },

  // 14. Starter Yearly - $49/year
  '/compress/starter-yearly': {
    pageIdentifier: '/compress/starter-yearly',
    displayName: 'Starter Yearly ($49)',
    monthly: UNLIMITED,
    maxFileSize: 75 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 49,
    subscriptionDuration: 365,
  },

  // 15. Pro Monthly - $19/month
  '/compress/pro-monthly': {
    pageIdentifier: '/compress/pro-monthly',
    displayName: 'PRO Monthly ($19)',
    monthly: UNLIMITED,
    maxFileSize: 150 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 19,
    subscriptionDuration: 30,
  },

  // 16. Pro Yearly - $149/year
  '/compress/pro-yearly': {
    pageIdentifier: '/compress/pro-yearly',
    displayName: 'PRO Yearly ($149)',
    monthly: UNLIMITED,
    maxFileSize: 150 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 149,
    subscriptionDuration: 365,
  },

  // 17. Business Monthly - $49/month
  '/compress/business-monthly': {
    pageIdentifier: '/compress/business-monthly',
    displayName: 'BUSINESS Monthly ($49)',
    monthly: UNLIMITED,
    maxFileSize: 200 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 49,
    subscriptionDuration: 30,
  },

  // 18. Business Yearly - $399/year
  '/compress/business-yearly': {
    pageIdentifier: '/compress/business-yearly',
    displayName: 'BUSINESS Yearly ($399)',
    monthly: UNLIMITED,
    maxFileSize: 200 * MB,
    maxConcurrentUploads: 3,
    inputFormats: ALL_INPUT_FORMATS,
    outputFormats: OUTPUT_FORMATS,
    autoConversionFormat: 'jpeg',
    requiresAuth: true,
    requiresPayment: true,
    paymentAmount: 399,
    subscriptionDuration: 365,
  },
};

// ✅ ALLOWED PAGE IDENTIFIERS FOR VALIDATION
export const ALLOWED_PAGE_IDENTIFIERS = Object.keys(PAGE_RULES);

// ✅ UTILITY FUNCTIONS
export function getPageLimits(pageIdentifier: string): PageLimits | null {
  // Check if it's in the static rules
  if (PAGE_RULES[pageIdentifier]) {
    return PAGE_RULES[pageIdentifier];
  }
  
  // For dynamic conversion page identifiers (format-to-format)
  if (pageIdentifier.match(/^[a-z0-9]+-to-[a-z0-9]+$/)) {
    return {
      ...PAGE_RULES['free-no-auth'],
      pageIdentifier: pageIdentifier,
      displayName: `${pageIdentifier.replace('-to-', ' to ').toUpperCase()} Converter`
    };
  }
  
  return null;
}

export function isValidPageIdentifier(pageIdentifier: string): boolean {
  // Check if it's in the static list
  if (ALLOWED_PAGE_IDENTIFIERS.includes(pageIdentifier)) {
    return true;
  }
  
  // Check if it's a dynamic conversion page identifier
  if (pageIdentifier.match(/^[a-z0-9]+-to-[a-z0-9]+$/)) {
    return true;
  }
  
  return false;
}

// Helper function to detect RAW file formats
function isRawFile(filename: string): boolean {
  if (!filename) return false;
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const rawFormats = ['cr2', 'cr3', 'crw', 'arw', 'srf', 'dng', 'nef', 'nrw', 'orf', 'raf', 'rw2', 'pef', 'srw', 'x3f', 'raw'];
  return rawFormats.includes(extension);
}

export function validateFileSize(file: { size: number; originalname?: string }, pageIdentifier: string): { valid: boolean; error?: string } {
  const limits = getPageLimits(pageIdentifier);
  if (!limits) {
    return { valid: false, error: 'Invalid page identifier' };
  }
  
  const filename = file.originalname || '';
  const isRaw = isRawFile(filename);
  
  // Use RAW file size limit if file is RAW and limit exists
  const maxFileSize = isRaw && limits.maxFileSizeRaw ? limits.maxFileSizeRaw : limits.maxFileSize;
  
  if (file.size > maxFileSize) {
    const maxMB = Math.round(maxFileSize / MB);
    const actualMB = (file.size / MB).toFixed(2);
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

export function validateUsageLimits(
  currentUsage: { monthly: number }, 
  pageIdentifier: string
): { canOperate: boolean; error?: string; limit?: string } {
  const limits = getPageLimits(pageIdentifier);
  if (!limits) {
    return { canOperate: false, error: 'Invalid page identifier' };
  }
  
  if (currentUsage.monthly >= limits.monthly) {
    return { canOperate: false, error: 'Monthly limit reached', limit: 'monthly' };
  }
  
  return { canOperate: true };
}