import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { adminService } from "../services/adminService";
import type {
  RoleListParams,
  CreateRolePayload,
  UpdateRolePayload,
} from "../types";

/**
 * Paginated role list.
 */
export function useRoles(params: RoleListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.admin.roles.list(params as Record<string, any>),
    () => adminService.listRoles(params),
    { staleTime: 3 * 60 * 1000, placeholderData: keepPreviousData },
  );

  return {
    roles: (query.data as any)?.data ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.roles.all(),
      }),
  };
}

/**
 * Fetch a single role's detail.
 */
export function useRoleDetail(id: number) {
  const query = useApiQuery(
    queryKeys.admin.roles.detail(id),
    () => adminService.showRole(id),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    role: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

/**
 * Fetch permissions grouped by module for create/edit role forms.
 */
export function useRoleFormData() {
  const query = useApiQuery(
    queryKeys.admin.roles.formData(),
    () => adminService.getRoleFormData(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    permissionsByModule: (query.data as any)?.data?.permissions_by_module ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Create a new role.
 */
export function useCreateRole() {
  return useApiMutation(
    (payload: CreateRolePayload) => adminService.createRole(payload),
    {
      invalidateKeys: [
        queryKeys.admin.roles.all(),
        queryKeys.admin.dashboard(),
      ],
      successMessage: "Role created successfully",
    },
  );
}

/**
 * Update an existing role.
 */
export function useUpdateRole(id: number) {
  return useApiMutation(
    (payload: UpdateRolePayload) => adminService.updateRole(id, payload),
    {
      invalidateKeys: [
        queryKeys.admin.roles.all(),
        queryKeys.admin.dashboard(),
      ],
      successMessage: "Role updated successfully",
    },
  );
}

/**
 * Delete a role.
 */
export function useDeleteRole() {
  return useApiMutation((id: number) => adminService.deleteRole(id), {
    invalidateKeys: [queryKeys.admin.roles.all(), queryKeys.admin.dashboard()],
    successMessage: "Role deleted successfully",
  });
}

/**
 * Assign permissions to a role.
 */
export function useAssignPermissions(roleId: number) {
  return useApiMutation(
    (permissions: number[]) =>
      adminService.assignPermissions(roleId, permissions),
    {
      invalidateKeys: [
        queryKeys.admin.roles.all(),
        queryKeys.admin.permissionMatrix(),
      ],
      successMessage: "Permissions assigned successfully",
    },
  );
}
