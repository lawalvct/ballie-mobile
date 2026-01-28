import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../navigation/types";

export default function PayrollReportsSection() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PayrollStackParamList>>();

  const reports = [
    {
      icon: "📄",
      title: "Announcement",
      description: "Send payroll notifications to employees",
      route: "PayrollAnnouncementsHome" as keyof PayrollStackParamList,
    },
    {
      icon: "📋",
      title: "Payslip",
      description: "Generate and distribute payslips",
    },
    {
      icon: "🏦",
      title: "Bank File",
      description: "Export bank transfer files",
    },
    {
      icon: "📊",
      title: "Tax Report",
      description: "Generate tax compliance reports",
    },
    {
      icon: "⚙️",
      title: "Payroll Settings",
      description: "Configure payroll preferences",
      route: "PayrollSettings" as keyof PayrollStackParamList,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Reports & Settings</Text>

      <View style={styles.grid}>
        {reports.map((report, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => {
              if (report.route) {
                navigation.navigate(report.route);
              }
            }}>
            <Text style={styles.icon}>{report.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{report.title}</Text>
              <Text style={styles.cardDescription}>{report.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  arrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
