import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { overtimeService } from "../services/overtimeService";
import type { OvertimeMonthlyReportResponse } from "../types";
import { departmentService } from "../../department/services/departmentService";
import type { PayrollDepartment } from "../../department/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollOvertimeMonthlyReport"
>;

const months = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2000, i).toLocaleString("en-US", { month: "long" }),
  value: i + 1,
}));

const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const formatAmount = (value?: number) => {
  if (typeof value !== "number") return "0";
  return new Intl.NumberFormat("en-US").format(value);
};

export default function PayrollOvertimeMonthlyReportScreen({
  navigation,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<OvertimeMonthlyReportResponse | null>(
    null,
  );
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadReport();
  }, [month, year, selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.list({ per_page: 1000 });
      setDepartments(response.departments || []);
    } catch (_error) {
      // ignore
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await overtimeService.monthlyReport(
        year,
        month,
        selectedDepartment,
      );
      setReport(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load report", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Employees",
        value: report?.summary?.total_employees ?? 0,
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Records",
        value: report?.summary?.total_records ?? 0,
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Hours",
        value: report?.summary?.total_hours ?? 0,
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Total Amount",
        value: report?.summary?.total_amount ?? 0,
        colors: ["#F59E0B", "#D97706"] as const,
      },
    ],
    [report],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Overtime Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Month</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={month}
                  onValueChange={(value) => setMonth(value)}>
                  {months.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Year</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={year}
                  onValueChange={(value) => setYear(value)}>
                  {years.map((item) => (
                    <Picker.Item key={item} label={String(item)} value={item} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDepartment}
                onValueChange={(value) => setSelectedDepartment(value)}>
                <Picker.Item label="All Departments" value={undefined} />
                {departments.map((dept) => (
                  <Picker.Item
                    key={dept.id}
                    label={dept.name}
                    value={dept.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            {summaryCards.map((stat) => (
              <LinearGradient
                key={stat.label}
                colors={stat.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stat.label === "Total Amount"
                    ? formatAmount(Number(stat.value))
                    : stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Employees</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
              <Text style={styles.loadingText}>Loading report...</Text>
            </View>
          ) : report?.employees?.length ? (
            report.employees.map((item) => (
              <View style={styles.recordCard} key={item.employee.id}>
                <Text style={styles.recordTitle}>{item.employee.name}</Text>
                <Text style={styles.recordSubtext}>
                  {item.employee.department_name || "Department"} •{" "}
                  {item.employee.employee_number || ""}
                </Text>
                <Text style={styles.recordSubtext}>
                  Records: {item.record_count ?? 0} • Hours:{" "}
                  {item.total_hours ?? 0}
                </Text>
                <Text style={styles.recordSubtext}>
                  Amount: {formatAmount(item.total_amount)} • Paid:{" "}
                  {formatAmount(item.paid_amount)} • Unpaid:{" "}
                  {formatAmount(item.unpaid_amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Report Data</Text>
              <Text style={styles.emptyText}>Try another filter</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  formGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  recordSubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});
