import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

const recentMovements = [
  {
    id: 1,
    product: "iPhone 14 Pro",
    type: "in",
    qty: 20,
    date: "Today, 2:30 PM",
  },
  {
    id: 2,
    product: "Samsung Galaxy S23",
    type: "out",
    qty: 5,
    date: "Today, 11:45 AM",
  },
  {
    id: 3,
    product: "Dell XPS 15",
    type: "in",
    qty: 10,
    date: "Yesterday, 4:20 PM",
  },
];

export default function StockManagement() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stock Management</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.menuCard}>
        <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.menuEmoji}>📥</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Stock In</Text>
          <Text style={styles.menuSubtitle}>Add stock to inventory</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <View style={[styles.menuIcon, { backgroundColor: "#fee2e2" }]}>
          <Text style={styles.menuEmoji}>📤</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Stock Out</Text>
          <Text style={styles.menuSubtitle}>Remove stock from inventory</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <View style={[styles.menuIcon, { backgroundColor: "#fef3c7" }]}>
          <Text style={styles.menuEmoji}>🔄</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Stock Transfer</Text>
          <Text style={styles.menuSubtitle}>Move stock between locations</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.movementsSection}>
        <Text style={styles.movementsTitle}>Recent Movements</Text>
        {recentMovements.map((movement) => (
          <View key={movement.id} style={styles.movementCard}>
            <View
              style={[
                styles.movementIcon,
                {
                  backgroundColor:
                    movement.type === "in" ? "#d1fae5" : "#fee2e2",
                },
              ]}>
              <Text style={styles.movementEmoji}>
                {movement.type === "in" ? "📥" : "📤"}
              </Text>
            </View>
            <View style={styles.movementInfo}>
              <Text style={styles.movementProduct}>{movement.product}</Text>
              <Text style={styles.movementDate}>{movement.date}</Text>
            </View>
            <View
              style={[
                styles.movementQty,
                {
                  backgroundColor:
                    movement.type === "in" ? "#d1fae5" : "#fee2e2",
                },
              ]}>
              <Text
                style={[
                  styles.movementQtyText,
                  { color: movement.type === "in" ? "#059669" : "#dc2626" },
                ]}>
                {movement.type === "in" ? "+" : "-"}
                {movement.qty}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
  movementsSection: {
    marginTop: 20,
  },
  movementsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  movementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  movementEmoji: {
    fontSize: 20,
  },
  movementInfo: {
    flex: 1,
  },
  movementProduct: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  movementDate: {
    fontSize: 11,
    color: "#6b7280",
  },
  movementQty: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  movementQtyText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
