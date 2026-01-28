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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { loanService } from "../services/loanService";
import type {
  LoanListResponse,
  LoanRecord,
  LoanStatus,
  LoanSummary,
} from "../types";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollEmployee } from "../../employee/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<PayrollStackParamList, "PayrollLoansHome">;

const STATUS_OPTIONS: { label: string; value?: LoanStatus }[] = [
  { label: "All Status", value: undefined },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const formatAmount = (value?: number) => {
  if (typeof value !== "number") return "0";
  return new Intl.NumberFormat("en-US").format(value);
};

const getEmployeeName = (employee: PayrollEmployee) => {
  if (employee.full_name?.trim()) return employee.full_name.trim();
  const first = employee.first_name?.trim();
  const last = employee.last_name?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (employee.employee_number) return employee.employee_number;
  return `Employee ${employee.id}`;
};

export default function PayrollLoansHomeScreen({ navigation }: Props) {
  const [records, setRecords] = useState<LoanRecord[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<
    number | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
    per_page: 20,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedEmployee, selectedStatus, page]);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.list({ per_page: 1000 });
      setEmployees(response.employees || []);
    } catch (_error) {
      // ignore
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response: LoanListResponse = await loanService.list({
        search: search.trim() || undefined,
        employee_id: selectedEmployee,
        status: selectedStatus,
        page,
      });
      setRecords(response.records || []);
      setSummary(response.summary || {});
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      showToast(error.message || "Failed to load loans", "error");
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

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Loans",
        value: summary?.total_loans ?? 0,
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Active Loans",
        value: summary?.active_loans ?? 0,
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Total Disbursed",
        value: summary?.total_amount ?? 0,
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Outstanding",
        value: summary?.total_outstanding ?? 0,
        colors: ["#EF4444", "#DC2626"] as const,
      },
    ],
    [summary],
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
          <Text style={styles.headerTitle}>Loan History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading loans...</Text>
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
        <Text style={styles.headerTitle}>Loan History</Text>
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
            onPress={() => navigation.navigate("PayrollSalaryAdvance")}
            activeOpacity={0.85}>
            <Text style={styles.primaryBtnIcon}>＋</Text>
            <Text style={styles.primaryBtnText}>Issue Salary Advance</Text>
          </TouchableOpacity>
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
                <Text style={styles.statValue}>
                  {stat.label.includes("Amount") || stat.label === "Outstanding"
                    ? formatAmount(Number(stat.value))
                    : stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search loan number"
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              onSubmitEditing={() => {
                setPage(1);
                loadData();
              }}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setPage(1);
                loadData();
              }}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedEmployee}
                onValueChange={(value) => {
                  setSelectedEmployee(value);
                  setPage(1);
                }}>
                <Picker.Item label="All Employees" value={undefined} />
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={getEmployeeName(emp)}
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setPage(1);
                }}>
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

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Loans</Text>
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No Loans Found</Text>
              <Text style={styles.emptyText}>Try adjusting filters</Text>
            </View>
          ) : (
            records.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() =>
                  navigation.navigate("PayrollLoanShow", { id: record.id })
                }>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>
                    {record.loan_number || "Loan"}
                  </Text>
                  <Text style={styles.recordStatus}>{record.status}</Text>
                </View>
                <Text style={styles.recordSubtext}>
                  {record.employee_name || "Employee"} •{" "}
                  {record.department_name || "Department"}
                </Text>
                <Text style={styles.recordSubtext}>
                  Amount: {formatAmount(record.loan_amount)} • Balance:{" "}
                  {formatAmount(record.balance)}
                </Text>
                <Text style={styles.recordSubtext}>
                  Monthly Deduction: {formatAmount(record.monthly_deduction)} •
                  Duration: {record.duration_months ?? "-"}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {pagination.last_page > 1 && (
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
                  pagination.current_page === 1 && styles.paginationDisabled,
                ]}
                disabled={pagination.current_page === 1}
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}>
                <Text style={styles.paginationButtonText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === pagination.last_page &&
                    styles.paginationDisabled,
                ]}
                disabled={pagination.current_page === pagination.last_page}
                onPress={() =>
                  setPage((prev) => Math.min(pagination.last_page, prev + 1))
                }>
                <Text style={styles.paginationButtonText}>Next →</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
  formGroup: {
    marginBottom: 12,
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
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
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
  paginationDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
});
