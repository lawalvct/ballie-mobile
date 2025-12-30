// Voucher Management Types

export interface VoucherType {
  id: number;
  name: string;
  code: string;
  description: string;
  has_numbering: boolean;
  number_prefix: string;
  number_suffix: string;
  next_number: number;
}

export interface LedgerAccountOption {
  id: number;
  name: string;
  code: string;
  display_name: string;
  account_type: string;
  account_group_id: number;
  account_group_name: string;
  parent_id: number | null;
  level: number;
  current_balance: number;
}

export interface VoucherEntry {
  id?: number;
  ledger_account_id: number | null;
  ledger_account_name?: string;
  ledger_account_code?: string;
  ledger_account_display_name?: string;
  account_group_name?: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export interface Voucher {
  id: number;
  voucher_type_id: number;
  voucher_type_name: string;
  voucher_type_code: string;
  voucher_number: string;
  voucher_date: string;
  narration: string;
  reference_number: string | null;
  total_amount: number;
  status: "draft" | "posted";
  created_at: string;
  updated_at: string;
  posted_at: string | null;
  entries?: VoucherEntry[];
  created_by?: {
    id: number;
    name: string;
  };
  updated_by?: {
    id: number;
    name: string;
  };
  posted_by?: {
    id: number | null;
    name: string;
  };
  can_be_edited?: boolean;
  can_be_deleted?: boolean;
  can_be_posted?: boolean;
  can_be_unposted?: boolean;
}

export interface VoucherDetails extends Voucher {
  entries: VoucherEntry[];
}

export interface FormDataResponse {
  voucher_types: VoucherType[];
  ledger_accounts: LedgerAccountOption[];
  products?: any[];
  selected_type?: VoucherType;
  defaults: {
    voucher_date: string;
    status: string;
  };
  validation_rules: Record<string, string>;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  voucher_type_id?: number;
  status?: "draft" | "posted";
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface Statistics {
  total_vouchers: number;
  draft_vouchers: number;
  posted_vouchers: number;
  total_amount: number;
}

export interface ListResponse {
  vouchers: Voucher[];
  pagination: PaginationInfo;
  statistics: Statistics;
}

export interface CreateVoucherData {
  voucher_type_id: number;
  voucher_date: string;
  voucher_number?: string;
  narration?: string;
  reference_number?: string;
  entries: Array<{
    ledger_account_id: number;
    debit_amount: number;
    credit_amount: number;
    description?: string;
  }>;
  action?: "save" | "save_and_post";
}

export interface BulkActionData {
  action: "post" | "unpost" | "delete";
  voucher_ids: number[];
}

export interface BulkActionResponse {
  success: number;
  failed: number;
  errors: string[];
}
