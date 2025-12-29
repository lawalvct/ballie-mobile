import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../../../../theme/colors";
import { Statistics } from "../types";

interface LedgerAccountStatsProps {
  statistics: Statistics | null;
}

export default function LedgerAccountStats({
  statistics,
}: LedgerAccountStatsProps) {
  if (!statistics) return null;

  const stats = [
    {
      label: "Total Accounts",
      value: statistics.total_accounts,
      gradient: ["#8B5CF6", "#6D28D9"],
    },
    {
      label: "Active Accounts",
      value: statistics.active_accounts,
      gradient: ["#10B981", "#059669"],
    },
    {
      label: "With Balance",
      value: statistics.with_balance,
      gradient: ["#F59E0B", "#D97706"],
    },
    {
      label: "Parent Accounts",
      value: statistics.parent_accounts,
      gradient: ["#3B82F6", "#2563EB"],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <LinearGradient
            key={index}
            colors={stat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
