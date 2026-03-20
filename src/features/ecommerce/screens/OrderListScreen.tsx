import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { useOrders } from "../hooks/useOrders";
import type { OrderListParams, OrderStatus, OrderListItem } from "../types";

type Nav = NativeStackNavigationProp<EcommerceStackParamList, "OrderList">;

const STATUS_FILTERS: { label: string; value: OrderStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  shipped: { bg: "#cffafe", text: "#155e75" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  unpaid: { bg: "#fee2e2", text: "#991b1b" },
  paid: { bg: "#d1fae5", text: "#065f46" },
  partially_paid: { bg: "#fef3c7", text: "#92400e" },
  refunded: { bg: "#e5e7eb", text: "#374151" },
};

export default function OrderListScreen() {
  const navigation = useNavigation<Nav>();
  const [params, setParams] = useState<OrderListParams>({
    per_page: 15,
    page: 1,
  });
  const [search, setSearch] = useState("");
  const { orders, stats, pagination, isLoading, isRefreshing, refresh } =
    useOrders(params);

  const handleSearch = () => {
    setParams((p) => ({ ...p, search, page: 1 }));
  };

  const setStatusFilter = (status: OrderStatus | "") => {
    setParams((p) => ({
      ...p,
      status: status || undefined,
      page: 1,
    }));
  };

  const goToPage = (page: number) => {
    setParams((p) => ({ ...p, page }));
  };

  if (isLoading && !orders.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        {/* Stats Overview Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: "#8b5cf6" }]}>
                <Text style={styles.statLabel}>Total Orders</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#f59e0b" }]}>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValue}>{stats.pending}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: "#10b981" }]}>
                <Text style={styles.statLabel}>Delivered</Text>
                <Text style={styles.statValue}>{stats.delivered}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#ec4899" }]}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>
                  ₦{(stats.total_revenue / 1000).toFixed(0)}k
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                (params.status || "") === f.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(f.value)}>
              <Text
                style={[
                  styles.filterChipText,
                  (params.status || "") === f.value &&
                    styles.filterChipTextActive,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Order Cards */}
        <View style={styles.list}>
          {orders.map((order: OrderListItem) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const pc =
              PAYMENT_COLORS[order.payment_status] || PAYMENT_COLORS.unpaid;
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate("OrderDetail", { id: order.id })
                }>
                <View style={styles.orderTop}>
                  <Text style={styles.orderNumber}>{order.order_number}</Text>
                  <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerName}>
                  {order.customer_name || "Guest"}
                </Text>
                <View style={styles.orderMeta}>
                  <Text style={styles.orderAmount}>
                    ₦{order.total_amount.toLocaleString()}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: pc.bg }]}>
                    <Text style={[styles.badgeText, { color: pc.text }]}>
                      {order.payment_status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderBottom}>
                  <Text style={styles.orderItems}>
                    {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {orders.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[
                styles.pageBtn,
                pagination.current_page <= 1 && styles.pageBtnDisabled,
              ]}
              disabled={pagination.current_page <= 1}
              onPress={() => goToPage(pagination.current_page - 1)}>
              <Text style={styles.pageBtnText}>‹ Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              {pagination.current_page} / {pagination.last_page}
            </Text>
            <TouchableOpacity
              style={[
                styles.pageBtn,
                pagination.current_page >= pagination.last_page &&
                  styles.pageBtnDisabled,
              ]}
              disabled={pagination.current_page >= pagination.last_page}
              onPress={() => goToPage(pagination.current_page + 1)}>
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
  statsContainer: {
    margin: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchRow: { paddingHorizontal: 16, marginBottom: 12 },
  searchInput: {
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  filterChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  filterChipTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, gap: 10 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  customerName: { fontSize: 14, color: "#374151", marginTop: 6 },
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  orderItems: { fontSize: 12, color: "#6b7280" },
  orderDate: { fontSize: 12, color: "#9ca3af" },
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
