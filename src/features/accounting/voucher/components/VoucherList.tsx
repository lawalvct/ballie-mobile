import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { Voucher, PaginationInfo } from "../types";

interface VoucherListProps {
  vouchers: Voucher[];
  pagination: PaginationInfo | null;
  onPress: (id: number) => void;
  onPageChange: (page: number) => void;
}

export default function VoucherList({
  vouchers,
  pagination,
  onPress,
  onPageChange,
}: VoucherListProps) {
  const renderVoucherItem = ({ item }: { item: Voucher }) => (
    <TouchableOpacity
      style={styles.voucherCard}
      onPress={() => onPress(item.id)}>
      <View style={styles.voucherHeader}>
        <View style={styles.voucherTypeContainer}>
          <View
            style={[
              styles.voucherTypeBadge,
              { backgroundColor: getTypeColor(item.voucher_type_code) },
            ]}>
            <Text style={styles.voucherTypeCode}>{item.voucher_type_code}</Text>
          </View>
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherNumber}>{item.voucher_number}</Text>
            <Text style={styles.voucherTypeName}>{item.voucher_type_name}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "posted" ? styles.statusPosted : styles.statusDraft,
          ]}>
          <Text
            style={[
              styles.statusText,
              item.status === "posted"
                ? styles.statusPostedText
                : styles.statusDraftText,
            ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.voucherBody}>
        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Date:</Text>
          <Text style={styles.voucherValue}>
            {new Date(item.voucher_date).toLocaleDateString()}
          </Text>
        </View>
        {item.narration && (
          <View style={styles.voucherRow}>
            <Text style={styles.voucherLabel}>Narration:</Text>
            <Text style={styles.voucherValue} numberOfLines={2}>
              {item.narration}
            </Text>
          </View>
        )}
        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Amount:</Text>
          <Text style={styles.voucherAmount}>
            ₦{item.total_amount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVoucherItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vouchers found</Text>
            <Text style={styles.emptySubtext}>
              Create your first voucher to get started
            </Text>
          </View>
        }
      />

      {pagination && pagination.last_page > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.current_page === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => onPageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}>
            <Text
              style={[
                styles.paginationButtonText,
                pagination.current_page === 1 &&
                  styles.paginationButtonTextDisabled,
              ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            Page {pagination.current_page} of {pagination.last_page}
            {"\n"}
            Showing {pagination.from} to {pagination.to} of {pagination.total}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              pagination.current_page === pagination.last_page &&
                styles.paginationButtonDisabled,
            ]}
            onPress={() => onPageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}>
            <Text
              style={[
                styles.paginationButtonText,
                pagination.current_page === pagination.last_page &&
                  styles.paginationButtonTextDisabled,
              ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function getTypeColor(code: string): string {
  const colors: Record<string, string> = {
    JV: "#8b5cf6",
    PV: "#ef4444",
    RV: "#10b981",
    CV: "#06b6d4",
    CN: "#f97316",
    DN: "#ec4899",
  };
  return colors[code] || "#6b7280";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  voucherCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  voucherTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  voucherTypeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  voucherTypeCode: {
    fontSize: 14,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  voucherTypeName: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPosted: {
    backgroundColor: "#d1fae5",
  },
  statusDraft: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPostedText: {
    color: "#065f46",
  },
  statusDraftText: {
    color: "#92400e",
  },
  voucherBody: {
    gap: 8,
  },
  voucherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  voucherLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginRight: 8,
  },
  voucherValue: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    flex: 1,
    textAlign: "right",
  },
  voucherAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: SEMANTIC_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.gold,
    minWidth: 90,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  paginationInfo: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
