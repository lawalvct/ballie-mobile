import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";
import type { OrderListParams, OrderStatus, PaymentStatus } from "../types";

export function useOrders(params: OrderListParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.orders.list(params),
    () => ecommerceService.listOrders(params),
    { keepPreviousData: true, staleTime: 30 * 1000 },
  );

  const raw = query.data as any;
  return {
    orders: raw?.data ?? [],
    stats: raw?.stats ?? null,
    pagination: raw?.pagination ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.orders.all(),
      }),
  };
}

export function useOrder(id: number) {
  const query = useApiQuery(
    queryKeys.ecommerce.orders.detail(id),
    () => ecommerceService.showOrder(id),
    { enabled: !!id },
  );

  return {
    order: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useUpdateOrderStatus() {
  return useApiMutation(
    ({ id, status }: { id: number; status: OrderStatus }) =>
      ecommerceService.updateOrderStatus(id, status),
    {
      invalidateKeys: [queryKeys.ecommerce.orders.all()],
      successMessage: "Order status updated",
    },
  );
}

export function useUpdatePaymentStatus() {
  return useApiMutation(
    ({ id, payment_status }: { id: number; payment_status: PaymentStatus }) =>
      ecommerceService.updatePaymentStatus(id, payment_status),
    {
      invalidateKeys: [queryKeys.ecommerce.orders.all()],
      successMessage: "Payment status updated",
    },
  );
}

export function useCreateInvoice() {
  return useApiMutation(
    (orderId: number) => ecommerceService.createInvoice(orderId),
    {
      invalidateKeys: [queryKeys.ecommerce.orders.all()],
      successMessage: "Invoice created successfully",
    },
  );
}
