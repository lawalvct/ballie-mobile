// E-commerce API Service
import apiClient from "../../../api/client";
import type {
  EcommerceSettings,
  OrderListItem,
  OrderStats,
  OrderDetail,
  OrderListParams,
  OrderStatus,
  PaymentStatus,
  ShippingMethod,
  ShippingMethodForm,
  Coupon,
  CouponDetail,
  CouponForm,
  CouponListParams,
  PayoutStats,
  PayoutSettings,
  PayoutListItem,
  PayoutDetail,
  PayoutForm,
  PayoutFormData,
  DeductionPreview,
  DateRangeParams,
  Pagination,
} from "../types";

const BASE = "/ecommerce";

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

export const ecommerceService = {
  // ── Settings ──────────────────────────────────────────────────

  getSettings: async (): Promise<{ data: EcommerceSettings }> => {
    return apiClient.get(`${BASE}/settings`);
  },

  updateSettings: async (
    data: FormData,
  ): Promise<{ data: EcommerceSettings; message: string }> => {
    return apiClient.post(`${BASE}/settings`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getQrCode: async (): Promise<{
    data: { qr_code_svg: string; store_url: string };
  }> => {
    return apiClient.get(`${BASE}/settings/qr-code`);
  },

  // ── Orders ────────────────────────────────────────────────────

  listOrders: async (
    params: OrderListParams = {},
  ): Promise<{
    data: OrderListItem[];
    stats: OrderStats;
    pagination: Pagination;
  }> => {
    return apiClient.get(`${BASE}/orders${buildQuery(params)}`);
  },

  showOrder: async (id: number): Promise<{ data: OrderDetail }> => {
    return apiClient.get(`${BASE}/orders/${id}`);
  },

  updateOrderStatus: async (
    id: number,
    status: OrderStatus,
  ): Promise<{ data: any; message: string }> => {
    return apiClient.put(`${BASE}/orders/${id}/status`, { status });
  },

  updatePaymentStatus: async (
    id: number,
    payment_status: PaymentStatus,
  ): Promise<{ data: any; message: string }> => {
    return apiClient.put(`${BASE}/orders/${id}/payment-status`, {
      payment_status,
    });
  },

  createInvoice: async (
    id: number,
  ): Promise<{
    data: { voucher_id: number; voucher_number: string };
    message: string;
  }> => {
    return apiClient.post(`${BASE}/orders/${id}/invoice`);
  },

  // ── Shipping Methods ──────────────────────────────────────────

  listShippingMethods: async (): Promise<{ data: ShippingMethod[] }> => {
    return apiClient.get(`${BASE}/shipping-methods`);
  },

  showShippingMethod: async (id: number): Promise<{ data: ShippingMethod }> => {
    return apiClient.get(`${BASE}/shipping-methods/${id}`);
  },

  createShippingMethod: async (
    data: ShippingMethodForm,
  ): Promise<{ data: ShippingMethod; message: string }> => {
    return apiClient.post(`${BASE}/shipping-methods`, data);
  },

  updateShippingMethod: async (
    id: number,
    data: ShippingMethodForm,
  ): Promise<{ data: ShippingMethod; message: string }> => {
    return apiClient.put(`${BASE}/shipping-methods/${id}`, data);
  },

  deleteShippingMethod: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`${BASE}/shipping-methods/${id}`);
  },

  toggleShippingMethod: async (
    id: number,
  ): Promise<{ data: { is_active: boolean }; message: string }> => {
    return apiClient.post(`${BASE}/shipping-methods/${id}/toggle`);
  },

  // ── Coupons ───────────────────────────────────────────────────

  listCoupons: async (
    params: CouponListParams = {},
  ): Promise<{ data: Coupon[]; pagination: Pagination }> => {
    return apiClient.get(`${BASE}/coupons${buildQuery(params)}`);
  },

  showCoupon: async (id: number): Promise<{ data: CouponDetail }> => {
    return apiClient.get(`${BASE}/coupons/${id}`);
  },

  createCoupon: async (
    data: CouponForm,
  ): Promise<{ data: Coupon; message: string }> => {
    return apiClient.post(`${BASE}/coupons`, data);
  },

  updateCoupon: async (
    id: number,
    data: Partial<CouponForm>,
  ): Promise<{ data: Coupon; message: string }> => {
    return apiClient.put(`${BASE}/coupons/${id}`, data);
  },

  deleteCoupon: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`${BASE}/coupons/${id}`);
  },

  toggleCoupon: async (
    id: number,
  ): Promise<{ data: { is_active: boolean }; message: string }> => {
    return apiClient.post(`${BASE}/coupons/${id}/toggle`);
  },

  // ── Payouts ───────────────────────────────────────────────────

  listPayouts: async (
    params: { per_page?: number; page?: number } = {},
  ): Promise<{
    data: {
      stats: PayoutStats;
      settings: PayoutSettings;
      payouts: PayoutListItem[];
    };
    pagination: Pagination;
  }> => {
    return apiClient.get(`${BASE}/payouts${buildQuery(params)}`);
  },

  getPayoutFormData: async (): Promise<{ data: PayoutFormData }> => {
    return apiClient.get(`${BASE}/payouts/create`);
  },

  calculateDeduction: async (
    amount: number,
  ): Promise<{ data: DeductionPreview }> => {
    return apiClient.post(`${BASE}/payouts/calculate-deduction`, { amount });
  },

  submitPayout: async (
    data: PayoutForm,
  ): Promise<{ data: PayoutListItem; message: string }> => {
    return apiClient.post(`${BASE}/payouts`, data);
  },

  showPayout: async (id: number): Promise<{ data: PayoutDetail }> => {
    return apiClient.get(`${BASE}/payouts/${id}`);
  },

  cancelPayout: async (
    id: number,
  ): Promise<{ data: { status: string }; message: string }> => {
    return apiClient.post(`${BASE}/payouts/${id}/cancel`);
  },

  // ── Reports ───────────────────────────────────────────────────

  getOrderReport: async (
    params: DateRangeParams = {},
  ): Promise<{ data: any; filters: any }> => {
    return apiClient.get(`${BASE}/reports/orders${buildQuery(params)}`);
  },

  getRevenueReport: async (
    params: DateRangeParams = {},
  ): Promise<{ data: any; filters: any }> => {
    return apiClient.get(`${BASE}/reports/revenue${buildQuery(params)}`);
  },

  getProductReport: async (
    params: DateRangeParams = {},
  ): Promise<{ data: any; filters: any }> => {
    return apiClient.get(`${BASE}/reports/products${buildQuery(params)}`);
  },

  getCustomerReport: async (
    params: DateRangeParams = {},
  ): Promise<{ data: any; filters: any }> => {
    return apiClient.get(`${BASE}/reports/customers${buildQuery(params)}`);
  },

  getAbandonedCartReport: async (
    params: DateRangeParams = {},
  ): Promise<{ data: any; filters: any }> => {
    return apiClient.get(
      `${BASE}/reports/abandoned-carts${buildQuery(params)}`,
    );
  },
};
