// ── POS Module Types ─────────────────────────────────────────────────────────

// === Shared ===
export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// === Cash Register ===
export interface CashRegister {
  id: number;
  name: string;
  location: string;
  current_balance: string;
  is_active: boolean;
  active_session: {
    id: number;
    user: { id: number; name: string };
    opened_at: string;
  } | null;
}

// === Session ===
export interface CashRegisterSession {
  id: number;
  cash_register_id: number;
  cash_register: { id: number; name: string; location: string };
  user_id: number;
  opening_balance: string;
  closing_balance: string | null;
  expected_balance: string | null;
  difference: string | null;
  opened_at: string;
  closed_at: string | null;
  opening_notes: string | null;
  closing_notes: string | null;
  total_sales: string;
  total_cash_sales: string;
}

export interface SessionCheckResponse {
  success: boolean;
  has_active_session: boolean;
  session: CashRegisterSession | null;
}

export interface OpenSessionPayload {
  cash_register_id: number;
  opening_balance: number;
  opening_notes?: string;
}

export interface CloseSessionPayload {
  closing_balance: number;
  closing_notes?: string;
}

export interface CloseSessionResponse {
  success: boolean;
  message: string;
  summary: {
    opening_balance: string;
    closing_balance: string;
    expected_balance: string;
    difference: string;
    total_sales: string;
    total_cash_sales: string;
    total_card_sales: string;
    total_transfer_sales: string;
    session_duration: string;
  };
}

// === Product ===
export interface PosProduct {
  id: number;
  name: string;
  sku: string;
  selling_price: string;
  tax_rate: string;
  tax_inclusive: boolean;
  current_stock: number;
  image_url: string | null;
  category_id: number | null;
  category: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string } | null;
  maintain_stock: boolean;
}

// === Category ===
export interface PosCategory {
  id: number;
  name: string;
  products_count: number;
}

// === Customer ===
export interface PosCustomer {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
}

// === Payment Method ===
export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  requires_reference: boolean;
  charge_percentage: string;
  charge_amount: string;
}

// === Cart (local state) ===
export interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  tax_rate: number;
  available_stock: number;
  line_subtotal: number;
  line_discount: number;
  line_tax: number;
  line_total: number;
}

export interface CartPayment {
  method_id: number;
  method_name: string;
  amount: number;
  reference: string | null;
  requires_reference: boolean;
}

// === Sale / Checkout ===
export interface CreateSalePayload {
  customer_id?: number | null;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }[];
  payments: {
    method_id: number;
    amount: number;
    reference?: string | null;
  }[];
  notes?: string | null;
}

export interface CreateSaleResponse {
  success: boolean;
  sale_id: number;
  receipt_url: string;
  change_amount: number;
  message: string;
}

// === Transaction ===
export interface TransactionListItem {
  id: number;
  sale_number: string;
  customer: { id: number; full_name: string } | null;
  user: { id: number; name: string };
  cash_register: { id: number; name: string };
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  change_amount: string;
  status: "completed" | "voided" | "refunded" | "pending";
  sale_date: string;
  items_count: number;
  notes: string | null;
}

export interface TransactionDetail {
  id: number;
  sale_number: string;
  status: "completed" | "voided" | "refunded" | "pending";
  sale_date: string;
  notes: string | null;
  customer: {
    id: number;
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  user: { id: number; name: string };
  cash_register: { id: number; name: string; location: string };
  items: {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    quantity: string;
    unit_price: string;
    discount_amount: string;
    tax_amount: string;
    line_total: string;
  }[];
  payments: {
    id: number;
    payment_method: { id: number; name: string };
    amount: string;
    reference_number: string | null;
  }[];
  totals: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    paid: string;
    change: string;
  };
}

export interface TransactionListFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

// === Receipt ===
export interface ReceiptData {
  receipt_number: string;
  type: string;
  receipt_data: {
    company: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    sale: {
      number: string;
      date: string;
      cashier: string;
      customer: { name: string; email: string; phone: string } | null;
    };
    items: {
      name: string;
      sku: string;
      quantity: string;
      unit_price: string;
      discount: string;
      tax: string;
      total: string;
    }[];
    payments: {
      method: string;
      amount: string;
      reference: string | null;
    }[];
    totals: {
      subtotal: string;
      discount: string;
      tax: string;
      total: string;
      paid: string;
      change: string;
    };
  };
}

// === Reports ===
export interface DailySalesReport {
  date: string;
  total_sales: string;
  total_transactions: number;
  total_items_sold: number;
  total_discount: string;
  total_tax: string;
  payment_breakdown: {
    method: string;
    total: string;
    count: number;
  }[];
  hourly_sales: {
    hour: string;
    total: string;
    count: number;
  }[];
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  product_sku: string;
  total_quantity: string;
  total_revenue: string;
  transaction_count: number;
}

export interface DailyReportFilters {
  date?: string;
  date_from?: string;
  date_to?: string;
}

export interface TopProductsFilters {
  date_from?: string;
  date_to?: string;
  limit?: number;
}

// === Init Data ===
export interface PosInitData {
  session: CashRegisterSession;
  products: PosProduct[];
  categories: PosCategory[];
  customers: PosCustomer[];
  payment_methods: PaymentMethod[];
  recent_sales: TransactionListItem[];
}
