import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { employeeService } from "../services/employeeService";
import type { PayrollEmployeeListParams } from "../types";

/**
 * Fetches a paginated, filtered employee list via TanStack Query.
 *
 * - Data is cached per unique `params` combination (2-min stale).
 * - `placeholderData: keepPreviousData` keeps the previous page visible
 *   while a new page/filter loads, eliminating blank flash.
 * - `refresh()` invalidates the entire employees cache so the next
 *   mount/focus triggers a background re-fetch.
 *
 * Usage:
 *   const { employees, pagination, isLoading, isRefreshing, refresh } =
 *     useEmployees(filters);
 */
export function useEmployees(params: PayrollEmployeeListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.employees.list(params as Record<string, any>),
    () => employeeService.list(params),
    {
      staleTime: 2 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  };

  return {
    employees: query.data?.employees ?? [],
    pagination: query.data?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0,
    },
    isLoading: query.isLoading,
    /** true while a background re-fetch is in progress (page/filter change) */
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
