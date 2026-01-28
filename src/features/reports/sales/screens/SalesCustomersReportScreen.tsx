import React, { useEffect, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { ReportsStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { reportsService } from "../../services/reportsService";
import type { SalesCustomerRecord } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "SalesCustomersReport"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const SORT_OPTIONS = [
  { label: "Total Sales", value: "total_sales" },
  { label: "Invoice Count", value: "invoice_count" },
];

const ORDER_OPTIONS = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

export default function SalesCustomersReportScreen({ navigation }: Props) {
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [sortBy, setSortBy] = useState("total_sales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SalesCustomerRecord[]>([]);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.salesCustomers({
        from_date: fromDate,
        to_date: toDate,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      const raw = response.records as any;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
      setRecords(list);
    } catch (error: any) {
      showToast(error.message || "Failed to load customer sales", "error");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Customer Sales</Text>
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

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Sort By</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sortBy}
                  onValueChange={(value) => setSortBy(value)}>
                  {SORT_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Order</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={sortOrder}
                  onValueChange={(value) => setSortOrder(value)}>
                  {ORDER_OPTIONS.map((option) => (
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
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Customers</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
              <Text style={styles.loadingText}>Loading customer sales...</Text>
            </View>
          ) : records.length ? (
            records.map((item, index) => (
              <View style={styles.recordCard} key={`${item.id}-${index}`}>
                <Text style={styles.recordTitle}>
                  {item.name || "Customer"}
                </Text>
                <Text style={styles.recordSubtext}>
                  Sales: {formatAmount(item.total_sales)} • Invoices:{" "}
                  {item.invoice_count ?? 0}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No customer sales found.</Text>
          )}
        </View>

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
    marginBottom: 12,
  },
  formGroupHalf: {
    flex: 1,
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
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
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
