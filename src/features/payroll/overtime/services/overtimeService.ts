import apiClient from "../../../../api/client";
import type {
  OvertimeDetailResponse,
  OvertimeListParams,
  OvertimeListResponse,
  OvertimeMonthlyReportResponse,
  OvertimeRecord,
} from "../types";

class OvertimeService {
  private baseUrl = "/payroll/overtime";

  private cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  }

  async list(params: OvertimeListParams = {}): Promise<OvertimeListResponse> {
    const cleanParams = this.cleanParams(params);
    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const summary = data?.summary ?? payload?.summary ?? {};
    const recordsBlock =
      data?.records ?? payload?.records ?? data?.data ?? data;

    const records = Array.isArray(recordsBlock?.data)
      ? recordsBlock.data
      : Array.isArray(recordsBlock)
        ? recordsBlock
        : [];

    const paginationSource =
      recordsBlock?.current_page ||
      recordsBlock?.last_page ||
      recordsBlock?.total
        ? recordsBlock
        : data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta ||
          payload?.data?.pagination ||
          payload?.data?.meta ||
          payload?.data ||
          {};

    const totalFromSource =
      paginationSource?.total ?? data?.total ?? payload?.total ?? 0;
    const perPageFromSource =
      paginationSource?.per_page ??
      (cleanParams.per_page as number | undefined);
    const currentPageFromSource =
      paginationSource?.current_page ??
      (cleanParams.page as number | undefined);

    const total =
      typeof totalFromSource === "number" ? totalFromSource : records.length;
    const per_page =
      typeof perPageFromSource === "number"
        ? perPageFromSource
        : records.length || 20;
    const current_page =
      typeof currentPageFromSource === "number" ? currentPageFromSource : 1;
    const last_page =
      typeof paginationSource?.last_page === "number"
        ? paginationSource.last_page
        : Math.max(1, Math.ceil(total / (per_page || 1)));

    const from =
      typeof paginationSource?.from === "number"
        ? paginationSource.from
        : total === 0
          ? 0
          : (current_page - 1) * per_page + 1;
    const to =
      typeof paginationSource?.to === "number"
        ? paginationSource.to
        : total === 0
          ? 0
          : Math.min(total, from + records.length - 1);

    return {
      summary,
      records,
      pagination: {
        current_page,
        last_page,
        per_page,
        total,
        from,
        to,
      },
    };
  }

  async show(id: number): Promise<OvertimeDetailResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};
    return {
      overtime: data?.overtime ?? payload?.overtime ?? data,
    };
  }

  async create(data: Partial<OvertimeRecord>) {
    const response = await apiClient.post(this.baseUrl, data);
    return (response as any)?.data ?? response;
  }

  async update(id: number, data: Partial<OvertimeRecord>) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return (response as any)?.data ?? response;
  }

  async delete(id: number) {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async approve(
    id: number,
    payload?: { approved_hours?: number; approval_remarks?: string },
  ) {
    const response = await apiClient.post(
      `${this.baseUrl}/${id}/approve`,
      payload ?? {},
    );
    return (response as any)?.data ?? response;
  }

  async reject(id: number, payload: { rejection_reason: string }) {
    const response = await apiClient.post(
      `${this.baseUrl}/${id}/reject`,
      payload,
    );
    return (response as any)?.data ?? response;
  }

  async markPaid(
    id: number,
    payload: {
      payment_date: string;
      payment_method?: string;
      reference_number?: string;
      create_voucher?: boolean;
      cash_bank_account_id?: number;
      payment_notes?: string;
    },
  ) {
    const response = await apiClient.post(
      `${this.baseUrl}/${id}/mark-paid`,
      payload,
    );
    return (response as any)?.data ?? response;
  }

  async bulkApprove(overtimeIds: number[]) {
    const response = await apiClient.post(`${this.baseUrl}/bulk-approve`, {
      overtime_ids: overtimeIds,
    });
    return (response as any)?.data ?? response;
  }

  async monthlyReport(
    year: number,
    month: number,
    department_id?: number,
  ): Promise<OvertimeMonthlyReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/report/monthly`, {
      params: this.cleanParams({ year, month, department_id }),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }
}

export const overtimeService = new OvertimeService();
