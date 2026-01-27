export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "half_day"
  | "on_leave"
  | "weekend"
  | "holiday";

export interface AttendanceStats {
  total?: number;
  present?: number;
  late?: number;
  absent?: number;
  on_leave?: number;
  half_day?: number;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_number?: string;
  department_name?: string;
  shift_id?: number;
  shift_name?: string;
  attendance_date: string;
  clock_in?: string;
  clock_out?: string;
  scheduled_in?: string;
  scheduled_out?: string;
  late_minutes?: number;
  early_out_minutes?: number;
  work_hours_minutes?: number;
  break_minutes?: number;
  overtime_minutes?: number;
  status?: AttendanceStatus;
  is_approved?: boolean;
}

export interface AttendanceDailyParams {
  date?: string;
  department_id?: number;
  employee_id?: number;
  shift_id?: number;
  status?: AttendanceStatus;
}

export interface AttendanceDailyResponse {
  date: string;
  stats: AttendanceStats;
  records: AttendanceRecord[];
}

export interface AttendanceMonthlySummary {
  total_days?: number;
  present?: number;
  late?: number;
  absent?: number;
  on_leave?: number;
  half_day?: number;
  total_hours?: number;
  total_overtime?: number;
}

export interface AttendanceMonthlyEmployeeSummary {
  employee_id: number;
  employee_name: string;
  employee_number?: string;
  department_name?: string;
  summary: AttendanceMonthlySummary;
}

export interface AttendanceMonthlyReportResponse {
  year: number;
  month: number;
  start_date?: string;
  end_date?: string;
  employees: AttendanceMonthlyEmployeeSummary[];
}

export interface AttendanceEmployeeInfo {
  id: number;
  name: string;
  employee_number?: string;
  department_name?: string;
}

export interface AttendanceEmployeeRecord {
  attendance_date: string;
  status?: AttendanceStatus;
  clock_in?: string;
  clock_out?: string;
}

export interface AttendanceEmployeeMonthlyResponse {
  employee: AttendanceEmployeeInfo;
  year: number;
  month: number;
  summary: AttendanceMonthlySummary;
  records: AttendanceEmployeeRecord[];
}

export interface AttendanceQrCodeResponse {
  success?: boolean;
  qr_code?: string;
  type?: "clock_in" | "clock_out";
  date?: string;
  expires_at?: string;
}
