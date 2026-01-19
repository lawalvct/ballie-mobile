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
import { VoucherType, PaginationInfo } from "../types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

interface VoucherTypeListProps {
  voucherTypes: VoucherType[];
  pagination: PaginationInfo | null;
  onToggleStatus: (id: number) => void;
  onItemUpdated: (id: number) => void;
  onPageChange?: (page: number) => void;
}

export default function VoucherTypeList({
  voucherTypes,
  pagination,
  onToggleStatus,
  onItemUpdated,
  onPageChange,
}: VoucherTypeListProps) {
  const navigation = useNavigation<NavigationProp>();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "accounting":
        return "#3b82f6";
      case "inventory":
        return "#10b981";
      case "pos":
        return "#f59e0b";
      case "payroll":
        return "#8b5cf6";
      case "ecommerce":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      accounting: "Accounting",
      inventory: "Inventory",
      pos: "POS",
      payroll: "Payroll",
      ecommerce: "Ecommerce",
    };
    return labels[category.toLowerCase()] || category;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voucher Types</Text>
        <Text style={styles.subtitle}>
          {pagination
            ? `${pagination.from}-${pagination.to} of ${pagination.total}`
            : `${voucherTypes.length} types`}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerCell, styles.codeColumn]}>Code</Text>
            <Text style={[styles.headerCell, styles.abbreviationColumn]}>
              Abbr
            </Text>
            <Text style={[styles.headerCell, styles.categoryColumn]}>
              Category
            </Text>
            <Text style={[styles.headerCell, styles.numberingColumn]}>
              Numbering
            </Text>
            <Text style={[styles.headerCell, styles.typeColumn]}>Type</Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionsColumn]}>
              Actions
            </Text>
          </View>

          {/* Table Rows */}
          {voucherTypes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No voucher types found</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() =>
                  navigation.navigate("VoucherTypeCreate", {} as any)
                }>
                <Text style={styles.createButtonText}>
                  + Create First Voucher Type
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            voucherTypes.map((type, index) => (
              <View
                key={type.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}>
                <Text style={[styles.cell, styles.nameColumn, styles.nameText]}>
                  {type.name}
                </Text>
                <Text style={[styles.cell, styles.codeColumn, styles.codeText]}>
                  {type.code}
                </Text>
                <Text style={[styles.cell, styles.abbreviationColumn]}>
                  {type.abbreviation}
                </Text>
                <View style={[styles.cellContainer, styles.categoryColumn]}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: getCategoryColor(type.category) + "20",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.categoryText,
                        { color: getCategoryColor(type.category) },
                      ]}>
                      {getCategoryLabel(type.category)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cell, styles.numberingColumn]}>
                  {type.numbering_method === "auto" ? "Auto" : "Manual"}
                </Text>
                <View style={[styles.cellContainer, styles.typeColumn]}>
                  <View
                    style={[
                      styles.typeBadge,
                      type.is_system_defined
                        ? styles.typeBadgeSystem
                        : styles.typeBadgeCustom,
                    ]}>
                    <Text
                      style={[
                        styles.typeText,
                        type.is_system_defined
                          ? styles.typeTextSystem
                          : styles.typeTextCustom,
                      ]}>
                      {type.is_system_defined ? "System" : "Custom"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cellContainer, styles.statusColumn]}>
                  <View
                    style={[
                      styles.statusBadge,
                      type.is_active
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        type.is_active
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}>
                      {type.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cellContainer, styles.actionsColumn]}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("VoucherTypeShow", {
                          id: type.id,
                        })
                      }>
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("VoucherTypeEdit", {
                          id: type.id,
                          onUpdated: onItemUpdated,
                        } as any)
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onToggleStatus(type.id)}>
                      <Text
                        style={[styles.actionButtonText, styles.deactivate]}>
                        {type.is_active ? "Deactivate" : "Activate"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.current_page === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              onPageChange && onPageChange(pagination.current_page - 1)
            }
            disabled={pagination.current_page === 1}>
            <Text
              style={[
                styles.paginationButtonText,
                pagination.current_page === 1 &&
                  styles.paginationButtonTextDisabled,
              ]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            Page {pagination.current_page} of {pagination.last_page}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.current_page === pagination.last_page &&
                styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              onPageChange && onPageChange(pagination.current_page + 1)
            }
            disabled={pagination.current_page === pagination.last_page}>
            <Text
              style={[
                styles.paginationButtonText,
                pagination.current_page === pagination.last_page &&
                  styles.paginationButtonTextDisabled,
              ]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  table: {
    minWidth: 1200,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  cell: {
    fontSize: 14,
    color: "#374151",
  },
  cellContainer: {
    justifyContent: "center",
  },
  nameColumn: {
    width: 200,
  },
  codeColumn: {
    width: 100,
  },
  abbreviationColumn: {
    width: 80,
  },
  categoryColumn: {
    width: 120,
  },
  numberingColumn: {
    width: 100,
  },
  typeColumn: {
    width: 100,
  },
  statusColumn: {
    width: 100,
  },
  actionsColumn: {
    width: 300,
  },
  nameText: {
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  codeText: {
    fontFamily: "monospace",
    color: "#6b7280",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  typeBadgeSystem: {
    backgroundColor: "#dbeafe",
  },
  typeBadgeCustom: {
    backgroundColor: "#fef3c7",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeTextSystem: {
    color: "#1e40af",
  },
  typeTextCustom: {
    color: "#92400e",
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 90,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
    elevation: 0,
    shadowOpacity: 0,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  paginationInfo: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
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
  },
  actionButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  deactivate: {
    color: "#dc2626",
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
});
