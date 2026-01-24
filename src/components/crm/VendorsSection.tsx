import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CRMStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

type NavigationProp = NativeStackNavigationProp<CRMStackParamList>;

const vendors = [
  {
    id: 1,
    name: "Global Supplies Inc",
    category: "Electronics",
    balance: "₦280,000",
    status: "active",
  },
  {
    id: 2,
    name: "Prime Distributors",
    category: "Furniture",
    balance: "₦0",
    status: "active",
  },
  {
    id: 3,
    name: "Quality Goods Ltd",
    category: "Food & Beverage",
    balance: "₦95,000",
    status: "active",
  },
];

export default function VendorsSection() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vendors</Text>
        <TouchableOpacity onPress={() => navigation.navigate("VendorHome")}>
          <Text style={styles.viewAll}>Manage →</Text>
        </TouchableOpacity>
      </View>

      {vendors.map((vendor) => (
        <TouchableOpacity key={vendor.id} style={styles.vendorCard}>
          <View style={styles.vendorLeft}>
            <View style={[styles.vendorIcon, { backgroundColor: "#f3e8ff" }]}>
              <Text style={styles.vendorEmoji}>🏪</Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <Text style={styles.vendorCategory}>{vendor.category}</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: "#d1fae5" }]}>
                <Text style={[styles.statusText, { color: "#059669" }]}>
                  Active
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.vendorRight}>
            <Text style={styles.balanceLabel}>Payable</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: vendor.balance === "₦0" ? "#10b981" : "#ef4444" },
              ]}>
              {vendor.balance}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
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
