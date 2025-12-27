import apiClient from "../client";
import {
  ApiResponse,
  LoginResponse,
  CheckEmailResponse,
  RegisterData,
  BusinessTypeCategory,
  Plan,
} from "../types";

export const authAPI = {
  /**
   * Check which workspace(s) an email belongs to
   * Optional step before login
   */
  checkEmail: async (
    email: string
  ): Promise<ApiResponse<CheckEmailResponse>> => {
    return apiClient.post("/auth/check-email", { email });
  },

  /**
   * Login with email (auto-detect tenant)
   * If user belongs to ONE tenant: Returns token immediately
   * If user belongs to MULTIPLE tenants: Returns list of workspaces
   */
  login: async (
    email: string,
    password: string,
    deviceName: string = "Ballie Mobile App"
  ): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post("/auth/login", {
      email,
      password,
      device_name: deviceName,
    });
  },

  /**
   * Select tenant if user belongs to multiple workspaces
   * Use the tenant_id from the tenants array returned by login
   */
  selectTenant: async (
    email: string,
    password: string,
    tenantId: number,
    deviceName: string = "Ballie Mobile App"
  ): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post("/auth/select-tenant", {
      email,
      password,
      tenant_id: tenantId,
      device_name: deviceName,
    });
  },

  /**
   * Get business types for registration (Step 1)
   */
  getBusinessTypes: async (): Promise<
    ApiResponse<BusinessTypeCategory[]>
  > => {
    return apiClient.get("/auth/business-types");
  },

  /**
   * Get subscription plans for registration (Step 3)
   */
  getPlans: async (): Promise<ApiResponse<Plan[]>> => {
    return apiClient.get("/auth/plans");
  },

  /**
   * Register new user with complete business setup (Step 4)
   * Creates tenant + owner user with 30-day free trial
   */
  register: async (
    userData: RegisterData
  ): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post("/auth/register", userData);
  },

  /**
   * Forgot password
   * tenant_slug is optional - if omitted, finds first user with that email
   */
  forgotPassword: async (
    email: string,
    tenantSlug?: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post("/auth/forgot-password", {
      email,
      ...(tenantSlug && { tenant_slug: tenantSlug }),
    });
  },

  /**
   * Logout current session
   */
  logout: async (tenantSlug: string): Promise<ApiResponse<null>> => {
    return apiClient.post(`/tenant/${tenantSlug}/auth/logout`);
  },

  /**
   * Logout all devices
   */
  logoutAll: async (tenantSlug: string): Promise<ApiResponse<null>> => {
    return apiClient.post(`/tenant/${tenantSlug}/auth/logout-all`);
  },
};
