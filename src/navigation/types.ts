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

  // Account Groups Module
  AccountGroupHome: undefined;
  AccountGroupCreate: undefined;
  AccountGroupShow: { id: number };
  AccountGroupEdit: { id: number };

  // Ledger Accounts Module (placeholder for future)
  LedgerAccountList: undefined;
  LedgerAccountCreate: undefined;
  LedgerAccountShow: { id: number };
  LedgerAccountEdit: { id: number };

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
