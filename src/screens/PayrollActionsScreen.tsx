import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import type { PayrollStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<
  PayrollStackParamList,
  "PayrollActions"
>;

type ActionCard = {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  route?: keyof PayrollStackParamList;
};

type ActionSection = {
  title: string;
  icon: string;
  color: string;
  cards: ActionCard[];
};

const SECTIONS: ActionSection[] = [
  {
    title: "Employee Management",
    icon: "👥",
    color: "#3b82f6",
    cards: [
      {
        title: "Add Employee",
        subtitle: "Create new employee",
        description: "Create new employee records with salary details.",
        color: "#3b82f6",
        accent: "#2563eb",
        icon: "➕",
        route: "PayrollEmployeeCreate",
      },
      {
        title: "All Employees",
        subtitle: "Manage employees",
        description: "View and manage all employee records and details.",
        color: "#10b981",
        accent: "#059669",
        icon: "📋",
        route: "PayrollEmployeeHome",
      },
      {
        title: "Departments",
        subtitle: "Manage departments",
        description: "Organize employees into departments and teams.",
        color: "#8b5cf6",
        accent: "#7c3aed",
        icon: "🏢",
        route: "PayrollDepartmentHome",
      },
      {
        title: "Positions",
        subtitle: "Manage positions",
        description: "Define job positions and hierarchies.",
        color: "#f59e0b",
        accent: "#d97706",
        icon: "💼",
        route: "PayrollPositionHome",
      },
      {
        title: "Salary Components",
        subtitle: "Manage components",
        description: "Configure allowances, deductions, and benefits.",
        color: "#ec4899",
        accent: "#db2777",
        icon: "📊",
        route: "PayrollSalaryComponentHome",
      },
      {
        title: "Shift Management",
        subtitle: "Work schedules",
        description: "Create and manage employee shift schedules.",
        color: "#06b6d4",
        accent: "#0891b2",
        icon: "🗓️",
        route: "PayrollShiftHome",
      },
    ],
  },
  {
    title: "Payroll Processing",
    icon: "💰",
    color: "#10b981",
    cards: [
      {
        title: "Process Payroll",
        subtitle: "Run new payroll",
        description: "Calculate and process current period payroll.",
        color: "#10b981",
        accent: "#059669",
        icon: "⚙️",
        route: "PayrollProcessingCreate",
      },
      {
        title: "Payroll History",
        subtitle: "View past payrolls",
        description: "Review completed and pending payroll runs.",
        color: "#6366f1",
        accent: "#4f46e5",
        icon: "🧾",
        route: "PayrollProcessingHome",
      },
      {
        title: "Attendance",
        subtitle: "Track attendance",
        description: "Manage employee attendance and time tracking.",
        color: "#f97316",
        accent: "#ea580c",
        icon: "⏱️",
        route: "PayrollAttendanceHome",
      },
      {
        title: "Overtime",
        subtitle: "Extra hours",
        description: "Manage overtime hours and calculations.",
        color: "#ef4444",
        accent: "#dc2626",
        icon: "⏰",
        route: "PayrollOvertimeHome",
      },
      {
        title: "Salary Advance",
        subtitle: "IOU / Staff Loans",
        description: "Issue salary advances and manage loan repayments.",
        color: "#8b5cf6",
        accent: "#7c3aed",
        icon: "💳",
        route: "PayrollSalaryAdvance",
      },
      {
        title: "Announcements",
        subtitle: "Email & SMS",
        description: "Send notifications to employees via email or SMS.",
        color: "#0ea5e9",
        accent: "#0284c7",
        icon: "📣",
        route: "PayrollAnnouncementsHome",
      },
    ],
  },
  {
    title: "Payroll Reports",
    icon: "📈",
    color: "#f97316",
    cards: [
      {
        title: "Tax Reports",
        subtitle: "Tax compliance",
        description: "Generate comprehensive tax reports and analytics.",
        color: "#f97316",
        accent: "#ea580c",
        icon: "🧾",
      },
      {
        title: "Payslips",
        subtitle: "Salary statements",
        description: "Generate and view employee payslips.",
        color: "#14b8a6",
        accent: "#0d9488",
        icon: "💵",
      },
      {
        title: "Bank Files",
        subtitle: "Banking integration",
        description: "Export bank transfer files for payroll.",
        color: "#6366f1",
        accent: "#4f46e5",
        icon: "🏦",
      },
      {
        title: "Analytics",
        subtitle: "Insights & trends",
        description: "View payroll analytics and cost trends.",
        color: "#06b6d4",
        accent: "#0891b2",
        icon: "📊",
      },
    ],
  },
  {
    title: "Settings",
    icon: "⚙️",
    color: "#eab308",
    cards: [
      {
        title: "Payroll Settings",
        subtitle: "Configure payroll",
        description: "Configure employee number format and other settings.",
        color: "#eab308",
        accent: "#ca8a04",
        icon: "🛠️",
        route: "PayrollSettings",
      },
    ],
  },
];

export default function PayrollActionsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            All Payroll Actions
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View style={styles.section} key={section.title}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: section.color },
                ]}>
                <Text style={styles.sectionIconText}>{section.icon}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.cardsGrid}>
              {section.cards.map((card) => (
                <TouchableOpacity
                  key={card.title}
                  style={[styles.actionCard, { backgroundColor: card.color }]}
                  onPress={() => {
                    if (card.route) {
                      navigation.navigate(card.route as any);
                    }
                  }}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: card.accent },
                    ]}>
                    <Text style={styles.cardIcon}>{card.icon}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: "rgba(164,212,255,0.85)",
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(164,212,255,0.85)",
    marginLeft: 2,
  },
  headerMid: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    backgroundColor: "#f3f4f8",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  actionCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardDescription: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
  },
});
