import apiClient from "../../../api/client";
import type {
  PeriodReportResponse,
  PurchaseSummaryResponse,
  ReportCompareWith,
  ReportGroupBy,
  ReportPeriodType,
  ReportRecordResponse,
  SalesCustomerRecord,
  SalesProductRecord,
  SalesSummaryResponse,
  PurchaseVendorRecord,
  PurchaseProductRecord,
} from "../types";

class ReportsService {
  private baseUrl = "/reports";

  private cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  }

  async salesSummary(params: {
    from_date: string;
    to_date: string;
    group_by: ReportGroupBy;
  }): Promise<SalesSummaryResponse> {
    const response = await apiClient.get(`${this.baseUrl}/sales/summary`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async salesCustomers(params: {
    from_date: string;
    to_date: string;
    customer_id?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<ReportRecordResponse<SalesCustomerRecord>> {
    const response = await apiClient.get(`${this.baseUrl}/sales/customers`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async salesProducts(params: {
    from_date: string;
    to_date: string;
    product_id?: number;
    category_id?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<ReportRecordResponse<SalesProductRecord>> {
    const response = await apiClient.get(`${this.baseUrl}/sales/products`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async salesByPeriod(params: {
    from_date: string;
    to_date: string;
    period_type: ReportPeriodType;
    compare_with?: ReportCompareWith;
  }): Promise<PeriodReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/sales/by-period`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async purchaseSummary(params: {
    from_date: string;
    to_date: string;
    group_by: ReportGroupBy;
  }): Promise<PurchaseSummaryResponse> {
    const response = await apiClient.get(`${this.baseUrl}/purchases/summary`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async purchaseVendors(params: {
    from_date: string;
    to_date: string;
    vendor_id?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<ReportRecordResponse<PurchaseVendorRecord>> {
    const response = await apiClient.get(`${this.baseUrl}/purchases/vendors`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async purchaseProducts(params: {
    from_date: string;
    to_date: string;
    product_id?: number;
    category_id?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<ReportRecordResponse<PurchaseProductRecord>> {
    const response = await apiClient.get(`${this.baseUrl}/purchases/products`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async purchaseByPeriod(params: {
    from_date: string;
    to_date: string;
    period_type: ReportPeriodType;
    compare_with?: ReportCompareWith;
  }): Promise<PeriodReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/purchases/by-period`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }
}

export const reportsService = new ReportsService();
