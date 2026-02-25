import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import { useReconciliations } from "../hooks/useReconciliations";
import type {
  ReconciliationRecord,
  ReconciliationBankOption,
} from "../types";

type Props = NativeStackScreenProps<AccountingStackParamList>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusBadgeStyle = (status?: string): { bg: string; text: string } => {
  switch (status) {
    case "completed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "in_progress":
      return { bg: "#e0f2fe", text: "#075985" };
    case "draft":
      return { bg: "#fef3c7", text: "#92400e" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#b91c1c" };
    default:
      return { bg: "#e5e7eb", text: "#6b7280" };
  }
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ReconciliationHomeScreen({ navigation }: Props) {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(
    () => formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    [today],
  );
  const defaultTo = useMemo(() => formatDate(today), [today]);

  const [filters, setFilters] = useState({
    bank_id: "",
    status: "",
    from_date: defaultFrom,
    to_date: defaultTo,
    page: 1,
    per_page: 20,
  });

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const {
    reconciliations,
    pagination,
    statistics,
    banks,
    isLoading,
    isRefreshing,
    refresh,
  } = useReconciliations(filters);

  // Refresh when navigating back to this screen
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  const handlePageChange = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <AccountingModuleHeader
          title="Reconciliations"
          onBack={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingLabel}>Loading reconciliations…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title="Reconciliations"
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
            onPress={() => navigation.navigate("ReconciliationCreate")}
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Start Reconciliation</Text>
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
                <Text style={styles.statValue}>{statistics.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.in_progress}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.draft}</Text>
                <Text style={styles.statLabel}>Draft</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.bank_id}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    page: 1,
                    bank_id: value ? String(value) : "",
                  }))
                }
                style={styles.picker}>
                <Picker.Item label="All Banks" value="" />
                {banks.map((bank: ReconciliationBankOption) => (
                  <Picker.Item
                    key={bank.id}
                    label={`${bank.bank_name} ${bank.masked_account_number || ""}`}
                    value={String(bank.id)}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    page: 1,
                    status: value ? String(value) : "",
                  }))
                }
                style={styles.picker}>
                <Picker.Item label="All Status" value="" />
                <Picker.Item label="Draft" value="draft" />
                <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
                <Picker.Item label="Cancelled" value="cancelled" />
              </Picker>
            </View>
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setShowFromPicker(true)}
              style={styles.filterButton}
              activeOpacity={0.7}>
              <Text style={styles.filterLabel}>📅 From</Text>
              <Text style={styles.filterValue}>{filters.from_date}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowToPicker(true)}
              style={styles.filterButton}
              activeOpacity={0.7}>
              <Text style={styles.filterLabel}>📅 To</Text>
              <Text style={styles.filterValue}>{filters.to_date}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={new Date(filters.from_date)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowFromPicker(false);
              if (selected) {
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  from_date: formatDate(selected),
                }));
              }
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={new Date(filters.to_date)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowToPicker(false);
              if (selected) {
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  to_date: formatDate(selected),
                }));
              }
            }}
          />
        )}

        {/* List */}
        <View style={styles.listSection}>
          {reconciliations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No Reconciliations</Text>
              <Text style={styles.emptyBody}>
                Start a reconciliation to match your bank statement.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate("ReconciliationCreate")}
                activeOpacity={0.8}>
                <Text style={styles.emptyBtnText}>+ Start Reconciliation</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reconciliations.map((item: ReconciliationRecord) => {
              const badge = statusBadgeStyle(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("ReconciliationShow", { id: item.id })
                  }>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {item.bank?.bank_name || "Bank"}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {item.bank?.masked_account_number || ""}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.bg },
                      ]}>
                      <Text style={[styles.statusText, { color: badge.text }]}>
                        {(item.status || "unknown").toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    {item.statement_start_date} → {item.statement_end_date}
                  </Text>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Difference</Text>
                    <Text style={styles.cardValue}>
                      {typeof item.difference === "number"
                        ? item.difference.toLocaleString()
                        : "-"}
                    </Text>
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
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
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
  filterButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a0f33",
  },

  /* ── List ── */
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a0f33",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a0f33",
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
