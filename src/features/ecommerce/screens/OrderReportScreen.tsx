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
import { useOrderReport } from "../hooks/useReports";
import type {
  DateRangeParams,
  OrderReportStats,
  DailyTrend,
  OrdersByStatus,
  OrdersByPayment,
  OrderPaymentMethod,
  OrderReportProduct,
} from "../types";

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function getDateRange(days: number): DateRangeParams {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { date_from: fmt(from), date_to: fmt(today) };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "#10b981",
  unpaid: "#ef4444",
  partially_paid: "#f59e0b",
  refunded: "#6366f1",
};

export default function OrderReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(30);
  const [params, setParams] = useState<DateRangeParams>(getDateRange(30));
  const { report, isLoading, isRefreshing, refresh } = useOrderReport(params);

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

  const stats: OrderReportStats | null = report?.stats ?? null;
  const trends: DailyTrend[] = report?.daily_trends ?? [];
  const ordersByStatus: OrdersByStatus[] = report?.orders_by_status ?? [];
  const ordersByPayment: OrdersByPayment[] = report?.orders_by_payment ?? [];
  const paymentMethods: OrderPaymentMethod[] = report?.payment_methods ?? [];
  const topProducts: OrderReportProduct[] = report?.top_products ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Report</Text>
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

        {/* KPI Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: "#6d28d9" }]}>
              <Text style={styles.statValue}>{stats.total_orders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#059669" }]}>
              <Text style={styles.statValue}>
                ₦{(stats.total_revenue / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d97706" }]}>
              <Text style={styles.statValue}>
                ₦{stats.average_order_value.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Avg Order</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#dc2626" }]}>
              <Text style={styles.statValue}>{stats.cancelled_orders}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        )}

        {/* Orders by Status */}
        {ordersByStatus.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Orders by Status</Text>
            {ordersByStatus.map((s: OrdersByStatus) => (
              <View key={s.status} style={styles.distRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: STATUS_COLORS[s.status] ?? "#9ca3af" },
                  ]}
                />
                <Text style={styles.distLabel}>{s.status}</Text>
                <View style={styles.distBar}>
                  <View
                    style={[
                      styles.distFill,
                      {
                        width: `${stats && stats.total_orders > 0 ? (s.count / stats.total_orders) * 100 : 0}%`,
                        backgroundColor:
                          STATUS_COLORS[s.status] ?? BRAND_COLORS.darkPurple,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.distCount}>{s.count}</Text>
                <Text style={styles.distAmount}>
                  ₦{(s.total / 1000).toFixed(0)}k
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Orders by Payment Status */}
        {ordersByPayment.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            {ordersByPayment.map((p: OrdersByPayment) => {
              const c = PAYMENT_COLORS[p.payment_status] ?? "#9ca3af";
              return (
                <View key={p.payment_status} style={styles.payRow}>
                  <View style={[styles.statusDot, { backgroundColor: c }]} />
                  <Text style={styles.distLabel}>
                    {p.payment_status.replace(/_/g, " ")}
                  </Text>
                  <Text style={[styles.payCount, { color: c }]}>{p.count}</Text>
                  <Text style={styles.payAmount}>
                    ₦{p.total.toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            {paymentMethods.map((m: OrderPaymentMethod) => (
              <View key={m.payment_method} style={styles.methodRow}>
                <Text style={styles.methodName}>
                  {m.payment_method.replace(/_/g, " ")}
                </Text>
                <Text style={styles.methodCount}>{m.count} orders</Text>
                <Text style={styles.methodAmount}>
                  ₦{m.total.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Trends */}
        {trends.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily Trends</Text>
            {trends.slice(-14).map((t: DailyTrend) => (
              <View key={t.date} style={styles.trendRow}>
                <Text style={styles.trendDate}>
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.trendOrders}>{t.orders ?? 0} orders</Text>
                <Text style={styles.trendRevenue}>
                  ₦{(t.revenue ?? 0).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Products */}
        {topProducts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            {topProducts.map((p: OrderReportProduct, i: number) => (
              <View key={p.product_id} style={styles.productRow}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.product_name}
                  </Text>
                  <Text style={styles.productQty}>{p.total_quantity} sold</Text>
                </View>
                <Text style={styles.productRevenue}>
                  ₦{p.total_revenue.toLocaleString()}
                </Text>
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
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
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
  statValue: { fontSize: 22, fontWeight: "bold", color: "#fff" },
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
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  distRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7 },
  distLabel: {
    width: 76,
    fontSize: 12,
    color: "#374151",
    textTransform: "capitalize",
  },
  distBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  distFill: { height: "100%", borderRadius: 4 },
  distCount: {
    width: 28,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },
  distAmount: {
    width: 44,
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
    marginLeft: 4,
  },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  payCount: {
    marginLeft: "auto",
    fontSize: 14,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  payAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    width: 110,
    textAlign: "right",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  methodName: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    textTransform: "capitalize",
  },
  methodCount: { fontSize: 12, color: "#6b7280", marginRight: 8 },
  methodAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  trendDate: { fontSize: 13, color: "#374151", width: 70 },
  trendOrders: { fontSize: 13, color: "#6b7280" },
  trendRevenue: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: { fontSize: 12, fontWeight: "700", color: "#5b21b6" },
  productName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  productQty: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  productRevenue: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
