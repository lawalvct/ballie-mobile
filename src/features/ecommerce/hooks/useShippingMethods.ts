import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";
import type { ShippingMethodForm } from "../types";

export function useShippingMethods() {
  const query = useApiQuery(
    queryKeys.ecommerce.shippingMethods.list(),
    () => ecommerceService.listShippingMethods(),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    methods: (query.data as any)?.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useShippingMethod(id: number) {
  const query = useApiQuery(
    queryKeys.ecommerce.shippingMethods.detail(id),
    () => ecommerceService.showShippingMethod(id),
    { enabled: !!id },
  );

  return {
    method: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useCreateShippingMethod() {
  return useApiMutation(
    (data: ShippingMethodForm) => ecommerceService.createShippingMethod(data),
    {
      invalidateKeys: [queryKeys.ecommerce.shippingMethods.all()],
      successMessage: "Shipping method created",
    },
  );
}

export function useUpdateShippingMethod(id: number) {
  return useApiMutation(
    (data: ShippingMethodForm) =>
      ecommerceService.updateShippingMethod(id, data),
    {
      invalidateKeys: [queryKeys.ecommerce.shippingMethods.all()],
      successMessage: "Shipping method updated",
    },
  );
}

export function useDeleteShippingMethod() {
  return useApiMutation(
    (id: number) => ecommerceService.deleteShippingMethod(id),
    {
      invalidateKeys: [queryKeys.ecommerce.shippingMethods.all()],
      successMessage: "Shipping method deleted",
    },
  );
}

export function useToggleShippingMethod() {
  return useApiMutation(
    (id: number) => ecommerceService.toggleShippingMethod(id),
    {
      invalidateKeys: [queryKeys.ecommerce.shippingMethods.all()],
    },
  );
}
