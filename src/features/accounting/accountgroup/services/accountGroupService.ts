// Account Group API Service
import {
  AccountGroup,
  CreateAccountGroupPayload,
  UpdateAccountGroupPayload,
  ListParams,
  FormData,
} from "../types";
import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = async () => {
  const tenantSlug = await AsyncStorage.getItem("tenant_slug");
  if (!tenantSlug) {
    throw new Error("Tenant slug not found. Please login again.");
  }
  return `/tenant/${tenantSlug}/accounting/account-groups`;
};

export const accountGroupService = {
  /**
   * Get form data for creating account group
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
   * Create new account group
   */
  create: async (payload: CreateAccountGroupPayload): Promise<AccountGroup> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(baseUrl, payload);
      return response.data.account_group;
    } catch (error) {
      console.error("Error creating account group:", error);
      throw error;
    }
  },

  /**
   * Get list of account groups
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
        `${baseUrl}${queryString ? `?${queryString}` : ""}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching account groups:", error);
      throw error;
    }
  },

  /**
   * Get single account group details
   */
  show: async (id: number): Promise<AccountGroup> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.get<any>(`${baseUrl}/${id}`);
      return response.data.account_group;
    } catch (error) {
      console.error("Error fetching account group:", error);
      throw error;
    }
  },

  /**
   * Update account group
   */
  update: async (
    id: number,
    payload: UpdateAccountGroupPayload
  ): Promise<AccountGroup> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.put<any>(`${baseUrl}/${id}`, payload);
      return response.data.account_group;
    } catch (error) {
      console.error("Error updating account group:", error);
      throw error;
    }
  },

  /**
   * Delete account group
   */
  delete: async (id: number): Promise<void> => {
    try {
      const baseUrl = await getBaseUrl();
      await apiClient.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error("Error deleting account group:", error);
      throw error;
    }
  },

  /**
   * Toggle active status
   */
  toggleStatus: async (id: number): Promise<AccountGroup> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await apiClient.post<any>(`${baseUrl}/${id}/toggle`);
      return response.data.account_group;
    } catch (error) {
      console.error("Error toggling status:", error);
      throw error;
    }
  },
};
