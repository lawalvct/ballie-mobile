import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { accountGroupService } from "../services/accountGroupService";
import type { ListParams } from "../types";

/**
 * Fetches a paginated, filtered account group list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (3-min stale).
 * - `placeholderData: keepPreviousData` keeps previous data visible during
 *   page/filter transitions.
 * - `refresh()` invalidates the entire accountGroups cache.
 *
 * Usage:
 *   const { groups, statistics, pagination, isLoading, isRefreshing, refresh } =
 *     useAccountGroups(filters);
 */
export function useAccountGroups(params: ListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.accountGroups.list(params as Record<string, any>),
    () => accountGroupService.list(params),
    {
      staleTime: 3 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.accountGroups.all });
  };

  return {
    groups: (query.data as any)?.account_groups ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (query.data as any)?.statistics ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
