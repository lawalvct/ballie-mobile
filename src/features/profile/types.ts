import type { ApiResponse } from "../../api/types";

// ─── User (extended with avatar_url) ─────────────────────────────────────────
export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  avatar_url: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  tour_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Tenant (from profile endpoint) ──────────────────────────────────────────
export interface ProfileTenant {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  subscription_status: string;
}

// ─── Response Types ──────────────────────────────────────────────────────────
export type GetProfileResponse = ApiResponse<{
  user: ProfileUser;
  tenant: ProfileTenant;
}>;

export type UpdateProfileResponse = ApiResponse<{
  user: ProfileUser;
}>;

export type ChangePasswordResponse = ApiResponse<null>;

export type RemoveAvatarResponse = ApiResponse<{
  user: ProfileUser;
}>;

export type ResendVerificationResponse = ApiResponse<null>;

export type VerifyEmailResponse = ApiResponse<{
  user: ProfileUser;
} | null>;

// ─── Request Payloads ────────────────────────────────────────────────────────
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyEmailPayload {
  code: string;
}
