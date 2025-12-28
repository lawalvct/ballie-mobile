import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

export default function ReportsHeader() {
  return (
    <LinearGradient
      colors={["#3c2c64", "#5a4a7e"]}
      style={styles.headerCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <Text style={styles.headerIcon}>📊</Text>
      <Text style={styles.headerTitle}>Business Reports</Text>
      <Text style={styles.headerSubtitle}>
        Generate insights and analytics for your business
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: 24,
    margin: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
});
