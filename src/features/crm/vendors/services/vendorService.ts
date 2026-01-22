import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  VendorCreatePayload,
  VendorUpdatePayload,
  VendorListParams,
  VendorListResponse,
  VendorListItem,
  VendorDetails,
  VendorStatistics,
  VendorStatementsResponse,
  VendorStatementsStats,
  VendorStatementDetail,
} from "../types";

class VendorService {
  private baseUrl = "/crm/vendors";

  async list(params: VendorListParams = {}): Promise<{
    data: VendorListItem[];
    pagination: VendorListResponse;
    statistics: VendorStatistics | null;
  }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get<{
      success: boolean;
      data: VendorListResponse;
      statistics?: VendorStatistics;
    }>(this.baseUrl, { params: cleanParams });

    const payload = response as any;
    const listData = payload?.data || {};

    return {
      data: listData?.data || [],
      pagination: listData,
      statistics: payload?.statistics ?? null,
    };
  }

  async create(data: VendorCreatePayload): Promise<VendorDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: VendorDetails;
    }>(this.baseUrl, data);

    return (response as any).data || response;
  }

  async show(id: number): Promise<{
    vendor: VendorDetails;
    outstanding_balance?: number;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        vendor: VendorDetails;
        outstanding_balance?: number;
      };
    }>(`${this.baseUrl}/${id}`);

    const payload = response as any;
    return payload?.data ?? payload;
  }

  async update(id: number, data: VendorUpdatePayload): Promise<VendorDetails> {
    const response = await apiClient.put<{
      success: boolean;
      data: VendorDetails;
    }>(`${this.baseUrl}/${id}`, data);

    return (response as any).data || response;
  }

  async toggleStatus(id: number): Promise<VendorDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: VendorDetails;
    }>(`${this.baseUrl}/${id}/toggle-status`);

    return (response as any).data || response;
  }

  async statements(params: VendorListParams = {}): Promise<{
    data: VendorStatementsResponse;
    statistics: VendorStatementsStats | null;
  }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    console.log("Fetching vendor statements with params:", cleanParams);

    const response = await apiClient.get<{
      success: boolean;
      data: VendorStatementsResponse;
      statistics?: VendorStatementsStats;
    }>(`${this.baseUrl}/statements`, { params: cleanParams });

    console.log(
      "Raw vendor statements response:",
      JSON.stringify(response, null, 2),
    );

    const payload = response as any;

    return {
      data: payload?.data || { data: [] },
      statistics: payload?.statistics ?? null,
    };
  }

  async statementDetail(
    id: number,
    startDate: string,
    endDate: string,
  ): Promise<VendorStatementDetail> {
    const response = await apiClient.get<{
      success: boolean;
      data: VendorStatementDetail;
    }>(`${this.baseUrl}/${id}/statement`, {
      params: { start_date: startDate, end_date: endDate },
    });

    const payload = response as any;
    return payload?.data || payload;
  }

  async exportStatementPDF(
    id: number,
    startDate: string,
    endDate: string,
  ): Promise<string> {
    const token = await AsyncStorage.getItem("auth_token");
    const tenantSlug = await AsyncStorage.getItem("tenant_slug");

    const baseUrl = apiClient.defaults.baseURL;
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    return `${baseUrl}/tenant/${tenantSlug}${this.baseUrl}/${id}/statement/pdf?${params.toString()}&access_token=${token}`;
  }

  async exportStatementExcel(
    id: number,
    startDate: string,
    endDate: string,
  ): Promise<string> {
    const token = await AsyncStorage.getItem("auth_token");
    const tenantSlug = await AsyncStorage.getItem("tenant_slug");

    const baseUrl = apiClient.defaults.baseURL;
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    return `${baseUrl}/tenant/${tenantSlug}${this.baseUrl}/${id}/statement/excel?${params.toString()}&access_token=${token}`;
  }
}

export const vendorService = new VendorService();
