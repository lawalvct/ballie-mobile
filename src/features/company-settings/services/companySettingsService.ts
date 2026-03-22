import apiClient from "../../../api/client";
import type {
  GetAllSettingsResponse,
  CompanyInfoResponse,
  BusinessDetailsResponse,
  BrandingResponse,
  PreferencesResponse,
  ModulesResponse,
  UpdateCompanyInfoPayload,
  UpdateBusinessDetailsPayload,
  UpdatePreferencesPayload,
  ModuleKey,
} from "../types";

const BASE = "/settings/company";

export const companySettingsService = {
  getAll: () =>
    apiClient.get(BASE) as Promise<GetAllSettingsResponse>,

  // Company Info
  getCompanyInfo: () =>
    apiClient.get(`${BASE}/info`) as Promise<CompanyInfoResponse>,

  updateCompanyInfo: (data: UpdateCompanyInfoPayload) =>
    apiClient.put(`${BASE}/info`, data) as Promise<CompanyInfoResponse>,

  // Business Details
  getBusinessDetails: () =>
    apiClient.get(`${BASE}/business`) as Promise<BusinessDetailsResponse>,

  updateBusinessDetails: (data: UpdateBusinessDetailsPayload) =>
    apiClient.put(`${BASE}/business`, data) as Promise<BusinessDetailsResponse>,

  // Branding
  getBranding: () =>
    apiClient.get(`${BASE}/branding`) as Promise<BrandingResponse>,

  uploadLogo: (imageUri: string) => {
    const ext = imageUri.split(".").pop()?.toLowerCase() ?? "png";
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    const formData = new FormData();
    formData.append("logo", {
      uri: imageUri,
      type: mimeType,
      name: `logo.${ext}`,
    } as any);
    return apiClient.post(`${BASE}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as Promise<BrandingResponse>;
  },

  removeLogo: () =>
    apiClient.delete(`${BASE}/logo`) as Promise<BrandingResponse>,

  // Preferences
  getPreferences: () =>
    apiClient.get(`${BASE}/preferences`) as Promise<PreferencesResponse>,

  updatePreferences: (data: UpdatePreferencesPayload) =>
    apiClient.put(`${BASE}/preferences`, data) as Promise<PreferencesResponse>,

  // Modules
  getModules: () =>
    apiClient.get(`${BASE}/modules`) as Promise<ModulesResponse>,

  updateModules: (modules: ModuleKey[]) =>
    apiClient.put(`${BASE}/modules`, { modules }) as Promise<ModulesResponse>,

  resetModules: () =>
    apiClient.post(`${BASE}/modules/reset`) as Promise<ModulesResponse>,
};
