import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

export default function InventoryOverview() {
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
          <Text style={styles.overviewValue}>456</Text>
          <Text style={styles.overviewSubtext}>In inventory</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>In Stock</Text>
          <Text style={styles.overviewValue}>428</Text>
          <Text style={styles.overviewSubtext}>Available items</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#f59e0b", "#d97706"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Low Stock</Text>
          <Text style={styles.overviewValue}>18</Text>
          <Text style={styles.overviewSubtext}>Need reorder</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#ef4444", "#dc2626"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Out of Stock</Text>
          <Text style={styles.overviewValue}>10</Text>
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
