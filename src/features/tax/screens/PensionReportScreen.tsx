import React, { useState } from "react";
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
import { usePensionReport } from "../hooks/useTax";
import type { ReportFilters } from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "PensionReport">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function PensionReportScreen({ navigation }: Props) {
  const [filters] = useState<ReportFilters>({});
  const { report, isLoading, isRefreshing, refresh } =
    usePensionReport(filters);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="Pension Report"
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
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Employee ({report?.summary.employee_rate ?? 8}%)</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_employee_contribution ?? 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Employer ({report?.summary.employer_rate ?? 10}%)</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_employer_contribution ?? 0)}
                  </Text>
                </View>
              </View>
              <View style={[styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Contribution</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(report?.summary.total_contribution ?? 0)}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {report?.summary.employee_count ?? 0} employees
                </Text>
              </View>
            </View>

            {/* By PFA */}
            {report?.by_pfa && report.by_pfa.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.cardTitle}>By PFA Provider</Text>
                {report.by_pfa.map((pfa) => (
                  <View key={`pfa-${pfa.pfa_provider}`} style={styles.pfaRow}>
                    <View style={styles.pfaHeader}>
                      <Text style={styles.pfaName}>{pfa.pfa_provider}</Text>
                      <Text style={styles.pfaCount}>
                        {pfa.employee_count} staff
                      </Text>
                    </View>
                    <View style={styles.pfaBody}>
                      <View style={styles.pfaItem}>
                        <Text style={styles.pfaLabel}>Employee</Text>
                        <Text style={styles.pfaValue}>
                          {formatCurrency(pfa.employee_contribution)}
                        </Text>
                      </View>
                      <View style={styles.pfaItem}>
                        <Text style={styles.pfaLabel}>Employer</Text>
                        <Text style={styles.pfaValue}>
                          {formatCurrency(pfa.employer_contribution)}
                        </Text>
                      </View>
                      <View style={styles.pfaItem}>
                        <Text style={styles.pfaLabelBold}>Total</Text>
                        <Text style={styles.pfaValueBold}>
                          {formatCurrency(pfa.total_contribution)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Employee Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>Employee Breakdown</Text>
              {(report?.employees ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No pension records</Text>
              ) : (
                report?.employees.map((emp) => (
                  <View key={`emp-${emp.employee_id}`} style={styles.empCard}>
                    <View style={styles.empHeader}>
                      <Text style={styles.empName}>{emp.name}</Text>
                      {emp.pfa_provider && (
                        <Text style={styles.empPfa}>{emp.pfa_provider}</Text>
                      )}
                    </View>
                    {emp.rsa_pin && (
                      <Text style={styles.empRsa}>RSA: {emp.rsa_pin}</Text>
                    )}
                    <View style={styles.empBody}>
                      <View style={styles.empRow}>
                        <Text style={styles.empLabel}>Employee</Text>
                        <Text style={styles.empValue}>
                          {formatCurrency(emp.employee_contribution)}
                        </Text>
                      </View>
                      <View style={styles.empRow}>
                        <Text style={styles.empLabel}>Employer</Text>
                        <Text style={styles.empValue}>
                          {formatCurrency(emp.employer_contribution)}
                        </Text>
                      </View>
                      <View style={[styles.empRow, styles.empRowTotal]}>
                        <Text style={styles.empLabelBold}>Total</Text>
                        <Text style={styles.empValueBold}>
                          {formatCurrency(emp.total)}
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

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 12 },
  summaryGrid: { flexDirection: "row", gap: 10 },
  summaryItem: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
  },
  summaryLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  totalValue: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  badge: {
    marginTop: 10,
    backgroundColor: "rgba(139,92,246,0.08)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#8b5cf6" },

  sectionCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },

  pfaRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  pfaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pfaName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  pfaCount: { fontSize: 11, color: "#6b7280" },
  pfaBody: { gap: 4 },
  pfaItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  pfaLabel: { fontSize: 12, color: "#6b7280" },
  pfaValue: { fontSize: 12, fontWeight: "600", color: "#374151" },
  pfaLabelBold: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  pfaValueBold: { fontSize: 12, fontWeight: "700", color: BRAND_COLORS.darkPurple },

  empCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  empHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  empName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  empPfa: { fontSize: 11, color: "#8b5cf6", fontWeight: "500" },
  empRsa: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  empBody: { marginTop: 8, gap: 4 },
  empRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  empRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 6,
    marginTop: 4,
  },
  empLabel: { fontSize: 12, color: "#6b7280" },
  empValue: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
  empLabelBold: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
  empValueBold: { fontSize: 13, fontWeight: "700", color: BRAND_COLORS.darkPurple },
});
