import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { dashboardService } from "../services/dashboardService";
import type { DashboardResponse } from "../types";

// ─── Full Dashboard ──────────────────────────────────────────────────────────
export function useDashboard() {
  const query = useApiQuery<DashboardResponse>(
    queryKeys.dashboard.all,
    () => dashboardService.getAll(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

// ─── Dismiss Tour ────────────────────────────────────────────────────────────
export function useDismissTour() {
  return useApiMutation(() => dashboardService.dismissTour(), {
    invalidateKeys: [queryKeys.dashboard.all],
  });
}
