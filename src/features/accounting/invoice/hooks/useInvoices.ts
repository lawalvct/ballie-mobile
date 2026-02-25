import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { invoiceService } from "../services/invoiceService";
import type { ListParams } from "../types";

/**
 * Fetches a paginated, filtered invoice list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (2-min stale).
 * - `placeholderData: keepPreviousData` keeps the previous page visible
 *   while a new page/filter loads, eliminating blank flash.
 * - `refresh()` invalidates the entire invoices cache so the next
 *   mount/focus triggers a background re-fetch.
 *
 * Usage:
 *   const { invoices, statistics, pagination, isLoading, isRefreshing, refresh } =
 *     useInvoices(filters);
 */
export function useInvoices(params: ListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.invoices.list(params as Record<string, any>),
    () => invoiceService.list(params),
    {
      staleTime: 2 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
  };

  return {
    invoices: (query.data as any)?.data ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (query.data as any)?.statistics ?? null,
    isLoading: query.isLoading,
    /** true while a background re-fetch is in progress (page/filter change) */
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
