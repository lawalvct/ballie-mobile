import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import { useBanks } from "../hooks/useBanks";
import type { BankAccount, ListParams } from "../types";

const statusBadgeMap: Record<string, { bg: string; text: string }> = {
  active: { bg: "#d1fae5", text: "#065f46" },
  inactive: { bg: "#e5e7eb", text: "#6b7280" },
  closed: { bg: "#fee2e2", text: "#b91c1c" },
  suspended: { bg: "#fef3c7", text: "#92400e" },
};

type Props = NativeStackScreenProps<AccountingStackParamList, "BankHome">;

export default function BankHomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<ListParams>({
    sort_by: "created_at",
    sort_order: "desc",
    page: 1,
    per_page: 20,
  });

  const {
    banks,
    pagination,
    statistics,
    bankNames,
    isLoading,
    isRefreshing,
    refresh,
  } = useBanks(filters);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = () =>
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchText.trim() || undefined,
    }));

  const handleFilterChange = (key: keyof ListParams, value: string) =>
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value || undefined,
    }));

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  const handleCreated = () => refresh();

  const toNumber = (value: number | string | null | undefined) =>
    typeof value === "number" ? value : value ? Number(value) : 0;

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <AccountingModuleHeader
          title="Bank Accounts"
          onBack={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingLabel}>Loading bank accounts…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title="Bank Accounts"
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
            onPress={() =>
              navigation.navigate({
                name: "BankCreate",
                params: { onCreated: handleCreated },
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {statistics && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.total_banks}</Text>
                <Text style={styles.statLabel}>Total Banks</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.active_banks}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  ₦{toNumber(statistics.total_balance).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Total Balance</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  {statistics.needs_reconciliation}
                </Text>
                <Text style={styles.statLabel}>Needs Reconciliation</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Search + Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search bank, account number, branch"
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.8}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "" ? "" : String(value),
                  )
                }
                style={styles.picker}>
                <Picker.Item label="All Status" value="" />
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Inactive" value="inactive" />
                <Picker.Item label="Closed" value="closed" />
                <Picker.Item label="Suspended" value="suspended" />
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.bank_name || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "bank_name",
                    value === "" ? "" : String(value),
                  )
                }
                style={styles.picker}>
                <Picker.Item label="All Banks" value="" />
                {bankNames.map((name: string) => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Bank list */}
        <View style={styles.listSection}>
          {banks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyTitle}>No Bank Accounts</Text>
              <Text style={styles.emptyBody}>
                {filters.search || filters.status || filters.bank_name
                  ? "No accounts match your current filters. Try clearing them."
                  : "Create your first bank account to get started."}
              </Text>
              {!filters.search && !filters.status && !filters.bank_name && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() =>
                    navigation.navigate({
                      name: "BankCreate",
                      params: { onCreated: handleCreated },
                    })
                  }
                  activeOpacity={0.8}>
                  <Text style={styles.emptyBtnText}>+ Add Bank Account</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            banks.map((bank: BankAccount) => {
              const statusStyle = statusBadgeMap[bank.status || ""] || {
                bg: "#e5e7eb",
                text: "#6b7280",
              };

              return (
                <TouchableOpacity
                  key={bank.id}
                  style={styles.bankCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate({
                      name: "BankShow",
                      params: { id: bank.id },
                    })
                  }>
                  <View style={styles.bankCardHeader}>
                    <View style={styles.bankTitleRow}>
                      <Text style={styles.bankName}>{bank.bank_name}</Text>
                      {bank.is_primary ? (
                        <Text style={styles.primaryBadge}>Primary</Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.bg },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusStyle.text },
                        ]}>
                        {(bank.status || "unknown").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.accountName}>{bank.account_name}</Text>
                  <Text style={styles.accountNumber}>
                    {bank.masked_account_number || bank.account_number}
                  </Text>

                  <View style={styles.bankMetaRow}>
                    <Text style={styles.metaText}>
                      {bank.account_type_display || bank.account_type || "-"}
                    </Text>
                    <Text style={styles.metaText}>
                      {bank.currency || "NGN"}
                    </Text>
                  </View>

                  <View style={styles.balanceRow}>
                    <View>
                      <Text style={styles.balanceLabel}>Current Balance</Text>
                      <Text style={styles.balanceValue}>
                        ₦{toNumber(bank.current_balance).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.balanceRight}>
                      <Text style={styles.balanceLabel}>Available</Text>
                      <Text style={styles.balanceValue}>
                        ₦{toNumber(bank.available_balance).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

  /* ── Actions section ── */
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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

  /* ── Stats ── */
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a0f33",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    textAlign: "center",
  },

  /* ── Filters ── */
  filtersSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a0f33",
  },
  searchButton: {
    backgroundColor: "#d1b05e",
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a0f33",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 48,
  },

  /* ── List ── */
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bankCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  bankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a0f33",
  },
  primaryBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  accountName: {
    fontSize: 13,
    color: "#6b7280",
  },
  accountNumber: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 10,
  },
  bankMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  balanceLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a0f33",
  },
  balanceRight: {
    alignItems: "flex-end",
  },

  /* ── Empty ── */
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 48,
    alignItems: "center",
    marginTop: 4,
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
