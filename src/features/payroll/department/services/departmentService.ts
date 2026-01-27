import apiClient from "../../../../api/client";
import type {
  PayrollDepartment,
  PayrollDepartmentListParams,
  PayrollDepartmentListResponse,
} from "../types";

class DepartmentService {
  private baseUrl = "/payroll/departments";

  async list(
    params: PayrollDepartmentListParams = {},
  ): Promise<PayrollDepartmentListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const departments = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.departments)
        ? data.departments
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

    const totalFromSource =
      paginationSource?.total ?? data?.total ?? payload?.total ?? 0;
    const perPageFromSource =
      paginationSource?.per_page ??
      (cleanParams.per_page as number | undefined);
    const currentPageFromSource =
      paginationSource?.current_page ??
      (cleanParams.page as number | undefined);

    const total =
      typeof totalFromSource === "number"
        ? totalFromSource
        : departments.length;
    const per_page =
      typeof perPageFromSource === "number"
        ? perPageFromSource
        : departments.length || 15;
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
          : Math.min(total, from + departments.length - 1);

    return {
      departments,
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

  async show(id: number): Promise<PayrollDepartment> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.department || payload?.department || payload?.data;
  }

  async create(data: Partial<PayrollDepartment>): Promise<PayrollDepartment> {
    const response = await apiClient.post(this.baseUrl, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.department || payload?.department || payload?.data;
  }

  async update(
    id: number,
    data: Partial<PayrollDepartment>,
  ): Promise<PayrollDepartment> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    const payload = (response as any)?.data ?? response;
    return payload?.data?.department || payload?.department || payload?.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const departmentService = new DepartmentService();
