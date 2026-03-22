import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { POSStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  usePosTransactionDetail,
  usePosReceipt,
  useVoidSale,
  useRefundSale,
  useEmailReceipt,
} from "../hooks/usePos";

type Props = NativeStackScreenProps<POSStackParamList, "POSTransactionDetail">;

function formatCurrency(n: string | number): string {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed: { bg: "#DEF7EC", text: "#03543F" },
  voided: { bg: "#FDE8E8", text: "#9B1C1C" },
  refunded: { bg: "#FDF6B2", text: "#723B13" },
  pending: { bg: "#E1EFFE", text: "#1E429F" },
};

export default function TransactionDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { transaction, isLoading, refresh } = usePosTransactionDetail(id);
  const { receipt } = usePosReceipt(id);
  const voidSale = useVoidSale();
  const refundSale = useRefundSale();
  const emailReceipt = useEmailReceipt();

  const handleVoid = () => {
    Alert.alert(
      "Void Sale",
      "Are you sure? This will restore stock and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void",
          style: "destructive",
          onPress: () => voidSale.mutate(id, { onSuccess: refresh }),
        },
      ],
    );
  };

  const handleRefund = () => {
    Alert.alert(
      "Refund Sale",
      "Are you sure? This will restore stock and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refund",
          style: "destructive",
          onPress: () => refundSale.mutate(id, { onSuccess: refresh }),
        },
      ],
    );
  };

  const handleEmailReceipt = () => {
    emailReceipt.mutate(id);
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_COLORS[transaction.status] || STATUS_COLORS.pending;
  const isCompleted = transaction.status === "completed";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Sale Header */}
        <View style={styles.saleHeader}>
          <Text style={styles.saleNumber}>{transaction.sale_number}</Text>
          <Text style={styles.saleDate}>{formatDate(transaction.sale_date)}</Text>
          <Text style={styles.cashier}>Cashier: {transaction.user.name}</Text>
          <Text style={styles.register}>
            Register: {transaction.cash_register.name} ({transaction.cash_register.location})
          </Text>
        </View>

        {/* Customer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          {transaction.customer ? (
            <>
              <Text style={styles.customerName}>{transaction.customer.full_name}</Text>
              {transaction.customer.email && (
                <Text style={styles.customerDetail}>{transaction.customer.email}</Text>
              )}
              {transaction.customer.phone && (
                <Text style={styles.customerDetail}>{transaction.customer.phone}</Text>
              )}
            </>
          ) : (
            <Text style={styles.walkIn}>Walk-in Customer</Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({transaction.items.length})</Text>
          {transaction.items.map((item) => (
            <View key={`item-${item.id}`} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemSku}>{item.product_sku}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} × {formatCurrency(item.unit_price)}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>{formatCurrency(item.line_total)}</Text>
                {parseFloat(item.discount_amount) > 0 && (
                  <Text style={styles.itemDiscount}>
                    Disc: {formatCurrency(item.discount_amount)}
                  </Text>
                )}
                {parseFloat(item.tax_amount) > 0 && (
                  <Text style={styles.itemTax}>Tax: {formatCurrency(item.tax_amount)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Totals</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(transaction.totals.subtotal)}</Text>
          </View>
          {parseFloat(transaction.totals.discount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: "#dc2626" }]}>
                −{formatCurrency(transaction.totals.discount)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(transaction.totals.tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(transaction.totals.total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(transaction.totals.paid)}</Text>
          </View>
          {parseFloat(transaction.totals.change) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Change</Text>
              <Text style={[styles.totalValue, { color: BRAND_COLORS.green }]}>
                {formatCurrency(transaction.totals.change)}
              </Text>
            </View>
          )}
        </View>

        {/* Payments */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payments</Text>
          {transaction.payments.map((p) => (
            <View key={`pay-${p.id}`} style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentMethod}>{p.payment_method.name}</Text>
                {p.reference_number && (
                  <Text style={styles.paymentRef}>Ref: {p.reference_number}</Text>
                )}
              </View>
              <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleEmailReceipt}
            disabled={emailReceipt.isPending}>
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={styles.actionText}>Email Receipt</Text>
          </TouchableOpacity>

          {isCompleted && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.voidBtn]}
                onPress={handleVoid}
                disabled={voidSale.isPending}>
                <Text style={styles.actionIcon}>🚫</Text>
                <Text style={[styles.actionText, { color: "#dc2626" }]}>Void Sale</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.refundBtn]}
                onPress={handleRefund}
                disabled={refundSale.isPending}>
                <Text style={styles.actionIcon}>↩️</Text>
                <Text style={[styles.actionText, { color: "#b45309" }]}>Refund</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Notes */}
        {transaction.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{transaction.notes}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Top bar
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: BRAND_COLORS.darkPurple, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: "600" },

  // Sale header
  saleHeader: { marginBottom: 16 },
  saleNumber: { fontSize: 24, fontWeight: "bold", color: BRAND_COLORS.blue },
  saleDate: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  cashier: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  register: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 12 },

  // Customer
  customerName: { fontSize: 16, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  customerDetail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  walkIn: { fontSize: 14, color: "#9ca3af", fontStyle: "italic" },

  // Items
  itemRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  itemName: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  itemSku: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  itemQty: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  itemRight: { alignItems: "flex-end", marginLeft: 12 },
  itemTotal: { fontSize: 15, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  itemDiscount: { fontSize: 11, color: "#dc2626", marginTop: 2 },
  itemTax: { fontSize: 11, color: "#6b7280", marginTop: 1 },

  // Totals
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 14, fontWeight: "500", color: BRAND_COLORS.darkPurple },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12, marginTop: 4 },
  grandTotalLabel: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  grandTotalValue: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.gold },

  // Payments
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  paymentMethod: { fontSize: 14, fontWeight: "500", color: BRAND_COLORS.darkPurple },
  paymentRef: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  paymentAmount: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },

  // Actions
  actionsCard: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  voidBtn: { borderColor: "#FDE8E8" },
  refundBtn: { borderColor: "#FDF6B2" },
  actionIcon: { fontSize: 16, marginRight: 8 },
  actionText: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple },

  // Notes
  notesText: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
});
