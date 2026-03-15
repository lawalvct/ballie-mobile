import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { adminService } from "../services/adminService";

/**
 * Fetch admin dashboard stats.
 */
export function useAdminDashboard() {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.admin.dashboard(),
    () => adminService.getDashboard(),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    stats: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() }),
  };
}
