// Purchase Order (LPO) Service - API Layer
import apiClient from "../../../../api/client";
import type {
  PurchaseOrder,
  PurchaseOrderCreatePayload,
  PurchaseOrderEmailPayload,
  PurchaseOrderListParams,
  PurchaseOrderListResponse,
  PurchaseOrderProductSearchItem,
  PurchaseOrderVendorSearchItem,
} from "../types";

const BASE_PATH = "/procurement/purchase-orders";

const normalizePayload = <T = any>(response: any): T => {
  if (response && typeof response === "object" && "success" in response) {
    return response as T;
  }
  if (response && typeof response === "object" && "data" in response) {
    return (response as any).data as T;
  }
  return response as T;
};

class PurchaseOrderService {
  async list(
    params: PurchaseOrderListParams = {},
  ): Promise<PurchaseOrderListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(BASE_PATH, { params: cleanParams });
    const payload = normalizePayload<any>(response);
    const data = payload?.data ?? payload ?? {};

    const orders = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.purchaseOrders)
        ? data.purchaseOrders
        : Array.isArray(data?.purchase_orders)
          ? data.purchase_orders
          : Array.isArray(data?.purchase_orders?.data)
            ? data.purchase_orders.data
            : Array.isArray(data)
              ? data
              : [];

    const paginationSource =
      data?.current_page || data?.last_page || data?.total
        ? data
        : data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta;

    const total =
      typeof paginationSource?.total === "number"
        ? paginationSource.total
        : orders.length;
    const per_page =
      typeof paginationSource?.per_page === "number"
        ? paginationSource.per_page
        : (cleanParams.per_page as number | undefined) || orders.length || 15;
    const current_page =
      typeof paginationSource?.current_page === "number"
        ? paginationSource.current_page
        : (cleanParams.page as number | undefined) || 1;
    const last_page =
      typeof paginationSource?.last_page === "number"
        ? paginationSource.last_page
        : Math.max(1, Math.ceil(total / (per_page || 1)));

    const from =
      typeof paginationSource?.from === "number"
        ? paginationSource.from
        : total === 0
          ? 0
          : (current_page - 1) * per_page + 1;
    const to =
      typeof paginationSource?.to === "number"
        ? paginationSource.to
        : total === 0
          ? 0
          : Math.min(total, from + orders.length - 1);

    return {
      data: orders,
      pagination: {
        current_page,
        last_page,
        per_page,
        total,
        from,
        to,
      },
      statistics:
        payload?.statistics ||
        data?.statistics ||
        payload?.data?.statistics ||
        null,
    };
  }

  async show(id: number): Promise<PurchaseOrder> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    const payload = normalizePayload<any>(response);
    const data = payload?.data ?? payload ?? {};
    return data?.purchaseOrder || data?.purchase_order || data;
  }

  async create(data: PurchaseOrderCreatePayload): Promise<PurchaseOrder> {
    const response = await apiClient.post(BASE_PATH, data);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.purchaseOrder || result?.purchase_order || result;
  }

  async sendEmail(
    id: number,
    data: PurchaseOrderEmailPayload,
  ): Promise<{ message: string } | void> {
    return await apiClient.post(`${BASE_PATH}/${id}/email`, data);
  }

  async searchVendors(query: string): Promise<PurchaseOrderVendorSearchItem[]> {
    const normalizeItems = (items: any[]): PurchaseOrderVendorSearchItem[] =>
      items.reduce<PurchaseOrderVendorSearchItem[]>((acc, item) => {
        if (!item) return acc;
        const name = item.name ?? item.display_name ?? item.vendor_name;
        if (!item.id || !name) return acc;
        acc.push({
          id: Number(item.id),
          name,
          email: item.email ?? null,
        });
        return acc;
      }, []);

    const parseResults = (payload: any) => {
      const data = payload?.data ?? payload ?? {};
      if (Array.isArray(data)) return normalizeItems(data);
      if (Array.isArray(data?.vendors)) return normalizeItems(data.vendors);
      if (Array.isArray(data?.data)) return normalizeItems(data.data);
      return [] as PurchaseOrderVendorSearchItem[];
    };

    try {
      const response = await apiClient.get(`${BASE_PATH}/search/vendors`, {
        params: { q: query, search: query },
      });
      const payload = normalizePayload<any>(response);
      const results = parseResults(payload);
      if (results.length > 0) return results;
    } catch (_error) {
      // fall through
    }

    const legacyResponse = await apiClient.get(`${BASE_PATH}/search-vendors`, {
      params: { search: query },
    });
    const legacyPayload = normalizePayload<any>(legacyResponse);
    return parseResults(legacyPayload);
  }

  async searchProducts(
    query: string,
  ): Promise<PurchaseOrderProductSearchItem[]> {
    const normalizeItems = (items: any[]): PurchaseOrderProductSearchItem[] =>
      items.reduce<PurchaseOrderProductSearchItem[]>((acc, item) => {
        if (!item) return acc;
        const name = item.name ?? item.product_name ?? item.display_name;
        const unitPrice =
          item.purchase_rate ?? item.unit_price ?? item.cost_price ?? item.rate;
        const description = item.description ?? item.product_description;

        if (!item.id || !name) return acc;

        acc.push({
          id: Number(item.id),
          name,
          unit_price: unitPrice ?? null,
          description: description ?? null,
        });

        return acc;
      }, []);

    const parseResults = (payload: any) => {
      const data = payload?.data ?? payload ?? {};
      if (Array.isArray(data)) return normalizeItems(data);
      if (Array.isArray(data?.products)) return normalizeItems(data.products);
      if (Array.isArray(data?.data)) return normalizeItems(data.data);
      return [] as PurchaseOrderProductSearchItem[];
    };

    try {
      const response = await apiClient.get(`${BASE_PATH}/search/products`, {
        params: { q: query, search: query },
      });
      const payload = normalizePayload<any>(response);
      const results = parseResults(payload);
      if (results.length > 0) return results;
    } catch (_error) {
      // fall through
    }

    const legacyResponse = await apiClient.get(`${BASE_PATH}/search-products`, {
      params: { search: query },
    });
    const legacyPayload = normalizePayload<any>(legacyResponse);
    return parseResults(legacyPayload);
  }
}

export const purchaseOrderService = new PurchaseOrderService();
