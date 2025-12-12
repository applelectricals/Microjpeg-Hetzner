import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useCallback } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<{ id: string; email: string } | null>({ on401: "returnNull" }),
    retry: false,
    refetchInterval: false, // Don't auto-refetch
    refetchOnWindowFocus: false, // Don't refetch on focus
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Logout function that clears cache and calls API
  const logout = useCallback(async () => {
    try {
      // Try POST first, then GET as fallback
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Try GET as fallback
        await fetch('/api/logout', {
          method: 'GET',
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('[useAuth] Logout API error:', error);
    } finally {
      // Clear all auth-related queries from cache
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.setQueryData(["/api/subscription-info"], null);
      
      // Invalidate queries to force refetch on next mount
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-info"] });
      
      // Clear all queries to be safe
      queryClient.clear();
    }
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout, // Export logout function
  };
}

export function useSubscription() {
  const { data: subscriptionInfo, isLoading } = useQuery({
    queryKey: ["/api/subscription-info"],
    queryFn: getQueryFn<{ isPremium?: boolean; subscriptionStatus?: string } | null>({ on401: "returnNull" }),
    retry: false,
  });

  // Type assertion for subscription info
  const typedSubscriptionInfo = subscriptionInfo as { isPremium?: boolean; subscriptionStatus?: string } | null;

  return {
    subscriptionInfo,
    isLoading,
    isPremium: typedSubscriptionInfo?.isPremium || false,
    subscriptionStatus: typedSubscriptionInfo?.subscriptionStatus || 'inactive',
  };
}
