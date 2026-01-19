import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import { Statistics } from "../types";

interface VoucherTypeStatsProps {
  statistics: Statistics | null;
}

export default function VoucherTypeStats({
  statistics,
}: VoucherTypeStatsProps) {
  if (!statistics) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        {/* Total Types */}
        <View style={[styles.statCard, { backgroundColor: "#3b82f6" }]}>
          <Text style={styles.statValue}>{statistics.total}</Text>
          <Text style={styles.statLabel}>Total Types</Text>
        </View>

        {/* Active Types */}
        <View style={[styles.statCard, { backgroundColor: "#10b981" }]}>
          <Text style={styles.statValue}>{statistics.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        {/* System Types */}
        <View style={[styles.statCard, { backgroundColor: "#8b5cf6" }]}>
          <Text style={styles.statValue}>{statistics.system_defined}</Text>
          <Text style={styles.statLabel}>System</Text>
        </View>

        {/* Custom Types */}
        <View style={[styles.statCard, { backgroundColor: "#f59e0b" }]}>
          <Text style={styles.statValue}>{statistics.custom}</Text>
          <Text style={styles.statLabel}>Custom</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  statCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
