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
import { useCustomerReport } from "../hooks/useReports";
import type {
  DateRangeParams,
  CustomerReportStats,
  TopCustomer,
} from "../types";

const PERIODS = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
];

function getDateRange(days: number): DateRangeParams {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { date_from: fmt(from), date_to: fmt(today) };
}

export default function CustomerReportScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(90);
  const [params, setParams] = useState<DateRangeParams>(getDateRange(90));
  const { report, isLoading, isRefreshing, refresh } =
    useCustomerReport(params);

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

  const stats: CustomerReportStats | null = report?.stats ?? null;
  const topCustomers: TopCustomer[] = report?.top_customers ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Report</Text>
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
              <Text style={styles.statValue}>{stats.total_customers}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#059669" }]}>
              <Text style={styles.statValue}>{stats.new_customers}</Text>
              <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d97706" }]}>
              <Text style={styles.statValue}>{stats.returning_customers}</Text>
              <Text style={styles.statLabel}>Returning</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#2563eb" }]}>
              <Text style={styles.statValue}>
                ₦{stats.average_lifetime_value.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Avg LTV</Text>
            </View>
          </View>
        )}

        {/* Guest vs Registered */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Source</Text>
            <View style={styles.sourceRow}>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceValue}>
                  {stats.registered_orders}
                </Text>
                <Text style={styles.sourceLabel}>Registered</Text>
              </View>
              <View style={styles.sourceDivider} />
              <View style={styles.sourceItem}>
                <Text style={styles.sourceValue}>{stats.guest_orders}</Text>
                <Text style={styles.sourceLabel}>Guest</Text>
              </View>
            </View>
          </View>
        )}

        {/* Top Customers */}
        {topCustomers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Customers</Text>
            {topCustomers.map((c: TopCustomer, i: number) => (
              <View key={c.customer_id} style={styles.customerRow}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{c.customer_name}</Text>
                  {c.customer_email && (
                    <Text style={styles.customerEmail}>{c.customer_email}</Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.customerSpent}>
                    ₦{c.total_spent.toLocaleString()}
                  </Text>
                  <Text style={styles.customerOrders}>
                    {c.order_count} orders
                  </Text>
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
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  sourceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  sourceLabel: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  sourceDivider: { width: 1, height: 40, backgroundColor: "#e5e7eb" },
  customerRow: {
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
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: { fontSize: 12, fontWeight: "700", color: "#92400e" },
  customerName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  customerEmail: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  customerSpent: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  customerOrders: { fontSize: 11, color: "#6b7280", marginTop: 2 },
});
