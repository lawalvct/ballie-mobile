// Admin Management API Service
import apiClient from "../../../api/client";
import type {
  DashboardStats,
  UserListItem,
  UserDetail,
  CreateUserPayload,
  UpdateUserPayload,
  CreateUserFormData,
  UserListParams,
  RoleListItem,
  RoleDetail,
  CreateRolePayload,
  UpdateRolePayload,
  RoleListParams,
  ModulePermissions,
  PermissionMatrix,
  Pagination,
} from "../types";

const BASE = "/admin";

function buildQuery(params: Record<string, any>): string {
  const clean: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      clean[key] = String(value);
    }
  });
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────

  getDashboard: async (): Promise<{ data: DashboardStats }> => {
    return apiClient.get(`${BASE}/dashboard`);
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  listUsers: async (
    params: UserListParams = {},
  ): Promise<{ data: UserListItem[]; pagination: Pagination }> => {
    return apiClient.get(`${BASE}/users${buildQuery(params)}`);
  },

  getUserFormData: async (): Promise<{ data: CreateUserFormData }> => {
    return apiClient.get(`${BASE}/users/create`);
  },

  createUser: async (payload: CreateUserPayload): Promise<any> => {
    return apiClient.post(`${BASE}/users`, payload);
  },

  showUser: async (id: number): Promise<{ data: UserDetail }> => {
    return apiClient.get(`${BASE}/users/${id}`);
  },

  updateUser: async (id: number, payload: UpdateUserPayload): Promise<any> => {
    return apiClient.put(`${BASE}/users/${id}`, payload);
  },

  deleteUser: async (id: number): Promise<any> => {
    return apiClient.delete(`${BASE}/users/${id}`);
  },

  toggleUserStatus: async (
    id: number,
  ): Promise<{ data: { is_active: boolean } }> => {
    return apiClient.post(`${BASE}/users/${id}/toggle-status`);
  },

  // ── Roles ──────────────────────────────────────────────────────────────────

  listRoles: async (
    params: RoleListParams = {},
  ): Promise<{ data: RoleListItem[]; pagination: Pagination }> => {
    return apiClient.get(`${BASE}/roles${buildQuery(params)}`);
  },

  getRoleFormData: async (): Promise<{
    data: { permissions_by_module: ModulePermissions[] };
  }> => {
    return apiClient.get(`${BASE}/roles/create`);
  },

  createRole: async (payload: CreateRolePayload): Promise<any> => {
    return apiClient.post(`${BASE}/roles`, payload);
  },

  showRole: async (id: number): Promise<{ data: RoleDetail }> => {
    return apiClient.get(`${BASE}/roles/${id}`);
  },

  updateRole: async (id: number, payload: UpdateRolePayload): Promise<any> => {
    return apiClient.put(`${BASE}/roles/${id}`, payload);
  },

  deleteRole: async (id: number): Promise<any> => {
    return apiClient.delete(`${BASE}/roles/${id}`);
  },

  assignPermissions: async (
    roleId: number,
    permissions: number[],
  ): Promise<any> => {
    return apiClient.post(`${BASE}/roles/${roleId}/permissions`, {
      permissions,
    });
  },

  // ── Permissions ────────────────────────────────────────────────────────────

  listPermissions: async (): Promise<{ data: ModulePermissions[] }> => {
    return apiClient.get(`${BASE}/permissions`);
  },

  getPermissionMatrix: async (): Promise<{ data: PermissionMatrix }> => {
    return apiClient.get(`${BASE}/permission-matrix`);
  },
};
