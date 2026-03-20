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
import { BRAND_COLORS } from "../../../theme/colors";
import { useRevenueReport } from "../hooks/useReports";
import type {
  DateRangeParams,
  RevenueReportStats,
  MonthlyRevenue,
  RevenueByPayment,
  RevenueByMethod,
} from "../types";

const PERIODS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
];

function getDateRange(days: number): DateRangeParams {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { date_from: fmt(from), date_to: fmt(today) };
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "#059669",
  unpaid: "#dc2626",
  partially_paid: "#d97706",
  refunded: "#7c3aed",
};

export default function RevenueReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(180);
  const [params, setParams] = useState<DateRangeParams>(getDateRange(180));
  const { report, isLoading, isRefreshing, refresh } = useRevenueReport(params);

  const handlePeriod = (days: number) => {
    setPeriod(days);
    setParams(getDateRange(days));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const stats: RevenueReportStats | null = report?.stats ?? null;
  const monthly: MonthlyRevenue[] = report?.monthly_revenue ?? [];
  const byPayment: RevenueByPayment[] = report?.revenue_by_payment ?? [];
  const byMethod: RevenueByMethod[] = report?.revenue_by_method ?? [];
  const totalByPayment = byPayment.reduce((s, p) => s + p.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revenue Report</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        {/* Period Filter */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.days}
              style={[
                styles.periodChip,
                period === p.days && styles.periodChipActive,
              ]}
              onPress={() => handlePeriod(p.days)}>
              <Text
                style={[
                  styles.periodChipText,
                  period === p.days && styles.periodChipTextActive,
                ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        {stats && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Current Revenue</Text>
              <Text style={styles.heroValue}>
                ₦{stats.current_revenue.toLocaleString()}
              </Text>
              <View style={styles.growthRow}>
                <View
                  style={[
                    styles.growthBadge,
                    {
                      backgroundColor:
                        stats.growth_rate >= 0 ? "#d1fae5" : "#fee2e2",
                    },
                  ]}>
                  <Text
                    style={[
                      styles.growthText,
                      { color: stats.growth_rate >= 0 ? "#065f46" : "#991b1b" },
                    ]}>
                    {stats.growth_rate >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(stats.growth_rate).toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.growthPrev}>
                  prev ₦{stats.previous_revenue.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total_orders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  ₦{stats.average_order_value.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Avg Order</Text>
              </View>
            </View>
          </>
        )}

        {/* Revenue by Payment Status */}
        {byPayment.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Revenue by Payment Status</Text>
            {byPayment.map((p: RevenueByPayment) => {
              const c = PAYMENT_STATUS_COLORS[p.payment_status] ?? "#9ca3af";
              const pct =
                totalByPayment > 0 ? (p.total / totalByPayment) * 100 : 0;
              return (
                <View key={p.payment_status} style={styles.payRow}>
                  <View style={[styles.statusDot, { backgroundColor: c }]} />
                  <Text style={styles.payLabel}>
                    {p.payment_status.replace(/_/g, " ")}
                  </Text>
                  <View style={styles.payBarWrap}>
                    <View
                      style={[
                        styles.payBar,
                        { width: `${pct}%`, backgroundColor: c },
                      ]}
                    />
                  </View>
                  <Text style={styles.payAmount}>
                    ₦{p.total.toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Revenue by Method */}
        {byMethod.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Revenue by Payment Method</Text>
            {byMethod.map((m: RevenueByMethod) => (
              <View key={m.payment_method} style={styles.methodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>
                    {m.payment_method.replace(/_/g, " ")}
                  </Text>
                  <Text style={styles.methodOrderCount}>{m.count} orders</Text>
                </View>
                <Text style={styles.methodAmount}>
                  ₦{m.total.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Monthly Revenue */}
        {monthly.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
            {monthly.map((m: MonthlyRevenue) => (
              <View key={m.month} style={styles.monthRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.monthName}>{m.month}</Text>
                  <Text style={styles.monthOrders}>{m.orders} orders</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.monthTotal}>
                    ₦{m.total.toLocaleString()}
                  </Text>
                  <View style={styles.monthBreakdown}>
                    {m.tax > 0 && (
                      <Text style={styles.breakdownText}>
                        Tax: ₦{m.tax.toLocaleString()}
                      </Text>
                    )}
                    {m.shipping > 0 && (
                      <Text style={styles.breakdownText}>
                        Ship: ₦{m.shipping.toLocaleString()}
                      </Text>
                    )}
                    {m.discount > 0 && (
                      <Text
                        style={[styles.breakdownText, { color: "#10b981" }]}>
                        -₦{m.discount.toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
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
  periodRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  periodChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  periodChipText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  periodChipTextActive: { color: "#fff" },
  heroCard: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  heroValue: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 4 },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  growthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  growthText: { fontSize: 14, fontWeight: "700" },
  growthPrev: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
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
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  payLabel: {
    width: 90,
    fontSize: 12,
    color: "#374151",
    textTransform: "capitalize",
  },
  payBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  payBar: { height: "100%", borderRadius: 4 },
  payAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    width: 100,
    textAlign: "right",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  methodOrderCount: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  methodAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  monthName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  monthOrders: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  monthTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  monthBreakdown: { flexDirection: "row", gap: 6, marginTop: 2 },
  breakdownText: { fontSize: 10, color: "#9ca3af" },
});
