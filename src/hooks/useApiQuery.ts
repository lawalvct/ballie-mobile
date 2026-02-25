import { useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { showToast } from "../utils/toast";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
  [key: string]: any; // allow extra fields like `statistics`
}

// ─── useApiQuery ─────────────────────────────────────────────────────────────
/**
 * Thin wrapper around useQuery that standardises error toasts.
 *
 * Usage:
 *   const { data, isLoading } = useApiQuery(
 *     queryKeys.products.list(filters),
 *     () => productService.list(filters),
 *   );
 */
export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn,
    ...options,
  });
}

// ─── useApiMutation ──────────────────────────────────────────────────────────
/**
 * Thin wrapper around useMutation that:
 *  1. Shows a success toast (if `successMessage` provided)
 *  2. Invalidates related query keys on success
 *  3. Shows an error toast on failure
 *
 * Usage:
 *   const create = useApiMutation(
 *     (data: CreateProductData) => productService.create(data),
 *     {
 *       invalidateKeys: [queryKeys.products.all],
 *       successMessage: "Product created",
 *     },
 *   );
 *   create.mutate(formValues);
 */
export function useApiMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> & {
    invalidateKeys?: QueryKey[];
    successMessage?: string;
  },
) {
  const queryClient = useQueryClient();
  const {
    invalidateKeys,
    successMessage,
    onSuccess: originalOnSuccess,
    onError: originalOnError,
    ...restOptions
  } = options ?? {};

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables, onMutateResult, mutationContext) => {
      // Invalidate related caches
      if (invalidateKeys) {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
      }

      // Success toast
      if (successMessage) {
        showToast(successMessage, "success");
      }

      originalOnSuccess?.(data, variables, onMutateResult, mutationContext);
    },
    onError: (error, variables, onMutateResult, mutationContext) => {
      const message =
        (error as any)?.message || "Something went wrong. Please try again.";
      showToast(message, "error");

      originalOnError?.(error, variables, onMutateResult, mutationContext);
    },
    ...restOptions,
  });
}

// ─── usePaginatedQuery ───────────────────────────────────────────────────────
/**
 * Convenience wrapper for list screens that need pagination + pull-to-refresh.
 *
 * Returns everything useQuery returns plus:
 *  - `items`       — the current page array
 *  - `pagination`  — PaginationInfo
 *  - `refreshing`  — boolean for RefreshControl
 *  - `onRefresh`   — handler for RefreshControl
 *  - `loadMore`    — handler for onEndReached
 *  - `hasMore`     — whether there's a next page
 *
 * Usage:
 *   const { items, isLoading, refreshing, onRefresh, pagination } =
 *     usePaginatedQuery(
 *       queryKeys.products.list(filters),
 *       (page) => productService.list({ ...filters, page }),
 *       { mapResponse: (r) => ({ items: r.products, pagination: r.pagination }) },
 *     );
 */
export function usePaginatedQuery<TRaw, TItem>(
  queryKey: QueryKey,
  fetchPage: (page: number) => Promise<TRaw>,
  options: {
    mapResponse: (raw: TRaw) => PaginatedResponse<TItem>;
    enabled?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const pageRef = useRef(1);

  const query = useQuery<TRaw, Error>({
    queryKey,
    queryFn: () => fetchPage(pageRef.current),
    enabled: options.enabled,
  });

  const mapped = query.data ? options.mapResponse(query.data) : null;

  const onRefresh = useCallback(() => {
    pageRef.current = 1;
    queryClient.invalidateQueries({ queryKey });
  }, [queryKey, queryClient]);

  const hasMore = mapped
    ? mapped.pagination.current_page < mapped.pagination.last_page
    : false;

  const loadMore = useCallback(() => {
    if (hasMore && !query.isFetching) {
      pageRef.current += 1;
      queryClient.invalidateQueries({ queryKey });
    }
  }, [hasMore, query.isFetching, queryKey, queryClient]);

  return {
    ...query,
    items: mapped?.items ?? [],
    pagination: mapped?.pagination ?? null,
    refreshing: query.isRefetching,
    onRefresh,
    loadMore,
    hasMore,
  };
}
