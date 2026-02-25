import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import AccountingModuleHeader from "../components/accounting/AccountingModuleHeader";
import LedgerAccountStats from "../features/accounting/ledgeraccount/components/LedgerAccountStats";
import LedgerAccountFilters from "../features/accounting/ledgeraccount/components/LedgerAccountFilters";
import LedgerAccountList from "../features/accounting/ledgeraccount/components/LedgerAccountList";
import { useLedgerAccounts } from "../features/accounting/ledgeraccount/hooks/useLedgerAccounts";
import { ledgerAccountService } from "../features/accounting/ledgeraccount/services/ledgerAccountService";
import type { ListParams } from "../features/accounting/ledgeraccount/types";
import { showToast } from "../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "LedgerAccountHome"
>;

export default function LedgerAccountHomeScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<ListParams>({
    sort: "code",
    direction: "asc",
    view_mode: "list",
    page: 1,
    per_page: 20,
  });

  const { accounts, pagination, statistics, isLoading, isRefreshing, refresh } =
    useLedgerAccounts(filters);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = () => setFilters((prev) => ({ ...prev, page: 1 }));

  const handleToggleView = () =>
    setFilters((prev) => ({
      ...prev,
      view_mode: prev.view_mode === "list" ? "tree" : "list",
    }));

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  const handleDelete = (id: number) => {
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
              refresh();
            } catch (error: any) {
              showToast(error.message || "Failed to delete account", "error");
            }
          },
        },
      ],
    );
  };

  const handleItemUpdated = () => refresh();
  const handleItemCreated = () => refresh();

  const handleExportExcel = async () => {
    try {
      showToast("Exporting to Excel…", "success");
      await ledgerAccountService.exportExcel(filters);
      showToast("✅ Export ready", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export", "error");
    }
  };

  const handleExportPdf = async () => {
    try {
      showToast("Exporting to PDF…", "success");
      await ledgerAccountService.exportPdf(filters);
      showToast("✅ Export ready", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export", "error");
    }
  };

  const handleImport = () => {
    showToast("Import functionality coming soon", "success");
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <AccountingModuleHeader
          title="Ledger Accounts"
          onBack={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingLabel}>Loading ledger accounts…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title="Ledger Accounts"
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
        {/* Create + secondary actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() =>
              navigation.navigate("LedgerAccountCreate", {
                onCreated: handleItemCreated,
              } as any)
            }
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Create New Account</Text>
          </TouchableOpacity>

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
        </View>

        {/* Stats */}
        <LedgerAccountStats statistics={statistics} />

        {/* Filters */}
        <LedgerAccountFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* List */}
        <LedgerAccountList
          ledgerAccounts={accounts}
          pagination={pagination}
          viewMode={filters.view_mode || "list"}
          onToggleView={handleToggleView}
          onDelete={handleDelete}
          onItemUpdated={handleItemUpdated}
          onPageChange={handlePageChange}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    gap: 10,
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
});
