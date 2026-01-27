export interface PayrollDepartment {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  employees_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollDepartmentListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface PayrollDepartmentPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollDepartmentListResponse {
  departments: PayrollDepartment[];
  pagination: PayrollDepartmentPagination;
}
