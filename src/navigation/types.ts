// Navigation type definitions for the entire app

import type { NavigatorScreenParams } from "@react-navigation/native";

// ============================================================================
// MAIN TAB NAVIGATOR
// ============================================================================
export type MainTabParamList = {
  Dashboard: undefined;
  Accounting: NavigatorScreenParams<AccountingStackParamList>;
  Inventory: undefined;
  POS: undefined;
  CRM: undefined;
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

  // Voucher Management Module
  VoucherHome: undefined;
  VoucherCreate: {
    onCreated?: () => void;
    voucherType?: string;
    duplicateId?: number;
  };
  VoucherShow: { id: number };
  VoucherEdit: { id: number; onUpdated?: (id: number) => void };

  // Journal Entries Module (placeholder for future)
  JournalEntryList: undefined;
  JournalEntryCreate: undefined;
  JournalEntryShow: { id: number };
  JournalEntryEdit: { id: number };
};

// ============================================================================
// TYPE HELPERS
// ============================================================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
