import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

const units = [
  { id: 1, name: "Pieces (pcs)", count: 245, icon: "📦" },
  { id: 2, name: "Kilograms (kg)", count: 89, icon: "⚖️" },
  { id: 3, name: "Liters (L)", count: 34, icon: "🥤" },
  { id: 4, name: "Cartons", count: 88, icon: "📦" },
];

export default function UnitsAndReports() {
  return (
    <View style={styles.section}>
      {/* Units Section */}
      <View style={styles.subsection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Units</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Manage →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.unitsGrid}>
          {units.map((unit) => (
            <TouchableOpacity key={unit.id} style={styles.unitCard}>
              <Text style={styles.unitEmoji}>{unit.icon}</Text>
              <Text style={styles.unitName}>{unit.name}</Text>
              <Text style={styles.unitCount}>{unit.count} products</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reports Section */}
      <View style={styles.subsection}>
        <Text style={styles.sectionTitle}>Inventory Reports</Text>

        <TouchableOpacity style={styles.reportCard}>
          <View style={[styles.reportIcon, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.reportEmoji}>📊</Text>
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Stock Valuation Report</Text>
            <Text style={styles.reportSubtitle}>Total value: ₦24.5M</Text>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportCard}>
          <View style={[styles.reportIcon, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.reportEmoji}>📈</Text>
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Stock Movement Report</Text>
            <Text style={styles.reportSubtitle}>Last 30 days activity</Text>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportCard}>
          <View style={[styles.reportIcon, { backgroundColor: "#fee2e2" }]}>
            <Text style={styles.reportEmoji}>⚠️</Text>
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Low Stock Report</Text>
            <Text style={styles.reportSubtitle}>18 items need attention</Text>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportCard}>
          <View style={[styles.reportIcon, { backgroundColor: "#e0e7ff" }]}>
            <Text style={styles.reportEmoji}>🔍</Text>
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Inventory Aging Report</Text>
            <Text style={styles.reportSubtitle}>Track slow-moving items</Text>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  subsection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  unitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  unitCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unitEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  unitName: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  unitCount: {
    fontSize: 11,
    color: "#6b7280",
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportEmoji: {
    fontSize: 24,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  reportArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
