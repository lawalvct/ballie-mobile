import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { reconciliationService } from "../services/reconciliationService";
import type {
  ReconciliationDetailResponse,
  ReconciliationItem,
} from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "ReconciliationShow"
>;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ReconciliationShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<ReconciliationDetailResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"uncleared" | "cleared" | "all">(
    "uncleared",
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reconciliationService.show(id);
      setDetail(response);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load reconciliation",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (
    item: ReconciliationItem,
    status: "cleared" | "uncleared" | "excluded",
  ) => {
    if (!detail) {
      return;
    }

    const applyOptimisticStatus = (
      prev: ReconciliationDetailResponse,
      itemId: number,
      nextStatus: "cleared" | "uncleared" | "excluded",
    ): ReconciliationDetailResponse => {
      const updatedItems = prev.items.map((itm) =>
        itm.id === itemId ? { ...itm, status: nextStatus } : itm,
      );

      const clearedItems = updatedItems.filter(
        (itm) => itm.status === "cleared",
      );
      const unclearedItems = updatedItems.filter(
        (itm) => itm.status === "uncleared",
      );

      const total = prev.statistics?.total ?? updatedItems.length;
      const reconciled = clearedItems.length;
      const unreconciled = unclearedItems.length;
      const progress = total
        ? Number(((reconciled / total) * 100).toFixed(2))
        : 0;

      return {
        ...prev,
        items: updatedItems,
        cleared_items: clearedItems,
        uncleared_items: unclearedItems,
        statistics: {
          total,
          reconciled,
          unreconciled,
          progress,
        },
      };
    };

    const snapshot = detail;
    setDetail((prev) =>
      prev ? applyOptimisticStatus(prev, item.id, status) : prev,
    );

    try {
      await reconciliationService.updateItemStatus(id, {
        item_id: item.id,
        status,
        cleared_date: status === "cleared" ? formatDate(new Date()) : undefined,
      });
      showToast("Updated", "success");
    } catch (error: any) {
      setDetail(snapshot);
      showToast(
        error.response?.data?.message || error.message || "Update failed",
        "error",
      );
    }
  };

  const handleComplete = () => {
    Alert.alert(
      "Complete reconciliation",
      "Mark this reconciliation as complete?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await reconciliationService.complete(id);
              showToast("Reconciliation completed", "success");
              loadData();
            } catch (error: any) {
              showToast(
                error.response?.data?.message || error.message || "Failed",
                "error",
              );
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert("Cancel reconciliation", "Cancel this reconciliation?", [
      { text: "No", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await reconciliationService.cancel(id);
            showToast("Reconciliation cancelled", "success");
            loadData();
          } catch (error: any) {
            showToast(
              error.response?.data?.message || error.message || "Failed",
              "error",
            );
          }
        },
      },
    ]);
  };

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
          <Text style={styles.headerTitle}>Reconciliation</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading reconciliation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
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
          <Text style={styles.headerTitle}>Reconciliation</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Not found</Text>
          <Text style={styles.emptyText}>Unable to load reconciliation.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { reconciliation, statistics } = detail;
  const items =
    activeTab === "cleared"
      ? detail.cleared_items
      : activeTab === "uncleared"
        ? detail.uncleared_items
        : detail.items;

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
        <Text style={styles.headerTitle}>Reconciliation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {reconciliation.bank_id
              ? `Bank #${reconciliation.bank_id}`
              : "Bank"}
          </Text>
          <Text style={styles.summarySubtitle}>
            {reconciliation.statement_start_date} →{" "}
            {reconciliation.statement_end_date}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>
                {reconciliation.closing_balance_per_bank?.toLocaleString() ??
                  "-"}
              </Text>
              <Text style={styles.statLabel}>Closing (Bank)</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>
                {reconciliation.closing_balance_per_books?.toLocaleString() ??
                  "-"}
              </Text>
              <Text style={styles.statLabel}>Closing (Books)</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>
                {reconciliation.difference?.toLocaleString() ?? "-"}
              </Text>
              <Text style={styles.statLabel}>Difference</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics?.progress ?? 0}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleComplete}>
            <Text style={styles.secondaryBtnText}>✅ Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleCancel}>
            <Text style={styles.secondaryBtnText}>✖ Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "uncleared" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("uncleared")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "uncleared" && styles.tabTextActive,
              ]}>
              Uncleared ({detail.uncleared_items.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "cleared" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("cleared")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "cleared" && styles.tabTextActive,
              ]}>
              Cleared ({detail.cleared_items.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "all" && styles.tabActive]}
            onPress={() => setActiveTab("all")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}>
              All ({detail.items.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          {items.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyText}>No items</Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {item.description || "Transaction"}
                  </Text>
                  <Text style={styles.itemDate}>{item.transaction_date}</Text>
                </View>
                <Text style={styles.itemRef}>
                  {item.reference_number || "-"}
                </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Debit</Text>
                  <Text style={styles.itemValue}>
                    {item.debit_amount?.toLocaleString() ?? "-"}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Credit</Text>
                  <Text style={styles.itemValue}>
                    {item.credit_amount?.toLocaleString() ?? "-"}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  {item.status !== "cleared" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleUpdateStatus(item, "cleared")}>
                      <Text style={styles.actionBtnText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === "cleared" && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleUpdateStatus(item, "uncleared")}>
                      <Text style={styles.actionBtnText}>Unclear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => handleUpdateStatus(item, "excluded")}>
                    <Text style={styles.actionBtnText}>Exclude</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  summarySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerBtn: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  tabText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
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
  emptyStateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  itemRef: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  itemValue: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#d1fae5",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
});
