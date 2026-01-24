import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { InventoryStackParamList } from "../../navigation/types";
import * as stockJournalService from "../../features/inventory/stockjournal/services/stockJournalService";
import type { StockJournalEntry } from "../../features/inventory/stockjournal/types";

type NavigationProp = NativeStackNavigationProp<InventoryStackParamList>;

export default function StockManagement() {
  const navigation = useNavigation<NavigationProp>();
  const [recentMovements, setRecentMovements] = useState<
    Array<{
      id: number;
      label: string;
      type: "in" | "out" | "adjustment" | "transfer";
      qty: number;
      date: string;
    }>
  >([]);

  useEffect(() => {
    loadRecentMovements();
  }, []);

  const mapMovementType = (entry: StockJournalEntry) => {
    switch (entry.entry_type) {
      case "production":
        return "in";
      case "consumption":
        return "out";
      case "transfer":
        return "transfer";
      default:
        return "adjustment";
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return "📥";
      case "out":
        return "📤";
      case "transfer":
        return "🔀";
      default:
        return "🔄";
    }
  };

  const getMovementColors = (type: string) => {
    switch (type) {
      case "in":
        return { bg: "#d1fae5", text: "#059669" };
      case "out":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "transfer":
        return { bg: "#dbeafe", text: "#2563eb" };
      default:
        return { bg: "#fef3c7", text: "#d97706" };
    }
  };

  const loadRecentMovements = async () => {
    try {
      const response = await stockJournalService.list({ per_page: 3, page: 1 });
      const entries = response?.data?.data || [];
      setRecentMovements(
        entries.map((entry: StockJournalEntry) => ({
          id: entry.id,
          label: entry.entry_type_display || entry.entry_type,
          type: mapMovementType(entry),
          qty: entry.total_items || 0,
          date: entry.journal_date,
        })),
      );
    } catch {
      setRecentMovements([]);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stock Management</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("StockJournalHome")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("StockProduction")}>
        <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.menuEmoji}>📥</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Stock In</Text>
          <Text style={styles.menuSubtitle}>Add stock to inventory</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("StockConsumption")}>
        <View style={[styles.menuIcon, { backgroundColor: "#fee2e2" }]}>
          <Text style={styles.menuEmoji}>📤</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Stock Out</Text>
          <Text style={styles.menuSubtitle}>Remove stock from inventory</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("StockTransfer")}>
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
        {recentMovements.length === 0 ? (
          <View style={styles.emptyMovements}>
            <Text style={styles.emptyMovementsText}>
              No recent stock movements
            </Text>
          </View>
        ) : (
          recentMovements.map((movement) => {
            const colors = getMovementColors(movement.type);
            return (
              <View key={movement.id} style={styles.movementCard}>
                <View
                  style={[
                    styles.movementIcon,
                    {
                      backgroundColor: colors.bg,
                    },
                  ]}>
                  <Text style={styles.movementEmoji}>
                    {getMovementIcon(movement.type)}
                  </Text>
                </View>
                <View style={styles.movementInfo}>
                  <Text style={styles.movementProduct}>{movement.label}</Text>
                  <Text style={styles.movementDate}>{movement.date}</Text>
                </View>
                <View
                  style={[
                    styles.movementQty,
                    {
                      backgroundColor: colors.bg,
                    },
                  ]}>
                  <Text
                    style={[styles.movementQtyText, { color: colors.text }]}>
                    {movement.type === "out" ? "-" : "+"}
                    {movement.qty}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
  emptyMovements: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyMovementsText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
