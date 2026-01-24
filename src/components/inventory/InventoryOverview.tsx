import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";
import { productService } from "../../features/inventory/product/services/productService";
import type { ListResponse } from "../../features/inventory/product/types";

export default function InventoryOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const response = (await productService.list({
        per_page: 1,
      })) as ListResponse["data"];
      const statistics = response?.statistics || null;
      const total =
        typeof statistics?.total_products === "number"
          ? statistics.total_products
          : response?.pagination?.total || 0;
      const low =
        typeof statistics?.low_stock_count === "number"
          ? statistics.low_stock_count
          : 0;
      const out =
        typeof statistics?.out_of_stock_count === "number"
          ? statistics.out_of_stock_count
          : 0;
      const inStock = Math.max(0, total - low - out);

      setStats({
        totalProducts: total,
        inStock,
        lowStock: low,
        outOfStock: out,
      });
    } catch {
      setStats({
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
      });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Inventory Overview</Text>

      <View style={styles.overviewGrid}>
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Total Products</Text>
          <Text style={styles.overviewValue}>{stats.totalProducts}</Text>
          <Text style={styles.overviewSubtext}>In inventory</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>In Stock</Text>
          <Text style={styles.overviewValue}>{stats.inStock}</Text>
          <Text style={styles.overviewSubtext}>Available items</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#f59e0b", "#d97706"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Low Stock</Text>
          <Text style={styles.overviewValue}>{stats.lowStock}</Text>
          <Text style={styles.overviewSubtext}>Need reorder</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#ef4444", "#dc2626"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Out of Stock</Text>
          <Text style={styles.overviewValue}>{stats.outOfStock}</Text>
          <Text style={styles.overviewSubtext}>Urgent</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3c2c64",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    minHeight: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  overviewSubtext: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
