/**
 * USE TIER LIMITS HOOK
 * 
 * Custom hook to fetch and manage user's tier limits and usage data
 * Uses TanStack Query for caching and state management
 */

import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

interface TierLimits {
  tier_name: string;
  tier_display_name: string;
  tier_description: string;
  monthly_operations: number;
  daily_operations: number | null;
  hourly_operations: number | null;
  max_file_size_regular: number;
  max_file_size_raw: number;
  max_concurrent_uploads: number;
  max_batch_size: number;
  processing_timeout_seconds: number;
  priority_processing: boolean;
  api_calls_monthly: number;
  team_seats: number;
  has_analytics: boolean;
  has_webhooks: boolean;
  has_custom_profiles: boolean;
  has_white_label: boolean;
  price_monthly: number;
  price_yearly: number;
}

interface UsageData {
  operations_used: number;
  operations_limit: number;
  api_calls_used: number;
  api_calls_limit: number;
  period_end: string;
  period_start: string;
}

interface UseTierLimitsReturn {
  tierLimits: TierLimits;
  usage: UsageData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTierLimits = (): UseTierLimitsReturn => {
  // Default tier limits
  const defaultTierLimits: TierLimits = {
    tier_name: 'starter',
    tier_display_name: 'Starter',
    tier_description: 'Perfect for individual users',
    monthly_operations: 3000,
    daily_operations: null,
    hourly_operations: null,
    max_file_size_regular: 75,
    max_file_size_raw: 250,
    max_concurrent_uploads: 5,
    max_batch_size: 20,
    processing_timeout_seconds: 300,
    priority_processing: false,
    api_calls_monthly: 1000,
    team_seats: 1,
    has_analytics: false,
    has_webhooks: false,
    has_custom_profiles: false,
    has_white_label: false,
    price_monthly: 9.00,
    price_yearly: 90.00
  };

  const defaultUsage: UsageData = {
    operations_used: 0,
    operations_limit: 3000,
    api_calls_used: 0,
    api_calls_limit: 1000,
    period_start: new Date().toISOString(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Fetch tier limits
  const { 
    data: tierLimitsData, 
    isLoading: limitsLoading,
    error: limitsError,
    refetch: refetchLimits
  } = useQuery({
    queryKey: ['/api/user/tier-limits'],
    queryFn: getQueryFn<{ tierLimits: TierLimits }>({ on401: 'returnNull' }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch usage data
  const { 
    data: usageData, 
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage
  } = useQuery({
    queryKey: ['/api/user/usage'],
    queryFn: getQueryFn<{ usage: UsageData }>({ on401: 'returnNull' }),
    retry: 1,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (more frequent updates)
    refetchOnWindowFocus: true, // Refetch usage on window focus
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  const refetch = () => {
    refetchLimits();
    refetchUsage();
  };

  return {
    tierLimits: tierLimitsData?.tierLimits || defaultTierLimits,
    usage: usageData?.usage || defaultUsage,
    isLoading: limitsLoading || usageLoading,
    error: limitsError?.message || usageError?.message || null,
    refetch
  };
};

export default useTierLimits;
