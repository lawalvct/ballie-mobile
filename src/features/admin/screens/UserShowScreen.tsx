import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
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
import {
  useUserDetail,
  useToggleUserStatus,
  useDeleteUser,
} from "../hooks/useUsers";

type Nav = NativeStackNavigationProp<AdminStackParamList, "UserShow">;
type Route = RouteProp<AdminStackParamList, "UserShow">;

export default function UserShowScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;

  const { user, isLoading } = useUserDetail(id);
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteUser.mutate(id, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ],
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading user...</Text>
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
        <Text style={styles.headerTitle}>User Detail</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: user.roles?.[0]?.color || BRAND_COLORS.purple,
              },
            ]}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: user.is_active ? "#d1fae5" : "#fee2e2",
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: user.is_active ? "#065f46" : "#991b1b" },
                ]}>
                {user.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
            <Switch
              value={user.is_active}
              onValueChange={() => toggleStatus.mutate(id)}
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold + "80",
              }}
              thumbColor={user.is_active ? BRAND_COLORS.gold : "#f4f3f4"}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Login</Text>
            <Text style={styles.infoValue}>
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Never"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Verified</Text>
            <Text style={styles.infoValue}>
              {user.email_verified_at
                ? new Date(user.email_verified_at).toLocaleDateString()
                : "Not verified"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Updated</Text>
            <Text style={styles.infoValue}>
              {new Date(user.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Roles & Permissions */}
        {user.roles && user.roles.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Roles & Permissions</Text>
            {user.roles.map((role: any) => (
              <View key={`role-${role.id}`} style={styles.roleSection}>
                <View style={styles.roleTitleRow}>
                  <View
                    style={[
                      styles.roleIndicator,
                      { backgroundColor: role.color || BRAND_COLORS.purple },
                    ]}
                  />
                  <Text style={styles.roleTitle}>{role.name}</Text>
                </View>
                {role.permissions && role.permissions.length > 0 && (
                  <View style={styles.permissionsList}>
                    {role.permissions.map((perm: any) => (
                      <View key={`perm-${perm.id}`} style={styles.permissionChip}>
                        <Text style={styles.permissionText}>
                          {perm.display_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("UserEdit", { id })}>
            <Text style={styles.editButtonText}>Edit User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete User</Text>
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
  bodyContent: { padding: 20 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 28 },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  profileEmail: { fontSize: 14, color: "#6b7280", marginBottom: 2 },
  profilePhone: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: { fontSize: 13, color: "#6b7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  roleSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  roleTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  roleIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
    marginRight: 10,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  permissionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginLeft: 16,
  },
  permissionChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionText: { fontSize: 11, color: "#374151" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
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
