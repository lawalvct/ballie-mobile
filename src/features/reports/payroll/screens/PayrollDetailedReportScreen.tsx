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
import type { PayrollDetailedReportResponse } from "../../types";
import { departmentService } from "../../../payroll/department/services/departmentService";
import type { PayrollDepartment } from "../../../payroll/department/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "PayrollDetailedReport"
>;

const MONTH_OPTIONS = [
  { label: "All", value: "" },
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function PayrollDetailedReportScreen({ navigation }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | undefined>();
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PayrollDetailedReportResponse | null>(null);

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - index),
    [currentYear],
  );

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadData();
  }, [year, month, departmentId]);

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
      const response = await reportsService.payrollDetailed({
        year,
        month,
        department_id: departmentId,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load detailed payroll", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Gross",
        value: formatAmount(data?.totals?.gross),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Deductions",
        value: formatAmount(data?.totals?.deductions),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Tax",
        value: formatAmount(data?.totals?.tax),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Net",
        value: formatAmount(data?.totals?.net),
        colors: ["#3B82F6", "#2563EB"] as const,
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
        <Text style={styles.headerTitle}>Detailed Payroll</Text>
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
              <Text style={styles.label}>Month</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={month ?? ""}
                  onValueChange={(value) =>
                    setMonth(value ? Number(value) : undefined)
                  }>
                  {MONTH_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.label}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
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
            <Text style={styles.loadingText}>Loading detailed payroll...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Totals</Text>
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
              <Text style={styles.sectionTitle}>Payroll Records</Text>
              {data?.records?.length ? (
                data.records.map((record) => (
                  <View style={styles.recordCard} key={record.id}>
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
                      Period: {record.period?.name || "-"} • Pay Date:{" "}
                      {record.period?.pay_date || "-"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Gross: {formatAmount(record.gross)} • Net:{" "}
                      {formatAmount(record.net)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Deductions: {formatAmount(record.deductions)} • Tax:{" "}
                      {formatAmount(record.tax)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No payroll records found.</Text>
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
