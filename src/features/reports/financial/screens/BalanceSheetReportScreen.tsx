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
import type { BalanceSheetReportResponse } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "BalanceSheetReport"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const COMPARE_OPTIONS = [
  { label: "No", value: false },
  { label: "Yes", value: true },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function BalanceSheetReportScreen({ navigation }: Props) {
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date()));
  const [compare, setCompare] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BalanceSheetReportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [asOfDate, compare]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.financialBalanceSheet({
        as_of_date: asOfDate,
        compare,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load balance sheet", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Assets",
        value: formatAmount(data?.summary?.total_assets),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Total Liabilities",
        value: formatAmount(data?.summary?.total_liabilities),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Total Equity",
        value: formatAmount(data?.summary?.total_equity),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "L + E",
        value: formatAmount(data?.summary?.total_liabilities_and_equity),
        colors: ["#8B5CF6", "#6D28D9"] as const,
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
        <Text style={styles.headerTitle}>Balance Sheet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>As of</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>{asOfDate}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
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
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading balance sheet...</Text>
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
              {data?.summary?.balance_check !== undefined && (
                <Text style={styles.balanceCheck}>
                  {data.summary.balance_check
                    ? "Balance check: OK"
                    : "Balance check: Out of balance"}
                </Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Assets</Text>
              {data?.assets?.length ? (
                data.assets.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Asset"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.code ? `${item.code} • ` : ""}
                      {formatAmount(item.balance)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No assets found.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Liabilities</Text>
              {data?.liabilities?.length ? (
                data.liabilities.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Liability"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.code ? `${item.code} • ` : ""}
                      {formatAmount(item.balance)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No liabilities found.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Equity</Text>
              {data?.equity?.length ? (
                data.equity.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Equity"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.code ? `${item.code} • ` : ""}
                      {formatAmount(item.balance)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No equity data.</Text>
              )}
            </View>

            {compare && data?.compare && (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Comparison</Text>
                <View style={styles.recordCard}>
                  <Text style={styles.recordTitle}>
                    As of {data.compare.as_of_date}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Assets: {formatAmount(data.compare.total_assets)}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Liabilities: {formatAmount(data.compare.total_liabilities)}
                  </Text>
                  <Text style={styles.recordSubtext}>
                    Equity: {formatAmount(data.compare.total_equity)}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={new Date(asOfDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setAsOfDate(formatDate(selectedDate));
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
    paddingBottom: 8,
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
  balanceCheck: {
    marginTop: 10,
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
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
