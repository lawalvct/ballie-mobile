// Unit Service - API Layer
import apiClient from "../../../../api/client";
import type { Unit, UnitListParams, UnitListResponse } from "../types";

class UnitService {
  private baseUrl = "/inventory/units";

  async list(params: UnitListParams = {}): Promise<UnitListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = response.data;

    const data = payload?.data ?? payload ?? {};
    const units = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.units)
          ? data.units
          : Array.isArray(data?.data?.data)
            ? data.data.data
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
      paginationSource?.total ??
      data?.total ??
      payload?.total ??
      payload?.data?.total;
    const perPageFromSource =
      paginationSource?.per_page ??
      (cleanParams.per_page as number | undefined);
    const currentPageFromSource =
      paginationSource?.current_page ??
      (cleanParams.page as number | undefined);

    const total =
      typeof totalFromSource === "number" ? totalFromSource : units.length;
    const per_page =
      typeof perPageFromSource === "number"
        ? perPageFromSource
        : units.length || 15;
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
          : Math.min(total, from + units.length - 1);

    const pagination = {
      current_page,
      last_page,
      per_page,
      total,
      from,
      to,
    };

    const statistics =
      payload?.statistics ||
      data?.statistics ||
      payload?.data?.statistics ||
      payload?.data?.data?.statistics ||
      null;

    return {
      units,
      pagination,
      statistics,
    };
  }

  async show(id: number): Promise<{
    unit: Unit;
    derived_units?: Array<{
      id: number;
      name: string;
      symbol: string;
      conversion_factor?: number;
    }>;
    products?: Array<{
      id: number;
      name: string;
      sku?: string;
      sales_rate?: number;
    }>;
    products_count?: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    const data = response.data?.data || response.data;
    return {
      unit: data?.unit || data,
      derived_units: data?.derived_units || [],
      products: data?.products || [],
      products_count: data?.products_count || 0,
    };
  }

  async getFormData(): Promise<{ base_units: any[] }> {
    const response = await apiClient.get(`${this.baseUrl}/create`);
    return response.data?.data || response.data || { base_units: [] };
  }

  async create(data: Partial<Unit>): Promise<Unit> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data?.data?.unit || response.data?.data || response.data;
  }

  async update(id: number, data: Partial<Unit>): Promise<Unit> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data?.data?.unit || response.data?.data || response.data;
  }

  async toggleStatus(id: number): Promise<Unit> {
    const response = await apiClient.patch(
      `${this.baseUrl}/${id}/toggle-status`,
    );
    return response.data?.data?.unit || response.data?.data || response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const unitService = new UnitService();
