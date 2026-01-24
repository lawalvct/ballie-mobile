// Category Service - API Layer
import apiClient from "../../../../api/client";
import type {
  Category,
  CategoryListParams,
  CategoryListResponse,
} from "../types";

class CategoryService {
  private baseUrl = "/inventory/categories";

  async list(params: CategoryListParams = {}): Promise<CategoryListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = response.data;

    const data = payload?.data ?? payload ?? {};
    const categories = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.categories)
          ? data.categories
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
      typeof totalFromSource === "number" ? totalFromSource : categories.length;
    const per_page =
      typeof perPageFromSource === "number"
        ? perPageFromSource
        : categories.length || 15;
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
          : Math.min(total, from + categories.length - 1);

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
      categories,
      pagination,
      statistics,
    };
  }

  async show(id: number): Promise<{
    category: Category;
    children?: Array<{ id: number; name: string; slug?: string }>;
    products?: Array<{
      id: number;
      name: string;
      sku?: string;
      sales_rate?: number;
    }>;
    products_count?: number;
    children_count?: number;
    descendants_count?: number;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    const data = response.data?.data || response.data;
    return {
      category: data?.category || data,
      children: data?.children || [],
      products: data?.products || [],
      products_count: data?.products_count || 0,
      children_count: data?.children_count || 0,
      descendants_count: data?.descendants_count || 0,
    };
  }

  async getFormData(): Promise<{
    parent_categories: Array<{
      id: number;
      name: string;
      slug?: string;
      level?: number;
    }>;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/create`);
    return response.data?.data || response.data || { parent_categories: [] };
  }

  async create(data: Partial<Category>): Promise<Category> {
    const response = await apiClient.post(this.baseUrl, data);
    return (
      response.data?.data?.category || response.data?.data || response.data
    );
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return (
      response.data?.data?.category || response.data?.data || response.data
    );
  }

  async toggleStatus(id: number): Promise<Category> {
    const response = await apiClient.patch(
      `${this.baseUrl}/${id}/toggle-status`,
    );
    return (
      response.data?.data?.category || response.data?.data || response.data
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const categoryService = new CategoryService();
