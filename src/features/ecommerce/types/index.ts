// E-commerce Module Type Definitions

// ========================
// Common
// ========================

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ========================
// Settings
// ========================

export interface PaymentMethodsConfig {
  cash_on_delivery: boolean;
  bank_transfer: boolean;
  paystack: boolean;
  flutterwave: boolean;
  stripe: boolean;
  nomba: boolean;
}

export interface EcommerceSettings {
  id: number;
  store_name: string;
  store_description: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
  store_logo_url: string | null;
  store_banner_url: string | null;
  store_url: string;
  currency: string;
  currency_symbol: string;
  tax_enabled: boolean;
  tax_rate: number;
  tax_name: string;
  shipping_enabled: boolean;
  free_shipping_threshold: number | null;
  minimum_order_amount: number | null;
  enable_guest_checkout: boolean;
  enable_customer_registration: boolean;
  enable_order_notifications: boolean;
  auto_confirm_orders: boolean;
  payment_methods: PaymentMethodsConfig;
  paystack_public_key: string | null;
  flutterwave_public_key: string | null;
  stripe_publishable_key: string | null;
  custom_css: string | null;
  custom_js: string | null;
  maintenance_mode: boolean;
  is_store_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ========================
// Orders
// ========================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "partially_paid" | "refunded";

export type PaymentMethod =
  | "cash_on_delivery"
  | "paystack"
  | "stripe"
  | "flutterwave"
  | "nomba"
  | "bank_transfer";

export interface OrderListItem {
  id: number;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  items_count: number;
  has_invoice: boolean;
  created_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  total_revenue: number;
}

export interface OrderCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: number;
    name: string;
    price: number;
  } | null;
}

export interface ShippingAddress {
  id: number;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
}

export interface OrderVoucher {
  id: number;
  voucher_number: string;
  total_amount: number;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code: string | null;
  notes: string | null;
  admin_notes: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
  customer: OrderCustomer | null;
  items: OrderItem[];
  shipping_address: ShippingAddress | null;
  billing_address: ShippingAddress | null;
  voucher: OrderVoucher | null;
}

export interface OrderListParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  search?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

// ========================
// Shipping Methods
// ========================

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  cost: number;
  estimated_days: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ShippingMethodForm {
  name: string;
  description?: string;
  cost: number;
  estimated_days?: number;
  is_active?: boolean;
}

// ========================
// Coupons
// ========================

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  minimum_amount: number | null;
  maximum_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  is_expired: boolean;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
}

export interface CouponUsage {
  id: number;
  discount_amount: number;
  used_at: string;
  customer: { id: number; name: string } | null;
  order: { id: number; order_number: string } | null;
}

export interface CouponDetail extends Coupon {
  updated_at: string;
  usages: CouponUsage[];
}

export interface CouponForm {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface CouponListParams {
  status?: "active" | "inactive" | "expired";
  search?: string;
  per_page?: number;
  page?: number;
}

// ========================
// Payouts
// ========================

export type PayoutStatus =
  | "pending"
  | "approved"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled";

export interface PayoutStats {
  total_revenue: number;
  available_balance: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  this_month_revenue: number;
}

export interface PayoutSettings {
  payouts_enabled: boolean;
  minimum_payout: number;
  maximum_payout: number;
  deduction_type: string;
  deduction_value: number;
  deduction_name: string;
  processing_time: string;
  payout_terms: string;
}

export interface PayoutListItem {
  id: number;
  request_number: string;
  requested_amount: number;
  deduction_amount: number;
  net_amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: PayoutStatus;
  status_color: string;
  status_label: string;
  can_be_cancelled: boolean;
  payment_reference: string | null;
  requester: { id: number; name: string } | null;
  processed_at: string | null;
  created_at: string;
}

export interface PayoutDetail extends PayoutListItem {
  deduction_type: string;
  deduction_rate: number;
  deduction_description: string;
  available_balance: number;
  bank_code: string | null;
  progress_percentage: number;
  notes: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  requester: { id: number; name: string; email: string } | null;
  processor: { id: number; name: string } | null;
  updated_at: string;
}

export interface PayoutForm {
  requested_amount: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_code?: string;
  notes?: string;
}

export interface Bank {
  code: string;
  name: string;
}

export interface DeductionPreview {
  requested_amount: number;
  deduction_amount: number;
  net_amount: number;
  deduction_description: string;
}

export interface PayoutFormData {
  available_balance: number;
  payouts_enabled: boolean;
  minimum_payout: number;
  maximum_payout: number;
  deduction_description: string;
  banks: Bank[];
}

// ========================
// Reports
// ========================

export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

export interface OrderReportStats {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  cancelled_orders: number;
}

export interface RevenueReportStats {
  current_revenue: number;
  previous_revenue: number;
  growth_rate: number;
  total_orders: number;
  average_order_value: number;
}

export interface ProductReportStats {
  total_products_sold: number;
  total_quantity_sold: number;
  total_revenue: number;
  low_stock_count: number;
}

export interface CustomerReportStats {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  guest_orders: number;
  registered_orders: number;
  average_lifetime_value: number;
}

export interface AbandonedCartStats {
  abandoned_carts: number;
  potential_revenue: number;
  recovery_rate: number;
  average_cart_value: number;
}

export interface DailyTrend {
  date: string;
  orders?: number;
  revenue?: number;
  abandoned_carts?: number;
}

export interface MonthlyRevenue {
  month: string;
  orders: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  category?: string;
  total_quantity: number;
  total_revenue: number;
  order_count?: number;
}

export interface TopCustomer {
  customer_id: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  order_count: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date: string;
}

export interface AbandonedProduct {
  id: number;
  name: string;
  price: number;
  total_quantity: number;
  cart_count: number;
}

export interface LowStockProduct {
  product_id: number;
  name: string;
  current_stock: number;
  reorder_level: number;
  sold_quantity: number;
}

// ── Order Report breakdowns ───────────────────────────────────────

export interface OrdersByStatus {
  status: string;
  count: number;
  total: number;
}

export interface OrdersByPayment {
  payment_status: string;
  count: number;
  total: number;
}

export interface OrderPaymentMethod {
  payment_method: string;
  count: number;
  total: number;
}

export interface OrderReportProduct {
  product_id: number;
  product_name: string;
  product_price: number;
  total_quantity: number;
  total_revenue: number;
}

// ── Revenue Report breakdowns ─────────────────────────────────────

export interface RevenueByPayment {
  payment_status: string;
  total: number;
}

export interface RevenueByMethod {
  payment_method: string;
  total: number;
  count: number;
}

// ── Product Report breakdowns ─────────────────────────────────────

export interface CategoryPerformance {
  category: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}
