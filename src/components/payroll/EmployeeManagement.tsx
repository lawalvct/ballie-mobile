import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { PayrollStackParamList } from "../../navigation/types";

export default function EmployeeManagement() {
  const navigation = useNavigation<
    NativeStackNavigationProp<PayrollStackParamList>
  >();

  const sections = [
    {
      icon: "👥",
      title: "Employment",
      description: "Manage employee records and contracts",
      count: "248 employees",
    },
    {
      icon: "🏢",
      title: "Departments",
      description: "Organize by department structure",
      count: "12 departments",
    },
    {
      icon: "💼",
      title: "Positions",
      description: "Define job roles and titles",
      count: "45 positions",
    },
    {
      icon: "📊",
      title: "Salary Components",
      description: "Configure pay items and deductions",
      count: "18 components",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Employee Management</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("PayrollActions")}
          activeOpacity={0.7}>
          <Text style={styles.moreActions}>More Actions →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {sections.map((section, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <Text style={styles.icon}>{section.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
              <Text style={styles.cardCount}>{section.count}</Text>
            </View>
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  moreActions: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
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
    fontSize: 32,
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
    marginBottom: 6,
  },
  cardCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
});
