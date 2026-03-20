import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";
import type { DateRangeParams } from "../types";

export function useOrderReport(params: DateRangeParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.reports.orders(params),
    () => ecommerceService.getOrderReport(params),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    report: (query.data as any)?.data ?? null,
    filters: (query.data as any)?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.reports.orders(params),
      }),
  };
}

export function useRevenueReport(params: DateRangeParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.reports.revenue(params),
    () => ecommerceService.getRevenueReport(params),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    report: (query.data as any)?.data ?? null,
    filters: (query.data as any)?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.reports.revenue(params),
      }),
  };
}

export function useProductReport(params: DateRangeParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.reports.products(params),
    () => ecommerceService.getProductReport(params),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    report: (query.data as any)?.data ?? null,
    filters: (query.data as any)?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.reports.products(params),
      }),
  };
}

export function useCustomerReport(params: DateRangeParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.reports.customers(params),
    () => ecommerceService.getCustomerReport(params),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    report: (query.data as any)?.data ?? null,
    filters: (query.data as any)?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.reports.customers(params),
      }),
  };
}

export function useAbandonedCartReport(params: DateRangeParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.reports.abandonedCarts(params),
    () => ecommerceService.getAbandonedCartReport(params),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    report: (query.data as any)?.data ?? null,
    filters: (query.data as any)?.filters ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.reports.abandonedCarts(params),
      }),
  };
}
