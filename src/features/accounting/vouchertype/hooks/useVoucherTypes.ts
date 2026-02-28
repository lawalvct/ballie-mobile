import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { voucherTypeService } from "../services/voucherTypeService";
import type { VoucherType } from "../types";

/**
 * Fetches voucher types via TanStack Query.
 *
 * - Data is cached per `category` (5-min stale).
 * - `refresh()` invalidates all voucherTypes cache.
 *
 * Usage:
 *   const { voucherTypes, isLoading, isError, refresh } = useVoucherTypes("accounting");
 */
export function useVoucherTypes(category?: string) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    [...queryKeys.voucherTypes.all, "search", category ?? "all"],
    () => voucherTypeService.search("", category),
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.voucherTypes.all });
  };

  return {
    voucherTypes: (query.data as VoucherType[] | undefined) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refresh,
  };
}
