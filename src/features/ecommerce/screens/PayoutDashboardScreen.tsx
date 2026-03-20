import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { usePayouts } from "../hooks/usePayouts";
import type { PayoutListItem, PayoutStats, PayoutSettings } from "../types";

type Nav = NativeStackNavigationProp<
  EcommerceStackParamList,
  "PayoutDashboard"
>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#dbeafe", text: "#1e40af" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  rejected: { bg: "#fee2e2", text: "#991b1b" },
  cancelled: { bg: "#e5e7eb", text: "#374151" },
};

export default function PayoutDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [page, setPage] = useState(1);
  const {
    payouts,
    stats,
    settings,
    pagination,
    isLoading,
    isRefreshing,
    refresh,
  } = usePayouts({
    per_page: 15,
    page,
  });

  if (isLoading && !payouts.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const s: PayoutStats | null = stats;
  const ps: PayoutSettings | null = settings;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payouts</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PayoutRequest")}
            style={styles.createBtn}
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Request New Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {s && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: "#6d28d9" }]}>
              <Text style={styles.statValue}>
                ₦{(s.total_revenue / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#059669" }]}>
              <Text style={styles.statValue}>
                ₦{(s.available_balance / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d97706" }]}>
              <Text style={styles.statValue}>
                ₦{(s.total_withdrawn / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Withdrawn</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#2563eb" }]}>
              <Text style={styles.statValue}>
                ₦{(s.pending_withdrawals / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        )}

        {/* Settings Info */}
        {ps && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payout Settings</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: ps.payouts_enabled ? "#10b981" : "#ef4444" },
                ]}>
                {ps.payouts_enabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Min / Max</Text>
              <Text style={styles.infoValue}>
                ₦{ps.minimum_payout.toLocaleString()} - ₦
                {ps.maximum_payout.toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Deduction</Text>
              <Text style={styles.infoValue}>{ps.deduction_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processing</Text>
              <Text style={styles.infoValue}>{ps.processing_time}</Text>
            </View>
          </View>
        )}

        {/* Payout List */}
        <Text style={styles.listTitle}>Payout History</Text>
        {payouts.map((p: PayoutListItem) => {
          const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.pending;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.payoutCard}
              onPress={() => navigation.navigate("PayoutDetail", { id: p.id })}>
              <View style={styles.payoutTop}>
                <Text style={styles.requestNum}>{p.request_number}</Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.text }]}>
                    {p.status_label || p.status}
                  </Text>
                </View>
              </View>
              <View style={styles.payoutMeta}>
                <View>
                  <Text style={styles.payoutAmount}>
                    ₦{p.net_amount.toLocaleString()}
                  </Text>
                  <Text style={styles.payoutBank}>
                    {p.bank_name} • {p.account_number}
                  </Text>
                </View>
                <Text style={styles.payoutDate}>
                  {new Date(p.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {payouts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No payout requests yet</Text>
          </View>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              disabled={page <= 1}
              onPress={() => setPage((p) => p - 1)}>
              <Text style={styles.pageBtnText}>‹ Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              {pagination.current_page} / {pagination.last_page}
            </Text>
            <TouchableOpacity
              style={[
                styles.pageBtn,
                page >= pagination.last_page && styles.pageBtnDisabled,
              ]}
              disabled={page >= pagination.last_page}
              onPress={() => setPage((p) => p + 1)}>
              <Text style={styles.pageBtnText}>Next ›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 60 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 60 },
  body: { flex: 1, backgroundColor: "#f3f4f8" },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: BRAND_COLORS.gold,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 8,
  },
  statCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: { fontSize: 13, color: "#6b7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 4,
  },
  payoutCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  payoutTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestNum: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  payoutMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  payoutBank: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  payoutDate: { fontSize: 12, color: "#9ca3af" },
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#6b7280", fontSize: 15 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 8,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  pageInfo: { fontSize: 14, fontWeight: "600", color: "#374151" },
});
