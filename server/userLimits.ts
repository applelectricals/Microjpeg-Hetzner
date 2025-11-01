// User types and limits (parallel system to page-based tracking)
export const USER_LIMITS = {
  free: {
    monthly: { raw: 100, regular: 100, total: 200 },
    daily: { raw: null, regular: null, total: null },
    hourly: { raw: null, regular: null, total: null },
    maxFileSize: 7 * 1024 * 1024, // 7MB for regular files
    maxRawFileSize: 15 * 1024 * 1024, // 15MB for RAW files
    concurrent: 1
  },
  premium: {
    monthly: { total: null },
    daily: { total: null },
    hourly: { total: null },
    maxFileSize: 75 * 1024 * 1024, // 75MB
    concurrent: 1
  },
  enterprise: {
    monthly: { total: null },
    daily: { total: null },
    hourly: { total: null },
    maxFileSize: 200 * 1024 * 1024, // 200MB
    concurrent: 1
  }
};

// User type definitions for TypeScript
export type UserType = keyof typeof USER_LIMITS;

export interface UserLimits {
  monthly: { raw?: number; regular?: number; total: number };
  daily: { raw?: number; regular?: number; total: number };
  hourly: { raw?: number; regular?: number; total: number };
  maxFileSize: number;
  maxRawFileSize?: number; // Optional property for RAW file size limit
  concurrent: number;
}

// Helper function to get limits for a user type
export function getUserLimits(userType: UserType): UserLimits {
  return USER_LIMITS[userType];
}

// Helper function to determine user type based on subscription
export function determineUserType(subscription?: { plan?: string }): UserType {
  if (!subscription || !subscription.plan) {
    return 'free';
  }
  
  const plan = subscription.plan.toLowerCase();
  if (plan.includes('premium') || plan.includes('pro')) {
    return 'premium';
  }
  if (plan.includes('enterprise') || plan.includes('business')) {
    return 'enterprise';
  }
  
  return 'free';
}