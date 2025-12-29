import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../../../../theme/colors";

export default function AccountGroupStats() {
  const stats = [
    { label: "Total Groups", value: "46", gradient: ["#3b82f6", "#2563eb"] },
    { label: "Active Groups", value: "42", gradient: ["#10b981", "#059669"] },
    { label: "Parent Groups", value: "15", gradient: ["#f59e0b", "#d97706"] },
    { label: "Child Groups", value: "63", gradient: ["#8b5cf6", "#7c3aed"] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statWrapper}>
            <LinearGradient colors={stat.gradient} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  statWrapper: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statCard: {
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
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
  },
});
