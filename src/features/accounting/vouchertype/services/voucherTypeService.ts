// Voucher Type API Service
import {
  VoucherType,
  CreateVoucherTypePayload,
  UpdateVoucherTypePayload,
  ListParams,
  FormData,
  BulkActionPayload,
  BulkActionResult,
  ResetNumberingPayload,
} from "../types";
import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = async () => {
  const tenantSlug = await AsyncStorage.getItem("tenant_slug");
  if (!tenantSlug) {
    throw new Error("Tenant slug not found. Please login again.");
  }
  return `/tenant/${tenantSlug}/accounting/voucher-types`;
};

export const voucherTypeService = {
  /**
   * Get form data for creating voucher type
   */
  getFormData: async (): Promise<FormData> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.get<any>(`${baseUrl}/create`);
      return response.data;
    } catch (error) {
      console.error("Error fetching form data:", error);
      throw error;
    }
  },

  /**
   * Create new voucher type
   */
  create: async (payload: CreateVoucherTypePayload): Promise<VoucherType> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(baseUrl, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating voucher type:", error);
      throw error;
    }
  },

  /**
   * Get list of voucher types
   */
  list: async (params: ListParams = {}) => {
    try {
      const baseUrl = await getBaseUrl();

      // Filter out undefined and empty string values
      const cleanParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = String(value);
        }
      });

      const queryString = new URLSearchParams(cleanParams).toString();
      const response = await apiClient.get<any>(
        `${baseUrl}${queryString ? `?${queryString}` : ""}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching voucher types:", error);
      throw error;
    }
  },

  /**
   * Get single voucher type details
   */
  show: async (id: number): Promise<VoucherType> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.get<any>(`${baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching voucher type:", error);
      throw error;
    }
  },

  /**
   * Update voucher type
   */
  update: async (
    id: number,
    payload: UpdateVoucherTypePayload,
  ): Promise<VoucherType> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.put<any>(`${baseUrl}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating voucher type:", error);
      throw error;
    }
  },

  /**
   * Delete voucher type
   */
  delete: async (id: number): Promise<void> => {
    try {
      const baseUrl = await getBaseUrl();
      await apiClient.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error("Error deleting voucher type:", error);
      throw error;
    }
  },

  /**
   * Toggle voucher type status
   */
  toggle: async (id: number): Promise<VoucherType> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(`${baseUrl}/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error("Error toggling voucher type:", error);
      throw error;
    }
  },

  /**
   * Reset numbering for auto-numbered voucher type
   */
  resetNumbering: async (
    id: number,
    payload: ResetNumberingPayload,
  ): Promise<VoucherType> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(
        `${baseUrl}/${id}/reset-numbering`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting numbering:", error);
      throw error;
    }
  },

  /**
   * Perform bulk action on voucher types
   */
  bulkAction: async (payload: BulkActionPayload): Promise<BulkActionResult> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(
        `${baseUrl}/bulk-action`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Error performing bulk action:", error);
      throw error;
    }
  },

  /**
   * Search voucher types (simplified for selection)
   */
  search: async (
    search?: string,
    category?: string,
  ): Promise<VoucherType[]> => {
    try {
      const baseUrl = await getBaseUrl();
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;

      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get<any>(
        `${baseUrl}/search${queryString ? `?${queryString}` : ""}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error searching voucher types:", error);
      throw error;
    }
  },
};
