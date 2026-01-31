import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { ProfitLossReportResponse } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<ReportsStackParamList, "ProfitLossReport">;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const COMPARE_OPTIONS = [
  { label: "No", value: false },
  { label: "Yes", value: true },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

const formatPercentage = (value?: number) =>
  `${typeof value === "number" ? value.toFixed(2) : "0.00"}%`;

export default function ProfitLossReportScreen({ navigation }: Props) {
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [compare, setCompare] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfitLossReportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, compare]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.financialProfitLoss({
        from_date: fromDate,
        to_date: toDate,
        compare,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load profit & loss", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Income",
        value: formatAmount(data?.summary?.total_income),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Total Expenses",
        value: formatAmount(data?.summary?.total_expenses),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Net Profit",
        value: formatAmount(data?.summary?.net_profit),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Profit Margin",
        value: formatPercentage(data?.summary?.profit_margin),
        colors: ["#F59E0B", "#D97706"] as const,
      },
    ],
    [data],
  );

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
        <Text style={styles.headerTitle}>Profit & Loss</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowFromPicker(true)}>
                <Text style={styles.dateButtonText}>{fromDate}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowToPicker(true)}>
                <Text style={styles.dateButtonText}>{toDate}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Compare</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={compare}
                onValueChange={(value) => setCompare(Boolean(value))}>
                {COMPARE_OPTIONS.map((option) => (
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading profit & loss...</Text>
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
              <Text style={styles.sectionTitle}>Income</Text>
              {data?.income?.length ? (
                data.income.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Income Account"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.code ? `${item.code} • ` : ""}
                      {formatAmount(item.amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No income data.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Expenses</Text>
              {data?.expenses?.length ? (
                data.expenses.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Expense Account"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.code ? `${item.code} • ` : ""}
                      {formatAmount(item.amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No expense data.</Text>
              )}
            </View>

            {data?.stock && (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Stock</Text>
                <View style={styles.recordCard}>
                  <Text style={styles.recordTitle}>Opening Stock</Text>
                  <Text style={styles.recordSubtext}>
                    {formatAmount(data.stock.opening_stock)}
                  </Text>
                </View>
                <View style={styles.recordCard}>
                  <Text style={styles.recordTitle}>Closing Stock</Text>
                  <Text style={styles.recordSubtext}>
                    {formatAmount(data.stock.closing_stock)}
                  </Text>
                </View>
              </View>
            )}

            {compare && data?.compare && (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Comparison</Text>
                <View style={styles.recordCard}>
                  <Text style={styles.recordTitle}>
                    {data.compare.previous_from} → {data.compare.previous_to}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Income: {formatAmount(data.compare.total_income)}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Expenses: {formatAmount(data.compare.total_expenses)}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Net Profit: {formatAmount(data.compare.net_profit)} •
                    Margin: {formatPercentage(data.compare.profit_margin)}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {showFromPicker && (
          <DateTimePicker
            value={new Date(fromDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowFromPicker(Platform.OS === "ios");
              if (selectedDate) {
                setFromDate(formatDate(selectedDate));
              }
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={new Date(toDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowToPicker(Platform.OS === "ios");
              if (selectedDate) {
                setToDate(formatDate(selectedDate));
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  calendarIcon: {
    fontSize: 16,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
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
