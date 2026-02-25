import { QueryClient } from "@tanstack/react-query";

/**
 * Global QueryClient configuration
 *
 * Defaults are tuned for a business management app:
 * - staleTime: 2 min — accounting/inventory data can tolerate slight staleness
 * - gcTime: 10 min  — keep cache warm while switching between modules
 * - retry: 1        — retry once, then let the UI handle errors
 * - refetchOnWindowFocus: true — refetch when app comes to foreground
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
