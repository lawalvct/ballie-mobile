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
  ProfitLossReportResponse,
  BalanceSheetReportResponse,
  TrialBalanceReportResponse,
  CashFlowReportResponse,
  StockSummaryReportResponse,
  LowStockAlertReportResponse,
  StockValuationReportResponse,
  StockMovementReportResponse,
  BinCardReportResponse,
  CustomerActivitiesReportResponse,
  CustomerStatementsReportResponse,
  PaymentReportsResponse,
  PayrollSummaryReportResponse,
  PayrollTaxReportResponse,
  PayrollTaxSummaryReportResponse,
  PayrollEmployeeSummaryReportResponse,
  PayrollBankScheduleReportResponse,
  PayrollDetailedReportResponse,
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

  async financialProfitLoss(params: {
    from_date: string;
    to_date: string;
    compare?: boolean;
  }): Promise<ProfitLossReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/financial/profit-loss`,
      {
        params: this.cleanParams({
          ...params,
          compare: params.compare ? 1 : 0,
        }),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async financialBalanceSheet(params: {
    as_of_date: string;
    compare?: boolean;
  }): Promise<BalanceSheetReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/financial/balance-sheet`,
      {
        params: this.cleanParams({
          ...params,
          compare: params.compare ? 1 : 0,
        }),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async financialTrialBalance(params: {
    from_date?: string;
    to_date?: string;
    as_of_date?: string;
  }): Promise<TrialBalanceReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/financial/trial-balance`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async financialCashFlow(params: {
    from_date: string;
    to_date: string;
  }): Promise<CashFlowReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/financial/cash-flow`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async inventoryStockSummary(params: {
    as_of_date: string;
    category_id?: number;
    stock_status?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    search?: string;
  }): Promise<StockSummaryReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/inventory/stock-summary`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async inventoryLowStockAlert(params: {
    as_of_date: string;
    category_id?: number;
    alert_type?: string;
    search?: string;
  }): Promise<LowStockAlertReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/inventory/low-stock-alert`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async inventoryStockValuation(params: {
    as_of_date: string;
    category_id?: number;
    valuation_method?: string;
    group_by?: string;
    search?: string;
  }): Promise<StockValuationReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/inventory/stock-valuation`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async crmActivities(params: {
    customer_id?: number;
    activity_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<CustomerActivitiesReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/crm/activities`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async crmCustomerStatements(params: {
    search?: string;
    customer_type?: string;
    status?: string;
    sort?: string;
    direction?: "asc" | "desc";
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<CustomerStatementsReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/crm/customer-statements`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async crmPaymentReports(params: {
    start_date?: string;
    end_date?: string;
  }): Promise<PaymentReportsResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/crm/payment-reports`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async inventoryStockMovement(params: {
    from_date: string;
    to_date: string;
    product_id?: number;
    category_id?: number;
    movement_type?: string;
  }): Promise<StockMovementReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/inventory/stock-movement`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async inventoryBinCard(params: {
    from_date: string;
    to_date: string;
    product_id?: number;
  }): Promise<BinCardReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/inventory/bin-card`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollSummary(params: {
    year: number;
    month?: number;
    status?: string;
  }): Promise<PayrollSummaryReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/payroll/summary`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollTaxReport(params: {
    year: number;
    month?: number;
  }): Promise<PayrollTaxReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/payroll/tax-report`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollTaxSummary(params: {
    year: number;
    month?: number;
  }): Promise<PayrollTaxSummaryReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/payroll/tax-summary`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollEmployeeSummary(params: {
    year: number;
    department_id?: number;
  }): Promise<PayrollEmployeeSummaryReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/payroll/employee-summary`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollBankSchedule(params: {
    year: number;
    month?: number;
    status?: string;
  }): Promise<PayrollBankScheduleReportResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/payroll/bank-schedule`,
      {
        params: this.cleanParams(params),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async payrollDetailed(params: {
    year: number;
    month?: number;
    department_id?: number;
  }): Promise<PayrollDetailedReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/payroll/detailed`, {
      params: this.cleanParams(params),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }
}

export const reportsService = new ReportsService();
