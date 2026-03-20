import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import EcommerceModuleHeader from "../../../components/ecommerce/EcommerceModuleHeader";
import {
  useCoupons,
  useDeleteCoupon,
  useToggleCoupon,
} from "../hooks/useCoupons";
import type { Coupon, CouponListParams } from "../types";

type Nav = NativeStackNavigationProp<EcommerceStackParamList, "CouponList">;

const STATUS_FILTERS = [
  { label: "All", value: "" as const },
  { label: "Active", value: "active" as const },
  { label: "Inactive", value: "inactive" as const },
  { label: "Expired", value: "expired" as const },
];

export default function CouponListScreen() {
  const navigation = useNavigation<Nav>();
  const [params, setParams] = useState<CouponListParams>({
    per_page: 15,
    page: 1,
  });
  const [search, setSearch] = useState("");
  const { coupons, pagination, isLoading, isRefreshing, refresh } =
    useCoupons(params);
  const deleteMutation = useDeleteCoupon();
  const toggleMutation = useToggleCoupon();

  const handleSearch = () => {
    setParams((p) => ({ ...p, search, page: 1 }));
  };

  const handleDelete = (id: number, code: string) => {
    Alert.alert("Delete Coupon", `Delete "${code}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  if (isLoading && !coupons.length) {
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

      <EcommerceModuleHeader
        title="Coupons"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CouponForm", {})}
            style={styles.createBtn}
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Create New Coupon</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search coupons..."
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
              onPress={() =>
                setParams((p) => ({
                  ...p,
                  status: f.value || undefined,
                  page: 1,
                }))
              }>
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

        {/* Coupon Cards */}
        <View style={styles.list}>
          {coupons.map((coupon: Coupon) => (
            <TouchableOpacity
              key={coupon.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("CouponDetail", { id: coupon.id })
              }>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.codeRow}>
                    <Text style={styles.code}>{coupon.code}</Text>
                    {coupon.is_expired && (
                      <View
                        style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
                        <Text style={[styles.badgeText, { color: "#991b1b" }]}>
                          Expired
                        </Text>
                      </View>
                    )}
                  </View>
                  {coupon.description && (
                    <Text style={styles.desc} numberOfLines={1}>
                      {coupon.description}
                    </Text>
                  )}
                </View>
                <Switch
                  value={coupon.is_active}
                  onValueChange={() => toggleMutation.mutate(coupon.id)}
                  trackColor={{ true: BRAND_COLORS.gold }}
                />
              </View>

              <View style={styles.cardMeta}>
                <View
                  style={[styles.valueBadge, { backgroundColor: "#ede9fe" }]}>
                  <Text style={[styles.valueBadgeText, { color: "#5b21b6" }]}>
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `₦${coupon.value.toLocaleString()}`}
                  </Text>
                </View>
                <Text style={styles.usageText}>
                  {coupon.usage_count}
                  {coupon.usage_limit ? `/${coupon.usage_limit}` : ""} uses
                </Text>
                {coupon.minimum_amount && (
                  <Text style={styles.minText}>
                    Min: ₦{coupon.minimum_amount.toLocaleString()}
                  </Text>
                )}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CouponForm", { id: coupon.id })
                  }>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(coupon.id, coupon.code)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {coupons.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No coupons found</Text>
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
              onPress={() =>
                setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))
              }>
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
              onPress={() =>
                setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))
              }>
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
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a0f33",
    lineHeight: 24,
  },
  createBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a0f33",
    letterSpacing: 0.3,
  },
  searchRow: { padding: 16, paddingBottom: 0 },
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
  filterRow: { marginVertical: 12 },
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  desc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  valueBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  valueBadgeText: { fontSize: 13, fontWeight: "700" },
  usageText: { fontSize: 12, color: "#6b7280" },
  minText: { fontSize: 12, color: "#9ca3af" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  editText: { color: BRAND_COLORS.darkPurple, fontWeight: "600", fontSize: 13 },
  deleteText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
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
