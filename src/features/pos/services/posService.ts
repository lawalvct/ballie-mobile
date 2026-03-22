// ── POS API Service ──────────────────────────────────────────────────────────
import apiClient from "../../../api/client";
import type {
  SessionCheckResponse,
  CashRegister,
  CashRegisterSession,
  OpenSessionPayload,
  CloseSessionPayload,
  CloseSessionResponse,
  PosInitData,
  PosProduct,
  PosCategory,
  PosCustomer,
  PaymentMethod,
  CreateSalePayload,
  CreateSaleResponse,
  TransactionListItem,
  TransactionDetail,
  TransactionListFilters,
  ReceiptData,
  DailySalesReport,
  DailyReportFilters,
  TopProduct,
  TopProductsFilters,
  Pagination,
} from "../types";

const BASE = "/pos";

function buildQuery(params: Record<string, any>): string {
  const clean: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      clean[key] = String(value);
    }
  });
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const posService = {
  // ── Session Management ─────────────────────────────────────────────────────
  checkSession: async (): Promise<SessionCheckResponse> => {
    return apiClient.get(`${BASE}/session`);
  },

  listRegisters: async (): Promise<{ success: boolean; data: CashRegister[] }> => {
    return apiClient.get(`${BASE}/cash-registers`);
  },

  openSession: async (
    payload: OpenSessionPayload,
  ): Promise<{ success: boolean; message: string; session: CashRegisterSession }> => {
    return apiClient.post(`${BASE}/session/open`, payload);
  },

  closeSession: async (
    payload: CloseSessionPayload,
  ): Promise<CloseSessionResponse> => {
    return apiClient.post(`${BASE}/session/close`, payload);
  },

  // ── Init Data ──────────────────────────────────────────────────────────────
  getInitData: async (): Promise<{ success: boolean; data: PosInitData }> => {
    return apiClient.get(`${BASE}/init`);
  },

  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: async (
    params: { search?: string; category_id?: number; in_stock?: boolean; page?: number; per_page?: number } = {},
  ): Promise<{ success: boolean; data: PosProduct[]; meta: Pagination }> => {
    return apiClient.get(`${BASE}/products${buildQuery(params)}`);
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  getCategories: async (): Promise<{ success: boolean; data: PosCategory[] }> => {
    return apiClient.get(`${BASE}/categories`);
  },

  // ── Customers ──────────────────────────────────────────────────────────────
  getCustomers: async (
    params: { search?: string } = {},
  ): Promise<{ success: boolean; data: PosCustomer[] }> => {
    return apiClient.get(`${BASE}/customers${buildQuery(params)}`);
  },

  // ── Payment Methods ────────────────────────────────────────────────────────
  getPaymentMethods: async (): Promise<{ success: boolean; data: PaymentMethod[] }> => {
    return apiClient.get(`${BASE}/payment-methods`);
  },

  // ── Sales ──────────────────────────────────────────────────────────────────
  createSale: async (payload: CreateSalePayload): Promise<CreateSaleResponse> => {
    return apiClient.post(`${BASE}/sales`, payload);
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  listTransactions: async (
    filters: TransactionListFilters = {},
  ): Promise<{ success: boolean; data: TransactionListItem[]; meta: Pagination }> => {
    return apiClient.get(`${BASE}/transactions${buildQuery(filters)}`);
  },

  getTransaction: async (
    id: number,
  ): Promise<{ success: boolean; data: TransactionDetail }> => {
    return apiClient.get(`${BASE}/transactions/${id}`);
  },

  voidSale: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post(`${BASE}/transactions/${id}/void`);
  },

  refundSale: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post(`${BASE}/transactions/${id}/refund`);
  },

  // ── Receipts ───────────────────────────────────────────────────────────────
  getReceipt: async (
    saleId: number,
  ): Promise<{ success: boolean; data: ReceiptData }> => {
    return apiClient.get(`${BASE}/transactions/${saleId}/receipt`);
  },

  emailReceipt: async (
    saleId: number,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post(`${BASE}/transactions/${saleId}/email`);
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  getDailySales: async (
    filters: DailyReportFilters = {},
  ): Promise<{ success: boolean; data: DailySalesReport }> => {
    return apiClient.get(`${BASE}/reports/daily-sales${buildQuery(filters)}`);
  },

  getTopProducts: async (
    filters: TopProductsFilters = {},
  ): Promise<{ success: boolean; data: TopProduct[] }> => {
    return apiClient.get(`${BASE}/reports/top-products${buildQuery(filters)}`);
  },
};
