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
