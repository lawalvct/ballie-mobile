export type PayrollProcessingType =
  | "monthly"
  | "weekly"
  | "bi_weekly"
  | "contract";

export type PayrollProcessingStatus =
  | "draft"
  | "processing"
  | "completed"
  | "approved"
  | "cancelled";

export interface PayrollProcessingPeriod {
  id: number;
  name: string;
  type: PayrollProcessingType;
  status: PayrollProcessingStatus;
  start_date: string;
  end_date: string;
  pay_date: string;
  total_gross?: string | number;
  total_deductions?: string | number;
  total_net?: string | number;
  total_tax?: string | number;
  total_nsitf?: string | number;
  payroll_runs_count?: number;
  apply_paye_tax?: boolean;
  apply_nsitf?: boolean;
  tax_exemption_reason?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollProcessingRun {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_number?: string;
  department_name?: string;
  basic_salary?: string | number;
  total_allowances?: string | number;
  total_deductions?: string | number;
  monthly_tax?: string | number;
  net_salary?: string | number;
  payment_status?: string | null;
}

export interface PayrollProcessingListParams {
  search?: string;
  type?: PayrollProcessingType;
  status?: PayrollProcessingStatus;
  date_range?: string;
  page?: number;
  per_page?: number;
}

export interface PayrollProcessingPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollProcessingListResponse {
  periods: PayrollProcessingPeriod[];
  pagination: PayrollProcessingPagination;
}

export interface PayrollProcessingShowResponse {
  period: PayrollProcessingPeriod;
  runs: PayrollProcessingRun[];
  pagination: PayrollProcessingPagination | null;
}
