import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

export default function RevenueCard() {
  return (
    <LinearGradient
      colors={["#10b981", "#059669"]}
      style={styles.revenueCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={styles.revenueContent}>
        <View>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>₦12,458,750</Text>
          <Text style={styles.revenueSubtitle}>This month</Text>
        </View>
        <View style={styles.revenueStats}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>+24%</Text>
            <Text style={styles.miniStatLabel}>vs last month</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  revenueCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  revenueContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
    fontWeight: "600",
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  revenueSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  revenueStats: {
    alignItems: "flex-end",
  },
  miniStat: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.9)",
  },
});
