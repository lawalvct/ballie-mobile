import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ecommerceService } from "../services/ecommerceService";
import type { CouponForm, CouponListParams } from "../types";

export function useCoupons(params: CouponListParams = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    queryKeys.ecommerce.coupons.list(params),
    () => ecommerceService.listCoupons(params),
    { keepPreviousData: true, staleTime: 30 * 1000 },
  );

  const raw = query.data as any;
  return {
    coupons: raw?.data ?? [],
    pagination: raw?.pagination ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ecommerce.coupons.all(),
      }),
  };
}

export function useCoupon(id: number) {
  const query = useApiQuery(
    queryKeys.ecommerce.coupons.detail(id),
    () => ecommerceService.showCoupon(id),
    { enabled: !!id },
  );

  return {
    coupon: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useCreateCoupon() {
  return useApiMutation(
    (data: CouponForm) => ecommerceService.createCoupon(data),
    {
      invalidateKeys: [queryKeys.ecommerce.coupons.all()],
      successMessage: "Coupon created successfully",
    },
  );
}

export function useUpdateCoupon(id: number) {
  return useApiMutation(
    (data: Partial<CouponForm>) => ecommerceService.updateCoupon(id, data),
    {
      invalidateKeys: [queryKeys.ecommerce.coupons.all()],
      successMessage: "Coupon updated successfully",
    },
  );
}

export function useDeleteCoupon() {
  return useApiMutation((id: number) => ecommerceService.deleteCoupon(id), {
    invalidateKeys: [queryKeys.ecommerce.coupons.all()],
    successMessage: "Coupon deleted",
  });
}

export function useToggleCoupon() {
  return useApiMutation((id: number) => ecommerceService.toggleCoupon(id), {
    invalidateKeys: [queryKeys.ecommerce.coupons.all()],
  });
}
