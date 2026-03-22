import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BRAND_COLORS } from "../../../theme/colors";
import { useCart } from "../context/CartContext";
import { usePosPaymentMethods, useCreateSale } from "../hooks/usePos";
import type { CartPayment } from "../types";

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ visible, onClose, onSuccess }: Props) {
  const cart = useCart();
  const { paymentMethods } = usePosPaymentMethods();
  const createSale = useCreateSale();

  const [payments, setPayments] = useState<CartPayment[]>([]);

  // Reset payments when modal opens
  useEffect(() => {
    if (visible && paymentMethods?.length) {
      const defaultMethod = paymentMethods[0];
      setPayments([
        {
          method_id: defaultMethod.id,
          method_name: defaultMethod.name,
          amount: cart.grandTotal,
          reference: null,
          requires_reference: defaultMethod.requires_reference,
        },
      ]);
    }
  }, [visible, paymentMethods]);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = Math.max(0, cart.grandTotal - totalPaid);
  const change = Math.max(0, totalPaid - cart.grandTotal);

  const updatePayment = (index: number, updates: Partial<CartPayment>) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    );
  };

  const addPayment = () => {
    if (!paymentMethods?.length) return;
    const method = paymentMethods[0];
    setPayments((prev) => [
      ...prev,
      {
        method_id: method.id,
        method_name: method.name,
        amount: remaining,
        reference: null,
        requires_reference: method.requires_reference,
      },
    ]);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteSale = () => {
    if (remaining > 0.01) {
      Alert.alert("Insufficient Payment", "Total payment does not cover the bill.");
      return;
    }

    const payload = {
      customer_id: cart.customerId,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || undefined,
      })),
      payments: payments
        .filter((p) => p.amount > 0)
        .map((p) => ({
          method_id: p.method_id,
          amount: p.amount,
          reference: p.reference || undefined,
        })),
      notes: cart.notes || undefined,
    };

    createSale.mutate(payload, {
      onSuccess: (data) => {
        cart.clearCart();
        if ((data as any)?.change_amount > 0) {
          Alert.alert("Sale Complete", `Change: ${formatCurrency((data as any).change_amount)}`, [
            { text: "OK", onPress: onSuccess },
          ]);
        } else {
          onSuccess();
        }
      },
    });
  };

  const quickAmounts = [
    { label: "Exact", value: cart.grandTotal },
    { label: "₦500", value: 500 },
    { label: "₦1,000", value: 1000 },
    { label: "₦2,000", value: 2000 },
    { label: "₦5,000", value: 5000 },
    { label: "₦10,000", value: 10000 },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{cart.itemCount} items</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cart.subtotal)}</Text>
            </View>
            {cart.totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: "#dc2626" }]}>
                  −{formatCurrency(cart.totalDiscount)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cart.totalTax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(cart.grandTotal)}</Text>
            </View>
          </View>

          {/* Payments */}
          {payments.map((payment, index) => (
            <View key={`payment-${index}`} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentLabel}>Payment {index + 1}</Text>
                {payments.length > 1 && (
                  <TouchableOpacity onPress={() => removePayment(index)}>
                    <Text style={styles.removePayment}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Method selector */}
              <Text style={styles.fieldLabel}>Method</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodChips}>
                {paymentMethods?.map((m) => (
                  <TouchableOpacity
                    key={`method-${index}-${m.id}`}
                    style={[
                      styles.methodChip,
                      payment.method_id === m.id && styles.methodChipActive,
                    ]}
                    onPress={() =>
                      updatePayment(index, {
                        method_id: m.id,
                        method_name: m.name,
                        requires_reference: m.requires_reference,
                        reference: m.requires_reference ? payment.reference : null,
                      })
                    }>
                    <Text
                      style={[
                        styles.methodChipText,
                        payment.method_id === m.id && styles.methodChipTextActive,
                      ]}>
                      {m.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Amount */}
              <Text style={styles.fieldLabel}>Amount (₦)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                value={payment.amount ? String(payment.amount) : ""}
                onChangeText={(text) => updatePayment(index, { amount: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />

              {/* Reference */}
              {payment.requires_reference && (
                <>
                  <Text style={styles.fieldLabel}>Reference</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Transaction reference"
                    placeholderTextColor="#9ca3af"
                    value={payment.reference || ""}
                    onChangeText={(text) => updatePayment(index, { reference: text })}
                  />
                </>
              )}

              {/* Quick amounts (first payment only) */}
              {index === 0 && (
                <View style={styles.quickAmounts}>
                  {quickAmounts.map((qa) => (
                    <TouchableOpacity
                      key={`qa-${qa.label}`}
                      style={styles.quickAmountBtn}
                      onPress={() => updatePayment(0, { amount: qa.value })}>
                      <Text style={styles.quickAmountText}>{qa.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Add payment */}
          <TouchableOpacity style={styles.addPaymentBtn} onPress={addPayment}>
            <Text style={styles.addPaymentText}>+ Add Another Payment</Text>
          </TouchableOpacity>

          {/* Balance indicator */}
          <View style={styles.balanceCard}>
            {remaining > 0.01 ? (
              <>
                <Text style={styles.balanceLabel}>Remaining</Text>
                <Text style={[styles.balanceValue, { color: "#dc2626" }]}>
                  {formatCurrency(remaining)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.balanceLabel}>Change</Text>
                <Text style={[styles.balanceValue, { color: BRAND_COLORS.green }]}>
                  {formatCurrency(change)}
                </Text>
              </>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Complete button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.completeBtn, remaining > 0.01 && styles.completeBtnDisabled]}
            onPress={handleCompleteSale}
            disabled={remaining > 0.01 || createSale.isPending}>
            {createSale.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeBtnText}>Complete Sale</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: BRAND_COLORS.darkPurple, fontWeight: "500" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: BRAND_COLORS.darkPurple },

  content: { flex: 1, padding: 16 },

  // Summary
  summaryCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: BRAND_COLORS.darkPurple },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12, marginTop: 4 },
  summaryTotalLabel: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  summaryTotalValue: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.gold },

  // Payment card
  paymentCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  paymentLabel: { fontSize: 15, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  removePayment: { fontSize: 13, color: "#dc2626", fontWeight: "500" },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f9fafb", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", fontSize: 15, color: BRAND_COLORS.darkPurple },

  // Method chips
  methodChips: { flexDirection: "row", marginBottom: 4 },
  methodChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f3f4f6", marginRight: 8 },
  methodChipActive: { backgroundColor: BRAND_COLORS.darkPurple },
  methodChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  methodChipTextActive: { color: "#fff" },

  // Quick amounts
  quickAmounts: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  quickAmountBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  quickAmountText: { fontSize: 13, fontWeight: "500", color: BRAND_COLORS.darkPurple },

  // Add payment
  addPaymentBtn: { alignItems: "center", paddingVertical: 14, marginBottom: 12 },
  addPaymentText: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.blue },

  // Balance
  balanceCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  balanceLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  balanceValue: { fontSize: 28, fontWeight: "bold" },

  // Footer
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  completeBtn: { backgroundColor: BRAND_COLORS.gold, padding: 18, borderRadius: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  completeBtnDisabled: { opacity: 0.5 },
  completeBtnText: { fontSize: 17, fontWeight: "bold", color: "#fff" },
});
