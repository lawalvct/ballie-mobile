import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { Invoice } from "../types";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export default function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const statusColor =
    invoice.status === "posted"
      ? "#10b981"
      : invoice.status === "draft"
        ? "#f59e0b"
        : "#6b7280";

  const statusBg =
    invoice.status === "posted"
      ? "#d1fae5"
      : invoice.status === "draft"
        ? "#fef3c7"
        : "#f3f4f6";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.voucherNumber}>{invoice.voucher_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.voucherDate}>{invoice.voucher_date}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Party:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {invoice.party_name}
          </Text>
        </View>

        {invoice.voucher_type_name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{invoice.voucher_type_name}</Text>
          </View>
        )}

        {invoice.narration && (
          <Text style={styles.narration} numberOfLines={2}>
            {invoice.narration}
          </Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>
            {invoice.type === "sales" ? "+" : "-"}₦
            {invoice.total_amount?.toLocaleString() || "0.00"}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
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
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    minWidth: 60,
  },
  value: {
    flex: 1,
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  narration: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
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
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.darkPurple,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
