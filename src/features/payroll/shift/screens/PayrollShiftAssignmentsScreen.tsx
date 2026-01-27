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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { shiftService } from "../services/shiftService";
import { departmentService } from "../../department/services/departmentService";
import { employeeService } from "../../employee/services/employeeService";
import type {
  PayrollShiftAssignment,
  PayrollShiftAssignmentsListParams,
  PayrollShiftPagination,
  PayrollShiftAssignmentStatus,
  PayrollShift,
} from "../types";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollEmployee } from "../../employee/types";
import { showConfirm, showToast } from "../../../../utils/toast";

const STATUS_OPTIONS: {
  label: string;
  value?: PayrollShiftAssignmentStatus;
}[] = [
  { label: "All Statuses", value: undefined },
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
];

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollShiftAssignments"
>;

export default function PayrollShiftAssignmentsScreen({
  navigation,
  route,
}: Props) {
  const { shiftId } = route.params || {};
  const [assignments, setAssignments] = useState<PayrollShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PayrollShiftPagination | null>(
    null,
  );
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [shifts, setShifts] = useState<PayrollShift[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();
  const [selectedEmployee, setSelectedEmployee] = useState<
    number | undefined
  >();
  const [selectedShift, setSelectedShift] = useState<number | undefined>(
    shiftId,
  );
  const [selectedStatus, setSelectedStatus] = useState<
    PayrollShiftAssignmentStatus | undefined
  >();

  const [filters, setFilters] = useState<PayrollShiftAssignmentsListParams>({
    page: 1,
    per_page: 15,
    shift_id: shiftId,
  });

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadFilterData = async () => {
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
      // ignore
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await shiftService.listAssignments(filters);
      setAssignments(response.assignments || []);
      setPagination(response.pagination || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load assignments", "error");
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

  const handleSearch = () => {
    setFilters({
      page: 1,
      per_page: filters.per_page,
      department_id: selectedDepartment,
      employee_id: selectedEmployee,
      shift_id: selectedShift,
      status: selectedStatus,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleEndAssignment = (assignmentId: number) => {
    showConfirm(
      "End Assignment",
      "Are you sure you want to end this shift assignment?",
      async () => {
        try {
          await shiftService.endAssignment(assignmentId);
          showToast("Assignment ended", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to end assignment", "error");
        }
      },
      { destructive: true, confirmText: "End" },
    );
  };

  const assignmentsLabel = useMemo(() => {
    if (!pagination) return "";
    return `Showing ${pagination.from} to ${pagination.to} of ${pagination.total}`;
  }, [pagination]);

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
          <Text style={styles.headerTitle}>Shift Assignments</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading assignments...</Text>
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
        <Text style={styles.headerTitle}>Shift Assignments</Text>
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
            onPress={() => navigation.navigate("PayrollShiftAssign")}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Assign Employees</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.filterRow}>
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
                      ? (value as PayrollShiftAssignmentStatus)
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

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          {assignments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Assignments Found</Text>
              <Text style={styles.emptyText}>
                Assign employees to shifts to get started
              </Text>
            </View>
          ) : (
            assignments.map((assignment) => (
              <View key={assignment.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>
                      {assignment.employee_name}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {assignment.shift_name}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      assignment.status === "ended" ||
                      assignment.is_active === false
                        ? styles.statusInactive
                        : styles.statusActive,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        assignment.status === "ended" ||
                        assignment.is_active === false
                          ? styles.statusTextInactive
                          : styles.statusTextActive,
                      ]}>
                      {assignment.status === "ended" ||
                      assignment.is_active === false
                        ? "Ended"
                        : "Active"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>
                  Department: {assignment.department_name || "N/A"}
                </Text>
                <Text style={styles.cardMeta}>
                  Employee ID: {assignment.employee_number || "N/A"}
                </Text>
                <Text style={styles.cardMeta}>
                  Effective: {assignment.effective_from}
                  {assignment.effective_to
                    ? ` → ${assignment.effective_to}`
                    : assignment.is_permanent
                      ? " (Permanent)"
                      : ""}
                </Text>

                {(assignment.status === "active" || assignment.is_active) && (
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => handleEndAssignment(assignment.id)}>
                    <Text style={styles.endButtonText}>End Assignment</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {pagination && pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>{assignmentsLabel}</Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === 1 &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  ← Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === pagination.last_page &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === pagination.last_page &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
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
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 18,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  filtersSection: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  searchButtonText: {
    color: SEMANTIC_COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  listSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 4,
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 13,
    color: SEMANTIC_COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#16a34a",
  },
  statusTextInactive: {
    color: "#dc2626",
  },
  endButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    alignSelf: "flex-start",
  },
  endButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  paginationContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  paginationInfo: {
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  paginationSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: SEMANTIC_COLORS.textLight,
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
