// Account Group Type Definitions

export interface AccountGroup {
  id: number;
  name: string;
  code: string;
  nature: "assets" | "liabilities" | "equity" | "income" | "expenses";
  nature_label: string;
  parent_id: number | null;
  parent?: AccountGroup | null;
  is_active: boolean;
  is_system: boolean;
  children_count: number;
  ledger_accounts_count: number;
  created_at: string;
  updated_at: string;
}

export interface AccountNature {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface ParentGroup {
  id: number;
  name: string;
  code: string;
  nature: string;
  display_name: string;
}

export interface FormData {
  parent_groups: ParentGroup[];
  natures: AccountNature[];
  defaults: {
    is_active: boolean;
  };
  validation_rules: Record<string, string>;
}

export interface CreateAccountGroupPayload {
  name: string;
  code: string;
  nature: "assets" | "liabilities" | "equity" | "income" | "expenses";
  parent_id?: number | null;
  is_active?: boolean;
}

export interface UpdateAccountGroupPayload {
  name?: string;
  code?: string;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface ListParams {
  search?: string;
  status?: "active" | "inactive";
  nature?: "assets" | "liabilities" | "equity" | "income" | "expenses";
  level?: "parent" | "child";
  sort?: "name" | "code" | "nature" | "created_at" | "is_active";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface Statistics {
  total_groups: number;
  active_groups: number;
  parent_groups: number;
  child_groups: number;
}
