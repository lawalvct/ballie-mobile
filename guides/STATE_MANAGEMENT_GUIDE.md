# State Management Architecture

## Overview

This app uses a **layered state management** approach:

| Layer                  | Tool                            | What it manages                                              |
| ---------------------- | ------------------------------- | ------------------------------------------------------------ |
| **Server state**       | TanStack Query                  | API data, caching, refetching, pagination                    |
| **Client/app state**   | Zustand                         | Selected branch, fiscal period, cross-module filters, drafts |
| **Screen-local state** | React `useState` / `useReducer` | Modals, tabs, temporary UI toggles                           |
| **Forms**              | (future) `react-hook-form`      | Multi-field forms with validation                            |

---

## Directory Structure

```
src/
├── state/
│   ├── index.ts            # Re-exports
│   ├── queryClient.ts      # TanStack Query client config
│   ├── queryKeys.ts        # Centralised query-key factory
│   └── appStore.ts         # Zustand global store
├── hooks/
│   ├── index.ts            # Re-exports
│   └── useApiQuery.ts      # Generic query/mutation wrappers
└── features/
    └── <module>/
        └── <entity>/
            └── hooks/
                └── use<Entity>.ts   # Domain-specific hooks
```

---

## 1. TanStack Query — Server State

### QueryClient (`src/state/queryClient.ts`)

Pre-configured with business-app defaults:

- **staleTime: 2 min** — ledger/inventory data can tolerate slight staleness between navigations
- **gcTime: 10 min** — keeps cache warm while switching between modules
- **retry: 1** — retries once, then surfaces the error
- **refetchOnWindowFocus: true** — re-syncs when the app returns to foreground

### Query Keys (`src/state/queryKeys.ts`)

Centralised factory so you never hard-code string keys:

```ts
queryKeys.products.list({ status: "active" });
// → ["products", "list", { status: "active" }]

queryKeys.products.detail(42);
// → ["products", "detail", 42]

// Invalidate all product queries at once:
queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
```

Every domain (products, vouchers, employees, customers, reports, …) has its own section in the factory.

### Generic Hooks (`src/hooks/useApiQuery.ts`)

| Hook                                      | Purpose                                        |
| ----------------------------------------- | ---------------------------------------------- |
| `useApiQuery(key, fn, opts?)`             | Standard query with error handling             |
| `useApiMutation(fn, opts?)`               | Mutation with toast, cache invalidation        |
| `usePaginatedQuery(key, fetchPage, opts)` | List screens with pagination + pull-to-refresh |

### Feature Hooks (example: `src/features/inventory/product/hooks/useProducts.ts`)

```tsx
// BEFORE — manual pattern (repeated in every screen):
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

useEffect(() => {
  loadProducts();
}, [filters]);

const loadProducts = async () => {
  try {
    setLoading(true);
    const response = await productService.list(filters);
    setProducts(response.products || []);
  } catch (error: any) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
};

// AFTER — hook-based:
const { items, isLoading, refreshing, onRefresh, pagination } =
  useProducts(filters);
```

Available product hooks:

| Hook                       | Returns                                       |
| -------------------------- | --------------------------------------------- |
| `useProducts(params?)`     | Paginated list + refresh + loadMore           |
| `useProduct(id)`           | Single product detail                         |
| `useProductFormData()`     | Form dropdowns (categories, units, accounts)  |
| `useProductStatistics()`   | Dashboard statistics                          |
| `useStockMovements(id)`    | Stock movement history                        |
| `useCreateProduct()`       | `.mutate(data)` — creates & invalidates cache |
| `useUpdateProduct(id)`     | `.mutate(data)` — updates & invalidates cache |
| `useDeleteProduct()`       | `.mutate(id)` — deletes & invalidates cache   |
| `useToggleProductStatus()` | `.mutate(id)` — toggles & invalidates cache   |
| `useBulkProductAction()`   | `.mutate({ action, product_ids })`            |

---

## 2. Zustand — Client / App State

### Store (`src/state/appStore.ts`)

Access anywhere without a provider:

```ts
import { useAppStore } from "../state";

// Read
const branchId = useAppStore((s) => s.selectedBranchId);

// Write
const setBranch = useAppStore((s) => s.setSelectedBranch);
setBranch(3);
```

Available slices:

| Slice          | State              | Actions                                                            |
| -------------- | ------------------ | ------------------------------------------------------------------ |
| Branch         | `selectedBranchId` | `setSelectedBranch(id)`                                            |
| Fiscal period  | `fiscalPeriod`     | `setFiscalPeriod(period)`                                          |
| Global filters | `globalFilters`    | `setGlobalFilters(partial)`, `resetGlobalFilters()`                |
| Active module  | `activeModule`     | `setActiveModule(name)`                                            |
| Drafts         | `draftItems`       | `setDraftItems(key, items)`, `clearDraft(key)`, `clearAllDrafts()` |

---

## 3. Migration Guide — How to Convert a Screen

### Step 1: Create hooks for the feature

Copy the product hooks pattern:

```
src/features/<module>/<entity>/hooks/use<Entity>.ts
```

### Step 2: Add query keys

Add a new section in `src/state/queryKeys.ts`.

### Step 3: Replace useState/useEffect in the screen

```diff
- const [items, setItems] = useState<Item[]>([]);
- const [loading, setLoading] = useState(true);
- const [refreshing, setRefreshing] = useState(false);
- useEffect(() => { loadItems(); }, [filters]);
- const loadItems = async () => { ... };

+ const { items, isLoading, refreshing, onRefresh, pagination } = useItems(filters);
```

### Step 4: Replace create/update/delete handlers

```diff
- const handleCreate = async (data) => {
-   try { await service.create(data); showToast("Created"); loadItems(); }
-   catch (e) { showToast(e.message, "error"); }
- };

+ const createMutation = useCreateItem();
+ const handleCreate = (data) => createMutation.mutate(data, {
+   onSuccess: () => navigation.goBack(),
+ });
```

### Step 5: Use `createMutation.isPending` for submit button loading state

```tsx
<Button
  title={createMutation.isPending ? "Saving..." : "Save"}
  disabled={createMutation.isPending}
  onPress={() => handleCreate(formValues)}
/>
```

---

## 4. Recommended Migration Order

Migrate one module at a time. Suggested order (least dependencies → most):

1. **Inventory** — Products, Categories, Units, Stock Journals
2. **Accounting** — Voucher Types, Ledger Accounts, Vouchers, Banks
3. **CRM** — Customers, Vendors
4. **Payroll** — Departments, Positions, Employees, Processing
5. **Reports** — Read-only, high benefit from caching
6. **Dashboard** — Last, benefits from all other caches being warm

Each module can be migrated screen-by-screen without breaking others.

---

## 5. When to Use What

| Scenario                       | Use                                    |
| ------------------------------ | -------------------------------------- |
| Fetching a list from API       | `usePaginatedQuery` or `useApiQuery`   |
| Fetching a single record       | `useApiQuery`                          |
| Creating / updating / deleting | `useApiMutation`                       |
| Which branch is selected       | `useAppStore(s => s.selectedBranchId)` |
| Current fiscal year dates      | `useAppStore(s => s.fiscalPeriod)`     |
| POS cart items (not yet saved) | `useAppStore(s => s.draftItems)`       |
| Is a modal open?               | `useState` in the screen               |
| Form field values + validation | `react-hook-form` (install when ready) |
