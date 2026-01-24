/**
 * Stock Journal Service
 * API methods for Stock Journal management
 */

import apiClient from "../../../../api/client";
import type {
  StockJournalListResponse,
  StockJournalListParams,
  StockJournalEntry,
  StockJournalFormData,
  StockJournalCreateData,
  ProductStockInfo,
  StockCalculation,
} from "../types";

const BASE_PATH = "/inventory/stock-journal";

const normalizePayload = <T = any>(response: any): T => {
  if (response && typeof response === "object" && "success" in response) {
    return response as T;
  }
  if (response && typeof response === "object" && "data" in response) {
    return (response as any).data as T;
  }
  return response as T;
};

/**
 * List stock journal entries with pagination and filters
 */
export const list = async (
  params: StockJournalListParams = {},
): Promise<StockJournalListResponse> => {
  try {
    const response = await apiClient.get(BASE_PATH, { params });
    const payload = normalizePayload<any>(response);

    // Normalize pagination from Laravel format
    const data = payload?.data;
    if (data && typeof data === "object" && "data" in data) {
      return {
        success: payload.success,
        message: payload.message,
        data: {
          current_page: data.current_page,
          data: data.data,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
        },
        statistics: payload.statistics,
      };
    }

    return payload;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock journal entries",
    );
  }
};

/**
 * Get single stock journal entry with details
 */
export const show = async (id: number): Promise<StockJournalEntry> => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    const payload = normalizePayload<any>(response);
    return payload.data.entry;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch stock journal entry",
    );
  }
};

/**
 * Get form data (entry types, products)
 */
export const getFormData = async (
  entryType?: string,
): Promise<StockJournalFormData> => {
  try {
    const params = entryType ? { type: entryType } : {};
    const response = await apiClient.get(`${BASE_PATH}/create`, { params });
    const payload = normalizePayload<any>(response);
    const data = payload?.data ?? payload;
    return {
      entry_type: data?.entry_type,
      entry_types: data?.entry_types ?? [],
      products: data?.products ?? [],
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch form data",
    );
  }
};

/**
 * Create new stock journal entry
 */
export const create = async (
  data: StockJournalCreateData,
): Promise<StockJournalEntry> => {
  try {
    const response = await apiClient.post(BASE_PATH, data);
    const payload = normalizePayload<any>(response);
    return payload.data.entry;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      throw new Error(
        Array.isArray(firstError) ? firstError[0] : error.response.data.message,
      );
    }
    throw new Error(
      error.response?.data?.message || "Failed to create stock journal entry",
    );
  }
};

/**
 * Update existing stock journal entry
 */
export const update = async (
  id: number,
  data: StockJournalCreateData,
): Promise<StockJournalEntry> => {
  try {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    const payload = normalizePayload<any>(response);
    return payload.data.entry;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      throw new Error(
        Array.isArray(firstError) ? firstError[0] : error.response.data.message,
      );
    }
    throw new Error(
      error.response?.data?.message || "Failed to update stock journal entry",
    );
  }
};

/**
 * Post stock journal entry (finalize)
 */
export const post = async (id: number): Promise<StockJournalEntry> => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/${id}/post`);
    const payload = normalizePayload<any>(response);
    return payload.data.entry;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to post stock journal entry",
    );
  }
};

/**
 * Cancel stock journal entry
 */
export const cancel = async (id: number): Promise<StockJournalEntry> => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/${id}/cancel`);
    const payload = normalizePayload<any>(response);
    return payload.data.entry;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to cancel stock journal entry",
    );
  }
};

/**
 * Delete stock journal entry
 */
export const deleteEntry = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete stock journal entry",
    );
  }
};

/**
 * Duplicate stock journal entry
 */
export const duplicate = async (id: number): Promise<StockJournalFormData> => {
  try {
    const response = await apiClient.get(`${BASE_PATH}/${id}/duplicate`);
    const payload = normalizePayload<any>(response);
    return payload.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to duplicate stock journal entry",
    );
  }
};

/**
 * Get product stock info
 */
export const getProductStock = async (
  productId: number,
): Promise<ProductStockInfo> => {
  try {
    const response = await apiClient.get(
      `${BASE_PATH}/product-stock/${productId}`,
    );
    const payload = normalizePayload<any>(response);
    return payload.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch product stock",
    );
  }
};

/**
 * Calculate stock after movement
 */
export const calculateStock = async (
  productId: number,
  movementType: "in" | "out",
  quantity: number,
): Promise<StockCalculation> => {
  try {
    const response = await apiClient.post(`${BASE_PATH}/calculate-stock`, {
      product_id: productId,
      movement_type: movementType,
      quantity,
    });
    const payload = normalizePayload<any>(response);
    return payload.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to calculate stock",
    );
  }
};

export default {
  list,
  show,
  getFormData,
  create,
  update,
  post,
  cancel,
  deleteEntry,
  duplicate,
  getProductStock,
  calculateStock,
};
