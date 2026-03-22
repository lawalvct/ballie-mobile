import apiClient from "../../../api/client";
import type {
  GetProfileResponse,
  UpdateProfileResponse,
  ChangePasswordResponse,
  RemoveAvatarResponse,
  ResendVerificationResponse,
  VerifyEmailResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";

const BASE = "/profile";

export const profileService = {
  getProfile: () =>
    apiClient.get(BASE) as Promise<GetProfileResponse>,

  updateProfile: (data: UpdateProfilePayload, avatarUri?: string) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.phone !== undefined) formData.append("phone", data.phone ?? "");
    if (avatarUri) {
      const ext = avatarUri.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      formData.append("avatar", {
        uri: avatarUri,
        type: mimeType,
        name: `avatar.${ext}`,
      } as any);
    }
    formData.append("_method", "PUT");
    return apiClient.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as Promise<UpdateProfileResponse>;
  },

  changePassword: (data: ChangePasswordPayload) =>
    apiClient.post(`${BASE}/change-password`, data) as Promise<ChangePasswordResponse>,

  removeAvatar: () =>
    apiClient.delete(`${BASE}/avatar`) as Promise<RemoveAvatarResponse>,

  resendVerification: () =>
    apiClient.post(`${BASE}/verification/resend`) as Promise<ResendVerificationResponse>,

  verifyEmail: (code: string) =>
    apiClient.post(`${BASE}/verification/verify`, { code }) as Promise<VerifyEmailResponse>,
};
