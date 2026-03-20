import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import ModuleScreenLayout from "../../../components/ModuleScreenLayout";
import { useOrders } from "../hooks/useOrders";
import { useEcommerceSettings } from "../hooks/useSettings";

type Nav = NativeStackNavigationProp<
  EcommerceStackParamList,
  "EcommerceDashboard"
>;

export default function EcommerceDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { stats, isLoading, isRefreshing, refresh } = useOrders();
  const { settings } = useEcommerceSettings();

  if (isLoading) {
    return (
      <ModuleScreenLayout>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading e-commerce...</Text>
        </View>
      </ModuleScreenLayout>
    );
  }

  return (
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
      {/* Store Info */}
      {settings && (
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeDot} />
            <Text style={styles.storeName}>
              {settings.store_name || "Your Store"}
            </Text>
            {settings.maintenance_mode && (
              <View style={styles.maintenanceBadge}>
                <Text style={styles.maintenanceText}>Maintenance</Text>
              </View>
            )}
          </View>
          <Text style={styles.storeUrl} numberOfLines={1}>
            {settings.store_url}
          </Text>
          {settings.store_url && (
            <View style={styles.urlActions}>
              <TouchableOpacity
                style={styles.urlActionBtn}
                onPress={async () => {
                  try {
                    await Share.share({ message: settings.store_url! });
                  } catch (_) {}
                }}>
                <Text style={styles.urlActionIcon}>📤</Text>
                <Text style={styles.urlActionLabel}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.urlActionBtn}
                onPress={async () => {
                  try {
                    await Share.share({ message: settings.store_url! });
                  } catch (_) {}
                }}>
                <Text style={styles.urlActionIcon}>📋</Text>
                <Text style={styles.urlActionLabel}>Copy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Overview Stats */}
      <Text style={styles.sectionTitle}>E-commerce Overview</Text>
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{stats?.total ?? 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{stats?.pending ?? 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{stats?.processing ?? 0}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{stats?.delivered ?? 0}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </LinearGradient>
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <LinearGradient
          colors={[BRAND_COLORS.gold, "#c9a84c"]}
          style={styles.revenueGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>
            ₦{(stats?.total_revenue ?? 0).toLocaleString()}
          </Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("OrderList")}>
          <View style={[styles.actionIcon, { backgroundColor: "#3b82f620" }]}>
            <Text style={styles.actionEmoji}>📦</Text>
          </View>
          <Text style={styles.actionTitle}>Orders</Text>
          <Text style={styles.actionDesc}>Manage orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("CouponList")}>
          <View style={[styles.actionIcon, { backgroundColor: "#8b5cf620" }]}>
            <Text style={styles.actionEmoji}>🏷️</Text>
          </View>
          <Text style={styles.actionTitle}>Coupons</Text>
          <Text style={styles.actionDesc}>Discounts & promos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("ShippingMethods")}>
          <View style={[styles.actionIcon, { backgroundColor: "#10b98120" }]}>
            <Text style={styles.actionEmoji}>🚚</Text>
          </View>
          <Text style={styles.actionTitle}>Shipping</Text>
          <Text style={styles.actionDesc}>Delivery methods</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("PayoutDashboard")}>
          <View style={[styles.actionIcon, { backgroundColor: "#ef444420" }]}>
            <Text style={styles.actionEmoji}>💰</Text>
          </View>
          <Text style={styles.actionTitle}>Payouts</Text>
          <Text style={styles.actionDesc}>Withdrawals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("EcommerceSettings")}>
          <View style={[styles.actionIcon, { backgroundColor: "#f59e0b20" }]}>
            <Text style={styles.actionEmoji}>⚙️</Text>
          </View>
          <Text style={styles.actionTitle}>Settings</Text>
          <Text style={styles.actionDesc}>Store config</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("EcommerceReports")}>
          <View style={[styles.actionIcon, { backgroundColor: "#14b8a620" }]}>
            <Text style={styles.actionEmoji}>📊</Text>
          </View>
          <Text style={styles.actionTitle}>Reports</Text>
          <Text style={styles.actionDesc}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </ModuleScreenLayout>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingLabel: { marginTop: 12, color: "#6b7280", fontSize: 14 },
  storeCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  storeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  storeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
  },
  maintenanceBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  maintenanceText: { fontSize: 10, fontWeight: "600", color: "#92400e" },
  storeUrl: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  urlActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  urlActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  urlActionIcon: { fontSize: 14 },
  urlActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  revenueCard: { marginHorizontal: 20, marginTop: 12 },
  revenueGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a0f33",
    opacity: 0.7,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a0f33",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionEmoji: { fontSize: 24 },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  actionDesc: { fontSize: 10, color: "#6b7280", textAlign: "center" },
});
