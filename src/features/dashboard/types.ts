import type { ApiResponse } from "../../api/types";

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export interface DashboardData {
  metrics: DashboardMetrics;
  counts: DashboardCounts;
  balances: AccountBalances;
  charts: DashboardCharts;
  inventory: InventoryStats;
  pos: POSStats;
  alerts: Alert[];
  top_products: TopProduct[];
  top_customers: TopCustomer[];
  outstanding_invoices: OutstandingInvoices;
  recent_transactions: Transaction[];
  business_category: BusinessCategory;
  terminology: Record<string, string | null>;
  enabled_modules: EnabledModules;
  show_tour: boolean;
}

export type BusinessCategory = "trading" | "manufacturing" | "service" | "hybrid";

// ─── Metrics ─────────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;
  monthly_expenses: number;
  monthly_purchase: number;
  net_profit: number;
  total_sales_count: number;
  monthly_receipts: number;
}

export interface DashboardCounts {
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  total_products: number;
}

export interface AccountBalances {
  cash_balance: number;
  receivables: number;
  payables: number;
}

// ─── Charts ──────────────────────────────────────────────────────────────────
export interface DashboardCharts {
  revenue_vs_expenses: RevenueVsExpensesChart;
  revenue_breakdown: RevenueBreakdownItem[];
  daily_revenue: DailyRevenuePoint[];
}

export interface RevenueVsExpensesChart {
  labels: string[];
  revenue: number[];
  expenses: number[];
}

export interface RevenueBreakdownItem {
  name: string;
  code: string;
  total: number;
}

export interface DailyRevenuePoint {
  date: string;
  date_iso: string;
  amount: number;
}

// ─── Lists ───────────────────────────────────────────────────────────────────
export interface TopProduct {
  product_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  spent: number;
  outstanding: number;
}

export interface Transaction {
  id: number;
  number: string;
  type: string;
  type_code: string;
  amount: number;
  date: string;
  narration: string | null;
}

export interface OutstandingInvoices {
  count: number;
  total: number;
  items: OutstandingInvoiceItem[];
}

export interface OutstandingInvoiceItem {
  id: number;
  number: string;
  amount: number;
  date: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export interface Alert {
  type: "low_stock" | "out_of_stock" | "receivables";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  count?: number;
  amount?: number;
}

// ─── Module Stats ────────────────────────────────────────────────────────────
export interface InventoryStats {
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface POSStats {
  today_sales: number;
  today_sales_count: number;
}

export interface EnabledModules {
  inventory: boolean;
  crm: boolean;
  pos: boolean;
  payroll: boolean;
  banking: boolean;
  ecommerce: boolean;
  projects: boolean;
  procurement: boolean;
}

// ─── Response Types ──────────────────────────────────────────────────────────
export type DashboardResponse = ApiResponse<DashboardData>;
export type SummaryResponse = ApiResponse<DashboardMetrics & DashboardCounts>;
export type BalancesResponse = ApiResponse<AccountBalances>;
export type TopProductsResponse = ApiResponse<{ top_products: TopProduct[] }>;
export type TopCustomersResponse = ApiResponse<{ top_customers: TopCustomer[] }>;
export type TransactionsResponse = ApiResponse<{ transactions: Transaction[] }>;
export type OutstandingInvoicesResponse = ApiResponse<OutstandingInvoices>;
export type AlertsResponse = ApiResponse<{ alerts: Alert[] }>;
export type POSTodayResponse = ApiResponse<POSStats>;
export type InventoryStatsResponse = ApiResponse<InventoryStats>;
export type RevenueChartResponse = ApiResponse<{ chart: RevenueVsExpensesChart }>;
export type DailyRevenueResponse = ApiResponse<{ daily_revenue: DailyRevenuePoint[] }>;
export type RevenueBreakdownResponse = ApiResponse<{ breakdown: RevenueBreakdownItem[] }>;
