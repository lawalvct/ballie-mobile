import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  BankFormDataResponse,
  CreateBankPayload,
  ListParams,
  ListResponse,
} from "../types";

const getBaseUrl = async () => {
  const tenantSlug = await AsyncStorage.getItem("tenant_slug");
  if (!tenantSlug) {
    throw new Error("Tenant slug not found. Please login again.");
  }
  return `/tenant/${tenantSlug}/banking/banks`;
};

const normalizeListResponse = (response: any): ListResponse => {
  const wrapper = response?.data ? response : { data: response };
  const listData = wrapper.data || {};

  const banks = listData.data || listData.banks || [];
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
    banks,
    pagination,
    statistics: wrapper.statistics || listData.statistics || null,
    bank_names: wrapper.bank_names || listData.bank_names || [],
  };
};

export const bankService = {
  async getFormData(): Promise<BankFormDataResponse> {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.get(`${baseUrl}/create`);
    return response.data || response;
  },
  async list(params: ListParams = {}): Promise<ListResponse> {
    const baseUrl = await getBaseUrl();
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(baseUrl, { params: cleanParams });
    return normalizeListResponse(response);
  },

  async create(payload: CreateBankPayload) {
    const baseUrl = await getBaseUrl();
    const response: any = await apiClient.post(baseUrl, payload);
    return response.data || response;
  },
};
