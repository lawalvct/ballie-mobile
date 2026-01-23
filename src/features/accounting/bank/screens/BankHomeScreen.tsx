import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { bankService } from "../services/bankService";
import type {
  BankAccount,
  ListParams,
  PaginationInfo,
  Statistics,
} from "../types";

const statusBadgeMap: Record<string, { bg: string; text: string }> = {
  active: { bg: "#d1fae5", text: "#065f46" },
  inactive: { bg: "#e5e7eb", text: "#6b7280" },
  closed: { bg: "#fee2e2", text: "#b91c1c" },
  suspended: { bg: "#fef3c7", text: "#92400e" },
};

type Props = NativeStackScreenProps<AccountingStackParamList, "BankHome">;

export default function BankHomeScreen({ navigation }: Props) {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  const [filters, setFilters] = useState<ListParams>({
    sort_by: "created_at",
    sort_order: "desc",
    page: 1,
    per_page: 20,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await bankService.list(filters);
      setBanks(response.banks || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
      setBankNames(response.bank_names || []);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load bank accounts",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchText.trim() || undefined,
    }));
  };

  const handleFilterChange = (key: keyof ListParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value || undefined,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const toNumber = (value: number | string | null | undefined) =>
    typeof value === "number" ? value : value ? Number(value) : 0;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Accounts</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading bank accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate({
                name: "BankCreate",
                params: {
                  onCreated: loadData,
                },
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>

        {statistics ? (
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
        ) : null}

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
              onPress={handleSearch}>
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
                {bankNames.map((name) => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          {banks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyTitle}>No Bank Accounts</Text>
              <Text style={styles.emptyText}>
                Create your first bank account to get started
              </Text>
            </View>
          ) : (
            banks.map((bank) => {
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
                    Alert.alert("Coming soon", "Bank detail screen pending", [
                      { text: "OK" },
                    ])
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

        {pagination && pagination.last_page > 1 ? (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                {pagination.total}
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === 1 &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  ← Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === pagination.last_page &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === pagination.last_page &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
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
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bankCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
  },
  bankName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  primaryBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
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
  },
  balanceLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  balanceRight: {
    alignItems: "flex-end",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  paginationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
