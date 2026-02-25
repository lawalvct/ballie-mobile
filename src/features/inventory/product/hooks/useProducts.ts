/**
 * TanStack Query hooks for the Product domain.
 *
 * These hooks replace the manual useState/useEffect pattern and give you:
 *  • Automatic caching & background refetch
 *  • Deduped requests
 *  • Optimistic updates (optional)
 *  • Consistent loading / error / refreshing states
 *
 * ─── Migration cheat-sheet ─────────────────────────────────────────────────
 *
 * BEFORE (manual):
 *   const [products, setProducts] = useState<Product[]>([]);
 *   const [loading, setLoading] = useState(true);
 *   useEffect(() => { loadProducts(); }, [filters]);
 *   const loadProducts = async () => { … }
 *
 * AFTER (hook):
 *   const { items, isLoading, refreshing, onRefresh } = useProducts(filters);
 */
import { productService } from "../services/productService";
import {
  useApiQuery,
  useApiMutation,
  usePaginatedQuery,
} from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import type {
  ListParams,
  Product,
  CreateProductData,
  BulkActionData,
  FormData as ProductFormData,
} from "../types";

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Paginated product list — drop-in for ProductHomeScreen */
export function useProducts(params?: ListParams) {
  return usePaginatedQuery(
    queryKeys.products.list(params),
    (page) => productService.list({ ...params, page }),
    {
      mapResponse: (raw) => ({
        items: raw.products ?? [],
        pagination: raw.pagination ?? {
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 0,
          from: null,
          to: null,
        },
        statistics: raw.statistics,
      }),
    },
  );
}

/** Single product detail */
export function useProduct(id: number) {
  return useApiQuery(queryKeys.products.detail(id), () =>
    productService.show(id),
  );
}

/** Form initialisation data (categories, units, ledger accounts) */
export function useProductFormData() {
  return useApiQuery(queryKeys.products.formData(), () =>
    productService.getFormData(),
  );
}

/** Product statistics card */
export function useProductStatistics() {
  return useApiQuery(queryKeys.products.statistics(), () =>
    productService.getStatistics(),
  );
}

/** Stock movements for a specific product */
export function useStockMovements(
  productId: number,
  params?: {
    from_date?: string;
    to_date?: string;
    transaction_type?: string;
    per_page?: number;
  },
) {
  return useApiQuery(
    queryKeys.products.stockMovements(productId, params),
    () => productService.getStockMovements(productId, params),
    { enabled: !!productId },
  );
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create a product and invalidate list cache */
export function useCreateProduct() {
  return useApiMutation(
    (data: CreateProductData) => productService.create(data),
    {
      invalidateKeys: [queryKeys.products.all],
      successMessage: "Product created successfully",
    },
  );
}

/** Update a product and invalidate both list and detail cache */
export function useUpdateProduct(id: number) {
  return useApiMutation(
    (data: Partial<CreateProductData>) => productService.update(id, data),
    {
      invalidateKeys: [queryKeys.products.all],
      successMessage: "Product updated successfully",
    },
  );
}

/** Delete a product */
export function useDeleteProduct() {
  return useApiMutation((id: number) => productService.delete(id), {
    invalidateKeys: [queryKeys.products.all],
    successMessage: "Product deleted",
  });
}

/** Toggle product active/inactive */
export function useToggleProductStatus() {
  return useApiMutation((id: number) => productService.toggleStatus(id), {
    invalidateKeys: [queryKeys.products.all],
  });
}

/** Bulk activate / deactivate / delete */
export function useBulkProductAction() {
  return useApiMutation(
    (data: BulkActionData) => productService.bulkAction(data),
    {
      invalidateKeys: [queryKeys.products.all],
      successMessage: "Bulk action completed",
    },
  );
}
