// Ledger Account entity
export interface LedgerAccount {
  id: number;
  name: string;
  code: string;
  account_type:
    | "assets"
    | "liabilities"
    | "equity"
    | "income"
    | "expenses"
    | "other";
  account_group_id: number;
  account_group?: {
    id: number;
    name: string;
    code: string;
  };
  parent_id: number | null;
  parent?: {
    id: number;
    name: string;
    code: string;
  };
  balance: number;
  formatted_balance: string;
  description: string | null;
  is_active: boolean;
  has_children: boolean;
  children_count: number;
  level: number;
  created_at: string;
  updated_at: string;
}

// List parameters with filters
export interface ListParams {
  search?: string;
  account_type?: string;
  account_group_id?: number;
  parent_id?: number;
  status?: "all" | "active" | "inactive";
  has_balance?: boolean;
  level?: number;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
  view_mode?: "list" | "tree";
}

// Pagination info
export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Statistics
export interface Statistics {
  total_accounts: number;
  active_accounts: number;
  with_balance: number;
  parent_accounts: number;
}

// Form data response
export interface FormDataResponse {
  account_groups: Array<{
    nature: string;
    nature_label: string;
    groups: Array<{
      id: number;
      name: string;
      code: string;
      display_name: string;
    }>;
  }>;
  parent_accounts: Array<{
    id: number;
    name: string;
    code: string;
    account_type: string;
    level: number;
  }>;
  account_types: Array<{
    value: string;
    label: string;
    description: string;
    icon: string;
    balance_type: string;
  }>;
}

// API response wrapper
export interface ListResponse {
  ledger_accounts: LedgerAccount[];
  pagination: PaginationInfo;
  statistics: Statistics;
}

// Create payload
export interface CreateLedgerAccountPayload {
  name: string;
  code: string;
  account_type: string;
  account_group_id: number;
  parent_id?: number | null;
  description?: string;
  is_active?: boolean;
}

// Update payload
export interface UpdateLedgerAccountPayload {
  name: string;
  code: string;
  account_type: string;
  account_group_id: number;
  parent_id?: number | null;
  description?: string;
  is_active?: boolean;
}

// Import payload
export interface ImportPayload {
  file: any; // FormData file
}

// Export options
export interface ExportOptions {
  format: "excel" | "pdf";
  filters?: ListParams;
}
