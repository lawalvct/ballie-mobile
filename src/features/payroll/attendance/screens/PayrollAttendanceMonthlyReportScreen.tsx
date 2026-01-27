import React, { useEffect, useState } from "react";
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
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { attendanceService } from "../services/attendanceService";
import type { AttendanceMonthlyReportResponse } from "../types";
import { showToast } from "../../../../utils/toast";

const MONTHS = [
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

const getYearOptions = () => {
  const year = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, idx) => year - idx);
};

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAttendanceMonthlyReport"
>;

export default function PayrollAttendanceMonthlyReportScreen({
  navigation,
}: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AttendanceMonthlyReportResponse | null>(
    null,
  );

  useEffect(() => {
    loadReport();
  }, [year, month]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.monthlyReport(year, month);
      setReport(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load report", "error");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={month}
                onValueChange={(value) =>
                  setMonth(typeof value === "number" ? value : month)
                }>
                {MONTHS.map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={year}
                onValueChange={(value) =>
                  setYear(typeof value === "number" ? value : year)
                }>
                {getYearOptions().map((value) => (
                  <Picker.Item key={value} label={`${value}`} value={value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading report...</Text>
          </View>
        ) : !report || report.employees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Data</Text>
            <Text style={styles.emptyText}>
              No attendance report for the selected month.
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {report.employees.map((employee) => (
              <View key={employee.employee_id} style={styles.card}>
                <Text style={styles.cardTitle}>{employee.employee_name}</Text>
                <Text style={styles.cardSubtitle}>
                  {employee.employee_number || ""}
                </Text>
                <Text style={styles.cardMeta}>
                  Department: {employee.department_name || "N/A"}
                </Text>
                <Text style={styles.cardMeta}>
                  Present: {employee.summary.present ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Late: {employee.summary.late ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Absent: {employee.summary.absent ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Leave: {employee.summary.on_leave ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Half Day: {employee.summary.half_day ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Total Hours: {employee.summary.total_hours ?? 0}
                </Text>
                <Text style={styles.cardMeta}>
                  Overtime: {employee.summary.total_overtime ?? 0}
                </Text>
              </View>
            ))}
          </View>
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
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
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
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
