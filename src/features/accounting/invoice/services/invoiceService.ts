// Invoice Service - API Layer
import apiClient from "../../../../api/client";
import type {
  FormData,
  ListParams,
  ListResponse,
  InvoiceDetails,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  Statistics,
  Party,
  Product,
  LedgerAccount,
} from "../types";

class InvoiceService {
  private baseUrl = "/accounting/invoices";

  /**
   * Get form data for creating an invoice
   */
  async getFormData(type: "sales" | "purchase" = "sales"): Promise<FormData> {
    console.log("[InvoiceService] getFormData called with type:", type);
    console.log("[InvoiceService] Request URL:", `${this.baseUrl}/create`);
    console.log(
      "[InvoiceService] Full URL with params:",
      `${this.baseUrl}/create?type=${type}`,
    );

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: FormData;
      }>(`${this.baseUrl}/create`, { params: { type } });

      console.log(
        "[InvoiceService] Full response object:",
        JSON.stringify(response, null, 2),
      );
      console.log("[InvoiceService] Response status:", response.status);
      console.log("[InvoiceService] Response data:", response.data);
      console.log("[InvoiceService] Response data type:", typeof response.data);

      if (!response.data) {
        console.error(
          "[InvoiceService] ERROR: response.data is undefined or null!",
        );
        throw new Error("API returned empty response");
      }

      // API returns data directly, not nested in response.data.data
      const formData = response.data as unknown as FormData;

      console.log("[InvoiceService] Form data extracted:", formData);
      console.log("[InvoiceService] Voucher types:", formData.voucher_types);
      console.log(
        "[InvoiceService] Voucher types count:",
        formData.voucher_types?.length || 0,
      );
      console.log("[InvoiceService] Parties:", formData.parties);
      console.log(
        "[InvoiceService] Parties count:",
        formData.parties?.length || 0,
      );
      console.log(
        "[InvoiceService] Products count:",
        formData.products?.length || 0,
      );
      console.log(
        "[InvoiceService] Ledger accounts count:",
        formData.ledger_accounts?.length || 0,
      );

      return formData;
    } catch (error: any) {
      console.error("[InvoiceService] ERROR in getFormData:", error);
      console.error("[InvoiceService] Error name:", error.name);
      console.error("[InvoiceService] Error message:", error.message);
      console.error("[InvoiceService] Error stack:", error.stack);
      console.error("[InvoiceService] Error response:", error.response);
      console.error(
        "[InvoiceService] Error response data:",
        error.response?.data,
      );
      console.error(
        "[InvoiceService] Error response status:",
        error.response?.status,
      );
      throw error;
    }
  }

  /**
   * Create a new invoice
   */
  async create(data: CreateInvoicePayload): Promise<InvoiceDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: InvoiceDetails;
    }>(this.baseUrl, data);
    return response.data.data;
  }

  /**
   * List invoices with filters and pagination
   */
  async list(
    params: ListParams = {},
  ): Promise<ListResponse & { statistics: Statistics }> {
    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get<{
      success: boolean;
      data: ListResponse;
      statistics: Statistics;
    }>(this.baseUrl, {
      params: cleanParams,
    });

    return {
      ...response.data.data,
      statistics: response.data.statistics,
    };
  }

  /**
   * Get invoice details by ID
   */
  async show(id: number): Promise<InvoiceDetails> {
    const response = await apiClient.get<{
      success: boolean;
      data: { invoice: InvoiceDetails; party: Party };
    }>(`${this.baseUrl}/${id}`);
    return response.data.data.invoice;
  }

  /**
   * Update existing invoice (draft only)
   */
  async update(
    id: number,
    data: UpdateInvoicePayload,
  ): Promise<InvoiceDetails> {
    const response = await apiClient.put<{
      success: boolean;
      data: InvoiceDetails;
    }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete invoice (draft only)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Post invoice (finalize)
   */
  async post(id: number): Promise<InvoiceDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: InvoiceDetails;
    }>(`${this.baseUrl}/${id}/post`);
    return response.data.data;
  }

  /**
   * Unpost invoice (revert to draft)
   */
  async unpost(id: number): Promise<InvoiceDetails> {
    const response = await apiClient.post<{
      success: boolean;
      data: InvoiceDetails;
    }>(`${this.baseUrl}/${id}/unpost`);
    return response.data.data;
  }

  /**
   * Search customers or vendors
   */
  async searchCustomers(
    search: string,
    type: "customer" | "vendor",
  ): Promise<Party[]> {
    const response = await apiClient.get<{ success: boolean; data: Party[] }>(
      `${this.baseUrl}/search-customers`,
      {
        params: { search, type },
      },
    );
    return response.data.data;
  }

  /**
   * Search products
   */
  async searchProducts(
    search: string,
    type: "sales" | "purchase",
  ): Promise<Product[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Product[];
    }>(`${this.baseUrl}/search-products`, {
      params: { search, type },
    });
    return response.data.data;
  }

  /**
   * Search ledger accounts
   */
  async searchLedgerAccounts(search: string): Promise<LedgerAccount[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: LedgerAccount[];
    }>(`${this.baseUrl}/search-ledger-accounts`, {
      params: { search },
    });
    return response.data.data;
  }
}

export const invoiceService = new InvoiceService();
