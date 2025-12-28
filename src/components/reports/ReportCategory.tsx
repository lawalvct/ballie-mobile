import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

interface ReportItem {
  name: string;
  icon: string;
}

interface ReportCategoryProps {
  title: string;
  subtitle: string;
  reports: ReportItem[];
  iconColor: string;
}

export default function ReportCategory({
  title,
  subtitle,
  reports,
  iconColor,
}: ReportCategoryProps) {
  return (
    <View style={styles.section}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categorySubtitle}>{subtitle}</Text>
      </View>

      {reports.map((report, index) => (
        <TouchableOpacity key={index} style={styles.reportCard}>
          <View style={[styles.reportIcon, { backgroundColor: iconColor }]}>
            <Text style={styles.reportEmoji}>{report.icon}</Text>
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportName}>{report.name}</Text>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryHeader: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportEmoji: {
    fontSize: 20,
  },
  reportContent: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  reportArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
