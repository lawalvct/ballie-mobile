import React, { useEffect, useMemo, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { PayrollSummaryReportResponse } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "PayrollSummaryReport"
>;

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Processing", value: "processing" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
];

const MONTH_OPTIONS = [
  { label: "All", value: "" },
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

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function PayrollSummaryReportScreen({ navigation }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PayrollSummaryReportResponse | null>(null);

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - index),
    [currentYear],
  );

  useEffect(() => {
    loadData();
  }, [year, month, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.payrollSummary({
        year,
        month,
        status,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load payroll summary", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Periods",
        value: String(data?.summary?.total_periods ?? 0),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Employees",
        value: String(data?.summary?.total_employees ?? 0),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Total Gross",
        value: formatAmount(data?.summary?.total_gross),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Total Net",
        value: formatAmount(data?.summary?.total_net),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Deductions",
        value: formatAmount(data?.summary?.total_deductions),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Tax",
        value: formatAmount(data?.summary?.total_tax),
        colors: ["#0EA5E9", "#0284C7"] as const,
      },
      {
        label: "Avg/Employee",
        value: formatAmount(data?.summary?.average_per_employee),
        colors: ["#14B8A6", "#0D9488"] as const,
      },
    ],
    [data],
  );

  const departmentEntries = data?.department_breakdown
    ? Object.entries(data.department_breakdown)
    : [];

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
        <Text style={styles.headerTitle}>Payroll Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Year</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={year} onValueChange={setYear}>
                  {yearOptions.map((value) => (
                    <Picker.Item
                      key={value}
                      label={String(value)}
                      value={value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Month</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={month ?? ""}
                  onValueChange={(value) =>
                    setMonth(value ? Number(value) : undefined)
                  }>
                  {MONTH_OPTIONS.map((option) => (
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

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={status ?? ""}
                  onValueChange={(value) =>
                    setStatus(value ? String(value) : undefined)
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
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading payroll summary...</Text>
          </View>
        ) : (
          <>
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
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
              {data?.monthly_breakdown?.length ? (
                data.monthly_breakdown.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.month}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.month || "Month"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Periods: {item.periods ?? 0} • Employees:{" "}
                      {item.employees ?? 0}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Gross: {formatAmount(item.gross)} • Net:{" "}
                      {formatAmount(item.net)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Deductions: {formatAmount(item.deductions)} • Tax:{" "}
                      {formatAmount(item.tax)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No monthly data.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Department Breakdown</Text>
              {departmentEntries.length ? (
                departmentEntries.map(([name, info]) => (
                  <View style={styles.recordCard} key={name}>
                    <Text style={styles.recordTitle}>{name}</Text>
                    <Text style={styles.recordSubtext}>
                      Employees: {info.employees ?? 0}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Gross: {formatAmount(info.gross)} • Net:{" "}
                      {formatAmount(info.net)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Deductions: {formatAmount(info.deductions)} • Tax:{" "}
                      {formatAmount(info.tax)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No department data.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Payroll Periods</Text>
              {data?.periods?.length ? (
                data.periods.map((period) => (
                  <View style={styles.recordCard} key={period.id}>
                    <Text style={styles.recordTitle}>
                      {period.name || "Period"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {period.start_date} → {period.end_date}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Pay Date: {period.pay_date || "-"} • Status:{" "}
                      {period.status || "-"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Employees: {period.employees ?? 0} • Gross:{" "}
                      {formatAmount(period.gross)} • Net:{" "}
                      {formatAmount(period.net)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No periods found.</Text>
              )}
            </View>
          </>
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
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
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
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
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
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textAlign: "center",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  recordSubtext: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
