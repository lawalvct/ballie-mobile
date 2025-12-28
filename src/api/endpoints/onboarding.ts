import apiClient from "../client";
import {
  ApiResponse,
  OnboardingStatus,
  CompanyInfoData,
  PreferencesData,
} from "../types";

export const onboardingAPI = {
  /**
   * Get onboarding status
   * Check if user needs to complete onboarding
   */
  getStatus: async (
    tenantSlug: string
  ): Promise<ApiResponse<OnboardingStatus>> => {
    return apiClient.get(`/tenant/${tenantSlug}/onboarding/status`);
  },

  /**
   * Save company information (Step 1)
   */
  saveCompanyInfo: async (
    tenantSlug: string,
    data: CompanyInfoData
  ): Promise<ApiResponse<any>> => {
    return apiClient.post(`/tenant/${tenantSlug}/onboarding/company`, data);
  },

  /**
   * Save preferences (Step 2)
   */
  savePreferences: async (
    tenantSlug: string,
    data: PreferencesData
  ): Promise<ApiResponse<any>> => {
    return apiClient.post(`/tenant/${tenantSlug}/onboarding/preferences`, data);
  },

  /**
   * Complete onboarding
   * Marks onboarding as complete and seeds default data
   */
  complete: async (tenantSlug: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/tenant/${tenantSlug}/onboarding/complete`);
  },

  /**
   * Skip onboarding (Quick Start)
   * Uses sensible defaults
   */
  skip: async (tenantSlug: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/tenant/${tenantSlug}/onboarding/skip`);
  },
};
