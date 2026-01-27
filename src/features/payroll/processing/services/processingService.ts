import apiClient from "../../../../api/client";
import type {
  PayrollProcessingListParams,
  PayrollProcessingListResponse,
  PayrollProcessingPagination,
  PayrollProcessingPeriod,
  PayrollProcessingRun,
  PayrollProcessingShowResponse,
} from "../types";

class PayrollProcessingService {
  private baseUrl = "/payroll/processing";

  private buildPagination(
    source: any,
    fallbackTotal: number,
    page?: number,
    perPage?: number,
  ): PayrollProcessingPagination {
    const totalFromSource = source?.total ?? fallbackTotal ?? 0;
    const perPageFromSource = source?.per_page ?? perPage;
    const currentPageFromSource = source?.current_page ?? page;

    const total =
      typeof totalFromSource === "number" ? totalFromSource : fallbackTotal;
    const per_page =
      typeof perPageFromSource === "number" ? perPageFromSource : perPage || 20;
    const current_page =
      typeof currentPageFromSource === "number" ? currentPageFromSource : 1;
    const last_page =
      typeof source?.last_page === "number"
        ? source.last_page
        : Math.max(1, Math.ceil(total / (per_page || 1)));

    const from =
      typeof source?.from === "number"
        ? source.from
        : total === 0
          ? 0
          : (current_page - 1) * per_page + 1;
    const to =
      typeof source?.to === "number"
        ? source.to
        : total === 0
          ? 0
          : Math.min(total, from + fallbackTotal - 1);

    return {
      current_page,
      last_page,
      per_page,
      total,
      from,
      to,
    };
  }

  async list(
    params: PayrollProcessingListParams = {},
  ): Promise<PayrollProcessingListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          (typeof value !== "string" || value !== ""),
      ),
    );

    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const periods = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.periods)
        ? data.periods
        : Array.isArray(data)
          ? data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];

    const paginationSource =
      data?.current_page || data?.last_page || data?.total
        ? data
        : data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta ||
          payload?.data?.pagination ||
          payload?.data?.meta ||
          payload?.data;

    return {
      periods,
      pagination: this.buildPagination(
        paginationSource,
        periods.length,
        cleanParams.page as number | undefined,
        cleanParams.per_page as number | undefined,
      ),
    };
  }

  async show(
    id: number,
    params: { per_page?: number } = {},
  ): Promise<PayrollProcessingShowResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          (typeof value !== "string" || value !== ""),
      ),
    );

    const response = await apiClient.get(`${this.baseUrl}/${id}`, {
      params: cleanParams,
    });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const period = data?.period || payload?.period || data?.data || data;

    const runsContainer = data?.runs || payload?.runs || payload?.data?.runs;
    const runs = Array.isArray(runsContainer?.data)
      ? runsContainer.data
      : Array.isArray(runsContainer)
        ? runsContainer
        : [];

    const paginationSource =
      runsContainer?.current_page ||
      runsContainer?.last_page ||
      runsContainer?.total
        ? runsContainer
        : runsContainer?.pagination ||
          runsContainer?.meta ||
          data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta;

    return {
      period,
      runs,
      pagination: runs.length
        ? this.buildPagination(
            paginationSource,
            runs.length,
            paginationSource?.current_page,
            cleanParams.per_page as number | undefined,
          )
        : null,
    };
  }

  async create(
    data: Partial<PayrollProcessingPeriod>,
  ): Promise<PayrollProcessingPeriod> {
    const response = await apiClient.post(this.baseUrl, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.period || payload?.period || payload?.data;
  }

  async update(
    id: number,
    data: Partial<PayrollProcessingPeriod>,
  ): Promise<PayrollProcessingPeriod> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.period || payload?.period || payload?.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async generate(
    id: number,
    data: {
      apply_paye_tax: boolean;
      apply_nsitf: boolean;
      paye_tax_rate?: number | null;
      nsitf_rate?: number | null;
      tax_exemption_reason?: string | null;
    },
  ): Promise<PayrollProcessingPeriod> {
    const response = await apiClient.post(
      `${this.baseUrl}/${id}/generate`,
      data,
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data?.period || payload?.period || payload?.data;
  }

  async approve(id: number): Promise<PayrollProcessingPeriod> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/approve`);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.period || payload?.period || payload?.data;
  }

  async reset(id: number): Promise<PayrollProcessingPeriod> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}/reset`);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.period || payload?.period || payload?.data;
  }

  async exportBankFile(id: number): Promise<any> {
    const response = await apiClient.get(
      `${this.baseUrl}/${id}/export-bank-file`,
    );
    return (response as any)?.data ?? response;
  }
}

export const payrollProcessingService = new PayrollProcessingService();
