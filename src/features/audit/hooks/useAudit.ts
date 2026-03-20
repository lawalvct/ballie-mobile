// ── Audit React Query Hooks ──────────────────────────────────────────────────
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { auditService } from "../services/auditService";
import type {
  AuditDashboardFilters,
  AuditDashboardResponse,
  AuditTrailResponse,
  AuditModelType,
} from "../types";

/**
 * Fetch the full audit dashboard (stats, users, paginated activities).
 */
export function useAuditDashboard(filters: AuditDashboardFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: AuditDashboardResponse }>(
    queryKeys.audit.dashboard(filters),
    () => auditService.getDashboard(filters),
    { staleTime: 60_000 },
  );

  const dashboard = (query.data as any)?.data as
    | AuditDashboardResponse
    | undefined;

  return {
    stats: dashboard?.stats ?? null,
    users: dashboard?.users ?? [],
    activities: dashboard?.activities?.data ?? [],
    pagination: dashboard?.activities
      ? {
          current_page: dashboard.activities.current_page,
          last_page: dashboard.activities.last_page,
          per_page: dashboard.activities.per_page,
          total: dashboard.activities.total,
        }
      : null,
    appliedFilters: dashboard?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.audit.dashboard(filters),
      }),
  };
}

/**
 * Fetch audit trail for a specific record (model + id).
 */
export function useAuditTrail(model: AuditModelType, id: number) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: AuditTrailResponse }>(
    queryKeys.audit.trail(model, id),
    () => auditService.getTrail(model, id),
    { enabled: !!model && !!id, staleTime: 60_000 },
  );

  const trail = (query.data as any)?.data as AuditTrailResponse | undefined;

  return {
    model: trail?.model ?? null,
    record: trail?.record ?? null,
    activities: trail?.activities ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.audit.trail(model, id),
      }),
  };
}
