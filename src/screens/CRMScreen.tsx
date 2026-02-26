import React, { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import CRMOverview from "../components/crm/CRMOverview";
import QuickActions from "../components/crm/QuickActions";
import CustomersSection from "../components/crm/CustomersSection";
import VendorsSection from "../components/crm/VendorsSection";
import DocumentsSection from "../components/crm/DocumentsSection";
import StatementsAndPayments from "../components/crm/StatementsAndPayments";
import { customerService } from "../features/crm/customers/services/customerService";
import { vendorService } from "../features/crm/vendors/services/vendorService";
import { invoiceService } from "../features/accounting/invoice/services/invoiceService";
import { quotationService } from "../features/accounting/quotation/services/quotationService";
import { purchaseOrderService } from "../features/accounting/purchaseorder/services/purchaseOrderService";
import { voucherService } from "../features/accounting/voucher/services/voucherService";
import { voucherTypeService } from "../features/accounting/vouchertype/services/voucherTypeService";
import type {
  CustomerListItem,
  CustomerStatistics,
  CustomerStatementsStats,
} from "../features/crm/customers/types";
import type {
  VendorListItem,
  VendorStatistics,
} from "../features/crm/vendors/types";
import type { Statistics as InvoiceStatistics } from "../features/accounting/invoice/types";

export default function CRMScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStatistics | null>(
    null,
  );
  const [vendorStats, setVendorStats] = useState<VendorStatistics | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStatistics | null>(
    null,
  );
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [quotationCount, setQuotationCount] = useState(0);
  const [purchaseOrderCount, setPurchaseOrderCount] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  const [customerStatementStats, setCustomerStatementStats] =
    useState<CustomerStatementsStats | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        customerResult,
        vendorResult,
        invoiceResult,
        statementResult,
        quotationResult,
        purchaseOrderResult,
        voucherTypes,
      ] = await Promise.all([
        customerService.list({ per_page: 5, page: 1 }),
        vendorService.list({ per_page: 5, page: 1 }),
        invoiceService.list({ type: "sales", per_page: 1, page: 1 }),
        customerService.statements({ per_page: 1, page: 1 }),
        quotationService.list({ per_page: 1, page: 1 }),
        purchaseOrderService.list({ per_page: 1, page: 1 }),
        voucherTypeService.search("", "accounting"),
      ]);

      setCustomers(customerResult.data || []);
      setCustomerStats(customerResult.statistics || null);

      setVendors(vendorResult.data || []);
      setVendorStats(vendorResult.statistics || null);

      setInvoiceStats(invoiceResult.statistics || null);
      setInvoiceCount(invoiceResult.pagination?.total || 0);
      setCustomerStatementStats(statementResult.statistics || null);
      setQuotationCount(quotationResult.pagination?.total || 0);
      setPurchaseOrderCount(purchaseOrderResult.pagination?.total || 0);

      const receiptType = voucherTypes.find((type) => {
        const code = type.code?.toLowerCase() || "";
        const name = type.name?.toLowerCase() || "";
        return code.includes("receipt") || name.includes("receipt");
      });

      if (receiptType) {
        const receiptList = await voucherService.list({
          voucher_type_id: receiptType.id,
          per_page: 1,
          page: 1,
        });
        const receiptTotal =
          receiptList?.pagination?.total ?? receiptList?.vouchers?.length ?? 0;
        setReceiptCount(receiptTotal);
      } else {
        setReceiptCount(0);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to load CRM data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ModuleScreenLayout refreshing={refreshing} onRefresh={onRefresh}>
      <CRMOverview
        totalCustomers={customerStats?.total_customers || 0}
        totalVendors={vendorStats?.total_vendors || 0}
        pendingInvoices={invoiceStats?.draft_invoices || 0}
        outstandingReceivable={customerStatementStats?.total_receivable || 0}
        loading={loading}
      />
      <QuickActions />
      <CustomersSection customers={customers} loading={loading} />
      <VendorsSection vendors={vendors} loading={loading} />
      <DocumentsSection
        invoiceCount={invoiceCount}
        quotationCount={quotationCount}
        purchaseOrderCount={purchaseOrderCount}
        receiptCount={receiptCount}
        loading={loading}
      />
      <StatementsAndPayments />
    </ModuleScreenLayout>
  );
}
