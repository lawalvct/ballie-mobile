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
import type { AttendanceEmployeeMonthlyResponse } from "../types";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollEmployee } from "../../employee/types";
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
  "PayrollAttendanceEmployee"
>;

export default function PayrollAttendanceEmployeeScreen({ navigation }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [employeeId, setEmployeeId] = useState<number | undefined>();
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] =
    useState<AttendanceEmployeeMonthlyResponse | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadReport();
    }
  }, [employeeId, year, month]);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.list({ per_page: 1000 });
      setEmployees(response.employees || []);
    } catch (_error) {
      // ignore
    }
  };

  const loadReport = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const response = await attendanceService.employeeMonthly(
        employeeId,
        year,
        month,
      );
      setReport(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load employee attendance", "error");
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
        <Text style={styles.headerTitle}>Employee Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(value) =>
                  setEmployeeId(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="Select employee" value={undefined} />
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={
                      emp.full_name || `${emp.first_name} ${emp.last_name}`
                    }
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

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
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        ) : !report ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Select Employee</Text>
            <Text style={styles.emptyText}>
              Choose an employee to view attendance.
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{report.employee.name}</Text>
              <Text style={styles.summarySubtitle}>
                {report.employee.employee_number || ""}
              </Text>
              <Text style={styles.summaryMeta}>
                Department: {report.employee.department_name || "N/A"}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMeta}>
                  Present: {report.summary.present ?? 0}
                </Text>
                <Text style={styles.summaryMeta}>
                  Late: {report.summary.late ?? 0}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMeta}>
                  Absent: {report.summary.absent ?? 0}
                </Text>
                <Text style={styles.summaryMeta}>
                  Leave: {report.summary.on_leave ?? 0}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMeta}>
                  Half Day: {report.summary.half_day ?? 0}
                </Text>
                <Text style={styles.summaryMeta}>
                  Hours: {report.summary.total_hours ?? 0}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Records</Text>
            {report.records.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Records</Text>
                <Text style={styles.emptyText}>
                  No attendance for this month.
                </Text>
              </View>
            ) : (
              report.records.map((item) => (
                <View key={item.attendance_date} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.attendance_date}</Text>
                  <Text style={styles.cardMeta}>Status: {item.status}</Text>
                  <Text style={styles.cardMeta}>
                    Clock In: {item.clock_in || "-"}
                  </Text>
                  <Text style={styles.cardMeta}>
                    Clock Out: {item.clock_out || "-"}
                  </Text>
                </View>
              ))
            )}
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
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  summaryMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
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
