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
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { TrialBalanceReportResponse } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "TrialBalanceReport"
>;

type ReportMode = "period" | "as_of";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function TrialBalanceReportScreen({ navigation }: Props) {
  const [mode, setMode] = useState<ReportMode>("period");
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date()));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showAsOfPicker, setShowAsOfPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrialBalanceReportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [mode, fromDate, toDate, asOfDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.financialTrialBalance(
        mode === "period"
          ? { from_date: fromDate, to_date: toDate }
          : { as_of_date: asOfDate },
      );
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load trial balance", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Debits",
        value: formatAmount(data?.summary?.total_debits),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Total Credits",
        value: formatAmount(data?.summary?.total_credits),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Difference",
        value: formatAmount(data?.summary?.difference),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Status",
        value: data?.summary?.balanced ? "Balanced" : "Not Balanced",
        colors: ["#10B981", "#059669"] as const,
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
        <Text style={styles.headerTitle}>Trial Balance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                mode === "period" && styles.toggleButtonActive,
              ]}
              onPress={() => setMode("period")}>
              <Text
                style={[
                  styles.toggleButtonText,
                  mode === "period" && styles.toggleButtonTextActive,
                ]}>
                Period
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                mode === "as_of" && styles.toggleButtonActive,
              ]}
              onPress={() => setMode("as_of")}>
              <Text
                style={[
                  styles.toggleButtonText,
                  mode === "as_of" && styles.toggleButtonTextActive,
                ]}>
                As Of
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "period" ? (
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
          ) : (
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>As of</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowAsOfPicker(true)}>
                  <Text style={styles.dateButtonText}>{asOfDate}</Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading trial balance...</Text>
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
              <Text style={styles.sectionTitle}>Accounts</Text>
              {data?.records?.length ? (
                data.records.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.account_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Account"}{" "}
                      {item.code ? `(${item.code})` : ""}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.group || item.account_type || ""}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Opening: {formatAmount(item.opening_balance)} • Current:{" "}
                      {formatAmount(item.current_balance)}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Debit: {formatAmount(item.debit_amount)} • Credit:{" "}
                      {formatAmount(item.credit_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No trial balance records.</Text>
              )}
            </View>
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

        {showAsOfPicker && (
          <DateTimePicker
            value={new Date(asOfDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowAsOfPicker(Platform.OS === "ios");
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
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: BRAND_COLORS.gold,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  toggleButtonTextActive: {
    color: BRAND_COLORS.darkPurple,
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
