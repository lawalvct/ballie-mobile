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

export interface BillingCycle {
  cycle: "monthly" | "quarterly" | "biannual" | "yearly";
  label: string;
  price: number;
  formatted_price: string;
  price_per_month: number;
  formatted_price_per_month: string;
  savings_kobo: number;
  savings_label: string | null;
  savings_description: string | null;
}

export interface PlanCapabilities {
  pos: boolean;
  payroll: boolean;
  api_access: boolean;
  advanced_reports: boolean;
}

export interface PlanLimits {
  max_users: number | null;
  max_customers: number | null;
}

export interface Plan {
  id: number;
  slug: string;
  name: string;
  description: string;
  monthly_price: number;
  quarterly_price: number;
  biannual_price: number;
  yearly_price: number;
  billing_cycles: BillingCycle[];
  features: string[];
  limits: PlanLimits;
  capabilities: PlanCapabilities;
  support_level: string;
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
  billing_cycle?: string;
  terms: boolean;
  device_name?: string;
  affiliate_code?: string;
}

export interface OnboardingStep {
  name: string;
  label: string;
  completed: boolean;
}

export interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  current_step: string;
  steps: OnboardingStep[];
  can_skip: boolean;
}

export interface CompanyInfoData {
  logo_base64?: string;
  company_name: string;
  business_structure: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  registration_number?: string;
  tax_id?: string;
}

export interface PreferencesData {
  default_currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  fiscal_year_start: string;
  default_tax_rate?: number;
  payment_methods: string[];
}
