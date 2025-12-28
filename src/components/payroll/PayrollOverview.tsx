import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

export default function PayrollOverview() {
  const stats = [
    {
      label: "Total Employees",
      value: "248",
      subtitle: "Active",
      color1: "#3c2c64",
      color2: "#5a4a7e",
    },
    {
      label: "This Month",
      value: "₦18.5M",
      subtitle: "Total payroll",
      color1: "#10b981",
      color2: "#059669",
    },
    {
      label: "Pending",
      value: "12",
      subtitle: "Approvals",
      color1: "#f59e0b",
      color2: "#d97706",
    },
    {
      label: "Processed",
      value: "236",
      subtitle: "This month",
      color1: "#3b82f6",
      color2: "#2563eb",
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <LinearGradient
          key={index}
          colors={[stat.color1, stat.color2]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
        </LinearGradient>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
