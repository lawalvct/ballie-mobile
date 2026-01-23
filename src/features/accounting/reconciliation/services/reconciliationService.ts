import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CreateReconciliationPayload,
  ReconciliationDetailResponse,
  ReconciliationFormResponse,
  ReconciliationListResponse,
  UpdateReconciliationItemPayload,
} from "../types";

const getBaseUrl = async () => {
  const tenantSlug = await AsyncStorage.getItem("tenant_slug");
  if (!tenantSlug) {
    throw new Error("Tenant slug not found. Please login again.");
  }
  return `/tenant/${tenantSlug}/banking/reconciliations`;
};

const normalizeListResponse = (response: any): ReconciliationListResponse => {
  const wrapper = response?.data ? response : { data: response };
  const listData = wrapper.data || {};

  const reconciliations = listData.data || listData.reconciliations || [];
  const pagination = listData.current_page
    ? {
        current_page: listData.current_page,
        last_page: listData.last_page,
        per_page: listData.per_page,
        total: listData.total,
        from: listData.from ?? null,
        to: listData.to ?? null,
      }
    : null;

  return {
    reconciliations,
    pagination,
    statistics: wrapper.statistics || listData.statistics || null,
    banks: wrapper.banks || listData.banks || [],
  };
};

export const reconciliationService = {
  async list(
    params: Record<string, any> = {},
  ): Promise<ReconciliationListResponse> {
    const baseUrl = await getBaseUrl();
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(baseUrl, { params: cleanParams });
    return normalizeListResponse(response);
  },

  async getFormData(): Promise<ReconciliationFormResponse> {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.get(`${baseUrl}/create`);
    return response.data || response;
  },

  async create(payload: CreateReconciliationPayload) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.post(baseUrl, payload);
    return response.data || response;
  },

  async show(id: number): Promise<ReconciliationDetailResponse> {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.get(`${baseUrl}/${id}`);
    return response.data || response;
  },

  async updateItemStatus(id: number, payload: UpdateReconciliationItemPayload) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.post(
      `${baseUrl}/${id}/items/status`,
      payload,
    );
    return response.data || response;
  },

  async complete(id: number) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.post(`${baseUrl}/${id}/complete`);
    return response.data || response;
  },

  async cancel(id: number) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.post(`${baseUrl}/${id}/cancel`);
    return response.data || response;
  },

  async remove(id: number) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.delete(`${baseUrl}/${id}`);
    return response.data || response;
  },
};
