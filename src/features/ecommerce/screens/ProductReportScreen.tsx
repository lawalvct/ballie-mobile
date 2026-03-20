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
import { useProductReport } from "../hooks/useReports";
import type {
  DateRangeParams,
  ProductReportStats,
  TopProduct,
  LowStockProduct,
  CategoryPerformance,
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

export default function ProductReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(30);
  const [params, setParams] = useState<DateRangeParams>(getDateRange(30));
  const { report, isLoading, isRefreshing, refresh } = useProductReport(params);

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

  const stats: ProductReportStats | null = report?.stats ?? null;
  const topByRevenue: TopProduct[] = report?.top_by_revenue ?? [];
  const topByQuantity: TopProduct[] = report?.top_by_quantity ?? [];
  const categoryPerformance: CategoryPerformance[] =
    report?.category_performance ?? [];
  const lowStock: LowStockProduct[] = report?.low_stock_products ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Report</Text>
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
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: "#6d28d9" }]}>
              <Text style={styles.statValue}>{stats.total_products_sold}</Text>
              <Text style={styles.statLabel}>Products Sold</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d97706" }]}>
              <Text style={styles.statValue}>{stats.total_quantity_sold}</Text>
              <Text style={styles.statLabel}>Qty Sold</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#059669" }]}>
              <Text style={styles.statValue}>
                ₦{(stats.total_revenue / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#dc2626" }]}>
              <Text style={styles.statValue}>{stats.low_stock_count}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>
        )}

        {/* Top by Revenue */}
        {topByRevenue.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top by Revenue</Text>
            {topByRevenue.map((p: TopProduct, i: number) => (
              <View key={p.product_id} style={styles.productRow}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.product_name}
                  </Text>
                  {p.category && (
                    <Text style={styles.productCat}>{p.category}</Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.productRevenue}>
                    ₦{p.total_revenue.toLocaleString()}
                  </Text>
                  <Text style={styles.productQty}>{p.total_quantity} sold</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top by Quantity */}
        {topByQuantity.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top by Quantity</Text>
            {topByQuantity.map((p: TopProduct, i: number) => (
              <View key={p.product_id} style={styles.productRow}>
                <View style={[styles.rank, { backgroundColor: "#fef3c7" }]}>
                  <Text style={[styles.rankText, { color: "#92400e" }]}>
                    #{i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {p.product_name}
                  </Text>
                  {p.category && (
                    <Text style={styles.productCat}>{p.category}</Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.qtyBold}>{p.total_quantity}</Text>
                  <Text style={styles.productQty}>units sold</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Category Performance</Text>
            {categoryPerformance.map((c: CategoryPerformance) => (
              <View key={c.category} style={styles.catRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{c.category}</Text>
                  <Text style={styles.catOrders}>
                    {c.order_count} orders • {c.total_quantity} units
                  </Text>
                </View>
                <Text style={styles.catRevenue}>
                  ₦{c.total_revenue.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Low Stock */}
        {lowStock.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Low Stock Alert</Text>
            {lowStock.map((p: LowStockProduct) => (
              <View key={p.product_id} style={styles.lowStockRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productCat}>
                    Reorder at: {p.reorder_level}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.productRevenue,
                      { color: p.current_stock === 0 ? "#dc2626" : "#d97706" },
                    ]}>
                    {p.current_stock} left
                  </Text>
                  <Text style={styles.productQty}>{p.sold_quantity} sold</Text>
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
  statValue: { fontSize: 20, fontWeight: "bold", color: "#fff" },
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
  productCat: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  productRevenue: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  productQty: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  qtyBold: { fontSize: 18, fontWeight: "bold", color: "#d97706" },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  catName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  catOrders: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  catRevenue: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  lowStockRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
});
