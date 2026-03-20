import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";
import type { PayoutForm } from "../types";

export function usePayouts(params: { per_page?: number; page?: number } = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.payouts.list(params),
    () => ecommerceService.listPayouts(params),
    { keepPreviousData: true, staleTime: 30 * 1000 },
  );

  const raw = query.data as any;
  return {
    payouts: raw?.data?.payouts ?? [],
    stats: raw?.data?.stats ?? null,
    settings: raw?.data?.settings ?? null,
    pagination: raw?.pagination ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.payouts.all(),
      }),
  };
}

export function usePayoutFormData() {
  const query = useApiQuery(
    queryKeys.ecommerce.payouts.formData(),
    () => ecommerceService.getPayoutFormData(),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    formData: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useDeductionPreview() {
  return useApiMutation(
    (amount: number) => ecommerceService.calculateDeduction(amount),
    {},
  );
}

export function useSubmitPayout() {
  return useApiMutation(
    (data: PayoutForm) => ecommerceService.submitPayout(data),
    {
      invalidateKeys: [queryKeys.ecommerce.payouts.all()],
      successMessage: "Payout request submitted successfully",
    },
  );
}

export function usePayout(id: number) {
  const query = useApiQuery(
    queryKeys.ecommerce.payouts.detail(id),
    () => ecommerceService.showPayout(id),
    { enabled: !!id },
  );

  return {
    payout: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useCancelPayout() {
  return useApiMutation((id: number) => ecommerceService.cancelPayout(id), {
    invalidateKeys: [queryKeys.ecommerce.payouts.all()],
    successMessage: "Payout request cancelled",
  });
}
