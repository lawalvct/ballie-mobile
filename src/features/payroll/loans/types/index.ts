export type LoanStatus = "active" | "completed" | "cancelled";

export interface SalaryAdvancePayload {
  employee_id: number;
  amount: number;
  duration_months: number;
  purpose?: string;
  voucher_date: string;
  payment_method?: "cash" | "bank";
  reference?: string;
  cash_bank_account_id?: number;
}

export interface SalaryAdvanceResponse {
  loan?: LoanRecord;
  voucher?: {
    id: number;
    voucher_number?: string;
    voucher_date?: string;
    total_amount?: number;
    reference_number?: string;
  };
}

export interface LoanSummary {
  total_loans?: number;
  active_loans?: number;
  total_amount?: number;
  total_outstanding?: number;
}

export interface LoanRecord {
  id: number;
  loan_number?: string;
  employee_id?: number;
  employee_name?: string;
  employee_number?: string;
  department_name?: string;
  loan_amount?: number;
  total_paid?: number;
  balance?: number;
  monthly_deduction?: number;
  duration_months?: number;
  remaining_months?: number;
  progress_percentage?: number;
  status?: LoanStatus;
  purpose?: string;
  start_date?: string;
  created_at?: string;
}

export interface LoanListParams {
  search?: string;
  employee_id?: number;
  status?: LoanStatus;
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

export interface LoanListResponse {
  summary: LoanSummary;
  records: LoanRecord[];
  pagination: PaginationInfo;
}

export interface LoanDetailResponse {
  loan: LoanRecord;
}
