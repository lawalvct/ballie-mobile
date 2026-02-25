import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { bankService } from "../services/bankService";
import type { ListParams } from "../types";

/**
 * Fetches a paginated, filtered bank account list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (3-min stale).
 * - `placeholderData: keepPreviousData` keeps previous data visible during
 *   page/filter transitions.
 * - `refresh()` invalidates the entire banks cache.
 * - Also returns `bankNames` for filter dropdowns.
 *
 * Usage:
 *   const { banks, statistics, pagination, bankNames, isLoading, isRefreshing, refresh } =
 *     useBanks(filters);
 */
export function useBanks(params: ListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.banks.list(params as Record<string, any>),
    () => bankService.list(params),
    {
      staleTime: 3 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.banks.all });
  };

  return {
    banks: (query.data as any)?.banks ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (query.data as any)?.statistics ?? null,
    bankNames: (query.data as any)?.bank_names ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
