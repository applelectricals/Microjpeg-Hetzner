/**
 * SHARED TYPES FOR TIER SYSTEM
 * 
 * Common TypeScript types used across frontend and backend
 * Place this in a shared directory accessible to both client and server
 */

// ============================================================================
// TIER LIMITS
// ============================================================================

export interface TierLimits {
  tier_name: TierName;
  tier_display_name: string;
  tier_description: string | null;
  
  // Operation Limits
  monthly_operations: number;
  daily_operations: number | null;
  hourly_operations: number | null;
  
  // File Size Limits (in MB)
  max_file_size_regular: number;
  max_file_size_raw: number;
  
  // Upload Limits
  max_concurrent_uploads: number;
  max_batch_size: number;
  
  // Processing
  processing_timeout_seconds: number;
  priority_processing: boolean;
  
  // API & Features
  api_calls_monthly: number;
  team_seats: number;
  has_analytics: boolean;
  has_webhooks: boolean;
  has_custom_profiles: boolean;
  has_white_label: boolean;
  
  // Pricing
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  
  // Status
  is_active: boolean;
  is_visible_on_pricing: boolean;
  
  // Metadata
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
  change_notes?: string;
}

export type TierName = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

// ============================================================================
// USAGE DATA
// ============================================================================

export interface UsageData {
  user_id: string;
  operations_used: number;
  operations_limit: number;
  api_calls_used: number;
  api_calls_limit: number;
  period_start: string;
  period_end: string;
  overage_operations?: number; // For BUSINESS tier
  overage_cost?: number; // For BUSINESS tier
}

export interface UsageByPeriod {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
}

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  tier: TierName;
  subscription_status: SubscriptionStatus;
  subscription_period_start?: Date;
  subscription_period_end?: Date;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  is_admin?: boolean;
  created_at: Date;
  updated_at: Date;
}

export type SubscriptionStatus = 
  | 'none'           // Free tier, no subscription
  | 'active'         // Active paid subscription
  | 'trialing'       // In trial period
  | 'past_due'       // Payment failed
  | 'canceled'       // Subscription canceled
  | 'unpaid'         // Payment required
  | 'incomplete'     // Subscription incomplete
  | 'incomplete_expired'; // Incomplete subscription expired

// ============================================================================
// FILE UPLOAD
// ============================================================================

export interface FileUploadMetadata {
  filename: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  format: string;
  isRawFile: boolean;
  uploadedAt: Date;
  processedAt?: Date;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
  maxSize?: number;
}

// ============================================================================
// COMPRESSION OPTIONS
// ============================================================================

export interface CompressionOptions {
  quality: number; // 1-100
  format: OutputFormat;
  preserveMetadata?: boolean;
  progressive?: boolean; // For JPEG
  optimizationLevel?: number; // For PNG
}

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export const SUPPORTED_INPUT_FORMATS = [
  'jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'svg',
  'cr2', 'cr3', 'arw', 'crw', 'dng', 'nef', 'orf', 'raf', 'rw2'
] as const;

export const RAW_FORMATS = [
  'cr2', 'cr3', 'arw', 'crw', 'dng', 'nef', 'orf', 'raf', 'rw2'
] as const;

export type SupportedInputFormat = typeof SUPPORTED_INPUT_FORMATS[number];
export type RawFormat = typeof RAW_FORMATS[number];

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TierLimitsResponse extends ApiResponse {
  tierLimits: TierLimits;
}

export interface UsageResponse extends ApiResponse {
  usage: UsageData;
}

export interface CompressionResponse extends ApiResponse {
  files: Array<{
    filename: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    downloadUrl: string;
  }>;
  zipDownloadUrl?: string;
}

// ============================================================================
// ADMIN PANEL
// ============================================================================

export interface TierLimitUpdate {
  tier_name: TierName;
  updates: Partial<TierLimits>;
  change_notes?: string;
  updated_by: string;
}

export interface TierLimitAuditLog {
  id: number;
  tier_name: TierName;
  changed_field: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: Date;
  change_reason?: string;
}

// ============================================================================
// UPGRADE PROMPTS
// ============================================================================

export interface UpgradePrompt {
  show: boolean;
  level: 'info' | 'warning' | 'critical';
  message: string;
  operationsUsed: number;
  operationsLimit: number;
  suggestedTier?: TierName;
}

export const UPGRADE_PROMPT_THRESHOLDS = {
  free: [10, 20, 50, 200, 250], // Show prompts at these operation counts
  starter: [2000, 2500, 2900],
  pro: [12000, 14000, 14800],
  business: [40000, 45000, 49000]
} as const;

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIER_COLORS = {
  free: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    gradient: null
  },
  starter: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    gradient: 'from-blue-500 to-cyan-500'
  },
  pro: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    gradient: 'from-purple-500 to-pink-500'
  },
  business: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    gradient: 'from-yellow-500 to-orange-500'
  },
  enterprise: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    gradient: 'from-gray-800 to-gray-900'
  }
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const isRawFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return RAW_FORMATS.includes(ext as RawFormat);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const calculateCompressionRatio = (
  originalSize: number, 
  compressedSize: number
): number => {
  if (originalSize === 0) return 0;
  return ((1 - compressedSize / originalSize) * 100);
};

export const getDaysUntilReset = (periodEnd: string): number => {
  const now = new Date();
  const reset = new Date(periodEnd);
  return Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};
