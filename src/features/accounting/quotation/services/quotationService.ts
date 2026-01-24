// Quotation Service - API Layer
import apiClient from "../../../../api/client";
import type {
  Quotation,
  QuotationCustomerSearchItem,
  QuotationProductSearchItem,
  QuotationCreatePayload,
  QuotationListParams,
  QuotationListResponse,
} from "../types";

const BASE_PATH = "/accounting/quotations";

const normalizePayload = <T = any>(response: any): T => {
  if (response && typeof response === "object" && "success" in response) {
    return response as T;
  }
  if (response && typeof response === "object" && "data" in response) {
    return (response as any).data as T;
  }
  return response as T;
};

class QuotationService {
  async list(params: QuotationListParams = {}): Promise<QuotationListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    const response = await apiClient.get(BASE_PATH, { params: cleanParams });
    const payload = normalizePayload<any>(response);
    const data = payload?.data ?? payload ?? {};

    const quotations = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.quotations)
        ? data.quotations
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
        : quotations.length;
    const per_page =
      typeof paginationSource?.per_page === "number"
        ? paginationSource.per_page
        : (cleanParams.per_page as number | undefined) ||
          quotations.length ||
          15;
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
          : Math.min(total, from + quotations.length - 1);

    return {
      data: quotations,
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

  async show(id: number): Promise<Quotation> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    const payload = normalizePayload<any>(response);
    const data = payload?.data ?? payload ?? {};
    return data?.quotation || data;
  }

  async create(data: QuotationCreatePayload): Promise<Quotation> {
    const response = await apiClient.post(BASE_PATH, data);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async update(id: number, data: QuotationCreatePayload): Promise<Quotation> {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  }

  async send(id: number): Promise<Quotation> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/send`);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async accept(id: number): Promise<Quotation> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/accept`);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async reject(id: number): Promise<Quotation> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/reject`);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async convert(id: number): Promise<Quotation> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/convert`);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }

  async searchCustomers(query: string): Promise<QuotationCustomerSearchItem[]> {
    const normalizeItems = (items: any[]): QuotationCustomerSearchItem[] =>
      items.reduce<QuotationCustomerSearchItem[]>((acc, item) => {
        if (!item) return acc;
        const ledgerId =
          item.ledger_account_id ??
          item.ledger_account?.id ??
          item.ledger_account?.ledger_account_id;
        const name =
          item.display_name ??
          item.ledger_account_name ??
          item.name ??
          item.ledger_account?.name;

        const normalized: QuotationCustomerSearchItem = {
          id: item.id ?? ledgerId ?? item.ledger_id ?? 0,
          ledger_account_id: Number(ledgerId) || 0,
          name: name || "Unknown",
          email: item.email ?? item.ledger_account?.email ?? null,
        };

        if (normalized.ledger_account_id) {
          acc.push(normalized);
        }

        return acc;
      }, []);

    const parseResults = (payload: any) => {
      const data = payload?.data ?? payload ?? {};
      if (Array.isArray(data)) return normalizeItems(data);
      if (Array.isArray(data?.customers)) return normalizeItems(data.customers);
      if (Array.isArray(data?.data)) return normalizeItems(data.data);
      return [] as QuotationCustomerSearchItem[];
    };

    try {
      const response = await apiClient.get(`${BASE_PATH}/search-customers`, {
        params: { search: query },
      });
      const payload = normalizePayload<any>(response);
      const results = parseResults(payload);
      if (results.length > 0) return results;
    } catch (_error) {
      // fall through to legacy endpoint
    }

    const legacyResponse = await apiClient.get(
      `${BASE_PATH}/search/customers`,
      {
        params: { q: query, search: query },
      },
    );
    const legacyPayload = normalizePayload<any>(legacyResponse);
    return parseResults(legacyPayload);
  }

  async searchProducts(query: string): Promise<QuotationProductSearchItem[]> {
    const normalizeItems = (items: any[]): QuotationProductSearchItem[] =>
      items.reduce<QuotationProductSearchItem[]>((acc, item) => {
        if (!item) return acc;
        const name = item.name ?? item.product_name ?? item.display_name;
        const rate =
          item.sales_rate ?? item.rate ?? item.selling_price ?? item.unit_price;
        const description = item.description ?? item.product_description;

        if (!item.id || !name) return acc;

        acc.push({
          id: Number(item.id),
          name,
          sales_rate: rate ?? null,
          rate: rate ?? null,
          description: description ?? null,
        });

        return acc;
      }, []);

    const parseResults = (payload: any) => {
      const data = payload?.data ?? payload ?? {};
      if (Array.isArray(data)) return normalizeItems(data);
      if (Array.isArray(data?.products)) return normalizeItems(data.products);
      if (Array.isArray(data?.data)) return normalizeItems(data.data);
      return [] as QuotationProductSearchItem[];
    };

    try {
      const response = await apiClient.get(`${BASE_PATH}/search/products`, {
        params: { q: query, search: query },
      });
      const payload = normalizePayload<any>(response);
      const results = parseResults(payload);
      if (results.length > 0) return results;
    } catch (_error) {
      // fall through to legacy endpoint
    }

    const legacyResponse = await apiClient.get(`${BASE_PATH}/search-products`, {
      params: { search: query },
    });
    const legacyPayload = normalizePayload<any>(legacyResponse);
    return parseResults(legacyPayload);
  }

  async duplicate(id: number): Promise<Quotation> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/duplicate`);
    const payload = normalizePayload<any>(response);
    const result = payload?.data ?? payload ?? {};
    return result?.quotation || result;
  }
}

export const quotationService = new QuotationService();
