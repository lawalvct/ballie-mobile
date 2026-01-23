// Voucher Service - API Layer
import apiClient from "../../../../api/client";
import type {
  FormDataResponse,
  ListParams,
  ListResponse,
  VoucherDetails,
  CreateVoucherData,
  BulkActionData,
  BulkActionResponse,
  Voucher,
} from "../types";

class VoucherService {
  private baseUrl = "/accounting/vouchers";

  /**
   * Get form data for creating a voucher
   */
  async getFormData(type?: string): Promise<FormDataResponse> {
    const params = type ? { type } : {};
    const response: any = await apiClient.get(`${this.baseUrl}/create`, {
      params,
    });
    return response.data;
  }

  /**
   * Create a new voucher
   */
  async create(data: CreateVoucherData | FormData): Promise<VoucherDetails> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const response: any = await apiClient.post(this.baseUrl, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  }

  /**
   * List vouchers with filters and pagination
   */
  async list(params: ListParams = {}): Promise<ListResponse> {
    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response: any = await apiClient.get(this.baseUrl, {
      params: cleanParams,
    });
    return response.data;
  }

  /**
   * Get voucher details by ID
   */
  async show(id: number): Promise<VoucherDetails> {
    const response: any = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update existing voucher (draft only)
   */
  async update(
    id: number,
    data: Partial<CreateVoucherData>,
  ): Promise<VoucherDetails> {
    const response: any = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete voucher (draft only)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Post voucher (finalize)
   */
  async post(id: number): Promise<VoucherDetails> {
    const response: any = await apiClient.post(`${this.baseUrl}/${id}/post`);
    return response.data;
  }

  /**
   * Unpost voucher (revert to draft)
   */
  async unpost(id: number): Promise<VoucherDetails> {
    const response: any = await apiClient.post(`${this.baseUrl}/${id}/unpost`);
    return response.data;
  }

  /**
   * Get data for duplicating a voucher
   */
  async getDuplicate(
    id: number,
  ): Promise<FormDataResponse & { voucher: VoucherDetails }> {
    const response: any = await apiClient.get(
      `${this.baseUrl}/${id}/duplicate`,
    );
    return response.data;
  }

  /**
   * Bulk actions (post, unpost, delete)
   */
  async bulkAction(data: BulkActionData): Promise<BulkActionResponse> {
    const response: any = await apiClient.post(
      `${this.baseUrl}/bulk-action`,
      data,
    );
    return response.data;
  }

  /**
   * Search vouchers (for autocomplete)
   */
  async search(params: {
    q?: string;
    status?: string;
    voucher_type_id?: number;
  }): Promise<Voucher[]> {
    const response: any = await apiClient.get(`${this.baseUrl}/search`, {
      params,
    });
    return response.data;
  }
}

export const voucherService = new VoucherService();
