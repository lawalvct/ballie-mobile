// Navigation type definitions for the entire app

import type { NavigatorScreenParams } from "@react-navigation/native";

// ============================================================================
// CRM STACK NAVIGATOR
// ============================================================================
export type CRMStackParamList = {
  CRMHome: undefined;
  CustomerHome: undefined;
  CustomerCreate: undefined;
  CustomerShow: { id: number };
  CustomerEdit: { id: number };
  CustomerStatements: undefined;
  CustomerStatementDetail: { id: number };
  VendorHome: undefined;
  VendorCreate: undefined;
  VendorShow: { id: number };
  VendorEdit: { id: number };
  VendorStatements: undefined;
  VendorStatementDetail: { id: number };
};

// ============================================================================
// PAYROLL STACK NAVIGATOR
// ============================================================================
export type PayrollStackParamList = {
  PayrollHome: undefined;
  PayrollActions: undefined;
  PayrollEmployeeHome: undefined;
  PayrollEmployeeCreate: { onCreated?: () => void } | undefined;
  PayrollEmployeeShow: { id: number };
  PayrollEmployeeEdit: { id: number; onUpdated?: (id: number) => void };
  PayrollAttendanceHome: undefined;
  PayrollAttendanceClockIn: undefined;
  PayrollAttendanceClockOut: undefined;
  PayrollAttendanceMarkAbsent: undefined;
  PayrollAttendanceMarkLeave: undefined;
  PayrollAttendanceManualEntry: { onCreated?: () => void } | undefined;
  PayrollAttendanceQr: undefined;
  PayrollAttendanceMonthlyReport: undefined;
  PayrollAttendanceEmployee: undefined;
  PayrollProcessingHome: undefined;
  PayrollProcessingCreate: { onCreated?: () => void } | undefined;
  PayrollProcessingShow: { id: number };
  PayrollShiftHome: undefined;
  PayrollShiftCreate: { onCreated?: () => void } | undefined;
  PayrollShiftShow: { id: number };
  PayrollShiftEdit: { id: number; onUpdated?: (id: number) => void };
  PayrollShiftAssignments: { shiftId?: number } | undefined;
  PayrollShiftAssign: { shiftId?: number; employeeId?: number } | undefined;
  PayrollDepartmentHome: undefined;
  PayrollDepartmentCreate: { onCreated?: () => void } | undefined;
  PayrollDepartmentShow: { id: number };
  PayrollDepartmentEdit: { id: number; onUpdated?: (id: number) => void };
  PayrollSalaryComponentHome: undefined;
  PayrollSalaryComponentCreate:
    | {
        type?: "earning" | "deduction" | "employer_contribution";
        onCreated?: () => void;
      }
    | undefined;
  PayrollSalaryComponentShow: { id: number };
  PayrollSalaryComponentEdit: { id: number; onUpdated?: (id: number) => void };
  PayrollPositionHome: undefined;
  PayrollPositionCreate: { onCreated?: () => void } | undefined;
  PayrollPositionShow: { id: number };
  PayrollPositionEdit: { id: number; onUpdated?: (id: number) => void };
};

// ============================================================================
// MAIN TAB NAVIGATOR
// ============================================================================
export type MainTabParamList = {
  Dashboard: undefined;
  Accounting: NavigatorScreenParams<AccountingStackParamList>;
  Inventory: NavigatorScreenParams<InventoryStackParamList>;
  // POS: undefined;
  CRM: NavigatorScreenParams<CRMStackParamList>;
  Reports: undefined;
  Audit: undefined;
  Ecommerce: undefined;
  Payroll: NavigatorScreenParams<PayrollStackParamList>;
  Admins: undefined;
  Statutory: undefined;
};

// ============================================================================
// ACCOUNTING STACK NAVIGATOR
// ============================================================================
export type AccountingStackParamList = {
  // Main Accounting Home
  AccountingHome: undefined;

  // All Accounting Actions
  AccountingActions: undefined;

  // Account Groups Module
  AccountGroupHome: undefined;
  AccountGroupCreate: undefined;
  AccountGroupShow: { id: number };
  AccountGroupEdit: { id: number };

  // Ledger Accounts Module
  LedgerAccountHome: undefined;
  LedgerAccountCreate: { onCreated?: () => void };
  LedgerAccountShow: { id: number };
  LedgerAccountEdit: { id: number; onUpdated?: (id: number) => void };

  // Voucher Types Module
  VoucherTypeHome: undefined;
  VoucherTypeCreate: { onCreated?: () => void };
  VoucherTypeShow: { id: number };
  VoucherTypeEdit: { id: number; onUpdated?: (id: number) => void };

  // Voucher Management Module
  VoucherHome: undefined;
  VoucherCreate: {
    onCreated?: () => void;
    voucherType?: string;
    duplicateId?: number;
  };
  VoucherForm: {
    voucherTypeId: number;
    voucherTypeCode: string;
    voucherTypeName: string;
    onCreated?: () => void;
  };
  VoucherShow: { id: number };
  VoucherEdit: { id: number; onUpdated?: (id: number) => void };

  // Banking Module
  BankHome: undefined;
  BankCreate: { onCreated?: () => void };
  BankShow: { id: number };
  BankEdit: { id: number; onUpdated?: () => void };
  BankStatement: { id: number };

  // Bank Reconciliation Module
  ReconciliationHome: undefined;
  ReconciliationCreate: undefined;
  ReconciliationShow: { id: number };

  // Invoice Management Module
  InvoiceHome: { type: "sales" | "purchase" };
  InvoiceCreate: { type: "sales" | "purchase"; onCreated?: () => void };
  InvoiceShow: { id: number };
  InvoiceEdit: { id: number; onUpdated?: (id: number) => void };

  // Purchase Order (LPO) Module
  PurchaseOrderHome: undefined;
  PurchaseOrderCreate: { vendorId?: number } | undefined;
  PurchaseOrderShow: { id: number };

  // Quotation Management Module
  QuotationHome: undefined;
  QuotationCreate: undefined;
  QuotationShow: { id: number };
  QuotationEdit: { id: number };

  // Journal Entries Module (placeholder for future)
  JournalEntryList: undefined;
  JournalEntryCreate: undefined;
  JournalEntryShow: { id: number };
  JournalEntryEdit: { id: number };
};

// ============================================================================
// INVENTORY STACK NAVIGATOR
// ============================================================================
export type InventoryStackParamList = {
  // Main Inventory Home
  InventoryHome: undefined;

  // All Inventory Actions
  InventoryActions: undefined;

  // Product Management Module
  ProductHome: undefined;
  ProductCreate: { onCreated?: () => void };
  ProductShow: { id: number };
  ProductEdit: { id: number; onUpdated?: (id: number) => void };
  ProductStockMovements: { id: number; productName: string };

  // Category Management Module (placeholder for future)
  CategoryHome: undefined;
  CategoryCreate: { onCreated?: () => void };
  CategoryShow: { id: number };
  CategoryEdit: { id: number; onUpdated?: (id: number) => void };

  // Unit Management Module
  UnitHome: undefined;
  UnitCreate: { onCreated?: () => void };
  UnitShow: { id: number };
  UnitEdit: { id: number; onUpdated?: (id: number) => void };

  // Stock Journal Module
  StockJournalHome: undefined;
  StockConsumption: undefined;
  StockProduction: undefined;
  StockAdjustment: undefined;
  StockTransfer: undefined;
  StockJournalDetail: { id: number };
  StockJournalEdit: { id: number };
};

// ============================================================================
// TYPE HELPERS
// ============================================================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
