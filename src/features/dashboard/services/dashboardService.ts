import apiClient from "../../../api/client";
import type {
  DashboardResponse,
  SummaryResponse,
  BalancesResponse,
  TopProductsResponse,
  TopCustomersResponse,
  TransactionsResponse,
  OutstandingInvoicesResponse,
  AlertsResponse,
  POSTodayResponse,
  InventoryStatsResponse,
  RevenueChartResponse,
  DailyRevenueResponse,
  RevenueBreakdownResponse,
} from "../types";

const BASE = "/dashboard";

export const dashboardService = {
  /** Full dashboard — all data in one call */
  getAll: () => apiClient.get<DashboardResponse>(BASE),

  /** Metric cards only */
  getSummary: () => apiClient.get<SummaryResponse>(`${BASE}/summary`),

  /** 6-month revenue vs expenses chart */
  getRevenueChart: () => apiClient.get<RevenueChartResponse>(`${BASE}/revenue-chart`),

  /** Daily revenue sparkline */
  getDailyRevenue: (days = 14) =>
    apiClient.get<DailyRevenueResponse>(`${BASE}/daily-revenue`, { params: { days } }),

  /** Revenue breakdown (doughnut) */
  getRevenueBreakdown: () =>
    apiClient.get<RevenueBreakdownResponse>(`${BASE}/revenue-breakdown`),

  /** Account balances */
  getBalances: () => apiClient.get<BalancesResponse>(`${BASE}/balances`),

  /** Top selling products */
  getTopProducts: (limit = 5) =>
    apiClient.get<TopProductsResponse>(`${BASE}/top-products`, { params: { limit } }),

  /** Top customers */
  getTopCustomers: (limit = 5) =>
    apiClient.get<TopCustomersResponse>(`${BASE}/top-customers`, { params: { limit } }),

  /** Recent transactions */
  getRecentTransactions: (limit = 8) =>
    apiClient.get<TransactionsResponse>(`${BASE}/recent-transactions`, {
      params: { limit },
    }),

  /** Outstanding invoices */
  getOutstandingInvoices: () =>
    apiClient.get<OutstandingInvoicesResponse>(`${BASE}/outstanding-invoices`),

  /** System alerts */
  getAlerts: () => apiClient.get<AlertsResponse>(`${BASE}/alerts`),

  /** POS today sales */
  getPOSToday: () => apiClient.get<POSTodayResponse>(`${BASE}/pos-today`),

  /** Inventory stats */
  getInventoryStats: () =>
    apiClient.get<InventoryStatsResponse>(`${BASE}/inventory-stats`),

  /** Dismiss onboarding tour */
  dismissTour: () => apiClient.post(`${BASE}/dismiss-tour`),
};
