import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import TaxModuleHeader from "../../../components/tax/TaxModuleHeader";
import { usePayeReport } from "../hooks/useTax";
import type { PayeReportFilters } from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "PayeReport">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function PayeReportScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<PayeReportFilters>({});
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>();
  const { report, isLoading, isRefreshing, refresh } = usePayeReport(filters);

  const departments = useMemo(
    () => report?.departments ?? [],
    [report?.departments],
  );

  const handleDeptFilter = (deptId: number | undefined) => {
    setSelectedDeptId(deptId);
    setFilters((prev) => ({ ...prev, department_id: deptId }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="PAYE Tax Report"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          </View>
        ) : (
          <>
            {/* Department Filter */}
            {departments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedDeptId && styles.filterChipActive,
                  ]}
                  onPress={() => handleDeptFilter(undefined)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      !selectedDeptId && styles.filterChipTextActive,
                    ]}>
                    All Depts
                  </Text>
                </TouchableOpacity>
                {departments.map((dept) => (
                  <TouchableOpacity
                    key={`dept-${dept.id}`}
                    style={[
                      styles.filterChip,
                      selectedDeptId === dept.id && styles.filterChipActive,
                    ]}
                    onPress={() => handleDeptFilter(dept.id)}>
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedDeptId === dept.id &&
                          styles.filterChipTextActive,
                      ]}>
                      {dept.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Gross</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_gross ?? 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Relief</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_relief ?? 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Taxable Income</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_taxable ?? 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total PAYE</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: BRAND_COLORS.darkPurple },
                    ]}>
                    {formatCurrency(report?.summary.total_tax ?? 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.employeeCount}>
                <Text style={styles.employeeCountText}>
                  {report?.summary.employee_count ?? 0} employees
                </Text>
              </View>
            </View>

            {/* Employee Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>Employee Breakdown</Text>
              {(report?.employees ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No employee records</Text>
              ) : (
                report?.employees.map((emp) => (
                  <View key={`emp-${emp.employee_id}`} style={styles.empCard}>
                    <View style={styles.empHeader}>
                      <View>
                        <Text style={styles.empName}>{emp.name}</Text>
                        {emp.tin && (
                          <Text style={styles.empTin}>TIN: {emp.tin}</Text>
                        )}
                        {emp.department && (
                          <Text style={styles.empDept}>{emp.department}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.empBody}>
                      <View style={styles.empRow}>
                        <Text style={styles.empLabel}>Gross</Text>
                        <Text style={styles.empValue}>
                          {formatCurrency(emp.gross_salary)}
                        </Text>
                      </View>
                      <View style={styles.empRow}>
                        <Text style={styles.empLabel}>Relief</Text>
                        <Text style={styles.empValue}>
                          -{formatCurrency(emp.consolidated_relief)}
                        </Text>
                      </View>
                      <View style={styles.empRow}>
                        <Text style={styles.empLabel}>Taxable</Text>
                        <Text style={styles.empValue}>
                          {formatCurrency(emp.taxable_income)}
                        </Text>
                      </View>
                      <View style={[styles.empRow, styles.empRowHighlight]}>
                        <Text style={styles.empLabelBold}>Monthly Tax</Text>
                        <Text style={styles.empValueBold}>
                          {formatCurrency(emp.monthly_tax)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f3f4f6" },
  loadingWrap: { paddingVertical: 60, alignItems: "center" },

  filterRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  filterChipTextActive: { color: "#fff" },

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryItem: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
  },
  summaryLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  employeeCount: {
    marginTop: 12,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  employeeCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3b82f6",
  },

  sectionCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 12,
  },

  empCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  empHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  empName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  empTin: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  empDept: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  empBody: { gap: 4 },
  empRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  empRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 6,
    marginTop: 4,
  },
  empLabel: { fontSize: 12, color: "#6b7280" },
  empValue: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
  empLabelBold: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
  empValueBold: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
});
