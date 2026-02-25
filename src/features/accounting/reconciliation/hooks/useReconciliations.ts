import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { reconciliationService } from "../services/reconciliationService";

/**
 * Fetches a paginated, filtered reconciliation list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (2-min stale).
 * - `placeholderData: keepPreviousData` keeps previous data visible during
 *   page/filter transitions.
 * - `refresh()` invalidates the entire reconciliation cache.
 * - Also returns `banks` for the bank filter dropdown.
 *
 * Usage:
 *   const { reconciliations, statistics, pagination, banks, isLoading, isRefreshing, refresh } =
 *     useReconciliations(filters);
 */
export function useReconciliations(params: Record<string, any>) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.reconciliation.list(params),
    () => reconciliationService.list(params),
    {
      staleTime: 2 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reconciliation.all });
  };

  return {
    reconciliations: (query.data as any)?.reconciliations ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (query.data as any)?.statistics ?? null,
    banks: (query.data as any)?.banks ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
