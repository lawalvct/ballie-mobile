import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CRMStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { VendorListItem } from "../../features/crm/vendors/types";

type NavigationProp = NativeStackNavigationProp<CRMStackParamList>;

type VendorsSectionProps = {
  vendors: VendorListItem[];
  loading?: boolean;
};

const formatCurrency = (value: number | string | null | undefined) => {
  let amount = 0;
  if (typeof value === "number") {
    amount = value;
  } else if (typeof value === "string") {
    amount = parseFloat(value) || 0;
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function VendorsSection({
  vendors,
  loading = false,
}: VendorsSectionProps) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vendors</Text>
        <TouchableOpacity onPress={() => navigation.navigate("VendorHome")}>
          <Text style={styles.viewAll}>Manage →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading vendors...</Text>
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No vendors yet</Text>
        </View>
      ) : (
        vendors.map((vendor) => {
          const name = vendor.display_name || vendor.company_name || "Unknown";
          const categoryLabel =
            vendor.vendor_type === "business" ? "Business" : "Individual";
          const balanceValue = vendor.outstanding_balance ?? 0;
          const isActive = vendor.status !== "inactive";
          const statusBg = isActive ? "#d1fae5" : "#fee2e2";
          const statusColor = isActive ? "#059669" : "#dc2626";
          const balanceColor =
            Number(balanceValue) === 0 ? "#10b981" : "#ef4444";

          return (
            <TouchableOpacity key={vendor.id} style={styles.vendorCard}>
              <View style={styles.vendorLeft}>
                <View
                  style={[styles.vendorIcon, { backgroundColor: "#f3e8ff" }]}>
                  <Text style={styles.vendorEmoji}>🏪</Text>
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{name}</Text>
                  <Text style={styles.vendorCategory}>{categoryLabel}</Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.vendorRight}>
                <Text style={styles.balanceLabel}>Payable</Text>
                <Text style={[styles.balanceValue, { color: balanceColor }]}>
                  ₦{formatCurrency(balanceValue)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
  vendorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorLeft: {
    flexDirection: "row",
    flex: 1,
  },
  vendorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  vendorEmoji: {
    fontSize: 24,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  vendorRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
