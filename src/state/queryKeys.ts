/**
 * Centralised query-key factory
 *
 * Pattern: each domain returns arrays that TanStack Query uses for
 * cache matching and invalidation.
 *
 * Usage:
 *   queryKeys.products.list({ status: "active" })   → ["products", "list", { status: "active" }]
 *   queryKeys.products.detail(42)                    → ["products", "detail", 42]
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })  → invalidates every product query
 */
export const queryKeys = {
  // ── Inventory ──────────────────────────────────────────────────────────────
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    formData: () => [...queryKeys.products.all, "formData"] as const,
    statistics: () => [...queryKeys.products.all, "statistics"] as const,
    stockMovements: (id: number, params?: Record<string, any>) =>
      [...queryKeys.products.all, "stockMovements", id, params] as const,
  },

  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.categories.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.categories.all, "detail", id] as const,
  },

  units: {
    all: ["units"] as const,
    lists: () => [...queryKeys.units.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.units.lists(), params] as const,
    detail: (id: number) => [...queryKeys.units.all, "detail", id] as const,
  },

  stockJournals: {
    all: ["stockJournals"] as const,
    lists: () => [...queryKeys.stockJournals.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.stockJournals.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.stockJournals.all, "detail", id] as const,
  },

  // ── Accounting ─────────────────────────────────────────────────────────────
  vouchers: {
    all: ["vouchers"] as const,
    lists: () => [...queryKeys.vouchers.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.vouchers.lists(), params] as const,
    detail: (id: number) => [...queryKeys.vouchers.all, "detail", id] as const,
  },

  voucherTypes: {
    all: ["voucherTypes"] as const,
    list: () => [...queryKeys.voucherTypes.all, "list"] as const,
  },

  ledgerAccounts: {
    all: ["ledgerAccounts"] as const,
    lists: () => [...queryKeys.ledgerAccounts.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.ledgerAccounts.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.ledgerAccounts.all, "detail", id] as const,
  },

  accountGroups: {
    all: ["accountGroups"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.accountGroups.all, "list", params] as const,
  },

  banks: {
    all: ["banks"] as const,
    lists: () => [...queryKeys.banks.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.banks.lists(), params] as const,
    detail: (id: number) => [...queryKeys.banks.all, "detail", id] as const,
  },

  invoices: {
    all: ["invoices"] as const,
    lists: () => [...queryKeys.invoices.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.invoices.lists(), params] as const,
    detail: (id: number) => [...queryKeys.invoices.all, "detail", id] as const,
  },

  quotations: {
    all: ["quotations"] as const,
    lists: () => [...queryKeys.quotations.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.quotations.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.quotations.all, "detail", id] as const,
  },

  purchaseOrders: {
    all: ["purchaseOrders"] as const,
    lists: () => [...queryKeys.purchaseOrders.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.purchaseOrders.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.purchaseOrders.all, "detail", id] as const,
  },

  reconciliation: {
    all: ["reconciliation"] as const,
    lists: () => [...queryKeys.reconciliation.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.reconciliation.lists(), params] as const,
  },

  // ── CRM ────────────────────────────────────────────────────────────────────
  customers: {
    all: ["customers"] as const,
    lists: () => [...queryKeys.customers.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.customers.lists(), params] as const,
    detail: (id: number) => [...queryKeys.customers.all, "detail", id] as const,
  },

  vendors: {
    all: ["vendors"] as const,
    lists: () => [...queryKeys.vendors.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.vendors.lists(), params] as const,
    detail: (id: number) => [...queryKeys.vendors.all, "detail", id] as const,
  },

  // ── Payroll ────────────────────────────────────────────────────────────────
  employees: {
    all: ["employees"] as const,
    lists: () => [...queryKeys.employees.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.employees.lists(), params] as const,
    detail: (id: number) => [...queryKeys.employees.all, "detail", id] as const,
  },

  departments: {
    all: ["departments"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.departments.all, "list", params] as const,
  },

  positions: {
    all: ["positions"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.positions.all, "list", params] as const,
  },

  salaryComponents: {
    all: ["salaryComponents"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.salaryComponents.all, "list", params] as const,
  },

  attendance: {
    all: ["attendance"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.attendance.all, "list", params] as const,
  },

  payrollProcessing: {
    all: ["payrollProcessing"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.payrollProcessing.all, "list", params] as const,
    detail: (id: number) =>
      [...queryKeys.payrollProcessing.all, "detail", id] as const,
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  reports: {
    all: ["reports"] as const,
    financial: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "financial", params] as const,
    inventory: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "inventory", params] as const,
    sales: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "sales", params] as const,
    payroll: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "payroll", params] as const,
    crm: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "crm", params] as const,
    audit: (params?: Record<string, any>) =>
      [...queryKeys.reports.all, "audit", params] as const,
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => [...queryKeys.dashboard.all, "summary"] as const,
    widgets: (params?: Record<string, any>) =>
      [...queryKeys.dashboard.all, "widgets", params] as const,
  },
} as const;
