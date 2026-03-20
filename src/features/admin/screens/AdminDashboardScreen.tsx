import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import ModuleScreenLayout from "../../../components/ModuleScreenLayout";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { DashboardStats } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "AdminDashboard">;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { stats, isLoading, isRefreshing, refresh } = useAdminDashboard();

  if (isLoading) {
    return (
      <ModuleScreenLayout>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading dashboard...</Text>
        </View>
      </ModuleScreenLayout>
    );
  }

  const dashboard: DashboardStats | null = stats;

  return (
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
      {/* Stats Cards */}
      <Text style={styles.sectionTitle}>Admin Overview</Text>
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.total_users ?? 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.active_users ?? 0}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#EF4444", "#DC2626"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.inactive_users ?? 0}</Text>
          <Text style={styles.statLabel}>Inactive Users</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.total_roles ?? 0}</Text>
          <Text style={styles.statLabel}>Total Roles</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#14B8A6", "#0D9488"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.recent_logins ?? 0}</Text>
          <Text style={styles.statLabel}>Recent Logins</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{dashboard?.failed_logins ?? 0}</Text>
          <Text style={styles.statLabel}>Failed Logins</Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("UserList")}>
          <View style={[styles.actionIcon, { backgroundColor: "#3b82f620" }]}>
            <Text style={styles.actionEmoji}>👥</Text>
          </View>
          <Text style={styles.actionTitle}>Users</Text>
          <Text style={styles.actionDesc}>Manage all users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("RoleList")}>
          <View style={[styles.actionIcon, { backgroundColor: "#8b5cf620" }]}>
            <Text style={styles.actionEmoji}>🎭</Text>
          </View>
          <Text style={styles.actionTitle}>Roles</Text>
          <Text style={styles.actionDesc}>Configure roles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("UserCreate")}>
          <View style={[styles.actionIcon, { backgroundColor: "#10b98120" }]}>
            <Text style={styles.actionEmoji}>➕</Text>
          </View>
          <Text style={styles.actionTitle}>Add User</Text>
          <Text style={styles.actionDesc}>Create new account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("PermissionMatrix")}>
          <View style={[styles.actionIcon, { backgroundColor: "#f59e0b20" }]}>
            <Text style={styles.actionEmoji}>🔒</Text>
          </View>
          <Text style={styles.actionTitle}>Permissions</Text>
          <Text style={styles.actionDesc}>Permission matrix</Text>
        </TouchableOpacity>
      </View>

      {/* Role Distribution */}
      {dashboard?.role_distribution &&
        dashboard.role_distribution.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Role Distribution</Text>
            <View style={styles.roleList}>
              {dashboard.role_distribution.map((role) => (
                <View key={`role-${role.id}`} style={styles.roleRow}>
                  <View style={styles.roleRowLeft}>
                    <View
                      style={[
                        styles.roleIndicator,
                        {
                          backgroundColor: role.color || BRAND_COLORS.purple,
                        },
                      ]}
                    />
                    <Text style={styles.roleName}>{role.name}</Text>
                  </View>
                  <View style={styles.roleCountBadge}>
                    <Text style={styles.roleCount}>{role.users_count}</Text>
                    <Text style={styles.roleCountLabel}>users</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: "47%",
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionEmoji: { fontSize: 28 },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  actionDesc: { fontSize: 11, color: "#6b7280", textAlign: "center" },
  roleList: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  roleRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  roleIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4,
    marginRight: 12,
  },
  roleName: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  roleCountBadge: { alignItems: "center", minWidth: 50 },
  roleCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  roleCountLabel: { fontSize: 11, color: "#6b7280" },
});
