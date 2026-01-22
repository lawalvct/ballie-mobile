import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerListParams,
  CustomerListResponse,
  CustomerListItem,
  CustomerDetails,
  CustomerStatistics,
  CustomerStatementsResponse,
  CustomerStatementsStats,
  CustomerStatementDetail,
} from "../types";

class CustomerService {
  private baseUrl = "/crm/customers";

  async list(params: CustomerListParams = {}): Promise<{
    data: CustomerListItem[];
    pagination: CustomerListResponse;
    statistics: CustomerStatistics | null;
  }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get<{
      success: boolean;
      data: CustomerListResponse;
      statistics?: CustomerStatistics;
    }>(this.baseUrl, { params: cleanParams });

    const payload = response as any;
    const listData = payload?.data || {};

    return {
      data: listData?.data || [],
      pagination: listData,
      statistics: payload?.statistics ?? null,
    };
  }

  async create(data: CustomerCreatePayload): Promise<CustomerDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: CustomerDetails;
    }>(this.baseUrl, data);

    return (response as any).data || response;
  }

  async show(id: number): Promise<{
    customer: CustomerDetails;
    outstanding_balance?: number;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        customer: CustomerDetails;
        outstanding_balance?: number;
      };
    }>(`${this.baseUrl}/${id}`);

    const payload = response as any;
    return payload?.data ?? payload;
  }

  async update(
    id: number,
    data: CustomerUpdatePayload,
  ): Promise<CustomerDetails> {
    const response = await apiClient.put<{
      success: boolean;
      data: CustomerDetails;
    }>(`${this.baseUrl}/${id}`, data);

    return (response as any).data || response;
  }

  async toggleStatus(id: number): Promise<CustomerDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: CustomerDetails;
    }>(`${this.baseUrl}/${id}/toggle-status`);

    return (response as any).data || response;
  }

  async statements(params: CustomerListParams = {}): Promise<{
    data: CustomerStatementsResponse;
    statistics: CustomerStatementsStats | null;
  }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get<{
      success: boolean;
      data: CustomerStatementsResponse;
      statistics?: CustomerStatementsStats;
    }>(`${this.baseUrl}/statements`, { params: cleanParams });

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
  ): Promise<CustomerStatementDetail> {
    const response = await apiClient.get<{
      success: boolean;
      data: CustomerStatementDetail;
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
    // Returns the download URL for the PDF
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
    // Returns the download URL for the Excel file
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

export const customerService = new CustomerService();
