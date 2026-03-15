import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { adminService } from "../services/adminService";

/**
 * Fetch all permissions grouped by module.
 */
export function usePermissions() {
  const query = useApiQuery(
    queryKeys.admin.permissions(),
    () => adminService.listPermissions(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    permissionsByModule: (query.data as any)?.data ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Fetch the full permission matrix (roles × permissions).
 */
export function usePermissionMatrix() {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.admin.permissionMatrix(),
    () => adminService.getPermissionMatrix(),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    matrix: (query.data as any)?.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.permissionMatrix(),
      }),
  };
}
