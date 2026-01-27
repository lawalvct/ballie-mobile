import apiClient from "../../../../api/client";
import type {
  PayrollShift,
  PayrollShiftListParams,
  PayrollShiftListResponse,
  PayrollShiftAssignmentsListParams,
  PayrollShiftAssignmentsListResponse,
  PayrollShiftAssignment,
  PayrollShiftShowResponse,
  PayrollShiftPagination,
} from "../types";

class ShiftService {
  private baseUrl = "/payroll/shifts";

  private buildPagination(
    source: any,
    fallbackTotal: number,
    page?: number,
    perPage?: number,
  ): PayrollShiftPagination {
    const totalFromSource = source?.total ?? fallbackTotal ?? 0;
    const perPageFromSource = source?.per_page ?? perPage;
    const currentPageFromSource = source?.current_page ?? page;

    const total =
      typeof totalFromSource === "number" ? totalFromSource : fallbackTotal;
    const per_page =
      typeof perPageFromSource === "number" ? perPageFromSource : perPage || 15;
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
    params: PayrollShiftListParams = {},
  ): Promise<PayrollShiftListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const shifts = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.shifts)
        ? data.shifts
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
      shifts,
      pagination: this.buildPagination(
        paginationSource,
        shifts.length,
        cleanParams.page as number | undefined,
        cleanParams.per_page as number | undefined,
      ),
    };
  }

  async show(
    id: number,
    params: { per_page?: number } = {},
  ): Promise<PayrollShiftShowResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(`${this.baseUrl}/${id}`, {
      params: cleanParams,
    });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const shift = data?.shift || payload?.shift || data?.data || data;

    const assignmentsContainer =
      data?.assignments || payload?.assignments || payload?.data?.assignments;
    const assignments = Array.isArray(assignmentsContainer?.data)
      ? assignmentsContainer.data
      : Array.isArray(assignmentsContainer)
        ? assignmentsContainer
        : [];

    const paginationSource =
      assignmentsContainer?.current_page ||
      assignmentsContainer?.last_page ||
      assignmentsContainer?.total
        ? assignmentsContainer
        : assignmentsContainer?.pagination ||
          assignmentsContainer?.meta ||
          data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta;

    return {
      shift,
      assignments,
      pagination: assignments.length
        ? this.buildPagination(
            paginationSource,
            assignments.length,
            paginationSource?.current_page,
            cleanParams.per_page as number | undefined,
          )
        : null,
    };
  }

  async create(data: Partial<PayrollShift>): Promise<PayrollShift> {
    const response = await apiClient.post(this.baseUrl, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.shift || payload?.shift || payload?.data;
  }

  async update(id: number, data: Partial<PayrollShift>): Promise<PayrollShift> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.shift || payload?.shift || payload?.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async listAssignments(
    params: PayrollShiftAssignmentsListParams = {},
  ): Promise<PayrollShiftAssignmentsListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(`${this.baseUrl}/assignments`, {
      params: cleanParams,
    });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const assignments = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.assignments)
        ? data.assignments
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
      assignments,
      pagination: this.buildPagination(
        paginationSource,
        assignments.length,
        cleanParams.page as number | undefined,
        cleanParams.per_page as number | undefined,
      ),
    };
  }

  async assignEmployee(
    data: Partial<PayrollShiftAssignment>,
  ): Promise<PayrollShiftAssignment> {
    const response = await apiClient.post(`${this.baseUrl}/assignments`, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.assignment || payload?.assignment || payload?.data;
  }

  async assignEmployeesBulk(data: {
    employee_ids: number[];
    shift_id: number;
    effective_from: string;
    is_permanent: boolean;
    effective_to?: string | null;
  }): Promise<any> {
    const response = await apiClient.post(
      `${this.baseUrl}/assignments/bulk`,
      data,
    );
    return (response as any)?.data ?? response;
  }

  async endAssignment(id: number): Promise<PayrollShiftAssignment> {
    const response = await apiClient.patch(
      `${this.baseUrl}/assignments/${id}/end`,
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data?.assignment || payload?.assignment || payload?.data;
  }
}

export const shiftService = new ShiftService();
