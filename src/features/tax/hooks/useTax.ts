// ── Tax / Statutory React Query Hooks ────────────────────────────────────────
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { taxService } from "../services/taxService";
import type {
  StatutoryDashboard,
  VatReport,
  PayeReport,
  PensionReport,
  NsitfReport,
  TaxSettings,
  TaxSettingsUpdatePayload,
  FilingListResponse,
  FilingListFilters,
  CreateFilingPayload,
  UpdateFilingStatusPayload,
  TaxFiling,
  ReportFilters,
  PayeReportFilters,
} from "../types";

// ── Dashboard ────────────────────────────────────────────────────────────────
export function useTaxDashboard() {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: StatutoryDashboard }>(
    queryKeys.tax.dashboard(),
    () => taxService.getDashboard(),
    { staleTime: 60_000 },
  );

  const dashboard = (query.data as any)?.data as
    | StatutoryDashboard
    | undefined;

  return {
    dashboard,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.dashboard() }),
  };
}

// ── VAT Report ───────────────────────────────────────────────────────────────
export function useVatReport(filters: ReportFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: VatReport }>(
    queryKeys.tax.vatReport(filters),
    () => taxService.getVatReport(filters),
    { staleTime: 60_000 },
  );

  const report = (query.data as any)?.data as VatReport | undefined;

  return {
    report,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.vatReport(filters),
      }),
  };
}

// ── PAYE Report ──────────────────────────────────────────────────────────────
export function usePayeReport(filters: PayeReportFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: PayeReport }>(
    queryKeys.tax.payeReport(filters),
    () => taxService.getPayeReport(filters),
    { staleTime: 60_000 },
  );

  const report = (query.data as any)?.data as PayeReport | undefined;

  return {
    report,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.payeReport(filters),
      }),
  };
}

// ── Pension Report ───────────────────────────────────────────────────────────
export function usePensionReport(filters: ReportFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: PensionReport }>(
    queryKeys.tax.pensionReport(filters),
    () => taxService.getPensionReport(filters),
    { staleTime: 60_000 },
  );

  const report = (query.data as any)?.data as PensionReport | undefined;

  return {
    report,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.pensionReport(filters),
      }),
  };
}

// ── NSITF Report ─────────────────────────────────────────────────────────────
export function useNsitfReport(filters: ReportFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: NsitfReport }>(
    queryKeys.tax.nsitfReport(filters),
    () => taxService.getNsitfReport(filters),
    { staleTime: 60_000 },
  );

  const report = (query.data as any)?.data as NsitfReport | undefined;

  return {
    report,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.nsitfReport(filters),
      }),
  };
}

// ── Tax Settings ─────────────────────────────────────────────────────────────
export function useTaxSettings() {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: TaxSettings }>(
    queryKeys.tax.settings(),
    () => taxService.getSettings(),
    { staleTime: 120_000 },
  );

  const settings = (query.data as any)?.data as TaxSettings | undefined;

  return {
    settings,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tax.settings() }),
  };
}

export function useUpdateTaxSettings() {
  return useApiMutation<
    { data: TaxSettings; message: string },
    TaxSettingsUpdatePayload
  >((payload) => taxService.updateSettings(payload), {
    invalidateKeys: [queryKeys.tax.settings()],
    successMessage: "Tax settings updated",
  });
}

// ── Filing History ───────────────────────────────────────────────────────────
export function useTaxFilings(filters: FilingListFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ data: FilingListResponse }>(
    queryKeys.tax.filings.list(filters),
    () => taxService.getFilings(filters),
    { staleTime: 60_000 },
  );

  const response = (query.data as any)?.data as
    | FilingListResponse
    | undefined;

  return {
    filings: response?.filings ?? [],
    pagination: response?.pagination ?? null,
    summary: response?.summary ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.filings.list(filters),
      }),
  };
}

export function useCreateFiling() {
  return useApiMutation<
    { data: TaxFiling; message: string },
    CreateFilingPayload
  >((payload) => taxService.createFiling(payload), {
    invalidateKeys: [queryKeys.tax.filings.all()],
    successMessage: "Tax filing recorded",
  });
}

export function useUpdateFilingStatus() {
  return useApiMutation<
    { data: TaxFiling; message: string },
    { id: number; payload: UpdateFilingStatusPayload }
  >(({ id, payload }) => taxService.updateFilingStatus(id, payload), {
    invalidateKeys: [queryKeys.tax.filings.all()],
    successMessage: "Filing status updated",
  });
}

export function useDeleteFiling() {
  return useApiMutation<{ message: string }, number>(
    (id) => taxService.deleteFiling(id),
    {
      invalidateKeys: [queryKeys.tax.filings.all()],
      successMessage: "Filing deleted",
    },
  );
}
