import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { voucherService } from "../services/voucherService";
import type { ListParams } from "../types";

/**
 * Fetches a paginated, filtered voucher list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (2-min stale).
 * - `placeholderData: keepPreviousData` keeps previous data visible during
 *   page/filter transitions.
 * - `refresh()` invalidates the entire vouchers cache.
 * - Also provides `voucherTypes` for filter dropdowns (5-min stale).
 *
 * Usage:
 *   const { vouchers, statistics, pagination, voucherTypes, isLoading, isRefreshing, refresh } =
 *     useVouchers(filters);
 */
export function useVouchers(params: ListParams) {
  const queryClient = useQueryClient();

  const listQuery = useApiQuery(
    queryKeys.vouchers.list(params as Record<string, any>),
    () => voucherService.list(params),
    {
      staleTime: 2 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const typesQuery = useApiQuery(
    queryKeys.voucherTypes.list(),
    () => voucherService.getFormData(),
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.all });
  };

  return {
    vouchers: (listQuery.data as any)?.vouchers ?? [],
    pagination: (listQuery.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (listQuery.data as any)?.statistics ?? null,
    voucherTypes: (typesQuery.data as any)?.voucher_types ?? [],
    isLoading: listQuery.isLoading,
    isRefreshing: listQuery.isFetching && !listQuery.isLoading,
    refresh,
  };
}
