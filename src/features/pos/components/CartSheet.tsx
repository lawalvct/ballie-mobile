import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { BRAND_COLORS } from "../../../theme/colors";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types";

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

function CartItemRow({ item }: { item: CartItem }) {
  const cart = useCart();
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemSku}>{item.sku}</Text>
        <Text style={styles.itemPrice}>
          {formatCurrency(item.unit_price)} × {item.quantity}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>{formatCurrency(item.line_total)}</Text>
        <View style={styles.qtyStepper}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => cart.updateQuantity(item.product_id, item.quantity - 1)}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => cart.updateQuantity(item.product_id, item.quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartSheet({ visible, onClose, onCheckout }: Props) {
  const cart = useCart();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.headerContent}>
              <Text style={styles.sheetTitle}>
                Cart ({cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""})
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Items */}
          <FlatList
            data={cart.items}
            keyExtractor={(item) => `cart-${item.product_id}`}
            renderItem={({ item }) => <CartItemRow item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyCart}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>Cart is empty</Text>
              </View>
            }
          />

          {/* Totals */}
          {cart.items.length > 0 && (
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(cart.subtotal)}</Text>
              </View>
              {cart.totalDiscount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={[styles.totalValue, { color: "#dc2626" }]}>
                    −{formatCurrency(cart.totalDiscount)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatCurrency(cart.totalTax)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(cart.grandTotal)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.clearCartBtn} onPress={cart.clearCart}>
                  <Text style={styles.clearCartText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout} activeOpacity={0.8}>
                  <Text style={styles.checkoutText}>Proceed to Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  sheetHeader: { alignItems: "center", paddingTop: 10 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#d1d5db", marginBottom: 12 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, width: "100%", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  closeText: { fontSize: 20, color: "#9ca3af", padding: 4 },

  listContent: { paddingHorizontal: 20, paddingVertical: 12 },
  separator: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },

  // Item row
  itemRow: { flexDirection: "row", alignItems: "center" },
  itemName: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  itemSku: { fontSize: 12, color: "#9ca3af", marginTop: 1 },
  itemPrice: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  itemRight: { alignItems: "flex-end", marginLeft: 12 },
  itemTotal: { fontSize: 15, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 6 },
  qtyStepper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 8 },
  qtyBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 18, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  qtyValue: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple, paddingHorizontal: 8 },

  // Totals
  totalsSection: { borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 14, fontWeight: "500", color: BRAND_COLORS.darkPurple },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12, marginTop: 4, marginBottom: 16 },
  grandTotalLabel: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  grandTotalValue: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.gold },

  // Actions
  actionRow: { flexDirection: "row", gap: 12 },
  clearCartBtn: { flex: 1, backgroundColor: "#f3f4f6", padding: 14, borderRadius: 12, alignItems: "center" },
  clearCartText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  checkoutBtn: { flex: 2, backgroundColor: BRAND_COLORS.gold, padding: 14, borderRadius: 12, alignItems: "center" },
  checkoutText: { fontSize: 15, fontWeight: "bold", color: "#fff" },

  // Empty
  emptyCart: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
