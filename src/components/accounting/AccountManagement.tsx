import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function AccountManagement() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AccountingActions")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("AccountGroupHome")}>
        <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.menuEmoji}>📁</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Account Groups</Text>
          <Text style={styles.menuSubtitle}>
            Manage account categories • 12 groups
          </Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("LedgerAccountHome")}>
        <View style={[styles.menuIcon, { backgroundColor: "#fef3c7" }]}>
          <Text style={styles.menuEmoji}>📋</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Ledger Accounts (COA)</Text>
          <Text style={styles.menuSubtitle}>
            Chart of accounts • 248 ledgers
          </Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
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
  menuCard: {
    flexDirection: "row",
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
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
