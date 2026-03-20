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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useRoles, useDeleteRole } from "../hooks/useRoles";
import type { RoleListItem, RoleListParams } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "RoleList">;

export default function RoleListScreen() {
  const navigation = useNavigation<Nav>();
  const [filters, setFilters] = useState<RoleListParams>({
    per_page: 15,
    page: 1,
  });
  const [searchText, setSearchText] = useState("");

  const { roles, pagination, isLoading, isRefreshing, refresh } =
    useRoles(filters);
  const deleteRole = useDeleteRole();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText, page: 1 }));
  };

  const handleDelete = (role: RoleListItem) => {
    Alert.alert(
      "Delete Role",
      `Are you sure you want to delete "${role.name}"?${
        role.users_count > 0
          ? `\n\nThis role has ${role.users_count} assigned user(s).`
          : ""
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRole.mutate(role.id),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading roles...</Text>
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
        <Text style={styles.headerTitle}>Roles</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={BRAND_COLORS.gold}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {/* Create Button */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate("RoleCreate")}>
            <Text style={styles.createBtnText}>+ Create Role</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search roles..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Roles List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Roles ({pagination.total})</Text>

          {roles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎭</Text>
              <Text style={styles.emptyTitle}>No roles found</Text>
              <Text style={styles.emptyDesc}>
                Create your first role to get started
              </Text>
            </View>
          ) : (
            roles.map((role: RoleListItem) => (
              <TouchableOpacity
                key={`role-${role.id}`}
                style={styles.roleCard}
                onPress={() =>
                  navigation.navigate("RoleShow", { id: role.id })
                }>
                <View style={styles.roleHeader}>
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: role.color || BRAND_COLORS.purple,
                      },
                    ]}
                  />
                  <View style={styles.roleInfo}>
                    <View style={styles.roleNameRow}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      {role.is_default && (
                        <Text style={styles.defaultBadge}>⭐ Default</Text>
                      )}
                    </View>
                    {role.description && (
                      <Text style={styles.roleDesc} numberOfLines={2}>
                        {role.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countNumber}>{role.users_count}</Text>
                    <Text style={styles.countLabel}>users</Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countNumber}>
                      {role.permissions_count}
                    </Text>
                    <Text style={styles.countLabel}>permissions</Text>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: role.is_active ? "#d1fae5" : "#fee2e2",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusChipText,
                        {
                          color: role.is_active ? "#065f46" : "#991b1b",
                        },
                      ]}>
                      {role.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.roleActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("RoleEdit", { id: role.id })
                    }>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(role)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.pageInfo}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <View style={styles.pageButtons}>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    pagination.current_page <= 1 && styles.pageBtnDisabled,
                  ]}
                  disabled={pagination.current_page <= 1}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) - 1,
                    }))
                  }>
                  <Text style={styles.pageBtnText}>← Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    pagination.current_page >= pagination.last_page &&
                      styles.pageBtnDisabled,
                  ]}
                  disabled={pagination.current_page >= pagination.last_page}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }>
                  <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  bodyContent: { paddingBottom: 20 },
  actionsSection: { paddingHorizontal: 20, paddingTop: 16 },
  createBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnText: { color: "#1a0f33", fontSize: 16, fontWeight: "700" },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    marginTop: 16,
    paddingBottom: 12,
  },
  searchRow: { flexDirection: "row", gap: 12 },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1f2937",
  },
  searchBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchBtnText: { color: "#1a0f33", fontWeight: "600", fontSize: 14 },
  listSection: { marginHorizontal: 20, marginTop: 16 },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  emptyDesc: { fontSize: 13, color: "#6b7280" },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roleHeader: { flexDirection: "row", alignItems: "flex-start" },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  roleInfo: { flex: 1 },
  roleNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  roleName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  defaultBadge: { fontSize: 11, color: "#d97706" },
  roleDesc: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  badgeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  countNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  countLabel: { fontSize: 12, color: "#6b7280" },
  statusChip: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: { fontSize: 11, fontWeight: "600" },
  roleActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    justifyContent: "flex-end",
  },
  editBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  deleteBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteBtnText: { fontSize: 13, fontWeight: "600", color: "#dc2626" },
  pagination: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  pageButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  pageBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  pageBtnDisabled: { backgroundColor: "#e5e7eb", opacity: 0.6 },
  pageBtnText: { fontWeight: "600", fontSize: 13, color: "#1a0f33" },
});
