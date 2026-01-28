import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";
import { employeeService } from "../../features/payroll/employee/services/employeeService";
import { overtimeService } from "../../features/payroll/overtime/services/overtimeService";
import { payrollProcessingService } from "../../features/payroll/processing/services/processingService";
import type { PayrollProcessingPeriod } from "../../features/payroll/processing/types";
import { showToast } from "../../utils/toast";

export default function PayrollOverview() {
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [payrollAmount, setPayrollAmount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const parseNumber = (value?: string | number) => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (value: number) =>
    `₦${new Intl.NumberFormat("en-US").format(value)}`;

  const loadStats = async () => {
    try {
      const [employeesRes, overtimeRes, processingRes, completedRes] =
        await Promise.all([
          employeeService.list({ per_page: 1 }),
          overtimeService.list({ status: "pending", per_page: 1 }),
          payrollProcessingService.list({ per_page: 1 }),
          payrollProcessingService.list({ status: "completed", per_page: 1 }),
        ]);

      setEmployeeTotal(employeesRes.pagination?.total ?? 0);
      setPendingApprovals(overtimeRes.summary?.pending_count ?? 0);

      const latestPeriod =
        (processingRes.periods?.[0] as PayrollProcessingPeriod | undefined) ??
        undefined;
      const periodAmount = parseNumber(
        latestPeriod?.total_net ?? latestPeriod?.total_gross,
      );
      setPayrollAmount(periodAmount);

      const processedFromPeriod = latestPeriod?.payroll_runs_count ?? 0;
      const processedFromTotal =
        completedRes.pagination?.total ?? latestPeriod?.payroll_runs_count ?? 0;
      setProcessedCount(processedFromPeriod || processedFromTotal || 0);
    } catch (error: any) {
      showToast(error.message || "Failed to load payroll overview", "error");
    }
  };

  const stats = [
    {
      label: "Total Employees",
      value: String(employeeTotal),
      subtitle: "Active",
      color1: "#3c2c64",
      color2: "#5a4a7e",
    },
    {
      label: "This Month",
      value: formatCurrency(payrollAmount),
      subtitle: "Total payroll",
      color1: "#10b981",
      color2: "#059669",
    },
    {
      label: "Pending",
      value: String(pendingApprovals),
      subtitle: "Approvals",
      color1: "#f59e0b",
      color2: "#d97706",
    },
    {
      label: "Processed",
      value: String(processedCount),
      subtitle: "This month",
      color1: "#3b82f6",
      color2: "#2563eb",
    },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>Payroll Overview</Text>
      <View style={styles.container}>
        {stats.map((stat, index) => (
          <LinearGradient
            key={index}
            colors={[stat.color1, stat.color2]}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    color: SEMANTIC_COLORS.text.primary,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    width: "48%",
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
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
