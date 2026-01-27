export type PayrollEmployeeStatus = "active" | "inactive" | "terminated";

export interface PayrollEmployee {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  employee_number?: string;
  avatar?: string;
  avatar_url?: string;
  department_id?: number;
  department_name?: string;
  position_id?: number;
  position_name?: string;
  position_code?: string;
  job_title?: string;
  status?: PayrollEmployeeStatus;
  employment_type?: string;
  pay_frequency?: string;
  hire_date?: string;
  date_of_birth?: string;
  gender?: string;
  attendance_deduction_exempt?: boolean;
  attendance_exemption_reason?: string | null;
  basic_salary?: string | number;
  gross_salary?: string | number;
  total_allowances?: string | number;
  total_deductions?: string | number;
  effective_date?: string;
  tin?: string;
  pension_pin?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  pfa_provider?: string;
  rsa_pin?: string;
  pension_exempt?: boolean;
  current_salary?: PayrollEmployeeSalary;
  components?: PayrollEmployeeComponentInput[];
  created_at?: string;
  updated_at?: string;
}

export interface PayrollEmployeeSalaryComponent {
  id: number;
  salary_component_id?: number;
  name?: string;
  code?: string;
  type?: string;
  calculation_type?: string;
  amount?: string | number | null;
  percentage?: string | number | null;
  is_active?: boolean;
}

export interface PayrollEmployeeSalary {
  id?: number;
  basic_salary?: string | number;
  effective_date?: string;
  gross_salary?: string | number;
  total_allowances?: string | number;
  total_deductions?: string | number;
  components?: PayrollEmployeeSalaryComponent[];
}

export interface PayrollEmployeeComponentInput {
  id: number;
  amount?: number;
  percentage?: number;
  is_active?: boolean;
}

export interface PayrollEmployeeListParams {
  search?: string;
  department_id?: number;
  status?: PayrollEmployeeStatus;
  position_id?: number;
  position?: string;
  page?: number;
  per_page?: number;
}

export interface PayrollEmployeePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollEmployeeListResponse {
  employees: PayrollEmployee[];
  pagination: PayrollEmployeePagination;
}
