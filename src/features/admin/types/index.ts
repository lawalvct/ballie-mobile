// Admin Management Type Definitions

// ========================
// Common
// ========================

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ========================
// Dashboard
// ========================

export interface DashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_roles: number;
  recent_logins: number;
  failed_logins: number;
  role_distribution: RoleDistributionItem[];
}

export interface RoleDistributionItem {
  id: number;
  name: string;
  users_count: number;
  color: string | null;
}

// ========================
// Users
// ========================

export interface RoleBadge {
  id: number;
  name: string;
  color: string | null;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  role: string;
  roles: RoleBadge[];
  last_login_at: string | null;
  created_at: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  display_name: string;
  module: string;
  description?: string | null;
}

export interface UserRoleWithPermissions {
  id: number;
  name: string;
  color: string | null;
  permissions: PermissionItem[];
}

export interface UserDetail extends Omit<UserListItem, "roles"> {
  roles: UserRoleWithPermissions[];
  email_verified_at: string | null;
  updated_at: string;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  roles?: number[];
  is_active?: boolean;
}

export interface CreateUserFormData {
  roles: { id: number; name: string; description: string | null }[];
}

export interface UserListParams {
  search?: string;
  role?: number;
  status?: "active" | "inactive";
  per_page?: number;
  page?: number;
}

// ========================
// Roles
// ========================

export interface RoleListItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  is_default: boolean;
  users_count: number;
  permissions_count: number;
  permissions: PermissionItem[];
  created_at: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  is_default: boolean;
  users_count: number;
  users: { id: number; name: string; email: string; is_active: boolean }[];
  permissions: PermissionItem[];
  permissions_by_module: ModulePermissions[];
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: number[];
  is_active?: boolean;
  color?: string;
}

export interface UpdateRolePayload {
  name: string;
  description?: string;
  permissions?: number[];
  is_active?: boolean;
  color?: string;
}

export interface RoleListParams {
  search?: string;
  per_page?: number;
  page?: number;
}

// ========================
// Permissions
// ========================

export interface ModulePermissions {
  module: string;
  permissions: Omit<PermissionItem, "module">[];
}

export interface PermissionMatrix {
  roles: {
    id: number;
    name: string;
    color: string | null;
    users_count: number;
  }[];
  matrix: MatrixModule[];
}

export interface MatrixModule {
  module: string;
  permissions: MatrixPermission[];
}

export interface MatrixPermission {
  id: number;
  name: string;
  display_name: string;
  roles: Record<string, boolean>;
}
