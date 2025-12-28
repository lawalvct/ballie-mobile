import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function ExportSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Export Data</Text>

      <View style={styles.exportOptions}>
        <TouchableOpacity style={styles.exportCard}>
          <Text style={styles.exportIcon}>📄</Text>
          <Text style={styles.exportLabel}>Export as PDF</Text>
          <Text style={styles.exportDescription}>
            Download audit trail report
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportCard}>
          <Text style={styles.exportIcon}>📊</Text>
          <Text style={styles.exportLabel}>Export as Excel</Text>
          <Text style={styles.exportDescription}>
            Download spreadsheet format
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportCard}>
          <Text style={styles.exportIcon}>📋</Text>
          <Text style={styles.exportLabel}>Export as CSV</Text>
          <Text style={styles.exportDescription}>
            Download comma-separated file
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <LinearGradient
          colors={[BRAND_COLORS.gold, "#c9a854"]}
          style={styles.exportButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.exportButtonText}>📥 Export Selected Format</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  exportOptions: {
    gap: 12,
    marginBottom: 16,
  },
  exportCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  exportLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  exportButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
});
