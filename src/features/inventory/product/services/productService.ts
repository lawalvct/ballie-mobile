// Product Service - API Layer
import apiClient from "../../../../api/client";
import type {
  FormData,
  ListParams,
  ListResponse,
  Product,
  CreateProductData,
  BulkActionData,
  BulkActionResponse,
  StockMovement,
} from "../types";

class ProductService {
  private baseUrl = "/inventory/products";

  /**
   * Get form data for creating a product
   */
  async getFormData(): Promise<FormData> {
    const response = await apiClient.get<FormData>(`${this.baseUrl}/create`);
    return response.data;
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<Product>(this.baseUrl, data);
    return response.data;
  }

  /**
   * List products with filters and pagination
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
   * Get product details by ID
   */
  async show(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update existing product
   */
  async update(id: number, data: Partial<CreateProductData>): Promise<Product> {
    const response = await apiClient.put<Product>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete product
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle product status (activate/deactivate)
   */
  async toggleStatus(id: number): Promise<Product> {
    const response = await apiClient.post<Product>(
      `${this.baseUrl}/${id}/toggle-status`
    );
    return response.data;
  }

  /**
   * Get stock movements for a product
   */
  async getStockMovements(
    id: number,
    params: {
      from_date?: string;
      to_date?: string;
      transaction_type?: string;
      per_page?: number;
    } = {}
  ): Promise<{ data: StockMovement[]; pagination: any }> {
    const response = await apiClient.get(
      `${this.baseUrl}/${id}/stock-movements`,
      { params }
    );
    return response.data;
  }

  /**
   * Bulk action on multiple products
   */
  async bulkAction(data: BulkActionData): Promise<BulkActionResponse> {
    const response = await apiClient.post<BulkActionResponse>(
      `${this.baseUrl}/bulk-action`,
      data
    );
    return response.data;
  }

  /**
   * Search products (for autocomplete)
   */
  async search(
    query: string,
    options: { status?: string; type?: string } = {}
  ): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>(
      `${this.baseUrl}/search`,
      {
        params: { q: query, ...options },
      }
    );
    return response.data.data;
  }

  /**
   * Get product statistics
   */
  async getStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`);
    return response.data;
  }
}

export const productService = new ProductService();
