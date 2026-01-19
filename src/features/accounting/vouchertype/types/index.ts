// Voucher Type Type Definitions

export interface VoucherType {
  id: number;
  tenant_id: number;
  name: string;
  code: string;
  abbreviation: string;
  category: "accounting" | "inventory" | "POS" | "payroll" | "ecommerce";
  description: string | null;
  numbering_method: "auto" | "manual";
  prefix: string | null;
  starting_number: number;
  current_number: number;
  has_reference: boolean;
  affects_inventory: boolean;
  affects_cashbank: boolean;
  is_system_defined: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  voucher_count?: number;
  recent_vouchers?: RecentVoucher[];
}

export interface RecentVoucher {
  id: number;
  voucher_number: string;
  date: string;
  reference: string | null;
  amount: number;
}

export interface PrimaryVoucherType {
  id: number;
  name: string;
  code: string;
  category: string;
}

export interface Category {
  value: string;
  label: string;
}

export interface NumberingMethod {
  value: string;
  label: string;
}

export interface FormData {
  primary_voucher_types: PrimaryVoucherType[];
  categories: Record<string, string>;
  numbering_methods: Record<string, string>;
}

export interface CreateVoucherTypePayload {
  name: string;
  code: string;
  abbreviation: string;
  description?: string | null;
  category: "accounting" | "inventory" | "POS" | "payroll" | "ecommerce";
  numbering_method: "auto" | "manual";
  prefix?: string | null;
  starting_number: number;
  has_reference?: boolean;
  affects_inventory?: boolean;
  affects_cashbank?: boolean;
  is_active?: boolean;
}

export interface UpdateVoucherTypePayload {
  name?: string;
  code?: string;
  abbreviation?: string;
  description?: string | null;
  category?: "accounting" | "inventory" | "POS" | "payroll" | "ecommerce";
  numbering_method?: "auto" | "manual";
  prefix?: string | null;
  starting_number?: number;
  has_reference?: boolean;
  affects_inventory?: boolean;
  affects_cashbank?: boolean;
  is_active?: boolean;
}

export interface ListParams {
  search?: string;
  status?: "active" | "inactive";
  type?: "system" | "custom";
  category?: "accounting" | "inventory" | "POS" | "payroll" | "ecommerce";
  sort?: "name" | "code" | "created_at" | "is_active";
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
  total: number;
  active: number;
  system_defined: number;
  custom: number;
}

export interface BulkActionPayload {
  action: "activate" | "deactivate" | "delete";
  voucher_types: number[];
}

export interface BulkActionResult {
  successful: number[];
  failed: Array<{ id: number; reason: string }>;
}

export interface ResetNumberingPayload {
  reset_number: number;
}
