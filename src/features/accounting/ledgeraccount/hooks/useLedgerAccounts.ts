import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { ledgerAccountService } from "../services/ledgerAccountService";
import type { ListParams } from "../types";

/**
 * Fetches a paginated, filtered ledger account list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (3-min stale).
 * - `placeholderData: keepPreviousData` keeps previous data visible during
 *   page/filter transitions.
 * - `refresh()` invalidates the entire ledgerAccounts cache.
 *
 * Usage:
 *   const { accounts, statistics, pagination, isLoading, isRefreshing, refresh } =
 *     useLedgerAccounts(filters);
 */
export function useLedgerAccounts(params: ListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.ledgerAccounts.list(params as Record<string, any>),
    () => ledgerAccountService.list(params),
    {
      staleTime: 3 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ledgerAccounts.all });
  };

  return {
    accounts: (query.data as any)?.ledger_accounts ?? [],
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
