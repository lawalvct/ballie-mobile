export type SalaryComponentType =
  | "earning"
  | "deduction"
  | "employer_contribution";

export type SalaryComponentCalculationType =
  | "fixed"
  | "percentage"
  | "variable"
  | "computed";

export interface PayrollSalaryComponent {
  id: number;
  name: string;
  code: string;
  type: SalaryComponentType;
  calculation_type: SalaryComponentCalculationType;
  is_taxable: boolean;
  is_pensionable: boolean;
  description?: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollSalaryComponentListParams {
  type?: SalaryComponentType;
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface PayrollSalaryComponentPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PayrollSalaryComponentListResponse {
  components: PayrollSalaryComponent[];
  pagination: PayrollSalaryComponentPagination;
}
