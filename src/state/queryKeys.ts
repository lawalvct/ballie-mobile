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
    statistics: () => [...queryKeys.vouchers.all, "statistics"] as const,
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
    statistics: () => [...queryKeys.ledgerAccounts.all, "statistics"] as const,
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
    statistics: () => [...queryKeys.banks.all, "statistics"] as const,
  },

  invoices: {
    all: ["invoices"] as const,
    lists: () => [...queryKeys.invoices.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.invoices.lists(), params] as const,
    detail: (id: number) => [...queryKeys.invoices.all, "detail", id] as const,
    statistics: () => [...queryKeys.invoices.all, "statistics"] as const,
    formData: (type: "sales" | "purchase") =>
      [...queryKeys.invoices.all, "formData", type] as const,
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
    detail: (id: number) =>
      [...queryKeys.reconciliation.all, "detail", id] as const,
    statistics: () => [...queryKeys.reconciliation.all, "statistics"] as const,
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

  // ── E-commerce ──────────────────────────────────────────────────────────────
  ecommerce: {
    all: ["ecommerce"] as const,
    settings: () => [...queryKeys.ecommerce.all, "settings"] as const,
    qrCode: () => [...queryKeys.ecommerce.all, "qrCode"] as const,
    orders: {
      all: () => [...queryKeys.ecommerce.all, "orders"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.orders.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.ecommerce.orders.all(), "detail", id] as const,
    },
    shippingMethods: {
      all: () => [...queryKeys.ecommerce.all, "shippingMethods"] as const,
      list: () =>
        [...queryKeys.ecommerce.shippingMethods.all(), "list"] as const,
      detail: (id: number) =>
        [...queryKeys.ecommerce.shippingMethods.all(), "detail", id] as const,
    },
    coupons: {
      all: () => [...queryKeys.ecommerce.all, "coupons"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.coupons.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.ecommerce.coupons.all(), "detail", id] as const,
    },
    payouts: {
      all: () => [...queryKeys.ecommerce.all, "payouts"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.payouts.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.ecommerce.payouts.all(), "detail", id] as const,
      formData: () =>
        [...queryKeys.ecommerce.payouts.all(), "formData"] as const,
    },
    reports: {
      all: () => [...queryKeys.ecommerce.all, "reports"] as const,
      orders: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.reports.all(), "orders", params] as const,
      revenue: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.reports.all(), "revenue", params] as const,
      products: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.reports.all(), "products", params] as const,
      customers: (params?: Record<string, any>) =>
        [...queryKeys.ecommerce.reports.all(), "customers", params] as const,
      abandonedCarts: (params?: Record<string, any>) =>
        [
          ...queryKeys.ecommerce.reports.all(),
          "abandonedCarts",
          params,
        ] as const,
    },
  },

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    users: {
      all: () => [...queryKeys.admin.all, "users"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.admin.users.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.admin.users.all(), "detail", id] as const,
      formData: () => [...queryKeys.admin.users.all(), "formData"] as const,
    },
    roles: {
      all: () => [...queryKeys.admin.all, "roles"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.admin.roles.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.admin.roles.all(), "detail", id] as const,
      formData: () => [...queryKeys.admin.roles.all(), "formData"] as const,
    },
    permissions: () => [...queryKeys.admin.all, "permissions"] as const,
    permissionMatrix: () =>
      [...queryKeys.admin.all, "permissionMatrix"] as const,
  },

  // ── Audit ───────────────────────────────────────────────────────────────────
  audit: {
    all: ["audit"] as const,
    dashboard: (params?: Record<string, any>) =>
      [...queryKeys.audit.all, "dashboard", params] as const,
    trail: (model: string, id: number) =>
      [...queryKeys.audit.all, "trail", model, id] as const,
  },

  // ── Tax / Statutory ────────────────────────────────────────────────────────
  tax: {
    all: ["tax"] as const,
    dashboard: () => [...queryKeys.tax.all, "dashboard"] as const,
    vatReport: (params?: Record<string, any>) =>
      [...queryKeys.tax.all, "vatReport", params] as const,
    payeReport: (params?: Record<string, any>) =>
      [...queryKeys.tax.all, "payeReport", params] as const,
    pensionReport: (params?: Record<string, any>) =>
      [...queryKeys.tax.all, "pensionReport", params] as const,
    nsitfReport: (params?: Record<string, any>) =>
      [...queryKeys.tax.all, "nsitfReport", params] as const,
    settings: () => [...queryKeys.tax.all, "settings"] as const,
    filings: {
      all: () => [...queryKeys.tax.all, "filings"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.tax.filings.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.tax.filings.all(), "detail", id] as const,
    },
  },

  // ── POS ─────────────────────────────────────────────────────────────────────
  pos: {
    all: ["pos"] as const,
    session: () => [...queryKeys.pos.all, "session"] as const,
    registers: () => [...queryKeys.pos.all, "registers"] as const,
    initData: () => [...queryKeys.pos.all, "initData"] as const,
    products: (params?: Record<string, any>) =>
      [...queryKeys.pos.all, "products", params] as const,
    categories: () => [...queryKeys.pos.all, "categories"] as const,
    customers: (params?: Record<string, any>) =>
      [...queryKeys.pos.all, "customers", params] as const,
    paymentMethods: () => [...queryKeys.pos.all, "paymentMethods"] as const,
    transactions: {
      all: () => [...queryKeys.pos.all, "transactions"] as const,
      list: (params?: Record<string, any>) =>
        [...queryKeys.pos.transactions.all(), "list", params] as const,
      detail: (id: number) =>
        [...queryKeys.pos.transactions.all(), "detail", id] as const,
      receipt: (id: number) =>
        [...queryKeys.pos.transactions.all(), "receipt", id] as const,
    },
    reports: {
      all: () => [...queryKeys.pos.all, "reports"] as const,
      daily: (params?: Record<string, any>) =>
        [...queryKeys.pos.reports.all(), "daily", params] as const,
      topProducts: (params?: Record<string, any>) =>
        [...queryKeys.pos.reports.all(), "topProducts", params] as const,
    },
  },

  // ── Projects ─────────────────────────────────────────────────────────────────
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (params?: Record<string, any>) =>
      [...queryKeys.projects.lists(), params] as const,
    detail: (id: number) =>
      [...queryKeys.projects.all, "detail", id] as const,
    formData: () => [...queryKeys.projects.all, "formData"] as const,
    reports: () => [...queryKeys.projects.all, "reports"] as const,
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => [...queryKeys.dashboard.all, "summary"] as const,
    widgets: (params?: Record<string, any>) =>
      [...queryKeys.dashboard.all, "widgets", params] as const,
  },
} as const;
