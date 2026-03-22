import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { profileService } from "../services/profileService";
import { useAuth } from "../../../context/AuthContext";
import type {
  GetProfileResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ProfileUser,
} from "../types";

// ─── Get Profile ─────────────────────────────────────────────────────────────
export function useProfile() {
  const qc = useQueryClient();
  const query = useApiQuery<GetProfileResponse>(
    queryKeys.profile.me(),
    () => profileService.getProfile(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    profile: query.data?.data?.user ?? null,
    tenant: query.data?.data?.tenant ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => qc.invalidateQueries({ queryKey: queryKeys.profile.all }),
  };
}

// ─── Update Profile ──────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const { updateUser } = useAuth();

  return useApiMutation(
    ({ data, avatarUri }: { data: UpdateProfilePayload; avatarUri?: string }) =>
      profileService.updateProfile(data, avatarUri),
    {
      invalidateKeys: [queryKeys.profile.all],
      successMessage: "Profile updated successfully",
      onSuccess: (response: any) => {
        const user: ProfileUser | undefined = response?.data?.user;
        if (user) {
          updateUser({
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            email_verified: user.email_verified,
          });
        }
      },
    },
  );
}

// ─── Change Password ─────────────────────────────────────────────────────────
export function useChangePassword() {
  return useApiMutation(
    (data: ChangePasswordPayload) => profileService.changePassword(data),
    { successMessage: "Password changed successfully" },
  );
}

// ─── Remove Avatar ───────────────────────────────────────────────────────────
export function useRemoveAvatar() {
  const { updateUser } = useAuth();

  return useApiMutation(() => profileService.removeAvatar(), {
    invalidateKeys: [queryKeys.profile.all],
    successMessage: "Avatar removed",
    onSuccess: (response: any) => {
      const user: ProfileUser | undefined = response?.data?.user;
      if (user) {
        updateUser({ avatar: user.avatar });
      }
    },
  });
}

// ─── Email Verification ──────────────────────────────────────────────────────
export function useResendVerification() {
  return useApiMutation(() => profileService.resendVerification(), {
    successMessage: "Verification code sent",
  });
}

export function useVerifyEmail() {
  const { updateUser } = useAuth();

  return useApiMutation(
    (code: string) => profileService.verifyEmail(code),
    {
      invalidateKeys: [queryKeys.profile.all],
      successMessage: "Email verified successfully",
      onSuccess: (response: any) => {
        const user: ProfileUser | undefined = response?.data?.user;
        if (user) {
          updateUser({ email_verified: user.email_verified });
        }
      },
    },
  );
}
