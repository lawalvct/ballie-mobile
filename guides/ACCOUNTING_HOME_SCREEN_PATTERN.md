# Accounting Home Screen Improvement Pattern

> Reference guide for applying the unified UI + TanStack Query pattern to any accounting feature home screen.
> Already applied to: **Invoice**, **Ledger Account**, **Account Group**.
> Next targets: **Bank**, **Voucher**, **Reconciliation**, **Voucher Type**.

---

## Overview of Changes

Each screen upgrade involves **3 things**:

| #   | What                    | Where                                                                                   |
| --- | ----------------------- | --------------------------------------------------------------------------------------- |
| 1   | **TanStack Query hook** | `src/features/accounting/<feature>/hooks/use<Feature>.ts`                               |
| 2   | **Rewrite home screen** | `src/features/accounting/<feature>/screens/<Feature>HomeScreen.tsx` (or `src/screens/`) |
| 3   | **Use shared header**   | `src/components/accounting/AccountingModuleHeader.tsx` (already exists)                 |

---

## Step 1 — Create the TanStack Query Hook

File: `src/features/accounting/<feature>/hooks/use<Feature>.ts`

```ts
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../../../../hooks/useApiQuery";
import { queryKeys } from "../../../../state/queryKeys";
import { <feature>Service } from "../services/<feature>Service";
import type { ListParams } from "../types";

export function use<Feature>(params: ListParams) {
  const queryClient = useQueryClient();

  const query = useApiQuery(
    queryKeys.<featureKey>.list(params as Record<string, any>),
    () => <feature>Service.list(params),
    {
      staleTime: 3 * 60 * 1000,        // 3-min stale
      placeholderData: keepPreviousData, // no blank flash on page/filter change
    },
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.<featureKey>.all });
  };

  return {
    <items>: (query.data as any)?.<responseField> ?? [],
    pagination: (query.data as any)?.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    statistics: (query.data as any)?.statistics ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    refresh,
  };
}
```

### Key variables to customise per feature

| Variable              | Invoice              | Ledger Account             | Account Group             | Bank (TODO)       |
| --------------------- | -------------------- | -------------------------- | ------------------------- | ----------------- |
| `queryKeys.*`         | `queryKeys.invoices` | `queryKeys.ledgerAccounts` | `queryKeys.accountGroups` | `queryKeys.banks` |
| `<responseField>`     | `data`               | `ledger_accounts`          | `account_groups`          | `banks`           |
| `<items>` return name | `invoices`           | `accounts`                 | `groups`                  | `banks`           |
| staleTime             | 2 min                | 3 min                      | 3 min                     | 3 min             |

> **Important:** The `<responseField>` must match the API response key. Check the service's `.list()` return shape.

---

## Step 2 — Rewrite the Home Screen

### Imports (replace old ones)

**Remove:**

```tsx
import { useState, useEffect } from "react";
import { StatusBar } from "react-native";        // RN StatusBar
import { BRAND_COLORS } from "../../../../theme/colors";
import { <feature>Service } from "../services/...";
import { <Entity>, ListParams, PaginationInfo, Statistics } from "../types";
```

**Add:**

```tsx
import { useState } from "react";                 // no useEffect needed
import { StatusBar } from "expo-status-bar";       // expo StatusBar
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import { use<Feature> } from "../hooks/use<Feature>";
import type { ListParams } from "../types";        // only ListParams needed
```

### State — Before vs After

**Before (manual state):**

```tsx
const [items, setItems] = useState<Entity[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [pagination, setPagination] = useState<PaginationInfo | null>(null);
const [statistics, setStatistics] = useState<Statistics | null>(null);

const [filters, setFilters] = useState<ListParams>({ sort: "name", direction: "asc" });

useEffect(() => { loadData(); }, [filters]);

const loadData = async () => { ... };
const handleRefresh = async () => { ... };
```

**After (TanStack Query):**

```tsx
const [filters, setFilters] = useState<ListParams>({
  sort: "name",
  direction: "asc",
  page: 1,
  per_page: 20,
});

const { items, pagination, statistics, isLoading, isRefreshing, refresh } =
  use<Feature>(filters);
```

### Handler simplification

```tsx
// Before: manual reload functions
const handleItemUpdated = async (id: number) => { ... fetch + setState ... };
const handleItemCreated = () => { loadData(); };

// After: just invalidate cache
const handleItemUpdated = () => refresh();
const handleItemCreated = () => refresh();
```

---

## Step 3 — JSX Structure

### Container + StatusBar

```tsx
<SafeAreaView style={styles.container} edges={["top"]}>
  <StatusBar style="light" />
  {/* ... */}
</SafeAreaView>
```

### Header (replaces inline View header)

**Before:**

```tsx
<View style={styles.header}>
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={styles.backButton}>
    <Text style={styles.backButtonText}>← Back</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Feature Name</Text>
  <View style={styles.placeholder} />
</View>
```

**After:**

```tsx
<AccountingModuleHeader
  title="Feature Name"
  onBack={() => navigation.goBack()}
  navigation={navigation}
/>
```

> The header renders a dark gradient (`#1a0f33 → #2d1f5e`), ‹ Back button, centred title, and ⋮ three-dot menu that opens a bottom sheet with quick links to all accounting sections.

### ScrollView + RefreshControl

```tsx
<ScrollView
  style={styles.body}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={refresh}
      colors={["#d1b05e"]}
      tintColor="#d1b05e"
    />
  }>
```

### Gold Create Button

```tsx
<View style={styles.actionsSection}>
  <TouchableOpacity
    style={styles.createBtn}
    onPress={() => navigation.navigate("<Feature>Create", { ... })}
    activeOpacity={0.8}>
    <Text style={styles.createBtnIcon}>+</Text>
    <Text style={styles.createBtnLabel}>Create New <Entity Name></Text>
  </TouchableOpacity>
</View>
```

### Optional Secondary Action Row (Import/Excel/PDF)

Used in Ledger Accounts. Add if the feature has export/import:

```tsx
<View style={styles.secondaryRow}>
  <TouchableOpacity
    style={styles.secondaryBtn}
    onPress={handleImport}
    activeOpacity={0.7}>
    <Text style={styles.secondaryBtnIcon}>📥</Text>
    <Text style={styles.secondaryBtnText}>Import</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.secondaryBtn}
    onPress={handleExportExcel}
    activeOpacity={0.7}>
    <Text style={styles.secondaryBtnIcon}>📊</Text>
    <Text style={styles.secondaryBtnText}>Excel</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.secondaryBtn}
    onPress={handleExportPdf}
    activeOpacity={0.7}>
    <Text style={styles.secondaryBtnIcon}>📄</Text>
    <Text style={styles.secondaryBtnText}>PDF</Text>
  </TouchableOpacity>
</View>
```

### Loading State

```tsx
if (isLoading) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader title="..." onBack={...} navigation={navigation} />
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#d1b05e" />
        <Text style={styles.loadingLabel}>Loading ...…</Text>
      </View>
    </SafeAreaView>
  );
}
```

### Bottom Spacer

```tsx
<View style={{ height: 30 }} />
```

---

## Step 4 — StyleSheet

### Required base styles (copy for every screen)

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f33", // dark purple background
  },

  /* ── Loading ── */
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 14,
    color: "#6b7280",
  },

  /* ── Body ── */
  body: {
    flex: 1,
    backgroundColor: "#f3f4f8", // light grey body
  },

  /* ── Actions section ── */
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10, // only if secondary row present
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1b05e", // gold
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#d1b05e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a0f33",
    lineHeight: 24,
  },
  createBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a0f33",
    letterSpacing: 0.3,
  },
});
```

### Optional: secondary action row styles

```tsx
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
```

### Styles to DELETE (old pattern)

Remove all of these if present:

```
header, backButton, backButtonText, headerTitle, placeholder,
content (rename to body), loadingContainer (rename to loadingWrap),
loadingText (rename to loadingLabel), addButtonContainer, addButton,
addButtonText, primaryBtn, primaryBtnIcon, primaryBtnText
```

---

## Design Tokens (Quick Reference)

| Token           | Value     | Usage                                                              |
| --------------- | --------- | ------------------------------------------------------------------ |
| Dark background | `#1a0f33` | Container, table header                                            |
| Gradient end    | `#2d1f5e` | Header gradient (via AccountingModuleHeader)                       |
| Gold accent     | `#d1b05e` | Create button, RefreshControl, pagination buttons, dots menu close |
| Body background | `#f3f4f8` | ScrollView body, loading wrap                                      |
| Card background | `#fff`    | Empty state, table, secondary buttons                              |
| Text primary    | `#1a0f33` | Button labels                                                      |
| Text secondary  | `#374151` | Table cells, secondary button text                                 |
| Text muted      | `#6b7280` | Loading label, count text, empty body                              |
| Border light    | `#e5e7eb` | Card borders, table borders                                        |
| Status green    | `#16a34a` | Posted/active status                                               |
| Status amber    | `#d97706` | Draft/pending status                                               |

---

## Shared Component Reference

### `AccountingModuleHeader`

**File:** `src/components/accounting/AccountingModuleHeader.tsx`

**Props:**

```ts
type Props = {
  title: string;
  onBack: () => void;
  navigation: Pick<
    NativeStackNavigationProp<AccountingStackParamList>,
    "navigate"
  >;
};
```

**Features:**

- Dark gradient header (`#1a0f33 → #2d1f5e`)
- ‹ Back button (left)
- Centred title
- ⋮ Three-dot menu (right) → opens bottom sheet Modal
- Bottom sheet has 2 sections:
  - **Voucher Management**: Voucher Types, Create Voucher, View Vouchers, Journal Entries
  - **Account Management**: Ledger Accounts, Account Groups, Bank Accounts, Reconciliation
- NavProp uses `Pick<..., "navigate">` to avoid TypeScript conflicts with screen-specific types

---

## Query Keys Reference

**File:** `src/state/queryKeys.ts`

Each feature must have entries in the queryKeys factory. Existing keys:

```ts
queryKeys.invoices.all / .lists() / .list(params) / .detail(id) / .statistics()
queryKeys.ledgerAccounts.all / .lists() / .list(params) / .detail(id) / .statistics()
queryKeys.accountGroups.all / .lists() / .list(params) / .detail(id) / .statistics()
queryKeys.banks.all / .lists() / .list(params) / .detail(id) / .statistics()
queryKeys.vouchers.all / .lists() / .list(params) / .detail(id) / .statistics()
queryKeys.voucherTypes.all / .lists() / .list(params) / .detail(id)
```

If a feature doesn't have `.statistics()` key yet, add it:

```ts
statistics: () => [...queryKeys.<feature>.all, "statistics"] as const,
```

---

## Completed Screens

### 1. InvoiceHomeScreen

- **Hook:** `src/features/accounting/invoice/hooks/useInvoices.ts`
- **Screen:** `src/features/accounting/invoice/screens/InvoiceHomeScreen.tsx`
- **Response field:** `data` (invoices are inside `response.data`)
- **Extra features:** Card/Table view toggle, TableView sub-component, Pagination sub-component, EmptyState sub-component
- **Sub-components preserved:** `InvoiceStats`, `InvoiceFilters`, `InvoiceCard`

### 2. LedgerAccountHomeScreen

- **Hook:** `src/features/accounting/ledgeraccount/hooks/useLedgerAccounts.ts`
- **Screen:** `src/screens/LedgerAccountHomeScreen.tsx`
- **Response field:** `ledger_accounts`
- **Extra features:** Secondary action row (Import/Excel/PDF), list/tree view toggle
- **Sub-components preserved:** `LedgerAccountStats`, `LedgerAccountFilters`, `LedgerAccountList`

### 3. AccountGroupHomeScreen

- **Hook:** `src/features/accounting/accountgroup/hooks/useAccountGroups.ts`
- **Screen:** `src/features/accounting/accountgroup/screens/AccountGroupHomeScreen.tsx`
- **Response field:** `account_groups`
- **Extra features:** Toggle status handler
- **Sub-components preserved:** `AccountGroupStats`, `AccountGroupFilters`, `AccountGroupList`

---

## Remaining Screens TODO

### 4. BankHomeScreen

- **Service:** `src/features/accounting/bank/services/bankService.ts`
- **Response field:** Check service — likely `banks`
- **Query key:** `queryKeys.banks`
- **Hook to create:** `src/features/accounting/bank/hooks/useBanks.ts`

### 5. VoucherHomeScreen

- **Service:** `src/features/accounting/voucher/services/voucherService.ts`
- **Response field:** Check service — likely `vouchers`
- **Query key:** `queryKeys.vouchers`
- **Hook to create:** `src/features/accounting/voucher/hooks/useVouchers.ts`

### 6. ReconciliationHomeScreen

- **Service:** `src/features/accounting/reconciliation/services/reconciliationService.ts`
- **Response field:** Check service
- **Query key:** `queryKeys.reconciliations` (may need to add to queryKeys.ts)
- **Hook to create:** `src/features/accounting/reconciliation/hooks/useReconciliations.ts`

### 7. VoucherTypeHomeScreen

- **Service:** `src/features/accounting/vouchertype/services/voucherTypeService.ts`
- **Response field:** Check service
- **Query key:** `queryKeys.voucherTypes`
- **Hook to create:** `src/features/accounting/vouchertype/hooks/useVoucherTypes.ts`

---

## Also Changed (Supporting Files)

| File                                                     | Change                                                                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/state/queryKeys.ts`                                 | Added `.statistics()` keys to vouchers, ledgerAccounts, banks, invoices                                                                  |
| `src/features/accounting/hooks/useAccountingOverview.ts` | New hook — 3 parallel queries for overview stats (5-min stale)                                                                           |
| `src/screens/AccountingScreen.tsx`                       | Replaced `useEffect/useState` with `useAccountingOverview()` hook; added `onPress` handlers to `AccountingOverview` cards for navigation |
| `src/components/accounting/AccountingOverview.tsx`       | Added `TouchableOpacity` wrappers + `onPress` callbacks on each overview card                                                            |
| `src/components/accounting/AccountingModuleHeader.tsx`   | New shared header component                                                                                                              |
