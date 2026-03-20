// ── Audit Module Types ───────────────────────────────────────────────────────

export interface AuditUser {
  id: number;
  name: string;
  email?: string;
}

export interface AuditActivity {
  id: number;
  model: string;
  model_key: string;
  model_name: string;
  action: AuditAction;
  user: AuditUser;
  timestamp: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  changes?: Record<string, { old: any; new: any }>;
}

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "posted"
  | "restored";

export type AuditModelType =
  | "customer"
  | "vendor"
  | "product"
  | "voucher"
  | string;

export interface AuditStats {
  total_records: number;
  created_today: number;
  updated_today: number;
  posted_today: number;
  active_users: number;
}

export interface AuditDashboardFilters {
  user_id?: number;
  action?: AuditAction;
  model?: AuditModelType;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AuditPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuditDashboardResponse {
  filters: AuditDashboardFilters;
  stats: AuditStats;
  users: AuditUser[];
  activities: {
    data: AuditActivity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuditTrailRecord {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuditTrailActivity {
  action: AuditAction;
  user: AuditUser;
  timestamp: string;
  details: string;
  ip_address?: string;
  changes?: Record<string, { old: any; new: any }>;
}

export interface AuditTrailResponse {
  model: string;
  record: AuditTrailRecord;
  activities: AuditTrailActivity[];
}
