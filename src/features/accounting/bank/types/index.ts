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
  description?: string;
  notes?: string;
  swift_code?: string;
  iban?: string;
  routing_number?: string;
  sort_code?: string;
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

export interface UpdateBankPayload {
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  status: string;
  account_type?: string;
  branch_name?: string;
  description?: string;
  notes?: string;
  is_primary?: boolean;
  is_payroll_account?: boolean;
  enable_reconciliation?: boolean;
}

export interface BankTransaction {
  id: number;
  voucher_id?: number | null;
  voucher_number?: string | null;
  voucher_date?: string | null;
  voucher_type?: string | null;
  particulars?: string | null;
  debit?: number | string | null;
  credit?: number | string | null;
}

export interface BankMonthlyStats {
  transactions_count?: number;
  reconciliation_status?: string;
  account_age_days?: number;
}

export interface BankDetailResponse {
  bank: BankAccount;
  recent_transactions: BankTransaction[];
  monthly_stats?: BankMonthlyStats | null;
}

export interface BankStatementBank {
  id: number;
  bank_name: string;
  account_number: string;
  currency?: string;
}

export interface BankStatementDateRange {
  start_date: string;
  end_date: string;
}

export interface BankStatementTransaction {
  date: string;
  particulars?: string | null;
  voucher_type?: string | null;
  voucher_number?: string | null;
  debit?: number | string | null;
  credit?: number | string | null;
  running_balance?: number | string | null;
}

export interface BankStatementTotals {
  total_debits: number;
  total_credits: number;
  closing_balance: number;
}

export interface BankStatementResponse {
  bank: BankStatementBank;
  date_range: BankStatementDateRange;
  opening_balance: number;
  transactions: BankStatementTransaction[];
  totals: BankStatementTotals;
}
