import React, { useState, useCallback } from "react";
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
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { usePermissionMatrix } from "../hooks/usePermissions";
import { useAssignPermissions } from "../hooks/useRoles";
import type {
  PermissionMatrix,
  MatrixModule,
  MatrixPermission,
} from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "PermissionMatrix">;

export default function PermissionMatrixScreen() {
  const navigation = useNavigation<Nav>();
  const { matrix, isLoading, isRefreshing, refresh } = usePermissionMatrix();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading permission matrix...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!matrix) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Permission Matrix</Text>
          <View style={styles.placeholder} />
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No permission data available.</Text>
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
        <Text style={styles.headerTitle}>Permission Matrix</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <View style={styles.bodyContent}>
          {/* Role Legend */}
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>Roles</Text>
            <View style={styles.legendList}>
              {matrix.roles.map((role: PermissionMatrix["roles"][number]) => (
                <View key={role.id} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: role.color || "#6b7280" },
                    ]}
                  />
                  <Text style={styles.legendName}>{role.name}</Text>
                  <Text style={styles.legendCount}>
                    {role.users_count}{" "}
                    {role.users_count === 1 ? "user" : "users"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Matrix Modules */}
          {matrix.matrix.map((module: MatrixModule) => (
            <ModuleMatrixCard
              key={module.module}
              module={module}
              roles={matrix.roles}
              onRefresh={refresh}
            />
          ))}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ModuleMatrixCardProps {
  module: MatrixModule;
  roles: PermissionMatrix["roles"];
  onRefresh: () => void;
}

function ModuleMatrixCard({ module, roles, onRefresh }: ModuleMatrixCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.moduleCard}>
      <TouchableOpacity
        style={styles.moduleHeader}
        onPress={() => setExpanded(!expanded)}>
        <View style={styles.moduleHeaderLeft}>
          <Text style={styles.moduleArrow}>{expanded ? "▼" : "▶"}</Text>
          <Text style={styles.moduleName}>
            {module.module.charAt(0).toUpperCase() + module.module.slice(1)}
          </Text>
        </View>
        <Text style={styles.modulePermCount}>
          {module.permissions.length} permissions
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.matrixContent}>
          {/* Role headers row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.matrixScroll}>
            <View>
              {/* Column headers */}
              <View style={styles.matrixRow}>
                <View style={styles.permNameCol}>
                  <Text style={styles.colHeader}>Permission</Text>
                </View>
                {roles.map((role) => (
                  <View key={role.id} style={styles.roleCol}>
                    <View
                      style={[
                        styles.roleColDot,
                        { backgroundColor: role.color || "#6b7280" },
                      ]}
                    />
                    <Text style={styles.roleColName} numberOfLines={1}>
                      {role.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Permission rows */}
              {module.permissions.map((perm, idx) => (
                <PermissionRow
                  key={perm.id}
                  permission={perm}
                  roles={roles}
                  isEven={idx % 2 === 0}
                  onRefresh={onRefresh}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

interface PermissionRowProps {
  permission: MatrixPermission;
  roles: PermissionMatrix["roles"];
  isEven: boolean;
  onRefresh: () => void;
}

function PermissionRow({
  permission,
  roles,
  isEven,
  onRefresh,
}: PermissionRowProps) {
  return (
    <View style={[styles.matrixRow, isEven && styles.matrixRowEven]}>
      <View style={styles.permNameCol}>
        <Text style={styles.permName} numberOfLines={2}>
          {permission.display_name}
        </Text>
      </View>
      {roles.map((role) => {
        const hasPermission = permission.roles[role.id.toString()] ?? false;
        return (
          <View key={role.id} style={styles.roleCol}>
            <View
              style={[
                styles.matrixCheck,
                hasPermission && [
                  styles.matrixCheckActive,
                  { backgroundColor: role.color || BRAND_COLORS.gold },
                ],
              ]}>
              {hasPermission && <Text style={styles.matrixCheckMark}>✓</Text>}
            </View>
          </View>
        );
      })}
    </View>
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
  loadingLabel: { marginTop: 12, color: "#6b7280", fontSize: 14 },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  emptyText: { color: "#6b7280", fontSize: 15 },
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
  bodyContent: { padding: 16, gap: 12 },

  // Legend
  legendCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  legendList: { gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  legendCount: { fontSize: 12, color: "#9ca3af" },

  // Module card
  moduleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  moduleHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  moduleArrow: { fontSize: 10, color: "#6b7280" },
  moduleName: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textTransform: "capitalize",
  },
  modulePermCount: { fontSize: 12, color: "#6b7280" },

  // Matrix
  matrixContent: { paddingHorizontal: 8, paddingBottom: 12 },
  matrixScroll: { marginTop: 8 },
  matrixRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingVertical: 6,
  },
  matrixRowEven: { backgroundColor: "#f9fafb" },
  permNameCol: { width: 150, paddingHorizontal: 8 },
  colHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textTransform: "uppercase",
  },
  roleCol: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  roleColDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  roleColName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  permName: { fontSize: 13, color: "#374151" },
  matrixCheck: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  matrixCheckActive: {
    borderColor: "transparent",
  },
  matrixCheckMark: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
