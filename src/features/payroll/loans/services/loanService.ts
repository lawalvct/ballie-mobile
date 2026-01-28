import apiClient from "../../../../api/client";
import type {
  LoanDetailResponse,
  LoanListParams,
  LoanListResponse,
  SalaryAdvancePayload,
  SalaryAdvanceResponse,
} from "../types";

class LoanService {
  private loansUrl = "/payroll/loans";
  private salaryAdvanceUrl = "/payroll/salary-advance";

  private cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  }

  async issueSalaryAdvance(
    payload: SalaryAdvancePayload,
  ): Promise<SalaryAdvanceResponse> {
    const response = await apiClient.post(this.salaryAdvanceUrl, payload);
    const data = (response as any)?.data ?? response;
    const body = data?.data ?? data ?? {};
    return {
      loan: body?.loan ?? data?.loan ?? body?.data?.loan,
      voucher: body?.voucher ?? data?.voucher,
    };
  }

  async list(params: LoanListParams = {}): Promise<LoanListResponse> {
    const cleanParams = this.cleanParams(params);
    const response = await apiClient.get(this.loansUrl, {
      params: cleanParams,
    });
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

  async show(id: number): Promise<LoanDetailResponse> {
    const response = await apiClient.get(`${this.loansUrl}/${id}`);
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};
    return {
      loan: data?.loan ?? payload?.loan ?? data,
    };
  }
}

export const loanService = new LoanService();
