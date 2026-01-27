import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { attendanceService } from "../services/attendanceService";
import type {
  AttendanceDailyResponse,
  AttendanceRecord,
  AttendanceStats,
  AttendanceStatus,
} from "../types";
import { departmentService } from "../../department/services/departmentService";
import { employeeService } from "../../employee/services/employeeService";
import { shiftService } from "../../shift/services/shiftService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollEmployee } from "../../employee/types";
import type { PayrollShift } from "../../shift/types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAttendanceHome"
>;

const STATUS_OPTIONS: { label: string; value?: AttendanceStatus }[] = [
  { label: "All Status", value: undefined },
  { label: "Present", value: "present" },
  { label: "Late", value: "late" },
  { label: "Absent", value: "absent" },
  { label: "Half Day", value: "half_day" },
  { label: "On Leave", value: "on_leave" },
  { label: "Weekend", value: "weekend" },
  { label: "Holiday", value: "holiday" },
];

const QUICK_ACTIONS: Array<{
  label: string;
  icon: string;
  route: keyof PayrollStackParamList;
}> = [
  { label: "Clock In", icon: "⏱️", route: "PayrollAttendanceClockIn" },
  { label: "Clock Out", icon: "⏰", route: "PayrollAttendanceClockOut" },
  { label: "Mark Absent", icon: "🚫", route: "PayrollAttendanceMarkAbsent" },
  { label: "Mark Leave", icon: "🌴", route: "PayrollAttendanceMarkLeave" },
  { label: "Manual Entry", icon: "✍️", route: "PayrollAttendanceManualEntry" },
  { label: "QR Codes", icon: "🔳", route: "PayrollAttendanceQr" },
  {
    label: "Monthly Report",
    icon: "📅",
    route: "PayrollAttendanceMonthlyReport",
  },
  {
    label: "Employee Attendance",
    icon: "👤",
    route: "PayrollAttendanceEmployee",
  },
];

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const formatStatus = (value?: string) =>
  value ? value.replace(/_/g, " ") : "N/A";

const statValue = (value?: number) => (typeof value === "number" ? value : 0);

export default function PayrollAttendanceHomeScreen({ navigation }: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [shifts, setShifts] = useState<PayrollShift[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();
  const [selectedEmployee, setSelectedEmployee] = useState<
    number | undefined
  >();
  const [selectedShift, setSelectedShift] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>();

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [
    date,
    selectedDepartment,
    selectedEmployee,
    selectedShift,
    selectedStatus,
  ]);

  const loadFilters = async () => {
    try {
      const [deptRes, empRes, shiftRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        employeeService.list({ per_page: 1000 }),
        shiftService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setEmployees(empRes.employees || []);
      setShifts(shiftRes.shifts || []);
    } catch (_error) {
      // ignore filter load errors
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response: AttendanceDailyResponse =
        await attendanceService.listDaily({
          date,
          department_id: selectedDepartment,
          employee_id: selectedEmployee,
          shift_id: selectedShift,
          status: selectedStatus,
        });
      setRecords(response.records || []);
      setStats(response.stats || {});
    } catch (error: any) {
      showToast(error.message || "Failed to load attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = (record: AttendanceRecord) => {
    showConfirm(
      "Approve Attendance",
      `Approve attendance for ${record.employee_name}?`,
      async () => {
        try {
          await attendanceService.approve(record.id);
          showToast("Attendance approved", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to approve", "error");
        }
      },
    );
  };

  const handleHalfDay = (record: AttendanceRecord) => {
    showConfirm(
      "Mark Half Day",
      `Mark ${record.employee_name} as half day?`,
      async () => {
        try {
          await attendanceService.markHalfDay(record.id);
          showToast("Marked as half day", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to update", "error");
        }
      },
    );
  };

  const handleBulkApprove = () => {
    const pendingIds = records
      .filter((record) => !record.is_approved)
      .map((record) => record.id);

    if (pendingIds.length === 0) {
      showToast("No pending approvals", "info");
      return;
    }

    showConfirm(
      "Bulk Approve",
      `Approve ${pendingIds.length} attendance records?`,
      async () => {
        try {
          await attendanceService.bulkApprove(pendingIds);
          showToast("Attendance approved", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to approve", "error");
        }
      },
    );
  };

  const statCards = useMemo<
    Array<{ label: string; value: number; colors: [string, string] }>
  >(
    () => [
      {
        label: "Total",
        value: statValue(stats?.total),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Present",
        value: statValue(stats?.present),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Late",
        value: statValue(stats?.late),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Absent",
        value: statValue(stats?.absent),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "On Leave",
        value: statValue(stats?.on_leave),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Half Day",
        value: statValue(stats?.half_day),
        colors: ["#14B8A6", "#0D9488"] as const,
      },
    ],
    [stats],
  );

  if (loading && !refreshing) {
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
          <Text style={styles.headerTitle}>Attendance</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("PayrollAttendanceManualEntry", {
                onCreated: loadData,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Manual Entry</Text>
          </TouchableOpacity>

          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.route as any)}>
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleBulkApprove}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Bulk Approve Pending</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>{date}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDepartment}
                onValueChange={(value) =>
                  setSelectedDepartment(
                    typeof value === "number" ? value : undefined,
                  )
                }>
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

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedShift}
                onValueChange={(value) =>
                  setSelectedShift(
                    typeof value === "number" ? value : undefined,
                  )
                }>
                <Picker.Item label="All Shifts" value={undefined} />
                {shifts.map((shift) => (
                  <Picker.Item
                    key={shift.id}
                    label={shift.name}
                    value={shift.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedEmployee}
                onValueChange={(value) =>
                  setSelectedEmployee(
                    typeof value === "number" ? value : undefined,
                  )
                }>
                <Picker.Item label="All Employees" value={undefined} />
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

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(
                    typeof value === "string"
                      ? (value as AttendanceStatus)
                      : undefined,
                  )
                }>
                {STATUS_OPTIONS.map((option) => (
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

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
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
          <Text style={styles.sectionTitle}>Daily Attendance</Text>
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Records</Text>
              <Text style={styles.emptyText}>
                No attendance records for the selected date.
              </Text>
            </View>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>{record.employee_name}</Text>
                    <Text style={styles.cardSubtitle}>
                      {record.employee_number || ""}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {formatStatus(record.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMetaText}>
                  Department: {record.department_name || "N/A"}
                </Text>
                <Text style={styles.cardMetaText}>
                  Shift: {record.shift_name || "N/A"}
                </Text>
                <Text style={styles.cardMetaText}>
                  Clock In: {record.clock_in || "-"}
                </Text>
                <Text style={styles.cardMetaText}>
                  Clock Out: {record.clock_out || "-"}
                </Text>
                <Text style={styles.cardMetaText}>
                  Late Minutes: {record.late_minutes ?? 0}
                </Text>
                <Text style={styles.cardMetaText}>
                  Overtime Minutes: {record.overtime_minutes ?? 0}
                </Text>
                <Text style={styles.cardMetaText}>
                  Approved: {record.is_approved ? "Yes" : "No"}
                </Text>

                <View style={styles.actionButtons}>
                  {!record.is_approved && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(record)}>
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {record.status !== "half_day" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.halfDayButton]}
                      onPress={() => handleHalfDay(record)}>
                      <Text style={styles.actionButtonText}>Half Day</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setDate(formatDate(selectedDate));
              }
            }}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  primaryBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  calendarIcon: {
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 12,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textTransform: "capitalize",
  },
  cardMetaText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  approveButton: {
    backgroundColor: "#dbeafe",
  },
  halfDayButton: {
    backgroundColor: "#fef3c7",
  },
});
