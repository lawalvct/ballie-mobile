import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type { ListParams, Invoice } from "../types";
import { useInvoices } from "../hooks/useInvoices";
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import InvoiceFilters from "../components/InvoiceFilters";
import InvoiceStats from "../components/InvoiceStats";
import InvoiceCard from "../components/InvoiceCard";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "InvoiceHome"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { type: "sales" | "purchase" };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number | string | null | undefined) => {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseFloat(value) || 0
        : 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function InvoiceHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const invoiceType = route.params.type;

  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [filters, setFilters] = useState<ListParams>({
    type: invoiceType,
    status: undefined,
    from_date: undefined,
    to_date: undefined,
    search: undefined,
    sort: "voucher_date",
    direction: "desc",
    page: 1,
    per_page: 20,
  });

  const { invoices, pagination, statistics, isLoading, isRefreshing, refresh } =
    useInvoices(filters);

  const isSales = invoiceType === "sales";
  const title = isSales ? "Sales Invoices" : "Purchase Invoices";

  const handleFilterChange = (newFilters: ListParams) =>
    setFilters({ ...newFilters, page: 1 });

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  const handleInvoicePress = (invoice: Invoice) =>
    navigation.navigate("InvoiceShow", { id: invoice.id });

  const handleCreatePress = () =>
    navigation.navigate("InvoiceCreate", { type: invoiceType });

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <AccountingModuleHeader
          title={title}
          onBack={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingLabel}>
            Loading {title.toLowerCase()}…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title={title}
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />
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
        {/* Create button */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreatePress}
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>
              Create New {isSales ? "Sales" : "Purchase"} Invoice
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <InvoiceStats statistics={statistics} type={invoiceType} />

        {/* Filters */}
        <View style={styles.filtersWrap}>
          <InvoiceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </View>

        {/* Toolbar: count + view toggle */}
        <View style={styles.toolbar}>
          <Text style={styles.countLabel}>
            {invoices.length > 0
              ? `${pagination.total.toLocaleString()} invoice${pagination.total !== 1 ? "s" : ""}`
              : "No results"}
          </Text>
          <View style={styles.viewToggle}>
            {(["card", "table"] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewToggleBtn,
                  viewMode === mode && styles.viewToggleBtnActive,
                ]}
                onPress={() => setViewMode(mode)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.viewToggleBtnText,
                    viewMode === mode && styles.viewToggleBtnTextActive,
                  ]}>
                  {mode === "card" ? "⊞ Cards" : "≡ Table"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Invoice list / empty */}
        <View style={styles.listSection}>
          {invoices.length === 0 ? (
            <EmptyState
              type={invoiceType}
              hasFilters={
                !!(filters.search || filters.status || filters.from_date)
              }
              onCreate={handleCreatePress}
            />
          ) : viewMode === "card" ? (
            <View style={styles.cardList}>
              {invoices.map((invoice: Invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPress={() => handleInvoicePress(invoice)}
                />
              ))}
            </View>
          ) : (
            <TableView
              invoices={invoices}
              onPress={handleInvoicePress}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}
        </View>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <Pagination
            current={pagination.current_page}
            total={pagination.last_page}
            onChange={handlePageChange}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  type,
  hasFilters,
  onCreate,
}: {
  type: "sales" | "purchase";
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>{type === "sales" ? "🧾" : "📦"}</Text>
      <Text style={styles.emptyTitle}>
        No {type === "sales" ? "Sales" : "Purchase"} Invoices
      </Text>
      <Text style={styles.emptyBody}>
        {hasFilters
          ? "No invoices match your current filters. Try clearing them."
          : `Create your first ${type} invoice to get started.`}
      </Text>
      {!hasFilters && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={onCreate}
          activeOpacity={0.8}>
          <Text style={styles.emptyBtnText}>+ Create Invoice</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TableView({
  invoices,
  onPress,
  formatCurrency,
  formatDate,
}: {
  invoices: Invoice[];
  onPress: (i: Invoice) => void;
  formatCurrency: (v: any) => string;
  formatDate: (v: any) => string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tableScroll}>
      <View style={styles.table}>
        {/* Table header */}
        <View style={styles.tableHead}>
          {["Invoice #", "Party", "Ref", "Date", "Amount", "Status", ""].map(
            (col, i) => (
              <Text
                key={i}
                style={[styles.tableHeadCell, TABLE_WIDTHS[i]]}
                numberOfLines={1}>
                {col}
              </Text>
            ),
          )}
        </View>

        {/* Table rows */}
        {invoices.map((invoice, idx) => {
          const statusColor =
            invoice.status === "posted" ? "#16a34a" : "#d97706";
          return (
            <TouchableOpacity
              key={invoice.id}
              style={[styles.tableRow, idx % 2 !== 0 && styles.tableRowAlt]}
              onPress={() => onPress(invoice)}
              activeOpacity={0.7}>
              <Text
                style={[styles.tableCell, TABLE_WIDTHS[0], styles.tableBold]}
                numberOfLines={1}>
                {invoice.voucher_number}
              </Text>
              <Text
                style={[styles.tableCell, TABLE_WIDTHS[1]]}
                numberOfLines={1}>
                {invoice.party_name ?? "—"}
              </Text>
              <Text
                style={[styles.tableCell, TABLE_WIDTHS[2]]}
                numberOfLines={1}>
                {invoice.reference_number ?? "—"}
              </Text>
              <Text
                style={[styles.tableCell, TABLE_WIDTHS[3]]}
                numberOfLines={1}>
                {formatDate(invoice.voucher_date)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  TABLE_WIDTHS[4],
                  styles.tableBold,
                  { color: "#d1b05e" },
                ]}
                numberOfLines={1}>
                ₦{formatCurrency(invoice.total_amount)}
              </Text>
              <View style={[TABLE_WIDTHS[5], styles.tableStatusCell]}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + "18" },
                  ]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={[TABLE_WIDTHS[6], styles.tableActionCell]}>
                <TouchableOpacity
                  style={styles.tableViewBtn}
                  onPress={() => onPress(invoice)}
                  activeOpacity={0.8}>
                  <Text style={styles.tableViewBtnText}>View →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const TABLE_WIDTHS = [
  { width: 110 },
  { width: 180 },
  { width: 120 },
  { width: 110 },
  { width: 130 },
  { width: 90 },
  { width: 90 },
] as const;

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const hasPrev = current > 1;
  const hasNext = current < total;

  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, !hasPrev && styles.pageBtnDisabled]}
        onPress={() => hasPrev && onChange(current - 1)}
        disabled={!hasPrev}
        activeOpacity={0.7}>
        <Text
          style={[styles.pageBtnText, !hasPrev && styles.pageBtnTextDisabled]}>
          ← Prev
        </Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          {current} / {total}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.pageBtn, !hasNext && styles.pageBtnDisabled]}
        onPress={() => hasNext && onChange(current + 1)}
        disabled={!hasNext}
        activeOpacity={0.7}>
        <Text
          style={[styles.pageBtnText, !hasNext && styles.pageBtnTextDisabled]}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },

  /* ── Actions section ── */
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1b05e",
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
    backgroundColor: "#f3f4f8",
  },
  filtersWrap: {
    paddingTop: 4,
  },

  /* ── Toolbar ── */
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 3,
  },
  viewToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewToggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewToggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  viewToggleBtnTextActive: {
    color: "#1a0f33",
  },

  /* ── Card list ── */
  listSection: {
    paddingHorizontal: 16,
  },
  cardList: {
    gap: 10,
  },

  /* ── Table ── */
  tableScroll: {
    marginBottom: 8,
  },
  table: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 830,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#1a0f33",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 12,
    color: "#374151",
  },
  tableBold: {
    fontWeight: "700",
  },
  tableStatusCell: {
    justifyContent: "center",
  },
  tableActionCell: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  tableViewBtn: {
    backgroundColor: "#1a0f33",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  tableViewBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d1b05e",
  },

  /* ── Status badge ── */
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  /* ── Empty ── */
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a0f33",
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: "#d1b05e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a0f33",
  },

  /* ── Pagination ── */
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  pageBtn: {
    backgroundColor: "#d1b05e",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 9,
  },
  pageBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a0f33",
  },
  pageBtnTextDisabled: {
    color: "#9ca3af",
  },
  pageInfo: {
    backgroundColor: "#f3f4f8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
});
