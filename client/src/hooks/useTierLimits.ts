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
  tierLimits: TierLimits | null;
  usage: UsageData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTierLimits = (): UseTierLimitsReturn => {
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
    tierLimits: tierLimitsData?.tierLimits || null,
    usage: usageData?.usage || null,
    isLoading: limitsLoading || usageLoading,
    error: limitsError?.message || usageError?.message || null,
    refetch
  };
};

export default useTierLimits;
