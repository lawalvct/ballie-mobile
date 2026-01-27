export type PayrollShiftStatus = "active" | "inactive";
export type PayrollShiftAssignmentStatus = "active" | "ended";

export interface PayrollShift {
  id: number;
  name: string;
  code: string;
  description?: string;
  start_time: string;
  end_time: string;
  time_range?: string;
  working_days: string[];
  late_grace_minutes?: number;
  work_hours: number;
  shift_allowance?: string | number;
  is_active: boolean;
  employees_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollShiftListParams {
  search?: string;
  status?: PayrollShiftStatus;
  page?: number;
  per_page?: number;
}

export interface PayrollShiftPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollShiftListResponse {
  shifts: PayrollShift[];
  pagination: PayrollShiftPagination;
}

export interface PayrollShiftAssignment {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_number?: string;
  department_id?: number;
  department_name?: string;
  shift_id: number;
  shift_name: string;
  shift_time?: string;
  effective_from: string;
  effective_to?: string | null;
  is_permanent?: boolean;
  is_active?: boolean;
  status?: PayrollShiftAssignmentStatus;
}

export interface PayrollShiftAssignmentsListParams {
  department_id?: number;
  employee_id?: number;
  shift_id?: number;
  status?: PayrollShiftAssignmentStatus;
  page?: number;
  per_page?: number;
}

export interface PayrollShiftAssignmentsListResponse {
  assignments: PayrollShiftAssignment[];
  pagination: PayrollShiftPagination;
}

export interface PayrollShiftShowResponse {
  shift: PayrollShift;
  assignments: PayrollShiftAssignment[];
  pagination: PayrollShiftPagination | null;
}
