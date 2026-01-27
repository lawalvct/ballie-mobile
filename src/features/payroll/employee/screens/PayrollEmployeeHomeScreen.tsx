import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { employeeService } from "../services/employeeService";
import { departmentService } from "../../department/services/departmentService";
import { positionService } from "../../position/services/positionService";
import type {
  PayrollEmployee,
  PayrollEmployeeListParams,
  PayrollEmployeePagination,
  PayrollEmployeeStatus,
} from "../types";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollPosition } from "../../position/types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollEmployeeHome"
>;

const STATUS_OPTIONS: { label: string; value?: PayrollEmployeeStatus }[] = [
  { label: "All Statuses", value: undefined },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Terminated", value: "terminated" },
];

export default function PayrollEmployeeHomeScreen({ navigation }: Props) {
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] =
    useState<PayrollEmployeePagination | null>(null);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [positions, setPositions] = useState<PayrollPosition[]>([]);
  const [searchText, setSearchText] = useState("");
  const [positionText, setPositionText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();
  const [selectedPosition, setSelectedPosition] = useState<
    number | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<PayrollEmployeeStatus>();

  const [filters, setFilters] = useState<PayrollEmployeeListParams>({
    page: 1,
    per_page: 15,
  });

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadFilterData = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        positionService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setPositions(posRes.positions || []);
    } catch (_error) {
      // ignore filter load errors
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await employeeService.list(filters);
      setEmployees(response.employees || []);
      setPagination(response.pagination || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load employees", "error");
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
      search: searchText.trim() || undefined,
      department_id: selectedDepartment,
      status: selectedStatus,
      position_id: selectedPosition,
      position: positionText.trim() || undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleDelete = (employee: PayrollEmployee) => {
    showConfirm(
      "Delete Employee",
      "Are you sure you want to delete this employee?",
      async () => {
        try {
          await employeeService.delete(employee.id);
          showToast("Employee deleted successfully", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to delete employee", "error");
        }
      },
      { destructive: true, confirmText: "Delete" },
    );
  };

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
          <Text style={styles.headerTitle}>Employees</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading employees...</Text>
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
        <Text style={styles.headerTitle}>Employees</Text>
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
              navigation.navigate("PayrollEmployeeCreate", {
                onCreated: loadData,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Add Employee</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search employees..."
              placeholderTextColor="#9ca3af"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
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
                selectedValue={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(
                    typeof value === "string"
                      ? (value as PayrollEmployeeStatus)
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

          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPosition}
                onValueChange={(value) =>
                  setSelectedPosition(
                    typeof value === "number" ? value : undefined,
                  )
                }>
                <Picker.Item label="All Positions" value={undefined} />
                {positions.map((position) => (
                  <Picker.Item
                    key={position.id}
                    label={position.name}
                    value={position.id}
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.smallInput}
              value={positionText}
              onChangeText={setPositionText}
              placeholder="Position keyword"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={handleSearch}>
            <Text style={styles.applyFiltersText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          {employees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Employees Found</Text>
              <Text style={styles.emptyText}>
                Create your first employee to get started
              </Text>
            </View>
          ) : (
            employees.map((employee) => (
              <View key={employee.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>
                      {employee.full_name ||
                        `${employee.first_name} ${employee.last_name}`}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {employee.employee_number
                        ? `ID: ${employee.employee_number}`
                        : employee.email || ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      employee.status === "active"
                        ? styles.statusActive
                        : employee.status === "inactive"
                          ? styles.statusInactive
                          : styles.statusTerminated,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        employee.status === "active"
                          ? styles.statusTextActive
                          : employee.status === "inactive"
                            ? styles.statusTextInactive
                            : styles.statusTextTerminated,
                      ]}>
                      {employee.status || "unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText}>
                    Department: {employee.department_name || "N/A"}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    Position:{" "}
                    {employee.position_name || employee.job_title || "N/A"}
                  </Text>
                </View>

                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText}>
                    Hire Date: {employee.hire_date || "N/A"}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    Basic Salary: {employee.basic_salary || "N/A"}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                      navigation.navigate("PayrollEmployeeShow", {
                        id: employee.id,
                      })
                    }>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() =>
                      navigation.navigate("PayrollEmployeeEdit", {
                        id: employee.id,
                        onUpdated: loadData,
                      })
                    }>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(employee)}>
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from} to {pagination.to} of{" "}
                {pagination.total}
              </Text>
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
    letterSpacing: 0.5,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  smallInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  applyFiltersButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  applyFiltersText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
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
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  cardMeta: {
    marginTop: 10,
  },
  cardMetaText: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusTerminated: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusTextActive: {
    color: "#065f46",
  },
  statusTextInactive: {
    color: "#991b1b",
  },
  statusTextTerminated: {
    color: "#92400e",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
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
    color: BRAND_COLORS.darkPurple,
  },
  viewButton: {
    backgroundColor: "#dbeafe",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  paginationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
