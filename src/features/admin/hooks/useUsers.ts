import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { adminService } from "../services/adminService";
import type {
  UserListParams,
  CreateUserPayload,
  UpdateUserPayload,
} from "../types";

/**
 * Paginated user list with search/filter support.
 */
export function useUsers(params: UserListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.admin.users.list(params as Record<string, any>),
    () => adminService.listUsers(params),
    { staleTime: 2 * 60 * 1000, placeholderData: keepPreviousData },
  );

  return {
    users: (query.data as any)?.data ?? [],
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
        queryKey: queryKeys.admin.users.all(),
      }),
  };
}

/**
 * Fetch a single user's detail.
 */
export function useUserDetail(id: number) {
  const query = useApiQuery(
    queryKeys.admin.users.detail(id),
    () => adminService.showUser(id),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    user: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
  };
}

/**
 * Fetch available roles for the create-user form.
 */
export function useUserFormData() {
  const query = useApiQuery(
    queryKeys.admin.users.formData(),
    () => adminService.getUserFormData(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    roles: (query.data as any)?.data?.roles ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Create a new user.
 */
export function useCreateUser() {
  return useApiMutation(
    (payload: CreateUserPayload) => adminService.createUser(payload),
    {
      invalidateKeys: [
        queryKeys.admin.users.all(),
        queryKeys.admin.dashboard(),
      ],
      successMessage: "User created successfully",
    },
  );
}

/**
 * Update an existing user.
 */
export function useUpdateUser(id: number) {
  return useApiMutation(
    (payload: UpdateUserPayload) => adminService.updateUser(id, payload),
    {
      invalidateKeys: [
        queryKeys.admin.users.all(),
        queryKeys.admin.dashboard(),
      ],
      successMessage: "User updated successfully",
    },
  );
}

/**
 * Delete a user.
 */
export function useDeleteUser() {
  return useApiMutation((id: number) => adminService.deleteUser(id), {
    invalidateKeys: [queryKeys.admin.users.all(), queryKeys.admin.dashboard()],
    successMessage: "User deleted successfully",
  });
}

/**
 * Toggle a user's active status.
 */
export function useToggleUserStatus() {
  return useApiMutation((id: number) => adminService.toggleUserStatus(id), {
    invalidateKeys: [queryKeys.admin.users.all(), queryKeys.admin.dashboard()],
    successMessage: "User status updated",
  });
}
