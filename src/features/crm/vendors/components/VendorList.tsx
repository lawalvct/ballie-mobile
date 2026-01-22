import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { VendorListItem, VendorListResponse } from "../types";

interface Props {
  vendors: VendorListItem[];
  pagination: VendorListResponse | null;
  onVendorPress: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onPageChange: (page: number) => void;
}

export default function VendorList({
  vendors,
  pagination,
  onVendorPress,
  onToggleStatus,
  onPageChange,
}: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (vendors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Vendors</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>No Vendors Found</Text>
          <Text style={styles.emptyText}>
            Create your first vendor to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendors</Text>
        <Text style={styles.count}>
          {pagination?.total || vendors.length} total
        </Text>
      </View>

      {vendors.map((vendor) => (
        <TouchableOpacity
          key={vendor.id}
          style={styles.vendorCard}
          onPress={() => onVendorPress(vendor.id)}>
          <View style={styles.vendorInfo}>
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorName}>
                {vendor.display_name || vendor.company_name || "N/A"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      vendor.status === "active" ? "#d1fae5" : "#fee2e2",
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: vendor.status === "active" ? "#059669" : "#dc2626",
                    },
                  ]}>
                  {vendor.status === "active" ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <View style={styles.vendorDetails}>
              {vendor.email && (
                <Text style={styles.vendorEmail} numberOfLines={1}>
                  📧 {vendor.email}
                </Text>
              )}
              {vendor.phone && (
                <Text style={styles.vendorPhone}>📞 {vendor.phone}</Text>
              )}
            </View>

            <View style={styles.vendorFooter}>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Outstanding:</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    {
                      color:
                        !vendor.outstanding_balance ||
                        vendor.outstanding_balance === 0
                          ? "#10b981"
                          : "#ef4444",
                    },
                  ]}>
                  {formatCurrency(vendor.outstanding_balance)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onToggleStatus(vendor.id)}>
                <Text style={styles.actionButtonText}>
                  {vendor.status === "active" ? "Deactivate" : "Activate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Page {pagination.current_page} of {pagination.last_page}
            </Text>
            <Text style={styles.paginationSecondary}>
              Showing {pagination.from} to {pagination.to} of {pagination.total}
            </Text>
          </View>

          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                pagination.current_page === 1 &&
                  styles.paginationButtonDisabled,
              ]}
              disabled={pagination.current_page === 1}
              onPress={() => onPageChange(pagination.current_page - 1)}>
              <Text
                style={[
                  styles.paginationButtonText,
                  pagination.current_page === 1 &&
                    styles.paginationButtonTextDisabled,
                ]}>
                ← Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                pagination.current_page === pagination.last_page &&
                  styles.paginationButtonDisabled,
              ]}
              disabled={pagination.current_page === pagination.last_page}
              onPress={() => onPageChange(pagination.current_page + 1)}>
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: SEMANTIC_COLORS.white,
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
    borderBottomColor: "#f3f4f6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  count: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  vendorCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  vendorDetails: {
    marginBottom: 12,
  },
  vendorEmail: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  vendorPhone: {
    fontSize: 13,
    color: "#6b7280",
  },
  vendorFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationContainer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  paginationInfo: {
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  paginationSecondary: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
