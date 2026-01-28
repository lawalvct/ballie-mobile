export type OvertimeType = "weekday" | "weekend" | "holiday" | "emergency";

export type OvertimeStatus = "pending" | "approved" | "rejected" | "paid";

export type OvertimeCalculationMethod = "hourly" | "fixed";

export interface OvertimeSummary {
  pending_count?: number;
  pending_amount?: number;
  approved_unpaid_count?: number;
  approved_unpaid_amount?: number;
  total_records?: number;
  total_amount?: number;
}

export interface OvertimeRecord {
  id: number;
  overtime_number?: string;
  employee_id: number;
  employee_name?: string;
  employee_number?: string;
  department_name?: string;
  overtime_date?: string;
  calculation_method?: OvertimeCalculationMethod;
  start_time?: string;
  end_time?: string;
  total_hours?: number;
  hourly_rate?: number;
  multiplier?: number;
  total_amount?: number;
  overtime_type?: OvertimeType;
  reason?: string;
  work_description?: string;
  status?: OvertimeStatus;
  is_paid?: boolean;
  paid_date?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_remarks?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OvertimeListParams {
  date_from?: string;
  date_to?: string;
  department_id?: number;
  employee_id?: number;
  overtime_type?: OvertimeType;
  status?: OvertimeStatus;
  payment_status?: "paid" | "unpaid";
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

export interface OvertimeListResponse {
  summary: OvertimeSummary;
  records: OvertimeRecord[];
  pagination: PaginationInfo;
}

export interface OvertimeDetailResponse {
  overtime: OvertimeRecord;
}

export interface OvertimeMonthlyEmployeeSummary {
  employee: {
    id: number;
    name: string;
    employee_number?: string;
    department_name?: string;
  };
  record_count?: number;
  total_hours?: number;
  total_amount?: number;
  paid_amount?: number;
  unpaid_amount?: number;
}

export interface OvertimeMonthlyReportResponse {
  year: number;
  month: number;
  summary: {
    total_employees?: number;
    total_records?: number;
    total_hours?: number;
    total_amount?: number;
    paid_amount?: number;
    unpaid_amount?: number;
  };
  employees: OvertimeMonthlyEmployeeSummary[];
}
