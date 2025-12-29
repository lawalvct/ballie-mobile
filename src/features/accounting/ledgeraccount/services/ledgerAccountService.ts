import apiClient from "../../../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  LedgerAccount,
  ListParams,
  ListResponse,
  FormDataResponse,
  CreateLedgerAccountPayload,
  UpdateLedgerAccountPayload,
} from "../types";

const getBaseUrl = async () => {
  const tenantSlug = await AsyncStorage.getItem("tenant_slug");
  if (!tenantSlug) {
    throw new Error("Tenant slug not found. Please login again.");
  }
  return `/tenant/${tenantSlug}/accounting/ledger-accounts`;
};

export const ledgerAccountService = {
  /**
   * Get form data (account groups, parent accounts, types)
   * GET /accounting/ledger-accounts/create
   */
  async getFormData(): Promise<FormDataResponse> {
    const baseUrl = await getBaseUrl();
    const response = await apiClient.get(`${baseUrl}/create`);
    return response.data;
  },

  /**
   * Create new ledger account
   * POST /accounting/ledger-accounts
   */
  async create(data: CreateLedgerAccountPayload): Promise<LedgerAccount> {
    const baseUrl = await getBaseUrl();
    const response = await apiClient.post(baseUrl, data);
    return response.data.ledger_account;
  },

  /**
   * List ledger accounts with filters
   * GET /accounting/ledger-accounts
   */
  async list(params: ListParams = {}): Promise<ListResponse> {
    const baseUrl = await getBaseUrl();

    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await apiClient.get(baseUrl, { params: cleanParams });
    return response.data;
  },

  /**
   * Get single ledger account
   * GET /accounting/ledger-accounts/:id
   */
  async show(id: number): Promise<LedgerAccount> {
    const baseUrl = await getBaseUrl();
    const response = await apiClient.get(`${baseUrl}/${id}`);
    return response.data.ledger_account;
  },

  /**
   * Update ledger account
   * PUT /accounting/ledger-accounts/:id
   */
  async update(
    id: number,
    data: UpdateLedgerAccountPayload
  ): Promise<LedgerAccount> {
    const baseUrl = await getBaseUrl();
    const response = await apiClient.put(`${baseUrl}/${id}`, data);
    return response.data.ledger_account;
  },

  /**
   * Toggle active status
   * POST /accounting/ledger-accounts/:id/toggle
   */
  async toggleStatus(id: number): Promise<LedgerAccount> {
    const baseUrl = await getBaseUrl();
    const response = await apiClient.post(`${baseUrl}/${id}/toggle`);
    return response.data.ledger_account;
  },

  /**
   * Delete ledger account
   * DELETE /accounting/ledger-accounts/:id
   */
  async delete(id: number): Promise<void> {
    const baseUrl = await getBaseUrl();
    await apiClient.delete(`${baseUrl}/${id}`);
  },

  /**
   * Export to Excel
   * GET /accounting/ledger-accounts/export/excel
   */
  async exportExcel(params: ListParams = {}): Promise<Blob> {
    const baseUrl = await getBaseUrl();

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await apiClient.get(`${baseUrl}/export/excel`, {
      params: cleanParams,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Export to PDF
   * GET /accounting/ledger-accounts/export/pdf
   */
  async exportPdf(params: ListParams = {}): Promise<Blob> {
    const baseUrl = await getBaseUrl();

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await apiClient.get(`${baseUrl}/export/pdf`, {
      params: cleanParams,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Import from file
   * POST /accounting/ledger-accounts/import
   */
  async import(file: any): Promise<{ message: string; imported: number }> {
    const baseUrl = await getBaseUrl();

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`${baseUrl}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Search accounts for autocomplete
   * GET /accounting/ledger-accounts/search
   */
  async search(query: string): Promise<LedgerAccount[]> {
    const baseUrl = await getBaseUrl();

    const response = await apiClient.get(`${baseUrl}/search`, {
      params: { search: query },
    });
    return response.data.accounts;
  },

  /**
   * Get account balance
   * GET /accounting/ledger-accounts/:id/balance
   */
  async getBalance(id: number): Promise<{
    current_balance: number;
    formatted_balance: string;
  }> {
    const baseUrl = await getBaseUrl();

    const response = await apiClient.get(`${baseUrl}/${id}/balance`);
    return response.data;
  },

  /**
   * Get child accounts
   * GET /accounting/ledger-accounts/:id/children
   */
  async getChildren(id: number): Promise<LedgerAccount[]> {
    const baseUrl = await getBaseUrl();

    const response = await apiClient.get(`${baseUrl}/${id}/children`);
    return response.data.children;
  },

  /**
   * Bulk actions
   * POST /accounting/ledger-accounts/bulk-action
   */
  async bulkAction(
    action: "activate" | "deactivate" | "delete",
    accountIds: number[]
  ): Promise<{
    success_count: number;
    failed_count: number;
    errors: string[];
  }> {
    const baseUrl = await getBaseUrl();

    const response = await apiClient.post(`${baseUrl}/bulk-action`, {
      action,
      account_ids: accountIds,
    });
    return response.data;
  },
};
