export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ReconciliationBankOption {
  id: number;
  bank_name: string;
  account_name?: string;
  account_number?: string;
  masked_account_number?: string;
  currency?: string;
  current_balance?: number;
  last_reconciliation_date?: string | null;
}

export interface ReconciliationRecord {
  id: number;
  bank_id: number;
  bank?: ReconciliationBankOption;
  reconciliation_date?: string;
  statement_start_date?: string;
  statement_end_date?: string;
  opening_balance?: number;
  closing_balance_per_bank?: number;
  closing_balance_per_books?: number;
  difference?: number;
  status?: string;
  status_color?: string;
  total_transactions?: number;
  reconciled_transactions?: number;
  unreconciled_transactions?: number;
  bank_charges?: number;
  interest_earned?: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReconciliationStats {
  total: number;
  completed: number;
  in_progress: number;
  draft: number;
  cancelled: number;
}

export interface ReconciliationListResponse {
  reconciliations: ReconciliationRecord[];
  pagination: PaginationInfo | null;
  statistics: ReconciliationStats | null;
  banks: ReconciliationBankOption[];
}

export interface ReconciliationFormResponse {
  banks: ReconciliationBankOption[];
}

export interface CreateReconciliationPayload {
  bank_id: number;
  reconciliation_date: string;
  statement_start_date: string;
  statement_end_date: string;
  closing_balance_per_bank: number;
  statement_number?: string;
  bank_charges?: number;
  interest_earned?: number;
  other_adjustments?: number;
  notes?: string;
}

export interface ReconciliationItem {
  id: number;
  transaction_date: string;
  description?: string | null;
  reference_number?: string | null;
  debit_amount?: number | null;
  credit_amount?: number | null;
  status?: string;
}

export interface ReconciliationDetailStats {
  total: number;
  reconciled: number;
  unreconciled: number;
  progress: number;
}

export interface ReconciliationDetailResponse {
  reconciliation: ReconciliationRecord;
  items: ReconciliationItem[];
  cleared_items: ReconciliationItem[];
  uncleared_items: ReconciliationItem[];
  statistics: ReconciliationDetailStats;
}

export interface UpdateReconciliationItemPayload {
  item_id: number;
  status: "cleared" | "uncleared" | "excluded";
  cleared_date?: string;
  bank_reference?: string;
}
