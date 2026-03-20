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
import { useAbandonedCartReport } from "../hooks/useReports";
import type {
  DateRangeParams,
  AbandonedCartStats,
  AbandonedProduct,
  DailyTrend,
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

export default function AbandonedCartReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(30);
  const [params, setParams] = useState<DateRangeParams>(getDateRange(30));
  const { report, isLoading, isRefreshing, refresh } =
    useAbandonedCartReport(params);

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

  const stats: AbandonedCartStats | null = report?.stats ?? null;
  const products: AbandonedProduct[] = report?.abandoned_products ?? [];
  const trends: DailyTrend[] = report?.daily_trends ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abandoned Carts</Text>
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
            <View style={[styles.statCard, { backgroundColor: "#dc2626" }]}>
              <Text style={styles.statValue}>{stats.abandoned_carts}</Text>
              <Text style={styles.statLabel}>Abandoned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d97706" }]}>
              <Text style={styles.statValue}>
                ₦{(stats.potential_revenue / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>Lost Revenue</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#059669" }]}>
              <Text style={styles.statValue}>
                {stats.recovery_rate.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Recovery</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#6d28d9" }]}>
              <Text style={styles.statValue}>
                ₦{stats.average_cart_value.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Avg Cart</Text>
            </View>
          </View>
        )}

        {/* Abandoned Products */}
        {products.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Frequently Abandoned Products
            </Text>
            {products.map((p: AbandonedProduct) => (
              <View key={p.id} style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productPrice}>
                    ₦{p.price.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cartCount}>{p.cart_count} carts</Text>
                  <Text style={styles.qtyText}>{p.total_quantity} units</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Daily Trends */}
        {trends.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily Trends</Text>
            {trends.slice(-10).map((t: DailyTrend) => (
              <View key={t.date} style={styles.trendRow}>
                <Text style={styles.trendDate}>
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.trendValue}>
                  {t.abandoned_carts ?? 0} abandoned
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
  productName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  productPrice: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  cartCount: { fontSize: 14, fontWeight: "bold", color: "#ef4444" },
  qtyText: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  trendDate: { fontSize: 13, color: "#374151" },
  trendValue: { fontSize: 13, fontWeight: "600", color: "#ef4444" },
});
