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
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { PayrollEmployeeSummaryReportResponse } from "../../types";
import { departmentService } from "../../../payroll/department/services/departmentService";
import type { PayrollDepartment } from "../../../payroll/department/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "PayrollEmployeeSummaryReport"
>;

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function PayrollEmployeeSummaryReportScreen({
  navigation,
}: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PayrollEmployeeSummaryReportResponse | null>(
    null,
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - index),
    [currentYear],
  );

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadData();
  }, [year, departmentId]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.list({ per_page: 1000 });
      setDepartments(response.departments || []);
    } catch (_error) {
      setDepartments([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.payrollEmployeeSummary({
        year,
        department_id: departmentId,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load employee summary", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Employees",
        value: String(data?.summary?.total_employees ?? 0),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Total Gross",
        value: formatAmount(data?.summary?.total_gross),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Deductions",
        value: formatAmount(data?.summary?.total_deductions),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Tax",
        value: formatAmount(data?.summary?.total_tax),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Total Net",
        value: formatAmount(data?.summary?.total_net),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
    ],
    [data],
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
        <Text style={styles.headerTitle}>Employee Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Year</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={year} onValueChange={setYear}>
                  {yearOptions.map((value) => (
                    <Picker.Item
                      key={value}
                      label={String(value)}
                      value={value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Department</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={departmentId ?? ""}
                  onValueChange={(value) =>
                    setDepartmentId(value ? Number(value) : undefined)
                  }>
                  <Picker.Item label="All Departments" value="" />
                  {departments.map((department) => (
                    <Picker.Item
                      key={department.id}
                      label={department.name}
                      value={department.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading employee summary...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                {summaryCards.map((stat) => (
                  <LinearGradient
                    key={stat.label}
                    colors={stat.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statCard}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Employees</Text>
              {data?.records?.length ? (
                data.records.map((record, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${record.employee?.id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {record.employee?.name || "Employee"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {record.employee?.employee_number || ""}
                      {record.employee?.department
                        ? ` • ${record.employee.department}`
                        : ""}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Payroll Runs: {record.payroll_count ?? 0}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Gross: {formatAmount(record.total_gross)} • Net:{" "}
                      {formatAmount(record.total_net)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Deductions: {formatAmount(record.total_deductions)} • Tax:{" "}
                      {formatAmount(record.total_tax)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Avg Gross: {formatAmount(record.average_gross)} • Avg Net:{" "}
                      {formatAmount(record.average_net)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No employee records.</Text>
              )}
            </View>
          </>
        )}

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
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
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
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textAlign: "center",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  recordSubtext: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
