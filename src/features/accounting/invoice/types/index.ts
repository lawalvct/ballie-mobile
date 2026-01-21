// Invoice Management Types

export interface VoucherType {
  id: number;
  name: string;
  code: string;
  abbreviation: string;
  category: string;
  prefix: string;
  inventory_effect: "increase" | "decrease";
  is_active: boolean;
}

export interface Party {
  id: number;
  ledger_account_id: number;
  name: string;
  customer_type?: "individual" | "business";
  email: string | null;
  phone: string | null;
  mobile: string | null;
  outstanding_balance: number;
  currency?: string;
  payment_terms?: string;
  address: string | null;
  status?: "active" | "inactive";
  ledger_account?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface Product {
  id: number;
  name: string;
  code: string;
  type: "goods" | "service";
  unit: string;
  unit_id: number;
  sales_price: number;
  purchase_price: number;
  current_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  account_id: number;
}

export interface LedgerAccount {
  id: number;
  name: string;
  code: string;
  display_name: string;
  account_type: string;
  account_group_id: number;
  account_group_name: string;
  current_balance: number;
}

export interface InvoiceItem {
  id?: number;
  product_id: number | null;
  product?: Product;
  product_name?: string;
  description?: string;
  quantity: number | null;
  unit_id?: number;
  unit?: string;
  rate: number | null;
  discount?: number;
  vat_rate?: number;
  amount: number;
}

export interface AdditionalCharge {
  id?: number;
  ledger_account_id: number | null;
  ledger_account?: LedgerAccount;
  ledger_account_name?: string;
  amount: number | null;
  description?: string;
  narration?: string;
}

export interface InvoiceEntry {
  id: number;
  ledger_account_id: number;
  ledger_account_name: string;
  ledger_account_code: string;
  debit_amount: number;
  credit_amount: number;
  particulars: string;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  voucher_type_id: number;
  voucher_number: string;
  voucher_date: string;
  reference_number: string | null;
  narration: string | null;
  party_id: number;
  party_name?: string;
  type: "sales" | "purchase";
  total_amount: number;
  status: "draft" | "posted";
  created_by: number;
  posted_at: string | null;
  posted_by: number | null;
  created_at: string;
  updated_at: string;
  voucher_type?: VoucherType;
  voucher_type_name?: string;
  items?: InvoiceItem[];
  additional_charges?: AdditionalCharge[];
  entries?: InvoiceEntry[];
  created_by_user?: {
    id: number;
    name: string;
  };
  posted_by_user?: {
    id: number;
    name: string;
  };
}

export interface InvoiceDetails extends Invoice {
  party?: Party;
  balance_due?: number;
  total_paid?: number;
}

export interface FormData {
  voucher_types: VoucherType[];
  parties: Party[];
  products: Product[];
  ledger_accounts: LedgerAccount[];
  type: "sales" | "purchase";
}

export interface CreateInvoicePayload {
  voucher_type_id: number;
  voucher_date: string;
  party_id: number;
  reference_number?: string;
  narration?: string;
  items: {
    product_id: number;
    quantity: number;
    rate: number;
    discount?: number;
    vat_rate?: number;
  }[];
  additional_charges?: {
    ledger_account_id: number;
    amount: number;
    description?: string;
  }[];
  status: "draft" | "posted";
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {}

export interface ListParams {
  type?: "sales" | "purchase";
  status?: "draft" | "posted";
  from_date?: string;
  to_date?: string;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface Statistics {
  total_invoices: number;
  draft_invoices: number;
  posted_invoices: number;
  total_sales_amount: number;
  total_purchase_amount: number;
}

export interface ListResponse {
  current_page: number;
  data: Invoice[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
