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
    const response = await apiClient.get<FormDataResponse>(
      `${this.baseUrl}/create`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new voucher
   */
  async create(data: CreateVoucherData): Promise<VoucherDetails> {
    const response = await apiClient.post<VoucherDetails>(this.baseUrl, data);
    return response.data;
  }

  /**
   * List vouchers with filters and pagination
   */
  async list(params: ListParams = {}): Promise<ListResponse> {
    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const response = await apiClient.get<ListResponse>(this.baseUrl, {
      params: cleanParams,
    });
    return response.data;
  }

  /**
   * Get voucher details by ID
   */
  async show(id: number): Promise<VoucherDetails> {
    const response = await apiClient.get<VoucherDetails>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Update existing voucher (draft only)
   */
  async update(
    id: number,
    data: Partial<CreateVoucherData>
  ): Promise<VoucherDetails> {
    const response = await apiClient.put<VoucherDetails>(
      `${this.baseUrl}/${id}`,
      data
    );
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
    const response = await apiClient.post<VoucherDetails>(
      `${this.baseUrl}/${id}/post`
    );
    return response.data;
  }

  /**
   * Unpost voucher (revert to draft)
   */
  async unpost(id: number): Promise<VoucherDetails> {
    const response = await apiClient.post<VoucherDetails>(
      `${this.baseUrl}/${id}/unpost`
    );
    return response.data;
  }

  /**
   * Get data for duplicating a voucher
   */
  async getDuplicate(
    id: number
  ): Promise<FormDataResponse & { voucher: VoucherDetails }> {
    const response = await apiClient.get<
      FormDataResponse & { voucher: VoucherDetails }
    >(`${this.baseUrl}/${id}/duplicate`);
    return response.data;
  }

  /**
   * Bulk actions (post, unpost, delete)
   */
  async bulkAction(data: BulkActionData): Promise<BulkActionResponse> {
    const response = await apiClient.post<BulkActionResponse>(
      `${this.baseUrl}/bulk-action`,
      data
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
    const response = await apiClient.get<Voucher[]>(`${this.baseUrl}/search`, {
      params,
    });
    return response.data;
  }
}

export const voucherService = new VoucherService();
