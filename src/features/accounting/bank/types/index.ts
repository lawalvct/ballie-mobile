export interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  masked_account_number?: string;
  display_name?: string;
  account_type?: string;
  account_type_display?: string;
  branch_name?: string;
  currency?: string;
  opening_balance?: number;
  current_balance?: number;
  available_balance?: number;
  overdraft_limit?: number;
  status?: string;
  status_color?: string;
  is_primary?: boolean;
  is_payroll_account?: boolean;
  enable_reconciliation?: boolean;
  reconciliation_status?: string;
  last_reconciliation_date?: string | null;
  ledger_account_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Statistics {
  total_banks: number;
  active_banks: number;
  total_balance: number;
  needs_reconciliation: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ListParams {
  search?: string;
  status?: string;
  bank_name?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface ListResponse {
  banks: BankAccount[];
  pagination: PaginationInfo | null;
  statistics: Statistics | null;
  bank_names: string[];
}

export interface BankFormOption {
  value: string;
  label: string;
}

export interface BankFormDataResponse {
  account_types: BankFormOption[];
  currencies: BankFormOption[];
  statuses: BankFormOption[];
}

export interface CreateBankPayload {
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  status: string;
  account_type?: string;
  opening_balance?: number;
  branch_name?: string;
  description?: string;
  notes?: string;
  is_primary?: boolean;
  is_payroll_account?: boolean;
  enable_reconciliation?: boolean;
}
