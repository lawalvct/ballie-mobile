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

export interface BusinessType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface BusinessTypeCategory {
  category: string;
  types: BusinessType[];
}

export interface PlanCapabilities {
  pos: boolean;
  payroll: boolean;
  api_access: boolean;
}

export interface PlanLimits {
  max_users: number;
  max_customers: number;
}

export interface Plan {
  id: number;
  name: string;
  monthly_price: number;
  formatted_monthly_price: string;
  yearly_price: number;
  formatted_yearly_price: string;
  yearly_savings_percent: number;
  features: string[];
  limits: PlanLimits;
  capabilities: PlanCapabilities;
  is_popular: boolean;
}

export interface RegisterData {
  business_type_id: number;
  business_structure?: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  business_name: string;
  phone?: string;
  plan_id: number;
  terms: boolean;
  device_name?: string;
  affiliate_code?: string;
}
