import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useCoupon } from "../hooks/useCoupons";
import type { CouponDetail, CouponUsage } from "../types";

type Nav = NativeStackNavigationProp<EcommerceStackParamList, "CouponDetail">;
type Route = NativeStackScreenProps<
  EcommerceStackParamList,
  "CouponDetail"
>["route"];

export default function CouponDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;
  const { coupon, isLoading } = useCoupon(id);

  if (isLoading || !coupon) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const c: CouponDetail = coupon;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupon Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CouponForm", { id: c.id })}
          style={styles.editBtn}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.body}>
        {/* Code & Status */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{c.code}</Text>
            <View style={styles.badges}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: c.is_active ? "#d1fae5" : "#fee2e2" },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    { color: c.is_active ? "#065f46" : "#991b1b" },
                  ]}>
                  {c.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
              {c.is_expired && (
                <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
                  <Text style={[styles.badgeText, { color: "#991b1b" }]}>
                    Expired
                  </Text>
                </View>
              )}
            </View>
          </View>
          {c.description && <Text style={styles.desc}>{c.description}</Text>}
        </View>

        {/* Value Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Discount</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{c.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Value</Text>
            <Text style={styles.infoValue}>
              {c.type === "percentage"
                ? `${c.value}%`
                : `₦${c.value.toLocaleString()}`}
            </Text>
          </View>
          {c.minimum_amount != null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Min. Order</Text>
              <Text style={styles.infoValue}>
                ₦{c.minimum_amount.toLocaleString()}
              </Text>
            </View>
          )}
          {c.maximum_discount != null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Max. Discount</Text>
              <Text style={styles.infoValue}>
                ₦{c.maximum_discount.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Usage & Validity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Usage & Validity</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Used</Text>
            <Text style={styles.infoValue}>
              {c.usage_count}
              {c.usage_limit ? ` / ${c.usage_limit}` : ""}
            </Text>
          </View>
          {c.valid_from && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valid From</Text>
              <Text style={styles.infoValue}>
                {new Date(c.valid_from).toLocaleDateString()}
              </Text>
            </View>
          )}
          {c.valid_to && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valid To</Text>
              <Text style={styles.infoValue}>
                {new Date(c.valid_to).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Usage History */}
        {c.usages && c.usages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Usage History</Text>
            {c.usages.map((u: CouponUsage) => (
              <View key={u.id} style={styles.usageRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.usageName}>
                    {u.customer?.name ?? "Guest"}
                  </Text>
                  {u.order && (
                    <Text style={styles.usageOrder}>
                      #{u.order.order_number}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.usageAmount}>
                    -₦{u.discount_amount.toLocaleString()}
                  </Text>
                  <Text style={styles.usageDate}>
                    {new Date(u.used_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
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
  editBtn: { width: 60, alignItems: "flex-end" },
  editText: { color: BRAND_COLORS.gold, fontSize: 15, fontWeight: "700" },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  code: { fontSize: 22, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  badges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  desc: { fontSize: 14, color: "#6b7280", marginTop: 6 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  usageName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  usageOrder: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  usageAmount: { fontSize: 14, fontWeight: "bold", color: "#10b981" },
  usageDate: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});
