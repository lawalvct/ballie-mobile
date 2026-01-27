export interface PayrollPosition {
  id: number;
  name: string;
  code?: string;
  description?: string;
  department_id?: number;
  department_name?: string;
  level?: number;
  level_name?: string;
  reports_to_position_id?: number;
  reports_to_name?: string;
  min_salary?: number;
  max_salary?: number;
  salary_range?: string;
  requirements?: string | null;
  responsibilities?: string | null;
  is_active: boolean;
  sort_order?: number;
  employees_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollPositionListParams {
  department_id?: number;
  level?: number;
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PayrollPositionPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollPositionListResponse {
  positions: PayrollPosition[];
  pagination: PayrollPositionPagination;
}
