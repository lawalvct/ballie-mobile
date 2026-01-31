export type ReportGroupBy = "day" | "week" | "month";

export type ReportPeriodType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export type ReportCompareWith = "previous_period" | "previous_year";

export interface SalesSummaryResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    group_by?: ReportGroupBy;
  };
  summary?: {
    total_sales?: number;
    sales_count?: number;
    average_sale_value?: number;
  };
  top_products?: Array<{
    product_id?: number;
    product_name?: string;
    total_quantity?: number;
    total_amount?: number;
  }>;
  top_customers?: Array<{
    id?: number;
    name?: string;
    total_sales?: number;
    invoice_count?: number;
  }>;
  trend?: Array<{
    period?: string;
    label?: string;
    total_sales?: number;
    invoice_count?: number;
  }>;
  payment_status?: {
    total_sales?: number;
    received?: number;
    outstanding?: number;
  };
  previous_period?: {
    previous_from?: string;
    previous_to?: string;
    previous_sales?: number;
    current_sales?: number;
    growth_rate?: number;
  };
}

export interface PurchaseSummaryResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    group_by?: ReportGroupBy;
  };
  summary?: {
    total_purchases?: number;
    purchase_count?: number;
    average_purchase_value?: number;
  };
  top_products?: Array<{
    product_id?: number;
    product_name?: string;
    total_quantity?: number;
    total_amount?: number;
  }>;
  top_vendors?: Array<{
    id?: number;
    name?: string;
    total_purchases?: number;
    invoice_count?: number;
  }>;
  trend?: Array<{
    period?: string;
    label?: string;
    total_purchases?: number;
    invoice_count?: number;
  }>;
  payment_status?: {
    total_purchases?: number;
    paid?: number;
    outstanding?: number;
  };
  previous_period?: {
    previous_from?: string;
    previous_to?: string;
    previous_purchases?: number;
    current_purchases?: number;
    growth_rate?: number;
  };
}

export interface ReportRecordResponse<T> {
  records?:
    | {
        data?: T[];
        total?: number;
        current_page?: number;
        per_page?: number;
      }
    | T[];
  summary?: any;
}

export interface SalesCustomerRecord {
  id?: number;
  name?: string;
  total_sales?: number;
  invoice_count?: number;
}

export interface SalesProductRecord {
  product_id?: number;
  product_name?: string;
  total_quantity?: number;
  total_revenue?: number;
  total_cost?: number;
  total_profit?: number;
}

export interface PurchaseVendorRecord {
  id?: number;
  name?: string;
  total_purchases?: number;
  invoice_count?: number;
}

export interface PurchaseProductRecord {
  product_id?: number;
  product_name?: string;
  total_quantity?: number;
  total_cost?: number;
}

export interface PeriodRecord {
  period?: string;
  label?: string;
  total_sales?: number;
  total_purchases?: number;
  invoice_count?: number;
  growth_rate?: number;
}

export interface PeriodReportResponse {
  records?: PeriodRecord[];
  summary?: {
    best_period?: string;
    worst_period?: string;
  };
}

export interface ProfitLossAccountRecord {
  account_id?: number;
  name?: string;
  code?: string;
  amount?: number;
}

export interface ProfitLossReportResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    compare?: boolean;
  };
  summary?: {
    total_income?: number;
    total_expenses?: number;
    net_profit?: number;
    profit_margin?: number;
  };
  income?: ProfitLossAccountRecord[];
  expenses?: ProfitLossAccountRecord[];
  stock?: {
    opening_stock?: number;
    closing_stock?: number;
  };
  compare?: {
    previous_from?: string;
    previous_to?: string;
    total_income?: number;
    total_expenses?: number;
    net_profit?: number;
    profit_margin?: number;
  };
}

export interface BalanceSheetAccountRecord {
  account_id?: number;
  name?: string;
  code?: string;
  balance?: number;
}

export interface BalanceSheetReportResponse {
  filters?: {
    as_of_date?: string;
    compare?: boolean;
  };
  assets?: BalanceSheetAccountRecord[];
  liabilities?: BalanceSheetAccountRecord[];
  equity?: BalanceSheetAccountRecord[];
  summary?: {
    total_assets?: number;
    total_liabilities?: number;
    total_equity?: number;
    total_liabilities_and_equity?: number;
    retained_earnings?: number;
    balance_check?: boolean;
  };
  compare?: {
    as_of_date?: string;
    total_assets?: number;
    total_liabilities?: number;
    total_equity?: number;
  };
}

export interface TrialBalanceRecord {
  account_id?: number;
  code?: string;
  name?: string;
  account_type?: string;
  group?: string;
  opening_balance?: number;
  current_balance?: number;
  debit_amount?: number;
  credit_amount?: number;
}

export interface TrialBalanceReportResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    as_of_date?: string | null;
  };
  summary?: {
    total_debits?: number;
    total_credits?: number;
    difference?: number;
    balanced?: boolean;
  };
  records?: TrialBalanceRecord[];
}

export interface CashFlowRecord {
  description?: string;
  amount?: number;
  type?: string;
}

export interface CashFlowReportResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
  };
  operating?: CashFlowRecord[];
  investing?: CashFlowRecord[];
  financing?: CashFlowRecord[];
  summary?: {
    operating_total?: number;
    investing_total?: number;
    financing_total?: number;
    net_cash_flow?: number;
    opening_cash?: number;
    closing_cash?: number;
    calculated_closing_cash?: number;
  };
}

export type CrmActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task"
  | "follow_up";

export type CrmActivityStatus = "pending" | "completed" | "cancelled";

export interface CrmCustomerOption {
  id?: number;
  name?: string;
  customer_type?: string;
}

export interface CrmActivityRecord {
  id?: number;
  customer?: {
    id?: number;
    name?: string;
  };
  activity_type?: CrmActivityType | string;
  subject?: string;
  description?: string;
  activity_date?: string;
  status?: CrmActivityStatus | string;
  user?: {
    id?: number;
    name?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CustomerActivitiesReportResponse {
  filters?: {
    customer_id?: number;
    activity_type?: CrmActivityType | string;
    status?: CrmActivityStatus | string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
  records?: {
    data?: CrmActivityRecord[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  customers?: CrmCustomerOption[];
}

export interface CustomerStatementRecord {
  id?: number;
  customer_code?: string;
  name?: string;
  email?: string;
  phone?: string;
  customer_type?: "individual" | "business" | string;
  status?: "active" | "inactive" | string;
  total_debits?: number;
  total_credits?: number;
  running_balance?: number;
  current_balance?: number;
  balance_type?: "dr" | "cr" | string;
  last_activity_at?: string;
  ledger_account_id?: number;
}

export interface CustomerStatementsReportResponse {
  filters?: {
    search?: string;
    customer_type?: "individual" | "business" | string;
    status?: "active" | "inactive" | string;
    sort?: string;
    direction?: "asc" | "desc" | string;
    date_from?: string;
    date_to?: string;
  };
  summary?: {
    total_customers?: number;
    total_receivable?: number;
    total_payable?: number;
    net_balance?: number;
  };
  records?: {
    data?: CustomerStatementRecord[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface CrmPaymentRecord {
  id?: number;
  voucher_id?: number;
  voucher_number?: string;
  voucher_date?: string;
  ledger_account_id?: number;
  ledger_account_name?: string;
  amount?: number;
}

export interface PaymentReportsResponse {
  filters?: {
    start_date?: string;
    end_date?: string;
  };
  summary?: {
    total_payments?: number;
    payment_count?: number;
  };
  records?: CrmPaymentRecord[];
}

export interface InventoryCategoryOption {
  id?: number;
  name?: string;
}

export interface InventoryProductOption {
  id?: number;
  name?: string;
}

export interface StockSummaryRecord {
  id?: number;
  name?: string;
  category?: InventoryCategoryOption;
  primary_unit?: {
    abbreviation?: string;
  };
  calculated_stock?: number;
  calculated_value?: number;
  average_rate?: number;
  status_flag?: string;
}

export interface StockSummaryReportResponse {
  filters?: {
    as_of_date?: string;
    category_id?: number | null;
    stock_status?: string;
    sort_by?: string;
    sort_order?: string;
    search?: string | null;
  };
  summary?: {
    total_products?: number;
    total_stock_value?: number;
    total_stock_quantity?: number;
    out_of_stock_count?: number;
    low_stock_count?: number;
  };
  categories?: InventoryCategoryOption[];
  records?: { data?: StockSummaryRecord[] } | StockSummaryRecord[];
}

export interface LowStockAlertRecord {
  id?: number;
  name?: string;
  calculated_stock?: number;
  reorder_level?: number;
  shortage_quantity?: number;
  shortage_percentage?: number;
  alert_level?: string;
  alert_status?: string;
}

export interface LowStockAlertReportResponse {
  filters?: {
    as_of_date?: string;
    category_id?: number | null;
    alert_type?: string;
    search?: string | null;
  };
  summary?: {
    total_alerts?: number;
    critical_alerts?: number;
    warning_alerts?: number;
    out_of_stock_count?: number;
    estimated_reorder_value?: number;
  };
  categories?: InventoryCategoryOption[];
  records?: { data?: LowStockAlertRecord[] } | LowStockAlertRecord[];
}

export interface StockValuationItemRecord {
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    unit?: string;
  };
  quantity?: number;
  value?: number;
  average_rate?: number;
  category_name?: string;
}

export interface StockValuationReportResponse {
  filters?: {
    as_of_date?: string;
    category_id?: number | null;
    valuation_method?: string;
    group_by?: string;
    search?: string | null;
  };
  summary?: {
    total_products?: number;
    total_stock_value?: number;
    total_quantity?: number;
    average_value?: number;
  };
  top_value_products?: StockValuationItemRecord[];
  records?: { data?: StockValuationItemRecord[] } | StockValuationItemRecord[];
  categories?: InventoryCategoryOption[];
}

export interface StockMovementRecord {
  id?: number;
  transaction_date?: string;
  quantity?: number;
  rate?: number;
  reference?: string;
  product_name?: string;
  category_name?: string;
  created_by?: string;
}

export interface StockMovementReportResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    product_id?: number | null;
    category_id?: number | null;
    movement_type?: string;
  };
  summary?: {
    total_in?: number;
    total_out?: number;
    net_movement?: number;
    total_in_value?: number;
    total_out_value?: number;
    transaction_count?: number;
  };
  products?: InventoryProductOption[];
  categories?: InventoryCategoryOption[];
  records?: { data?: StockMovementRecord[] } | StockMovementRecord[];
}

export interface BinCardRecord {
  date?: string;
  particulars?: string;
  vch_type?: string;
  vch_no?: string;
  in_qty?: number;
  in_value?: number;
  out_qty?: number;
  out_value?: number;
  closing_qty?: number;
  closing_value?: number;
  created_by?: string;
}

export interface BinCardReportResponse {
  filters?: {
    from_date?: string;
    to_date?: string;
    product_id?: number | null;
  };
  summary?: {
    opening_qty?: number;
    opening_value?: number;
    total_in_qty?: number;
    total_out_qty?: number;
    total_in_value?: number;
    total_out_value?: number;
  };
  products?: InventoryProductOption[];
  records?: { data?: BinCardRecord[] } | BinCardRecord[];
}

export interface PayrollSummaryReportResponse {
  filters?: {
    year?: number;
    month?: number | null;
    status?: string | null;
  };
  summary?: {
    total_periods?: number;
    total_employees?: number;
    total_gross?: number;
    total_deductions?: number;
    total_net?: number;
    total_tax?: number;
    average_per_employee?: number;
  };
  monthly_breakdown?: Array<{
    month?: string;
    periods?: number;
    employees?: number;
    gross?: number;
    deductions?: number;
    net?: number;
    tax?: number;
  }>;
  department_breakdown?: Record<
    string,
    {
      employees?: number;
      gross?: number;
      deductions?: number;
      net?: number;
      tax?: number;
    }
  >;
  periods?: Array<{
    id?: number;
    name?: string;
    start_date?: string;
    end_date?: string;
    pay_date?: string;
    status?: string;
    employees?: number;
    gross?: number;
    deductions?: number;
    net?: number;
  }>;
}

export interface PayrollTaxReportResponse {
  filters?: {
    year?: number;
    month?: number | null;
  };
  summary?: {
    total_employees?: number;
    total_gross?: number;
    total_tax?: number;
    average_tax_rate?: number;
  };
  records?: Array<{
    employee?: {
      id?: number;
      name?: string;
      employee_number?: string;
      department?: string;
      email?: string;
    };
    total_gross?: number;
    total_tax?: number;
    tax_rate?: number;
    run_count?: number;
  }>;
}

export interface PayrollTaxSummaryReportResponse {
  filters?: {
    year?: number;
    month?: number | null;
  };
  summary?: {
    total_tax?: number;
    total_gross?: number;
    total_employees?: number;
    average_tax_rate?: number;
  };
  monthly_breakdown?: Array<{
    month?: string;
    employees?: number;
    gross?: number;
    tax?: number;
    net?: number;
  }>;
  department_breakdown?: Record<
    string,
    {
      employees?: number;
      gross?: number;
      tax?: number;
      net?: number;
    }
  >;
}

export interface PayrollEmployeeSummaryReportResponse {
  filters?: {
    year?: number;
    department_id?: number | null;
  };
  summary?: {
    total_employees?: number;
    total_gross?: number;
    total_deductions?: number;
    total_tax?: number;
    total_net?: number;
  };
  departments?: Array<{ id?: number; name?: string }>;
  records?: Array<{
    employee?: {
      id?: number;
      name?: string;
      employee_number?: string;
      department?: string;
    };
    payroll_count?: number;
    total_gross?: number;
    total_deductions?: number;
    total_tax?: number;
    total_net?: number;
    average_gross?: number;
    average_net?: number;
  }>;
}

export interface PayrollBankScheduleReportResponse {
  filters?: {
    year?: number;
    month?: number | null;
    status?: string | null;
  };
  summary?: {
    total_periods?: number;
    total_employees?: number;
    total_gross?: number;
    total_deductions?: number;
    total_net?: number;
  };
  periods?: Array<{
    id?: number;
    name?: string;
    start_date?: string;
    end_date?: string;
    pay_date?: string;
    employees?: number;
    gross?: number;
    deductions?: number;
    net?: number;
    status?: string;
  }>;
}

export interface PayrollDetailedReportResponse {
  filters?: {
    year?: number;
    month?: number | null;
    department_id?: number | null;
  };
  totals?: {
    gross?: number;
    deductions?: number;
    tax?: number;
    net?: number;
  };
  departments?: Array<{ id?: number; name?: string }>;
  records?: Array<{
    id?: number;
    period?: {
      id?: number;
      name?: string;
      pay_date?: string;
    };
    employee?: {
      id?: number;
      name?: string;
      employee_number?: string;
      department?: string;
    };
    gross?: number;
    deductions?: number;
    tax?: number;
    net?: number;
  }>;
}
