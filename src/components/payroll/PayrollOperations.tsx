import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function PayrollOperations() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payroll Operations</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>⏰</Text>
          <Text style={styles.cardTitle}>Shift Management</Text>
          <Text style={styles.cardDescription}>
            Configure work schedules and shifts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Attendance</Text>
          <Text style={styles.cardDescription}>Track employee attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>🕐</Text>
          <Text style={styles.cardTitle}>Overtime</Text>
          <Text style={styles.cardDescription}>Manage overtime hours</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>💰</Text>
          <Text style={styles.cardTitle}>Salary Advance</Text>
          <Text style={styles.cardDescription}>Process advance payments</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <LinearGradient
          colors={[BRAND_COLORS.gold, "#c9a854"]}
          style={styles.processButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.processButtonText}>⚙️ Process Payroll</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 16,
  },
  processButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
});
