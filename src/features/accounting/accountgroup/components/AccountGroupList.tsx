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
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { AccountGroup, PaginationInfo } from "../types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

interface AccountGroupListProps {
  accountGroups: AccountGroup[];
  pagination: PaginationInfo | null;
  onToggleStatus: (id: number) => void;
  onItemUpdated: (id: number) => void;
}

export default function AccountGroupList({
  accountGroups,
  pagination,
  onToggleStatus,
  onItemUpdated,
}: AccountGroupListProps) {
  const navigation = useNavigation<NavigationProp>();

  const getNatureColor = (nature: string) => {
    const lowerNature = nature.toLowerCase();
    switch (lowerNature) {
      case "assets":
        return "#3b82f6";
      case "liabilities":
        return "#ef4444";
      case "equity":
        return "#8b5cf6";
      case "income":
        return "#10b981";
      case "expenses":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getHierarchyDisplay = (group: AccountGroup) => {
    if (group.parent) {
      return `Child → ${group.parent.name}`;
    }
    return group.children_count > 0 ? "Parent" : "Standalone";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Groups</Text>
        <Text style={styles.subtitle}>
          {pagination
            ? `${pagination.from}-${pagination.to} of ${pagination.total}`
            : `${accountGroups.length} groups`}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerCell, styles.codeColumn]}>Code</Text>
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
          {accountGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No account groups found</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("AccountGroupCreate")}>
                <Text style={styles.createButtonText}>
                  + Create First Group
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            accountGroups.map((group, index) => (
              <View
                key={group.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}>
                <Text style={[styles.cell, styles.nameColumn, styles.nameText]}>
                  {group.name}
                </Text>
                <Text style={[styles.cell, styles.codeColumn, styles.codeText]}>
                  {group.code}
                </Text>
                <View style={[styles.cell, styles.natureColumn]}>
                  <View
                    style={[
                      styles.natureBadge,
                      {
                        backgroundColor:
                          getNatureColor(group.nature_label) + "20",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.natureText,
                        { color: getNatureColor(group.nature_label) },
                      ]}>
                      {group.nature_label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cell, styles.hierarchyColumn]}>
                  {getHierarchyDisplay(group)}
                </Text>
                <Text style={[styles.cell, styles.countColumn]}>
                  {group.ledger_accounts_count}
                </Text>
                <View style={[styles.cell, styles.statusColumn]}>
                  <View
                    style={[
                      styles.statusBadge,
                      group.is_active
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        group.is_active
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}>
                      {group.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cell, styles.actionsColumn]}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("AccountGroupShow", {
                          id: group.id,
                        })
                      }>
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("AccountGroupEdit", {
                          id: group.id,
                          onUpdated: onItemUpdated,
                        } as any)
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onToggleStatus(group.id)}>
                      <Text
                        style={[styles.actionButtonText, styles.deactivate]}>
                        {group.is_active ? "Deactivate" : "Activate"}
                      </Text>
                    </TouchableOpacity>
                    {!group.parent_id && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.createChildButton]}
                        onPress={() =>
                          navigation.navigate("AccountGroupCreate")
                        }>
                        <Text style={styles.createChildText}>+ Child</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
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
    minWidth: "100%",
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
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  nameColumn: {
    width: 180,
  },
  codeColumn: {
    width: 100,
  },
  natureColumn: {
    width: 120,
  },
  hierarchyColumn: {
    width: 180,
  },
  countColumn: {
    width: 100,
    textAlign: "center",
  },
  statusColumn: {
    width: 100,
  },
  actionsColumn: {
    width: 350,
  },
  nameText: {
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#6b7280",
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
    backgroundColor: "#d1b05e20",
    borderColor: BRAND_COLORS.gold,
  },
  createChildText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
});
