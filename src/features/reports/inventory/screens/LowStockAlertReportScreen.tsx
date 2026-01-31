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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type {
  LowStockAlertReportResponse,
  LowStockAlertRecord,
} from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "LowStockAlertReport"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const ALERT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Low", value: "low" },
  { label: "Out of Stock", value: "out_of_stock" },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

const resolveRecords = (
  records?: { data?: LowStockAlertRecord[] } | LowStockAlertRecord[],
) => {
  if (Array.isArray(records)) {
    return records;
  }
  return records?.data ?? [];
};

export default function LowStockAlertReportScreen({ navigation }: Props) {
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date()));
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [alertType, setAlertType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LowStockAlertReportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [asOfDate, categoryId, alertType, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.inventoryLowStockAlert({
        as_of_date: asOfDate,
        category_id: categoryId,
        alert_type: alertType,
        search: searchQuery || undefined,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load low stock alerts", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Alerts",
        value: String(data?.summary?.total_alerts ?? 0),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Critical",
        value: String(data?.summary?.critical_alerts ?? 0),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Warning",
        value: String(data?.summary?.warning_alerts ?? 0),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Out of Stock",
        value: String(data?.summary?.out_of_stock_count ?? 0),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Reorder Value",
        value: formatAmount(data?.summary?.estimated_reorder_value),
        colors: ["#10B981", "#059669"] as const,
      },
    ],
    [data],
  );

  const categories = data?.categories ?? [];
  const records = resolveRecords(data?.records);

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
        <Text style={styles.headerTitle}>Low Stock Alerts</Text>
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
              <Text style={styles.label}>Alert Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={alertType}
                  onValueChange={(value) => setAlertType(value)}>
                  {ALERT_OPTIONS.map((option) => (
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

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId ?? ""}
                  onValueChange={(value) =>
                    setCategoryId(value ? Number(value) : undefined)
                  }>
                  <Picker.Item label="All Categories" value="" />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name || "Category"}
                      value={category.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={() => setSearchQuery(searchText.trim())}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchQuery(searchText.trim())}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading low stock alerts...</Text>
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
              <Text style={styles.sectionTitle}>Alerts</Text>
              {records.length ? (
                records.map((item, index) => (
                  <View style={styles.recordCard} key={`${item.id}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.name || "Product"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Stock: {item.calculated_stock ?? 0} • Reorder:{" "}
                      {item.reorder_level ?? 0}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Shortage: {item.shortage_quantity ?? 0} (
                      {item.shortage_percentage ?? 0}%)
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Level: {item.alert_level || "-"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No alert records found.</Text>
              )}
            </View>
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
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
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
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
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
