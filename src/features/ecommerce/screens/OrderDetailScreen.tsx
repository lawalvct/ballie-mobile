import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useCreateInvoice,
} from "../hooks/useOrders";
import type {
  OrderStatus,
  PaymentStatus,
  OrderDetail,
  OrderItem,
} from "../types";

type Nav = NativeStackNavigationProp<EcommerceStackParamList, "OrderDetail">;
type Route = NativeStackScreenProps<
  EcommerceStackParamList,
  "OrderDetail"
>["route"];

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return "0";
  return value.toLocaleString("en-NG");
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  shipped: { bg: "#cffafe", text: "#155e75" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  unpaid: { bg: "#fee2e2", text: "#991b1b" },
  paid: { bg: "#d1fae5", text: "#065f46" },
  partially_paid: { bg: "#fef3c7", text: "#92400e" },
  refunded: { bg: "#e5e7eb", text: "#374151" },
};

const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const PAYMENT_OPTIONS: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partially_paid",
  "refunded",
];

export default function OrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;

  const { order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const createInvoice = useCreateInvoice();

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const o: OrderDetail = order;
  const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
  const pc = PAYMENT_COLORS[o.payment_status] || PAYMENT_COLORS.unpaid;

  const handleStatusUpdate = (status: OrderStatus) => {
    Alert.alert("Update Status", `Change status to "${status}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: () => {
          updateStatus.mutate({ id: o.id, status });
          setShowStatusPicker(false);
        },
      },
    ]);
  };

  const handlePaymentUpdate = (payment_status: PaymentStatus) => {
    Alert.alert(
      "Update Payment",
      `Mark payment as "${payment_status.replace("_", " ")}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: () => {
            updatePayment.mutate({ id: o.id, payment_status });
            setShowPaymentPicker(false);
          },
        },
      ],
    );
  };

  const handleCreateInvoice = () => {
    Alert.alert("Create Invoice", "Generate invoice for this order?", [
      { text: "Cancel", style: "cancel" },
      { text: "Create", onPress: () => createInvoice.mutate(o.id) },
    ]);
  };

  const statusIdx = ORDER_FLOW.indexOf(o.status);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        {/* Order Header */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.orderNumber}>{o.order_number}</Text>
            <View style={[styles.badge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.badgeText, { color: sc.text }]}>
                {o.status}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {new Date(o.created_at).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={[styles.badge, { backgroundColor: pc.bg }]}>
              <Text style={[styles.badgeText, { color: pc.text }]}>
                {o.payment_status.replace("_", " ")}
              </Text>
            </View>
            {o.payment_method && (
              <Text style={styles.methodText}>
                {o.payment_method.replace("_", " ")}
              </Text>
            )}
          </View>
        </View>

        {/* Status Timeline */}
        {o.status !== "cancelled" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Progress</Text>
            <View style={styles.timeline}>
              {ORDER_FLOW.map((s, i) => {
                const isCompleted = i <= statusIdx;
                const isActive = i === statusIdx;
                return (
                  <View key={s} style={styles.timelineStep}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotDone,
                        isActive && styles.timelineDotActive,
                      ]}
                    />
                    {i < ORDER_FLOW.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          i < statusIdx && styles.timelineLineDone,
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelDone,
                      ]}>
                      {s}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Customer */}
        {o.customer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.customerName}>{o.customer.name}</Text>
            {o.customer.email && (
              <Text style={styles.metaText}>{o.customer.email}</Text>
            )}
            {o.customer.phone && (
              <Text style={styles.metaText}>{o.customer.phone}</Text>
            )}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({o.items.length})</Text>
          {o.items.map((item: OrderItem) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQty}>
                  Qty: {item.quantity} × ₦{formatCurrency(item.price)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ₦{formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {o.shipping_address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shipping Address</Text>
            <Text style={styles.metaText}>
              {o.shipping_address.first_name} {o.shipping_address.last_name}
            </Text>
            <Text style={styles.metaText}>
              {o.shipping_address.address_line_1}
            </Text>
            {o.shipping_address.address_line_2 && (
              <Text style={styles.metaText}>
                {o.shipping_address.address_line_2}
              </Text>
            )}
            <Text style={styles.metaText}>
              {o.shipping_address.city}, {o.shipping_address.state}{" "}
              {o.shipping_address.postal_code || ""}
            </Text>
            <Text style={styles.metaText}>{o.shipping_address.country}</Text>
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              ₦{formatCurrency(o.subtotal)}
            </Text>
          </View>
          {o.tax_amount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>
                ₦{formatCurrency(o.tax_amount)}
              </Text>
            </View>
          )}
          {o.shipping_amount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              <Text style={styles.priceValue}>
                ₦{formatCurrency(o.shipping_amount)}
              </Text>
            </View>
          )}
          {o.discount_amount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: "#10b981" }]}>
                -₦{formatCurrency(o.discount_amount)}
              </Text>
            </View>
          )}
          {o.coupon_code && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Coupon</Text>
              <Text style={[styles.priceValue, { color: BRAND_COLORS.gold }]}>
                {o.coupon_code}
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₦{formatCurrency(o.total_amount)}
            </Text>
          </View>
        </View>

        {/* Voucher */}
        {o.voucher && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invoice</Text>
            <Text style={styles.metaText}>
              #{o.voucher.voucher_number} — ₦
              {formatCurrency(o.voucher.total_amount)}
            </Text>
          </View>
        )}

        {/* Notes */}
        {(o.notes || o.admin_notes) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            {o.notes && (
              <Text style={styles.metaText}>Customer: {o.notes}</Text>
            )}
            {o.admin_notes && (
              <Text style={[styles.metaText, { marginTop: 4 }]}>
                Admin: {o.admin_notes}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              o.status === "delivered" && styles.actionBtnDisabled,
            ]}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
            disabled={o.status === "delivered"}>
            <Text
              style={[
                styles.actionBtnText,
                o.status === "delivered" && styles.actionBtnTextDisabled,
              ]}>
              {o.status === "delivered"
                ? "Order Delivered (No Updates)"
                : "Update Order Status"}
            </Text>
          </TouchableOpacity>
          {showStatusPicker && o.status !== "delivered" && (
            <View style={styles.pickerList}>
              {ORDER_FLOW.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.pickerOption,
                    s === o.status && styles.pickerOptionActive,
                  ]}
                  onPress={() => handleStatusUpdate(s)}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      s === o.status && styles.pickerOptionTextActive,
                    ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.pickerOption, { backgroundColor: "#fee2e2" }]}
                onPress={() => handleStatusUpdate("cancelled")}>
                <Text style={[styles.pickerOptionText, { color: "#991b1b" }]}>
                  cancelled
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { marginTop: 10 },
              o.payment_status === "paid" && styles.actionBtnDisabled,
            ]}
            onPress={() => setShowPaymentPicker(!showPaymentPicker)}
            disabled={o.payment_status === "paid"}>
            <Text
              style={[
                styles.actionBtnText,
                o.payment_status === "paid" && styles.actionBtnTextDisabled,
              ]}>
              {o.payment_status === "paid"
                ? "Payment Completed (No Updates)"
                : "Update Payment Status"}
            </Text>
          </TouchableOpacity>
          {showPaymentPicker && o.payment_status !== "paid" && (
            <View style={styles.pickerList}>
              {PAYMENT_OPTIONS.map((ps) => (
                <TouchableOpacity
                  key={ps}
                  style={[
                    styles.pickerOption,
                    ps === o.payment_status && styles.pickerOptionActive,
                  ]}
                  onPress={() => handlePaymentUpdate(ps)}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      ps === o.payment_status && styles.pickerOptionTextActive,
                    ]}>
                    {ps.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!o.voucher && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.invoiceBtn]}
              onPress={handleCreateInvoice}>
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                Create Invoice
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 60 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 60 },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  dateText: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  methodText: { fontSize: 13, color: "#6b7280", textTransform: "capitalize" },
  /* Timeline */
  timeline: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  timelineStep: { flex: 1, alignItems: "center", position: "relative" },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#e5e7eb",
    zIndex: 1,
  },
  timelineDotDone: { backgroundColor: BRAND_COLORS.darkPurple },
  timelineDotActive: {
    backgroundColor: BRAND_COLORS.gold,
    borderWidth: 2,
    borderColor: BRAND_COLORS.darkPurple,
  },
  timelineLine: {
    position: "absolute",
    top: 6,
    left: "57%",
    right: "-43%",
    height: 2,
    backgroundColor: "#e5e7eb",
  },
  timelineLineDone: { backgroundColor: BRAND_COLORS.darkPurple },
  timelineLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 4,
    textTransform: "capitalize",
    textAlign: "center",
  },
  timelineLabelDone: { color: BRAND_COLORS.darkPurple, fontWeight: "600" },
  /* Customer */
  customerName: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  metaText: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  /* Items */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  itemQty: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  itemTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  /* Price */
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  priceLabel: { fontSize: 14, color: "#6b7280" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 6,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  /* Actions */
  actionBtn: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  actionBtnDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  actionBtnTextDisabled: {
    color: "#9ca3af",
  },
  invoiceBtn: { backgroundColor: BRAND_COLORS.gold, marginTop: 10 },
  pickerList: { gap: 4, marginTop: 8 },
  pickerOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  pickerOptionActive: { backgroundColor: BRAND_COLORS.darkPurple },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    textTransform: "capitalize",
  },
  pickerOptionTextActive: { color: "#fff" },
});
