import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { Statistics } from "../types";

interface InvoiceStatsProps {
  statistics: Statistics | null;
  type: "sales" | "purchase";
}

const formatAmount = (value: number) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₦${(value / 1000).toFixed(1)}K`;
  }
  return `₦${value.toLocaleString()}`;
};

export default function InvoiceStats({ statistics, type }: InvoiceStatsProps) {
  if (!statistics) return null;

  const totalAmount =
    type === "sales"
      ? statistics.total_sales_amount
      : statistics.total_purchase_amount;

  const stats = [
    {
      label: "Total",
      value: statistics.total_invoices,
      gradient: ["#667eea", "#764ba2"] as [string, string],
      icon: "📊",
    },
    {
      label: "Draft",
      value: statistics.draft_invoices,
      gradient: ["#f093fb", "#f5576c"] as [string, string],
      icon: "📝",
    },
    {
      label: "Posted",
      value: statistics.posted_invoices,
      gradient: ["#4facfe", "#00f2fe"] as [string, string],
      icon: "✅",
    },
    {
      label: type === "sales" ? "Sales" : "Purchases",
      value: formatAmount(totalAmount),
      gradient: ["#43e97b", "#38f9d7"] as [string, string],
      icon: "💰",
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <LinearGradient
          key={index}
          colors={stat.gradient}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statIcon}>{stat.icon}</Text>
          <Text style={styles.statValue}>
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
          </Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
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
    marginTop: 20,
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});
