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
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { PurchaseSummaryResponse, ReportGroupBy } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "PurchaseSummaryReport"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const GROUP_BY_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function PurchaseSummaryReportScreen({ navigation }: Props) {
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("month");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PurchaseSummaryResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, groupBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.purchaseSummary({
        from_date: fromDate,
        to_date: toDate,
        group_by: groupBy,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load purchase summary", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Purchases",
        value: formatAmount(data?.summary?.total_purchases),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Purchase Count",
        value: String(data?.summary?.purchase_count ?? 0),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Average Purchase",
        value: formatAmount(data?.summary?.average_purchase_value),
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
        <Text style={styles.headerTitle}>Purchase Summary</Text>
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
            <Text style={styles.label}>Group By</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={groupBy}
                onValueChange={(value) => setGroupBy(value)}>
                {GROUP_BY_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
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
            <Text style={styles.loadingText}>Loading purchase summary...</Text>
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
              <Text style={styles.sectionTitle}>Top Products</Text>
              {data?.top_products?.length ? (
                data.top_products.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.product_id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.product_name || "Product"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Qty: {item.total_quantity ?? 0} • Amount:{" "}
                      {formatAmount(item.total_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No product data.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Top Vendors</Text>
              {data?.top_vendors?.length ? (
                data.top_vendors.map((item, index) => (
                  <View style={styles.recordCard} key={`${item.id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Vendor"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Purchases: {formatAmount(item.total_purchases)} • Bills:{" "}
                      {item.invoice_count ?? 0}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No vendor data.</Text>
              )}
            </View>

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Trend</Text>
              {data?.trend?.length ? (
                data.trend.map((item, index) => (
                  <View
                    style={styles.recordCard}
                    key={`${item.period}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.label || item.period || "Period"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Purchases: {formatAmount(item.total_purchases)} • Count:{" "}
                      {item.invoice_count ?? 0}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No trend data.</Text>
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
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  formGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
  },
  calendarIcon: {
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  recordSubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
});
