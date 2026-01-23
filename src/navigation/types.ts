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
// MAIN TAB NAVIGATOR
// ============================================================================
export type MainTabParamList = {
  Dashboard: undefined;
  Accounting: NavigatorScreenParams<AccountingStackParamList>;
  Inventory: NavigatorScreenParams<InventoryStackParamList>;
  POS: undefined;
  CRM: NavigatorScreenParams<CRMStackParamList>;
  Reports: undefined;
  Audit: undefined;
  Ecommerce: undefined;
  Payroll: undefined;
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

  // Invoice Management Module
  InvoiceHome: { type: "sales" | "purchase" };
  InvoiceCreate: { type: "sales" | "purchase"; onCreated?: () => void };
  InvoiceShow: { id: number };
  InvoiceEdit: { id: number; onUpdated?: (id: number) => void };

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
  CategoryCreate: undefined;
  CategoryShow: { id: number };
  CategoryEdit: { id: number };

  // Stock Adjustment Module (placeholder for future)
  StockAdjustmentHome: undefined;
  StockAdjustmentCreate: undefined;
  StockAdjustmentShow: { id: number };
};

// ============================================================================
// TYPE HELPERS
// ============================================================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
