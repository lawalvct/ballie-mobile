// Vendor Management Types

export interface Vendor {
  id: number;
  vendor_type: "individual" | "business";
  company_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  tax_id?: string;
  registration_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  currency?: string;
  payment_terms?: string;
  credit_limit?: number;
  opening_balance_amount?: number;
  opening_balance_type?: "debit" | "credit";
  opening_balance_date?: string;
  notes?: string;
  status: "active" | "inactive";
  outstanding_balance?: number;
  ledger_account?: {
    id: number;
    name: string;
    current_balance?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface VendorListItem {
  id: number;
  vendor_type: "individual" | "business";
  company_name?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  display_name?: string;
  outstanding_balance?: number;
  ledger_account?: {
    id: number;
    name: string;
  };
}

export interface VendorListParams {
  search?: string;
  vendor_type?: "individual" | "business";
  status?: "active" | "inactive";
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface VendorListResponse {
  current_page: number;
  data: VendorListItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface VendorStatistics {
  total_vendors: number;
  active_vendors: number;
  total_purchases: number;
  total_outstanding: number;
}

export interface VendorCreatePayload {
  vendor_type: "individual" | "business";
  company_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  tax_id?: string;
  registration_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  currency?: string;
  payment_terms?: string;
  credit_limit?: number;
  opening_balance_amount?: number;
  opening_balance_type?: "debit" | "credit";
  opening_balance_date?: string;
  notes?: string;
}

export interface VendorUpdatePayload extends Partial<VendorCreatePayload> {}

export interface VendorDetails extends Vendor {}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface Statistics {
  total_vendors: number;
  active_vendors: number;
  total_purchases: number;
  total_outstanding: number;
}

export interface VendorStatementsStats {
  total_vendors: number;
  total_payable: number;
  total_receivable: number;
  net_balance: number;
}

export interface VendorStatementListItem {
  id: number;
  display_name: string;
  running_balance: number;
  balance_type: "payable" | "receivable";
}

export interface VendorStatementsResponse {
  current_page: number;
  data: VendorStatementListItem[];
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface VendorStatementDetail {
  vendor: {
    id: number;
    company_name?: string | null;
    display_name?: string | null;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  opening_balance: number;
  total_debits: number;
  total_credits: number;
  closing_balance: number;
  transactions: Array<{
    date: string;
    particulars: string;
    voucher_type?: string;
    voucher_number?: string;
    debit?: number;
    credit?: number;
    running_balance?: number;
  }>;
}
