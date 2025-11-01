// server/config/operationLimits.ts

export const OPERATION_CONFIG = {
  // File format classifications
  formats: {
    regular: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif', 'tiff', 'tif'],
    raw: ['cr2', 'cr3', 'arw', 'nef', 'nrw', 'dng', 'orf', 'raf', 'rw2', 'pef', 'srw'],
    video: ['mp4', 'avi', 'mov', 'wmv'], // Future expansion
  },
  
  // Size limits by type
  maxFileSize: {
    regular: {
      anonymous: 10 * 1024 * 1024,     // 10MB
      free: 10 * 1024 * 1024,          // 10MB
      premium: 75 * 1024 * 1024,       // 75MB
      pro: 75 * 1024 * 1024,           // 75MB (alias for premium)
      test_premium: 75 * 1024 * 1024,  // 75MB
      enterprise: 200 * 1024 * 1024,   // 200MB
    },
    raw: {
      anonymous: 25 * 1024 * 1024,     // 25MB
      free: 75 * 1024 * 1024,          // 75MB
      premium: 75 * 1024 * 1024,       // 75MB
      pro: 75 * 1024 * 1024,           // 75MB (alias for premium)
      test_premium: 75 * 1024 * 1024,  // 75MB
      enterprise: 500 * 1024 * 1024,   // 500MB
    }
  },
  
  // Operation limits by user type
  limits: {
    anonymous: {
      regular: { monthly: 100, daily: null, hourly: null },
      raw: { monthly: 100, daily: null, hourly: null },
      totalBandwidthMB: 1000, // 1GB monthly
    },
    free: {
      regular: { monthly: 100, daily: null, hourly: null },
      raw: { monthly: 100, daily: null, hourly: null },
      totalBandwidthMB: 2000, // 2GB monthly
    },
    premium: {
      regular: { monthly: null, daily: null, hourly: null },
      raw: { monthly: null, daily: null, hourly: null },
      totalBandwidthMB: 50000, // 50GB monthly
    },
    pro: {
      regular: { monthly: null, daily: null, hourly: null },
      raw: { monthly: null, daily: null, hourly: null },
      totalBandwidthMB: 50000, // 50GB monthly (alias for premium)
    },
    test_premium: {
      regular: { monthly: null, daily: null, hourly: null },
      raw: { monthly: null, daily: null, hourly: null },
      totalBandwidthMB: 5000, // 5GB monthly
    },
    enterprise: {
      regular: { monthly: null, daily: null, hourly: null },
      raw: { monthly: null, daily: null, hourly: null },
      totalBandwidthMB: 500000, // 500GB monthly
    }
  },
  
  // Special page overrides (optional)
  pageOverrides: {
    '/convert/cr2-to-jpg': {
      anonymous: { monthly: 100, daily: null },
      free: { monthly: 100, daily: null }
    }
  }
};

// Helper function to determine file type
export function getFileType(filename: string): 'regular' | 'raw' | 'unknown' {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  if (OPERATION_CONFIG.formats.regular.includes(extension)) {
    return 'regular';
  }
  if (OPERATION_CONFIG.formats.raw.includes(extension)) {
    return 'raw';
  }
  return 'unknown';
}