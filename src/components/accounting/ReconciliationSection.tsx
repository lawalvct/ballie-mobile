import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function ReconciliationSection() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reconciliation</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reconCard}>
        <View style={styles.reconLeft}>
          <View style={[styles.reconIcon, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.reconEmoji}>⚠️</Text>
          </View>
          <View>
            <Text style={styles.reconTitle}>Access Bank - Dec 2025</Text>
            <Text style={styles.reconStatus}>8 unreconciled transactions</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reconButton}>
          <Text style={styles.reconButtonText}>Reconcile</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.reconCard}>
        <View style={styles.reconLeft}>
          <View style={[styles.reconIcon, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.reconEmoji}>✅</Text>
          </View>
          <View>
            <Text style={styles.reconTitle}>GTBank - Nov 2025</Text>
            <Text style={[styles.reconStatus, { color: "#10b981" }]}>
              Fully reconciled
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.reconButton, { backgroundColor: "#f3f4f6" }]}>
          <Text style={[styles.reconButtonText, { color: "#6b7280" }]}>
            View
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
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
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  reconCard: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  reconLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reconIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reconEmoji: {
    fontSize: 20,
  },
  reconTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  reconStatus: {
    fontSize: 12,
    color: "#f59e0b",
  },
  reconButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.blue,
  },
  reconButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
});
