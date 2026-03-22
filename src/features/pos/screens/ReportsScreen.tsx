import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { POSStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { usePosDailySales, usePosTopProducts } from "../hooks/usePos";
import type { DailyReportFilters, TopProductsFilters } from "../types";

type Props = NativeStackScreenProps<POSStackParamList, "POSReports">;

const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const todayISO = (): string => new Date().toISOString().split("T")[0];

function formatCurrency(n: string | number): string {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function ReportsScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const [dailyFilters] = useState<DailyReportFilters>({ date: todayISO() });
  const [topFilters] = useState<TopProductsFilters>({
    date_from: todayISO(),
    date_to: todayISO(),
    limit: 10,
  });

  const {
    report: dailyReport,
    isLoading: dailyLoading,
    isRefreshing: dailyRefreshing,
    refresh: refreshDaily,
  } = usePosDailySales(dailyFilters);

  const {
    products: topProducts,
    isLoading: topLoading,
    refresh: refreshTop,
  } = usePosTopProducts(topFilters);

  const handleRefresh = () => {
    refreshDaily();
    refreshTop();
  };

  const isLoading = dailyLoading || topLoading;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dailyRefreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
            progressBackgroundColor="#2d1f5e"
          />
        }>
        {/* Header Hero */}
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyName} numberOfLines={1}>
                {tenant?.name || "Your Business"}
              </Text>
              <Text style={styles.headerDate}>{todayFormatted()}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.title}>POS Reports</Text>
          <Text style={styles.subtitle}>Daily Sales Summary</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Summary Cards */}
              {dailyReport && (
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryCard, { backgroundColor: "#EEF2FF" }]}>
                    <Text style={styles.summaryLabel}>Total Sales</Text>
                    <Text style={[styles.summaryValue, { color: BRAND_COLORS.blue }]}>
                      {formatCurrency(dailyReport.total_sales)}
                    </Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: "#F0FDF4" }]}>
                    <Text style={styles.summaryLabel}>Transactions</Text>
                    <Text style={[styles.summaryValue, { color: BRAND_COLORS.green }]}>
                      {dailyReport.total_transactions}
                    </Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: "#FFF7ED" }]}>
                    <Text style={styles.summaryLabel}>Items Sold</Text>
                    <Text style={[styles.summaryValue, { color: "#b45309" }]}>
                      {dailyReport.total_items_sold}
                    </Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: "#FDF2F8" }]}>
                    <Text style={styles.summaryLabel}>Avg Sale</Text>
                    <Text style={[styles.summaryValue, { color: BRAND_COLORS.darkPurple }]}>
                      {dailyReport.total_transactions > 0
                        ? formatCurrency(
                            parseFloat(dailyReport.total_sales) / dailyReport.total_transactions,
                          )
                        : "₦0.00"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Payment Breakdown */}
              {dailyReport && dailyReport.payment_breakdown.length > 0 && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Payment Breakdown</Text>
                  {dailyReport.payment_breakdown.map((pb, idx) => {
                    const totalSales = parseFloat(dailyReport.total_sales) || 1;
                    const pct = (parseFloat(pb.total) / totalSales) * 100;
                    return (
                      <View key={`pb-${idx}`} style={styles.breakdownRow}>
                        <View style={styles.breakdownLeft}>
                          <Text style={styles.breakdownMethod}>{pb.method}</Text>
                          <Text style={styles.breakdownCount}>{pb.count} transactions</Text>
                        </View>
                        <View style={styles.breakdownRight}>
                          <Text style={styles.breakdownAmount}>{formatCurrency(pb.total)}</Text>
                          <Text style={styles.breakdownPct}>{pct.toFixed(1)}%</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Top Products */}
              {topProducts && topProducts.length > 0 && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Top Selling Products</Text>
                  {topProducts.map((product, idx) => (
                    <View key={`top-${product.product_id}`} style={styles.topProductRow}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.topProductName}>{product.product_name}</Text>
                        <Text style={styles.topProductSku}>{product.product_sku}</Text>
                      </View>
                      <View style={styles.topProductRight}>
                        <Text style={styles.topProductRevenue}>
                          {formatCurrency(product.total_revenue)}
                        </Text>
                        <Text style={styles.topProductQty}>
                          {product.total_quantity} sold
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Hourly Sales */}
              {dailyReport && dailyReport.hourly_sales.length > 0 && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Sales by Hour</Text>
                  {dailyReport.hourly_sales.map((hs, idx) => {
                    const maxTotal = Math.max(
                      ...dailyReport.hourly_sales.map((h) => parseFloat(h.total)),
                    );
                    const pct = maxTotal > 0 ? (parseFloat(hs.total) / maxTotal) * 100 : 0;
                    return (
                      <View key={`hour-${idx}`} style={styles.hourlyRow}>
                        <Text style={styles.hourlyLabel}>{hs.hour}</Text>
                        <View style={styles.hourlyBarContainer}>
                          <View
                            style={[
                              styles.hourlyBar,
                              { width: `${Math.max(pct, 2)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.hourlyValue}>{formatCurrency(hs.total)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* No data */}
              {!dailyReport && !topProducts?.length && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyText}>No report data available</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f5f5f5" },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerDate: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  bellBtn: { position: "relative", padding: 4 },
  bellIcon: { fontSize: 22 },
  bellDot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND_COLORS.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  body: { backgroundColor: "#f5f5f5", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -12, paddingTop: 20, paddingHorizontal: 16, minHeight: 600 },
  title: { fontSize: 22, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 4, paddingHorizontal: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20, paddingHorizontal: 4 },

  // Summary grid
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  summaryCard: { width: "48%", borderRadius: 14, padding: 16 },
  summaryLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: "bold" },

  // Section cards
  sectionCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 14 },

  // Payment breakdown
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  breakdownLeft: {},
  breakdownMethod: { fontSize: 14, fontWeight: "500", color: BRAND_COLORS.darkPurple },
  breakdownCount: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  breakdownRight: { alignItems: "flex-end" },
  breakdownAmount: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  breakdownPct: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  // Top products
  topProductRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND_COLORS.gold, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 13, fontWeight: "bold", color: "#fff" },
  topProductName: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  topProductSku: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  topProductRight: { alignItems: "flex-end", marginLeft: 12 },
  topProductRevenue: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  topProductQty: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  // Hourly sales
  hourlyRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  hourlyLabel: { width: 45, fontSize: 12, color: "#6b7280" },
  hourlyBarContainer: { flex: 1, height: 18, backgroundColor: "#f3f4f6", borderRadius: 9, marginHorizontal: 8 },
  hourlyBar: { height: 18, backgroundColor: BRAND_COLORS.gold, borderRadius: 9 },
  hourlyValue: { width: 80, fontSize: 12, fontWeight: "500", color: BRAND_COLORS.darkPurple, textAlign: "right" },

  // Empty
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
