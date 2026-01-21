import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { Invoice } from "../types";

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onInvoicePress: (invoice: Invoice) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  ListHeaderComponent?: () => React.ReactElement;
}

export default function InvoiceList({
  invoices,
  loading,
  onInvoicePress,
  onLoadMore,
  hasMore,
  ListHeaderComponent,
}: InvoiceListProps) {
  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const statusColor =
      item.status === "posted"
        ? "#10b981"
        : item.status === "draft"
          ? "#f59e0b"
          : "#6b7280";

    const statusBg =
      item.status === "posted"
        ? "#d1fae5"
        : item.status === "draft"
          ? "#fef3c7"
          : "#f3f4f6";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onInvoicePress(item)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.voucherNumber}>{item.voucher_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.voucherDate}>{item.voucher_date}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Party:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {item.party_name}
            </Text>
          </View>

          {item.voucher_type_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{item.voucher_type_name}</Text>
            </View>
          )}

          {item.narration && (
            <Text style={styles.narration} numberOfLines={2}>
              {item.narration}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>
              {item.type === "sales" ? "+" : "-"}
              {item.total_amount?.toLocaleString() || "0.00"}
            </Text>
          </View>
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="small" color={BRAND_COLORS.darkPurple} />
        ) : (
          <TouchableOpacity onPress={onLoadMore} style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          <Text style={styles.emptyText}>Loading invoices...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyTitle}>No Invoices Found</Text>
        <Text style={styles.emptyText}>
          Create your first invoice to get started
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={invoices}
      renderItem={renderInvoiceCard}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={hasMore && !loading ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voucherNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  voucherDate: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    minWidth: 50,
  },
  value: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    flex: 1,
  },
  narration: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  amountContainer: {
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  arrow: {
    width: 32,
    height: 32,
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
