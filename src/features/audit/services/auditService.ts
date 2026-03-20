// ── Audit API Service ────────────────────────────────────────────────────────
import apiClient from "../../../api/client";
import type {
  AuditDashboardFilters,
  AuditDashboardResponse,
  AuditTrailResponse,
  AuditModelType,
} from "../types";

const BASE = "/reports/audit";

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

export const auditService = {
  /**
   * GET /reports/audit
   * Fetch audit dashboard with stats, users and paginated activities.
   */
  getDashboard: async (
    filters: AuditDashboardFilters = {},
  ): Promise<{ data: AuditDashboardResponse }> => {
    return apiClient.get(`${BASE}${buildQuery(filters)}`);
  },

  /**
   * GET /reports/audit/{model}/{id}
   * Fetch the full audit trail for a specific record.
   */
  getTrail: async (
    model: AuditModelType,
    id: number,
  ): Promise<{ data: AuditTrailResponse }> => {
    return apiClient.get(`${BASE}/${encodeURIComponent(model)}/${id}`);
  },
};
