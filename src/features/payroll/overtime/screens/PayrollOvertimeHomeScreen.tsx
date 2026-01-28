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
import { overtimeService } from "../services/overtimeService";
import type {
  OvertimeListResponse,
  OvertimeRecord,
  OvertimeStatus,
  OvertimeSummary,
  OvertimeType,
} from "../types";
import { departmentService } from "../../department/services/departmentService";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollEmployee } from "../../employee/types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollOvertimeHome"
>;

const OVERTIME_TYPES: { label: string; value?: OvertimeType }[] = [
  { label: "All Types", value: undefined },
  { label: "Weekday", value: "weekday" },
  { label: "Weekend", value: "weekend" },
  { label: "Holiday", value: "holiday" },
  { label: "Emergency", value: "emergency" },
];

const STATUS_OPTIONS: { label: string; value?: OvertimeStatus }[] = [
  { label: "All Status", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Paid", value: "paid" },
];

const PAYMENT_OPTIONS: { label: string; value?: "paid" | "unpaid" }[] = [
  { label: "All Payments", value: undefined },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
];

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const formatAmount = (value?: number) => {
  if (typeof value !== "number") return "0";
  return new Intl.NumberFormat("en-US").format(value);
};

const formatStatus = (value?: string) =>
  value ? value.replace(/_/g, " ") : "N/A";

export default function PayrollOvertimeHomeScreen({ navigation }: Props) {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [summary, setSummary] = useState<OvertimeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState(formatDate(new Date()));
  const [dateTo, setDateTo] = useState(formatDate(new Date()));
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();
  const [selectedEmployee, setSelectedEmployee] = useState<
    number | undefined
  >();
  const [selectedType, setSelectedType] = useState<OvertimeType>();
  const [selectedStatus, setSelectedStatus] = useState<OvertimeStatus>();
  const [selectedPayment, setSelectedPayment] = useState<
    "paid" | "unpaid" | undefined
  >();

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [
    dateFrom,
    dateTo,
    selectedDepartment,
    selectedEmployee,
    selectedType,
    selectedStatus,
    selectedPayment,
  ]);

  const loadFilters = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        employeeService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setEmployees(empRes.employees || []);
    } catch (_error) {
      // ignore filter load errors
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response: OvertimeListResponse = await overtimeService.list({
        date_from: dateFrom,
        date_to: dateTo,
        department_id: selectedDepartment,
        employee_id: selectedEmployee,
        overtime_type: selectedType,
        status: selectedStatus,
        payment_status: selectedPayment,
      });
      setRecords(response.records || []);
      setSummary(response.summary || {});
    } catch (error: any) {
      showToast(error.message || "Failed to load overtime", "error");
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

  const handleDelete = (record: OvertimeRecord) => {
    showConfirm(
      "Delete Overtime",
      `Delete overtime ${record.overtime_number || "record"}?`,
      async () => {
        try {
          await overtimeService.delete(record.id);
          showToast("Overtime deleted", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to delete", "error");
        }
      },
    );
  };

  const handleApprove = (record: OvertimeRecord) => {
    showConfirm(
      "Approve Overtime",
      `Approve ${record.employee_name || "employee"} overtime?`,
      async () => {
        try {
          await overtimeService.approve(record.id);
          showToast("Overtime approved", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to approve", "error");
        }
      },
    );
  };

  const handleReject = (record: OvertimeRecord) => {
    showConfirm(
      "Reject Overtime",
      `Reject ${record.employee_name || "employee"} overtime?`,
      async () => {
        try {
          await overtimeService.reject(record.id, {
            rejection_reason: "Rejected from mobile",
          });
          showToast("Overtime rejected", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to reject", "error");
        }
      },
    );
  };

  const handleMarkPaid = (record: OvertimeRecord) => {
    showConfirm(
      "Mark Paid",
      `Mark ${record.overtime_number || "overtime"} as paid?`,
      async () => {
        try {
          await overtimeService.markPaid(record.id, {
            payment_date: formatDate(new Date()),
            payment_method: "bank",
          });
          showToast("Overtime marked as paid", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to mark paid", "error");
        }
      },
    );
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Pending",
        valueText: String(summary?.pending_count ?? 0),
        sub: formatAmount(summary?.pending_amount),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Approved Unpaid",
        valueText: String(summary?.approved_unpaid_count ?? 0),
        sub: formatAmount(summary?.approved_unpaid_amount),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Total Records",
        valueText: String(summary?.total_records ?? records.length),
        sub: "Records",
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Total Amount",
        valueText: formatAmount(summary?.total_amount),
        sub: "Amount",
        colors: ["#10B981", "#059669"] as const,
      },
    ],
    [summary, records.length],
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
          <Text style={styles.headerTitle}>Overtime</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading overtime...</Text>
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
        <Text style={styles.headerTitle}>Overtime</Text>
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
            onPress={() => navigation.navigate("PayrollOvertimeCreate")}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnIcon}>＋</Text>
            <Text style={styles.primaryBtnText}>Create Overtime</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                navigation.navigate("PayrollOvertimeMonthlyReport")
              }
              activeOpacity={0.85}>
              <Text style={styles.secondaryBtnIcon}>📅</Text>
              <Text style={styles.secondaryBtnText}>Monthly Report</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                <Text style={styles.statValue}>{stat.valueText}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statSub}>{stat.sub}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Date From</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateFromPicker(true)}>
                <Text style={styles.dateButtonText}>{dateFrom}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Date To</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateToPicker(true)}>
                <Text style={styles.dateButtonText}>{dateTo}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedEmployee}
                onValueChange={(value) => setSelectedEmployee(value)}>
                <Picker.Item label="All Employees" value={undefined} />
                {employees.map((emp) => (
                  <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedType}
                  onValueChange={(value) => setSelectedType(value)}>
                  {OVERTIME_TYPES.map((option) => (
                    <Picker.Item
                      key={option.label}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPayment}
                onValueChange={(value) => setSelectedPayment(value)}>
                {PAYMENT_OPTIONS.map((option) => (
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

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Overtime Records</Text>
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⏰</Text>
              <Text style={styles.emptyTitle}>No Overtime Found</Text>
              <Text style={styles.emptyText}>Try adjusting filters</Text>
            </View>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>
                    {record.overtime_number || "Overtime"}
                  </Text>
                  <Text style={styles.recordStatus}>
                    {formatStatus(record.status)}
                  </Text>
                </View>

                <Text style={styles.recordSubtext}>
                  {record.employee_name || "Employee"} •{" "}
                  {record.department_name || "Department"}
                </Text>
                <Text style={styles.recordSubtext}>
                  {record.overtime_date || ""} • {record.start_time || ""} -{" "}
                  {record.end_time || ""}
                </Text>
                <Text style={styles.recordSubtext}>
                  Hours: {record.total_hours ?? "-"} • Rate:{" "}
                  {formatAmount(record.hourly_rate)} • Amount:{" "}
                  {formatAmount(record.total_amount)}
                </Text>
                <Text style={styles.recordSubtext}>
                  Type: {record.overtime_type || "-"} • Multiplier:{" "}
                  {record.multiplier ?? "-"}
                </Text>

                <View style={styles.recordActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                      navigation.navigate("PayrollOvertimeShow", {
                        id: record.id,
                      })
                    }>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>

                  {record.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() =>
                        navigation.navigate("PayrollOvertimeEdit", {
                          id: record.id,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  {record.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(record)}>
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}

                  {record.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(record)}>
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  )}

                  {record.status === "approved" && !record.is_paid && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.payButton]}
                      onPress={() => handleMarkPaid(record)}>
                      <Text style={styles.actionButtonText}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}

                  {record.status !== "pending" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(record)}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {showDateFromPicker && (
          <DateTimePicker
            value={dateFrom ? new Date(dateFrom) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDateFromPicker(Platform.OS === "ios");
              if (selectedDate) {
                setDateFrom(formatDate(selectedDate));
              }
            }}
          />
        )}

        {showDateToPicker && (
          <DateTimePicker
            value={dateTo ? new Date(dateTo) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDateToPicker(Platform.OS === "ios");
              if (selectedDate) {
                setDateTo(formatDate(selectedDate));
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
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryBtnIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
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
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
  },
  calendarIcon: {
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  recordStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "capitalize",
  },
  recordSubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  recordActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1f2937",
  },
  viewButton: {
    backgroundColor: "#dbeafe",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  approveButton: {
    backgroundColor: "#d1fae5",
  },
  rejectButton: {
    backgroundColor: "#fee2e2",
  },
  payButton: {
    backgroundColor: "#e0e7ff",
  },
  deleteButton: {
    backgroundColor: "#fecaca",
  },
});
