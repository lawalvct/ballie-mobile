import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function AccountGroupList() {
  const navigation = useNavigation<NavigationProp>();
  const accountGroups = [
    {
      id: 1,
      name: "Current Assets",
      nature: "Assets",
      hierarchy: "Parent",
      accountsCount: 24,
      status: "Active",
    },
    {
      id: 2,
      name: "Cash and Bank",
      nature: "Assets",
      hierarchy: "Child → Current Assets",
      accountsCount: 8,
      status: "Active",
    },
    {
      id: 3,
      name: "Fixed Assets",
      nature: "Assets",
      hierarchy: "Parent",
      accountsCount: 18,
      status: "Active",
    },
    {
      id: 4,
      name: "Current Liabilities",
      nature: "Liabilities",
      hierarchy: "Parent",
      accountsCount: 15,
      status: "Active",
    },
    {
      id: 5,
      name: "Accounts Payable",
      nature: "Liabilities",
      hierarchy: "Child → Current Liabilities",
      accountsCount: 6,
      status: "Active",
    },
    {
      id: 6,
      name: "Revenue",
      nature: "Income",
      hierarchy: "Parent",
      accountsCount: 32,
      status: "Active",
    },
    {
      id: 7,
      name: "Operating Expenses",
      nature: "Expenses",
      hierarchy: "Parent",
      accountsCount: 28,
      status: "Active",
    },
    {
      id: 8,
      name: "Salary & Wages",
      nature: "Expenses",
      hierarchy: "Child → Operating Expenses",
      accountsCount: 12,
      status: "Active",
    },
    {
      id: 9,
      name: "Shareholders Equity",
      nature: "Equity",
      hierarchy: "Parent",
      accountsCount: 9,
      status: "Active",
    },
    {
      id: 10,
      name: "Inventory",
      nature: "Assets",
      hierarchy: "Child → Current Assets",
      accountsCount: 5,
      status: "Inactive",
    },
  ];

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case "Assets":
        return "#3b82f6";
      case "Liabilities":
        return "#ef4444";
      case "Equity":
        return "#8b5cf6";
      case "Income":
        return "#10b981";
      case "Expenses":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Groups</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerCell, styles.natureColumn]}>Nature</Text>
            <Text style={[styles.headerCell, styles.hierarchyColumn]}>
              Hierarchy
            </Text>
            <Text style={[styles.headerCell, styles.countColumn]}>
              Accounts
            </Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionsColumn]}>
              Actions
            </Text>
          </View>

          {/* Table Rows */}
          {accountGroups.map((group, index) => (
            <View
              key={group.id}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.cell, styles.nameColumn, styles.nameText]}>
                {group.name}
              </Text>
              <View style={[styles.cell, styles.natureColumn]}>
                <View
                  style={[
                    styles.natureBadge,
                    { backgroundColor: getNatureColor(group.nature) + "20" },
                  ]}>
                  <Text
                    style={[
                      styles.natureText,
                      { color: getNatureColor(group.nature) },
                    ]}>
                    {group.nature}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cell, styles.hierarchyColumn]}>
                {group.hierarchy}
              </Text>
              <Text style={[styles.cell, styles.countColumn]}>
                {group.accountsCount}
              </Text>
              <View style={[styles.cell, styles.statusColumn]}>
                <View
                  style={[
                    styles.statusBadge,
                    group.status === "Active"
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      group.status === "Active"
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}>
                    {group.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, styles.actionsColumn]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("AccountGroupShow", { id: group.id })
                    }>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("AccountGroupEdit", { id: group.id })
                    }>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={[styles.actionButtonText, styles.deactivate]}>
                      {group.status === "Active" ? "Deactivate" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                  {group.hierarchy === "Parent" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.createChildButton]}
                      onPress={() => navigation.navigate("AccountGroupCreate")}>
                      <Text style={styles.createChildText}>+ Child</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  table: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#374151",
    justifyContent: "center",
  },
  nameColumn: {
    width: 180,
  },
  natureColumn: {
    width: 120,
  },
  hierarchyColumn: {
    width: 220,
  },
  countColumn: {
    width: 100,
    textAlign: "center",
  },
  statusColumn: {
    width: 100,
  },
  actionsColumn: {
    width: 380,
  },
  nameText: {
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  natureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  natureText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTextActive: {
    color: "#065f46",
  },
  statusTextInactive: {
    color: "#991b1b",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: SEMANTIC_COLORS.background,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  deactivate: {
    color: "#dc2626",
  },
  createChildButton: {
    backgroundColor: BRAND_COLORS.gold + "20",
    borderColor: BRAND_COLORS.gold,
  },
  createChildText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
});
