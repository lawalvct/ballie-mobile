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
    // Check if we have images to upload
    const hasImages =
      data.image || (data.gallery_images && data.gallery_images.length > 0);

    if (hasImages) {
      // Use FormData for multipart upload
      const formData = new FormData();

      // Add all text fields
      Object.keys(data).forEach((key) => {
        if (key !== "image" && key !== "gallery_images") {
          const value = data[key as keyof CreateProductData];
          // Always include boolean fields, even if false
          if (typeof value === "boolean") {
            formData.append(key, value ? "1" : "0");
          } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        }
      });

      // Add primary image
      if (data.image) {
        formData.append("image", {
          uri: data.image.uri,
          name: data.image.name,
          type: data.image.type,
        } as any);
      }

      // Add gallery images
      if (data.gallery_images && data.gallery_images.length > 0) {
        data.gallery_images.forEach((img) => {
          formData.append("gallery_images[]", {
            uri: img.uri,
            name: img.name,
            type: img.type,
          } as any);
        });
      }

      const response = await apiClient.post<Product>(this.baseUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      // Use JSON for non-image data
      const response = await apiClient.post<Product>(this.baseUrl, data);
      return response.data;
    }
  }

  /**
   * List products with filters and pagination
   */
  async list(params: ListParams = {}): Promise<ListResponse["data"]> {
    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get<ListResponse>(this.baseUrl, {
      params: cleanParams,
    });
    const payload = (response as any)?.data ? (response as any).data : response;
    const data = payload?.data ?? payload ?? {};

    return {
      products: Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [],
      pagination: data?.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: cleanParams.per_page || 15,
        total: Array.isArray(data?.products) ? data.products.length : 0,
        from: 0,
        to: 0,
      },
      statistics: data?.statistics || {
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        total_stock_value: 0,
      },
    };
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
      data,
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
      `${this.baseUrl}/${id}/toggle-status`,
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
    } = {},
  ): Promise<{ data: StockMovement[]; pagination: any }> {
    const response = await apiClient.get(
      `${this.baseUrl}/${id}/stock-movements`,
      { params },
    );
    return response.data;
  }

  /**
   * Bulk action on multiple products
   */
  async bulkAction(data: BulkActionData): Promise<BulkActionResponse> {
    const response = await apiClient.post<BulkActionResponse>(
      `${this.baseUrl}/bulk-action`,
      data,
    );
    return response.data;
  }

  /**
   * Search products (for autocomplete)
   */
  async search(
    query: string,
    options: { status?: string; type?: string } = {},
  ): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>(
      `${this.baseUrl}/search`,
      {
        params: { q: query, ...options },
      },
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
