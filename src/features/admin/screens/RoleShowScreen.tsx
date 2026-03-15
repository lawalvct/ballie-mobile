import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useRoleDetail, useDeleteRole } from "../hooks/useRoles";

type Nav = NativeStackNavigationProp<AdminStackParamList, "RoleShow">;
type Route = RouteProp<AdminStackParamList, "RoleShow">;

export default function RoleShowScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;

  const { role, isLoading } = useRoleDetail(id);
  const deleteRole = useDeleteRole();

  const handleDelete = () => {
    Alert.alert(
      "Delete Role",
      `Are you sure you want to delete "${role?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteRole.mutate(id, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ],
    );
  };

  if (isLoading || !role) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading role...</Text>
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
        <Text style={styles.headerTitle}>Role Detail</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.colorBadge,
              { backgroundColor: role.color || BRAND_COLORS.purple },
            ]}>
            <Text style={styles.colorBadgeText}>
              {role.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.roleName}>{role.name}</Text>
          {role.description && (
            <Text style={styles.roleDesc}>{role.description}</Text>
          )}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: role.is_active ? "#d1fae5" : "#fee2e2",
                },
              ]}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: role.is_active ? "#065f46" : "#991b1b",
                }}>
                {role.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
            {role.is_default && (
              <Text style={styles.defaultLabel}>⭐ Default Role</Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{role.users_count}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {role.permissions?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Permissions</Text>
            </View>
          </View>
        </View>

        {/* Users Section */}
        {role.users && role.users.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Assigned Users ({role.users.length})
            </Text>
            {role.users.map((u: any) => (
              <TouchableOpacity
                key={u.id}
                style={styles.userRow}
                onPress={() => navigation.navigate("UserShow", { id: u.id })}>
                <View
                  style={[
                    styles.userAvatar,
                    { backgroundColor: role.color || BRAND_COLORS.purple },
                  ]}>
                  <Text style={styles.userAvatarText}>
                    {u.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <View
                  style={[
                    styles.miniStatus,
                    {
                      backgroundColor: u.is_active ? "#d1fae5" : "#fee2e2",
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: u.is_active ? "#065f46" : "#991b1b",
                    }}>
                    {u.is_active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Permissions by Module */}
        {role.permissions_by_module &&
          role.permissions_by_module.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Permissions</Text>
              {role.permissions_by_module.map((module: any) => (
                <View key={module.module} style={styles.moduleBlock}>
                  <Text style={styles.moduleName}>
                    {module.module.charAt(0).toUpperCase() +
                      module.module.slice(1)}
                  </Text>
                  <View style={styles.permissionChips}>
                    {module.permissions.map((perm: any) => (
                      <View key={perm.id} style={styles.permChip}>
                        <Text style={styles.permChipText}>
                          {perm.display_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Slug</Text>
            <Text style={styles.infoValue}>{role.slug}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(role.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Updated</Text>
            <Text style={styles.infoValue}>
              {new Date(role.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("RoleEdit", { id })}>
            <Text style={styles.editButtonText}>Edit Role</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Role</Text>
          </TouchableOpacity>
        </View>

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
  loadingLabel: { marginTop: 12, color: "#6b7280", fontSize: 14 },
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
  bodyContent: { padding: 20, gap: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  colorBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  colorBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 28 },
  roleName: {
    fontSize: 22,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultLabel: { fontSize: 12, color: "#d97706", fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    width: "100%",
    justifyContent: "center",
  },
  statItem: { alignItems: "center", paddingHorizontal: 24 },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#e5e7eb",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  userAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  userEmail: { fontSize: 12, color: "#6b7280" },
  miniStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moduleBlock: { marginBottom: 16 },
  moduleName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  permissionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  permChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  permChipText: { fontSize: 12, color: "#374151" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: { fontSize: 13, color: "#6b7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  actionRow: { flexDirection: "row", gap: 12 },
  editButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: { fontSize: 15, fontWeight: "700", color: "#1a0f33" },
  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: { fontSize: 15, fontWeight: "700", color: "#dc2626" },
});
