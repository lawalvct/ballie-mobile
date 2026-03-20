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
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useUsers,
  useToggleUserStatus,
  useDeleteUser,
} from "../hooks/useUsers";
import type { UserListItem, UserListParams } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "UserList">;

export default function UserListScreen() {
  const navigation = useNavigation<Nav>();
  const [filters, setFilters] = useState<UserListParams>({
    per_page: 15,
    page: 1,
  });
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { users, pagination, isLoading, isRefreshing, refresh } =
    useUsers(filters);
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText, page: 1 }));
  };

  const handleFilterStatus = (status: string) => {
    setActiveFilter(status);
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as "active" | "inactive"),
      page: 1,
    }));
  };

  const handleToggleStatus = (user: UserListItem) => {
    toggleStatus.mutate(user.id);
  };

  const handleDeleteUser = (user: UserListItem) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteUser.mutate(user.id),
        },
      ],
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users</Text>
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
            onPress={() => navigation.navigate("UserCreate")}>
            <Text style={styles.createBtnText}>+ Create User</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
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

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}>
            {["all", "active", "inactive"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  activeFilter === status && styles.filterChipActive,
                ]}
                onPress={() => handleFilterStatus(status)}>
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === status && styles.filterChipTextActive,
                  ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* User List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Users ({pagination.total})</Text>
          </View>

          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptyDesc}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            users.map((user: UserListItem) => (
              <TouchableOpacity
                key={`user-${user.id}`}
                style={styles.userCard}
                onPress={() =>
                  navigation.navigate("UserShow", { id: user.id })
                }>
                <View style={styles.userRow}>
                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          user.roles[0]?.color || BRAND_COLORS.purple,
                      },
                    ]}>
                    <Text style={styles.avatarText}>
                      {getInitials(user.name)}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.roleBadges}>
                      {user.roles.map((role) => (
                        <View
                          key={`role-${role.id}`}
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: (role.color || "#6b7280") + "20",
                            },
                          ]}>
                          <Text
                            style={[
                              styles.roleBadgeText,
                              { color: role.color || "#6b7280" },
                            ]}>
                            {role.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Status Toggle */}
                  <View style={styles.userActions}>
                    <Switch
                      value={user.is_active}
                      onValueChange={() => handleToggleStatus(user)}
                      trackColor={{
                        false: "#d1d5db",
                        true: BRAND_COLORS.gold + "80",
                      }}
                      thumbColor={
                        user.is_active ? BRAND_COLORS.gold : "#f4f3f4"
                      }
                    />
                  </View>
                </View>

                {/* Meta Row */}
                <View style={styles.userMeta}>
                  <Text style={styles.metaText}>
                    Last login:{" "}
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : "Never"}
                  </Text>
                  <View style={styles.userCardActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() =>
                        navigation.navigate("UserEdit", { id: user.id })
                      }>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteUser(user)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
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
              <Text style={styles.pageInfoSub}>
                Showing {pagination.from} to {pagination.to} of{" "}
                {pagination.total}
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
  filterRow: { marginTop: 12 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: BRAND_COLORS.darkPurple },
  filterChipText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  filterChipTextActive: { color: "#fff" },
  listSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
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
  userCard: {
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
  userRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  userEmail: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  roleBadges: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleBadgeText: { fontSize: 11, fontWeight: "600" },
  userActions: { marginLeft: 8 },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  metaText: { fontSize: 12, color: "#6b7280" },
  userCardActions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  deleteBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: { fontSize: 12, fontWeight: "600", color: "#dc2626" },
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
  pageInfoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  pageButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
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
