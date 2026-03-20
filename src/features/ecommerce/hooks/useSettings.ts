import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";

export function useEcommerceSettings() {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.settings(),
    () => ecommerceService.getSettings(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    settings: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.settings(),
      }),
  };
}

export function useUpdateSettings() {
  return useApiMutation(
    (data: FormData) => ecommerceService.updateSettings(data),
    {
      invalidateKeys: [queryKeys.ecommerce.settings()],
      successMessage: "Store settings updated successfully",
    },
  );
}

export function useQrCode() {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.qrCode(),
    () => ecommerceService.getQrCode(),
    { staleTime: 10 * 60 * 1000 },
  );

  return {
    qrData: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.qrCode(),
      }),
  };
}
