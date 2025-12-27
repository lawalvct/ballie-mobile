// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  tour_completed: boolean;
  last_login_at: string | null;
  created_at: string;
}

// Tenant types
export interface Tenant {
  id: number;
  slug: string;
  name: string;
}

export interface TenantInfo {
  tenant_id: number;
  tenant_slug: string;
  tenant_name: string;
  user_role: string;
}

// Auth responses
export interface LoginResponse {
  user: User;
  token: string;
  tenant: Tenant;
  token_type: string;
  multiple_tenants?: boolean;
  tenants?: TenantInfo[];
}

export interface CheckEmailResponse {
  email: string;
  multiple_tenants: boolean;
  tenants: TenantInfo[];
}

export interface RegisterData {
  tenant_slug: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  device_name?: string;
}
