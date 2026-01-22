export type CustomerType = "individual" | "business";
export type CustomerStatus = "active" | "inactive";

export interface CustomerLedgerAccount {
  id: number;
  name: string;
  current_balance?: number | string;
}

export interface CustomerListItem {
  id: number;
  customer_type: CustomerType;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  status?: CustomerStatus;
  outstanding_balance?: number;
  ledger_account?: CustomerLedgerAccount;
}

export interface CustomerDetails {
  id: number;
  customer_type: CustomerType;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  status?: CustomerStatus;
  ledger_account?: CustomerLedgerAccount;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  currency?: string | null;
  payment_terms?: string | null;
  credit_limit?: number | null;
  opening_balance_amount?: number | null;
  opening_balance_type?: "debit" | "credit" | null;
  opening_balance_date?: string | null;
  notes?: string | null;
}

export interface CustomerStatistics {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  individual_customers: number;
  business_customers: number;
}

export interface CustomerListResponse {
  current_page: number;
  data: CustomerListItem[];
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface CustomerListParams {
  search?: string;
  customer_type?: CustomerType;
  status?: CustomerStatus;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface CustomerCreatePayload {
  customer_type: CustomerType;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  currency?: string;
  payment_terms?: string;
  credit_limit?: number;
  opening_balance_amount?: number;
  opening_balance_type?: "debit" | "credit";
  opening_balance_date?: string;
  notes?: string;
}

export interface CustomerUpdatePayload extends Partial<CustomerCreatePayload> {}

export interface CustomerStatementsStats {
  total_customers: number;
  total_receivable: number;
  total_payable: number;
  net_balance: number;
}

export interface CustomerStatementListItem {
  id: number;
  display_name: string;
  running_balance: number;
  balance_type: "receivable" | "payable";
}

export interface CustomerStatementsResponse {
  current_page: number;
  data: CustomerStatementListItem[];
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface CustomerStatementDetail {
  customer: {
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
