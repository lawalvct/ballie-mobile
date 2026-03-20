// ── Tax / Statutory API Service ──────────────────────────────────────────────
import apiClient from "../../../api/client";
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

const BASE = "/statutory";

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

export const taxService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<{ data: StatutoryDashboard }> => {
    return apiClient.get(`${BASE}/dashboard`);
  },

  // ── VAT Report ─────────────────────────────────────────────────────────────
  getVatReport: async (
    filters: ReportFilters = {},
  ): Promise<{ data: VatReport }> => {
    return apiClient.get(`${BASE}/vat/report${buildQuery(filters)}`);
  },

  // ── PAYE Report ────────────────────────────────────────────────────────────
  getPayeReport: async (
    filters: PayeReportFilters = {},
  ): Promise<{ data: PayeReport }> => {
    return apiClient.get(`${BASE}/paye/report${buildQuery(filters)}`);
  },

  // ── Pension Report ─────────────────────────────────────────────────────────
  getPensionReport: async (
    filters: ReportFilters = {},
  ): Promise<{ data: PensionReport }> => {
    return apiClient.get(`${BASE}/pension/report${buildQuery(filters)}`);
  },

  // ── NSITF Report ───────────────────────────────────────────────────────────
  getNsitfReport: async (
    filters: ReportFilters = {},
  ): Promise<{ data: NsitfReport }> => {
    return apiClient.get(`${BASE}/nsitf/report${buildQuery(filters)}`);
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  getSettings: async (): Promise<{ data: TaxSettings }> => {
    return apiClient.get(`${BASE}/settings`);
  },

  updateSettings: async (
    payload: TaxSettingsUpdatePayload,
  ): Promise<{ data: TaxSettings; message: string }> => {
    return apiClient.put(`${BASE}/settings`, payload);
  },

  // ── Filing History ─────────────────────────────────────────────────────────
  getFilings: async (
    filters: FilingListFilters = {},
  ): Promise<{ data: FilingListResponse }> => {
    return apiClient.get(`${BASE}/filings${buildQuery(filters)}`);
  },

  createFiling: async (
    payload: CreateFilingPayload,
  ): Promise<{ data: TaxFiling; message: string }> => {
    return apiClient.post(`${BASE}/filings`, payload);
  },

  updateFilingStatus: async (
    id: number,
    payload: UpdateFilingStatusPayload,
  ): Promise<{ data: TaxFiling; message: string }> => {
    return apiClient.patch(`${BASE}/filings/${id}/status`, payload);
  },

  deleteFiling: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`${BASE}/filings/${id}`);
  },
};
