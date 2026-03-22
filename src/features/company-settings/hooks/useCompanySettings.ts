import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { companySettingsService } from "../services/companySettingsService";
import type {
  GetAllSettingsResponse,
  UpdateCompanyInfoPayload,
  UpdateBusinessDetailsPayload,
  UpdatePreferencesPayload,
  ModuleKey,
} from "../types";

// ─── Get All Settings (dashboard) ────────────────────────────────────────────
export function useCompanySettings() {
  const query = useApiQuery<GetAllSettingsResponse>(
    queryKeys.companySettings.all,
    () => companySettingsService.getAll(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
  };
}

// ─── Company Info ────────────────────────────────────────────────────────────
export function useUpdateCompanyInfo() {
  return useApiMutation(
    (data: UpdateCompanyInfoPayload) => companySettingsService.updateCompanyInfo(data),
    {
      invalidateKeys: [queryKeys.companySettings.all],
      successMessage: "Company information updated",
    },
  );
}

// ─── Business Details ────────────────────────────────────────────────────────
export function useUpdateBusinessDetails() {
  return useApiMutation(
    (data: UpdateBusinessDetailsPayload) =>
      companySettingsService.updateBusinessDetails(data),
    {
      invalidateKeys: [queryKeys.companySettings.all],
      successMessage: "Business details updated",
    },
  );
}

// ─── Branding ────────────────────────────────────────────────────────────────
export function useUploadLogo() {
  return useApiMutation(
    (imageUri: string) => companySettingsService.uploadLogo(imageUri),
    {
      invalidateKeys: [queryKeys.companySettings.all],
      successMessage: "Logo updated",
    },
  );
}

export function useRemoveLogo() {
  return useApiMutation(() => companySettingsService.removeLogo(), {
    invalidateKeys: [queryKeys.companySettings.all],
    successMessage: "Logo removed",
  });
}

// ─── Preferences ─────────────────────────────────────────────────────────────
export function useUpdatePreferences() {
  return useApiMutation(
    (data: UpdatePreferencesPayload) =>
      companySettingsService.updatePreferences(data),
    {
      invalidateKeys: [queryKeys.companySettings.all],
      successMessage: "Preferences updated",
    },
  );
}

// ─── Modules ─────────────────────────────────────────────────────────────────
export function useUpdateModules() {
  return useApiMutation(
    (modules: ModuleKey[]) => companySettingsService.updateModules(modules),
    {
      invalidateKeys: [queryKeys.companySettings.all],
      successMessage: "Module settings updated",
    },
  );
}

export function useResetModules() {
  return useApiMutation(() => companySettingsService.resetModules(), {
    invalidateKeys: [queryKeys.companySettings.all],
    successMessage: "Modules reset to defaults",
  });
}
