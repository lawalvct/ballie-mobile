import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { departmentService } from "../../department/services/departmentService";
import { positionService } from "../../position/services/positionService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollPosition } from "../../position/types";

/**
 * Fetches departments and positions for filter dropdowns.
 *
 * These are reference data that change rarely, so we use a 10-minute stale
 * time. The hook runs a single parallel fetch for both lists and exposes
 * the arrays directly.
 *
 * Usage:
 *   const { departments, positions } = usePayrollFilterData();
 */
export function usePayrollFilterData() {
  const deptQuery = useApiQuery(
    queryKeys.departments.list({ per_page: 1000 }),
    () => departmentService.list({ per_page: 1000 }),
    { staleTime: 10 * 60 * 1000 },
  );

  const posQuery = useApiQuery(
    queryKeys.positions.list({ per_page: 1000 }),
    () => positionService.list({ per_page: 1000 }),
    { staleTime: 10 * 60 * 1000 },
  );

  return {
    departments: (deptQuery.data?.departments ?? []) as PayrollDepartment[],
    positions: (posQuery.data?.positions ?? []) as PayrollPosition[],
    isLoadingFilters: deptQuery.isLoading || posQuery.isLoading,
  };
}
