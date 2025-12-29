import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import { BRAND_COLORS } from "../theme/colors";
import LedgerAccountStats from "../features/accounting/ledgeraccount/components/LedgerAccountStats";
import LedgerAccountFilters from "../features/accounting/ledgeraccount/components/LedgerAccountFilters";
import LedgerAccountList from "../features/accounting/ledgeraccount/components/LedgerAccountList";
import { ledgerAccountService } from "../features/accounting/ledgeraccount/services/ledgerAccountService";
import {
  LedgerAccount,
  ListParams,
  PaginationInfo,
  Statistics,
} from "../features/accounting/ledgeraccount/types";
import { showToast } from "../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "LedgerAccountHome"
>;

export default function LedgerAccountHomeScreen({ navigation }: Props) {
  // State
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ListParams>({
    sort: "code",
    direction: "asc",
    view_mode: "list",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ledgerAccountService.list(filters);

      setLedgerAccounts(response.ledger_accounts || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load ledger accounts", "error");
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
    loadData();
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete this ledger account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ledgerAccountService.delete(id);
              showToast("✅ Account deleted successfully", "success");
              loadData();
            } catch (error: any) {
              showToast(error.message || "Failed to delete account", "error");
            }
          },
        },
      ]
    );
  };

  // Targeted update for edit (no full reload)
  const handleItemUpdated = async (id: number) => {
    try {
      const updated = await ledgerAccountService.show(id);
      setLedgerAccounts((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      showToast("✅ Updated successfully", "success");
    } catch (_error) {
      // Fallback to full reload if fetch fails
      loadData();
    }
  };

  // Full reload for create
  const handleItemCreated = () => {
    loadData();
  };

  const handleToggleView = () => {
    setFilters((prev) => ({
      ...prev,
      view_mode: prev.view_mode === "list" ? "tree" : "list",
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleExportExcel = async () => {
    try {
      showToast("Exporting to Excel...", "success");
      const _blob = await ledgerAccountService.exportExcel(filters);
      // Note: In React Native, you'd need to use react-native-fs or similar
      // to save the blob. For now, just show success message.
      showToast("✅ Export ready (download functionality pending)", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export", "error");
    }
  };

  const handleExportPdf = async () => {
    try {
      showToast("Exporting to PDF...", "success");
      const _blob = await ledgerAccountService.exportPdf(filters);
      showToast("✅ Export ready (download functionality pending)", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export", "error");
    }
  };

  const handleImport = () => {
    // Navigate to import screen or show file picker
    showToast("Import functionality coming soon", "success");
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ledger Accounts</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading ledger accounts...</Text>
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

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ledger Accounts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          {/* Primary Action - Create */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("LedgerAccountCreate", {
                onCreated: handleItemCreated,
              } as any)
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Create New Account</Text>
          </TouchableOpacity>

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
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
              <Text style={styles.secondaryBtnText}>Export Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleExportPdf}
              activeOpacity={0.7}>
              <Text style={styles.secondaryBtnIcon}>📄</Text>
              <Text style={styles.secondaryBtnText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <LedgerAccountStats statistics={statistics} />

        {/* Filters Section */}
        <LedgerAccountFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* Ledger Account List */}
        <LedgerAccountList
          ledgerAccounts={ledgerAccounts}
          pagination={pagination}
          viewMode={filters.view_mode || "list"}
          onToggleView={handleToggleView}
          onDelete={handleDelete}
          onItemUpdated={handleItemUpdated}
          onPageChange={handlePageChange}
        />
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
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
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
    marginBottom: 12,
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
    letterSpacing: 0.5,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
});
