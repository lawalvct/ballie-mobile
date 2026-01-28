import apiClient from "../../../../api/client";
import type {
  PayrollSettings,
  PayrollSettingsPayload,
  PayrollSettingsResponse,
} from "../types";

class PayrollSettingsService {
  private baseUrl = "/payroll/settings";

  async get(): Promise<PayrollSettingsResponse> {
    const response = await apiClient.get(this.baseUrl);
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};
    return {
      settings: data ?? payload?.settings ?? payload?.data ?? {},
    };
  }

  async update(payload: PayrollSettingsPayload): Promise<PayrollSettings> {
    const response = await apiClient.put(this.baseUrl, payload);
    const data = (response as any)?.data ?? response;
    const body = data?.data ?? data ?? {};
    return body ?? {};
  }
}

export const payrollSettingsService = new PayrollSettingsService();
