import type { ApiResponse } from "../../api/types";

// ─── Company Info ────────────────────────────────────────────────────────────
export interface CompanyInfo {
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

// ─── Business Details ────────────────────────────────────────────────────────
export type BusinessType =
  | "retail"
  | "service"
  | "restaurant"
  | "manufacturing"
  | "wholesale"
  | "other";

export interface BusinessDetails {
  business_type: BusinessType | null;
  business_registration_number: string | null;
  tax_identification_number: string | null;
  fiscal_year_start: string | null;
  payment_terms: number | null;
}

// ─── Branding ────────────────────────────────────────────────────────────────
export interface Branding {
  logo: string | null;
  logo_path: string | null;
}

// ─── Preferences ─────────────────────────────────────────────────────────────
export type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP";
export type DateFormatStr = "d/m/Y" | "m/d/Y" | "Y-m-d";
export type TimeFormat = "12" | "24";
export type TimezoneId = "Africa/Lagos" | "UTC" | "America/New_York" | "Europe/London";
export type LanguageCode = "en" | "fr";

export interface Preferences {
  currency: CurrencyCode;
  currency_symbol: string;
  date_format: DateFormatStr;
  time_format: TimeFormat;
  timezone: TimezoneId;
  language: LanguageCode;
}

// ─── Module ──────────────────────────────────────────────────────────────────
export type ModuleKey =
  | "dashboard"
  | "accounting"
  | "inventory"
  | "crm"
  | "pos"
  | "ecommerce"
  | "payroll"
  | "procurement"
  | "banking"
  | "projects"
  | "reports"
  | "statutory"
  | "audit"
  | "admin"
  | "settings"
  | "support"
  | "help";

export type BusinessCategory = "trading" | "manufacturing" | "service" | "hybrid";

export interface AppModule {
  key: ModuleKey;
  name: string;
  description: string;
  icon: string;
  core: boolean;
  recommended: boolean;
  enabled: boolean;
}

// ─── Response Types ──────────────────────────────────────────────────────────
export type GetAllSettingsResponse = ApiResponse<{
  company: CompanyInfo;
  business: BusinessDetails;
  branding: Branding;
  preferences: Preferences;
  modules: AppModule[];
  business_category: BusinessCategory;
}>;

export type CompanyInfoResponse = ApiResponse<{ company: CompanyInfo }>;
export type BusinessDetailsResponse = ApiResponse<{ business: BusinessDetails }>;
export type BrandingResponse = ApiResponse<{ branding: Branding }>;
export type PreferencesResponse = ApiResponse<{ preferences: Preferences }>;
export type ModulesResponse = ApiResponse<{
  modules: AppModule[];
  business_category: BusinessCategory;
}>;

// ─── Request Payloads ────────────────────────────────────────────────────────
export interface UpdateCompanyInfoPayload {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface UpdateBusinessDetailsPayload {
  business_type?: BusinessType;
  business_registration_number?: string;
  tax_identification_number?: string;
  fiscal_year_start?: string;
  payment_terms?: number;
}

export interface UpdatePreferencesPayload {
  currency?: CurrencyCode;
  currency_symbol?: string;
  date_format?: DateFormatStr;
  time_format?: TimeFormat;
  timezone?: string;
  language?: LanguageCode;
}

export interface UpdateModulesPayload {
  modules: ModuleKey[];
}
