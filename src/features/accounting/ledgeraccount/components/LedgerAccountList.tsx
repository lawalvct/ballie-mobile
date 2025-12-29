import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BRAND_COLORS } from "../../../../theme/colors";
import { LedgerAccount, PaginationInfo, ListParams } from "../types";

interface LedgerAccountListProps {
  ledgerAccounts: LedgerAccount[];
  pagination: PaginationInfo | null;
  viewMode: "list" | "tree";
  onToggleView: () => void;
  onDelete: (id: number) => void;
  onItemUpdated: (id: number) => void;
}

export default function LedgerAccountList({
  ledgerAccounts,
  pagination,
  viewMode,
  onToggleView,
  onDelete,
  onItemUpdated,
}: LedgerAccountListProps) {
  const navigation = useNavigation();

  if (!ledgerAccounts || ledgerAccounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No ledger accounts found</Text>
      </View>
    );
  }

  const renderTreeItem = (account: LedgerAccount) => {
    const indentLevel = account.level || 0;
    return (
      <View
        key={account.id}
        style={[styles.treeRow, { paddingLeft: 16 + indentLevel * 20 }]}>
        <View style={styles.treeItemContent}>
          <View style={styles.treeItemHeader}>
            {account.has_children && (
              <Text style={styles.treeIcon}>
                {account.children_count > 0 ? "▼" : "▶"}
              </Text>
            )}
            <Text style={styles.treeName}>
              {account.code} - {account.name}
            </Text>
          </View>
          <Text style={styles.treeBalance}>{account.formatted_balance}</Text>
          <View
            style={[
              styles.statusBadge,
              account.is_active ? styles.statusActive : styles.statusInactive,
            ]}>
            <Text style={styles.statusText}>
              {account.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() =>
              navigation.navigate("LedgerAccountShow", {
                id: account.id,
              } as any)
            }>
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() =>
              navigation.navigate("LedgerAccountEdit", {
                id: account.id,
                onUpdated: onItemUpdated,
              } as any)
            }>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(account.id)}>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Ledger Accounts ({pagination?.total || 0})
        </Text>
        <TouchableOpacity style={styles.viewToggle} onPress={onToggleView}>
          <Text style={styles.viewToggleText}>
            {viewMode === "list" ? "🌳 Tree" : "📋 List"}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "tree" ? (
        <ScrollView style={styles.treeView}>
          {ledgerAccounts.map((account) => renderTreeItem(account))}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.codeColumn]}>Code</Text>
              <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
              <Text style={[styles.headerCell, styles.typeColumn]}>Type</Text>
              <Text style={[styles.headerCell, styles.groupColumn]}>Group</Text>
              <Text style={[styles.headerCell, styles.parentColumn]}>
                Parent
              </Text>
              <Text style={[styles.headerCell, styles.balanceColumn]}>
                Balance
              </Text>
              <Text style={[styles.headerCell, styles.statusColumn]}>
                Status
              </Text>
              <Text style={[styles.headerCell, styles.actionsColumn]}>
                Actions
              </Text>
            </View>

            {/* Table Rows */}
            {ledgerAccounts.map((account) => (
              <View key={account.id} style={styles.tableRow}>
                <Text style={[styles.cell, styles.codeColumn]}>
                  {account.code}
                </Text>
                <Text style={[styles.cell, styles.nameColumn]}>
                  {account.name}
                </Text>
                <Text style={[styles.cell, styles.typeColumn]}>
                  {account.account_type}
                </Text>
                <Text style={[styles.cell, styles.groupColumn]}>
                  {account.account_group?.name || "-"}
                </Text>
                <Text style={[styles.cell, styles.parentColumn]}>
                  {account.parent?.name || "-"}
                </Text>
                <Text style={[styles.cell, styles.balanceColumn]}>
                  {account.formatted_balance}
                </Text>
                <View style={[styles.cell, styles.statusColumn]}>
                  <View
                    style={[
                      styles.statusBadge,
                      account.is_active
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}>
                    <Text style={styles.statusText}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cell, styles.actionsColumn]}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() =>
                        navigation.navigate("LedgerAccountShow", {
                          id: account.id,
                        } as any)
                      }>
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() =>
                        navigation.navigate("LedgerAccountEdit", {
                          id: account.id,
                          onUpdated: onItemUpdated,
                        } as any)
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => onDelete(account.id)}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Pagination Info */}
      {pagination && (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Showing {pagination.from} to {pagination.to} of {pagination.total}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewToggle: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  // Tree View Styles
  treeView: {
    maxHeight: 600,
  },
  treeRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  treeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  treeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  treeIcon: {
    fontSize: 12,
    marginRight: 8,
    color: "#6b7280",
  },
  treeName: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  treeBalance: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginRight: 12,
  },
  // List View Styles
  table: {
    minWidth: 1200,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    padding: 16,
    fontWeight: "600",
    fontSize: 14,
    color: "#374151",
  },
  cell: {
    padding: 16,
    fontSize: 14,
    color: "#1f2937",
  },
  codeColumn: { width: 120 },
  nameColumn: { width: 250 },
  typeColumn: { width: 120 },
  groupColumn: { width: 180 },
  parentColumn: { width: 180 },
  balanceColumn: { width: 150 },
  statusColumn: { width: 120 },
  actionsColumn: { width: 280 },
  statusBadge: {
    paddingHorizontal: 12,
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
    color: "#1f2937",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: "#dbeafe",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  pagination: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
