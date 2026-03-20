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
import { useNsitfReport } from "../hooks/useTax";
import type { ReportFilters } from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "NsitfReport">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function NsitfReportScreen({ navigation }: Props) {
  const [filters] = useState<ReportFilters>({});
  const { report, isLoading, isRefreshing, refresh } = useNsitfReport(filters);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="NSITF Report"
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
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total NSITF</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(report?.summary.total_nsitf ?? 0)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Employee Count</Text>
                  <Text style={styles.summaryValue}>
                    {report?.summary.employee_count ?? 0}
                  </Text>
                </View>
              </View>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Rate</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateBadgeText}>
                    {report?.summary.rate ?? 1}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Employee Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>Employee Breakdown</Text>
              {(report?.employees ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No NSITF records</Text>
              ) : (
                report?.employees.map((emp) => (
                  <View key={`nsitf-emp-${emp.employee_id}`} style={styles.empCard}>
                    <View style={styles.empHeader}>
                      <Text style={styles.empName}>{emp.name}</Text>
                      <Text style={styles.empContrib}>
                        {formatCurrency(emp.nsitf_contribution)}
                      </Text>
                    </View>
                    <Text style={styles.empGross}>
                      Gross: {formatCurrency(emp.gross_salary)}
                    </Text>
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
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryItem: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
  },
  summaryLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  rateLabel: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  rateBadge: {
    marginLeft: 8,
    backgroundColor: "rgba(16,185,129,0.08)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  rateBadgeText: { fontSize: 12, fontWeight: "700", color: "#10b981" },

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
  emptyText: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },
  empCard: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
  },
  empHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  empName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  empContrib: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  empGross: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});
