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
import type { BinCardReportResponse, BinCardRecord } from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<ReportsStackParamList, "BinCardReport">;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const formatAmount = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return `₦${new Intl.NumberFormat("en-US").format(amount)}`;
};

const resolveRecords = (
  records?: { data?: BinCardRecord[] } | BinCardRecord[],
) => {
  if (Array.isArray(records)) {
    return records;
  }
  return records?.data ?? [];
};

export default function BinCardReportScreen({ navigation }: Props) {
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [productId, setProductId] = useState<number | undefined>();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BinCardReportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.inventoryBinCard({
        from_date: fromDate,
        to_date: toDate,
        product_id: productId,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load bin card", "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Opening Qty",
        value: String(data?.summary?.opening_qty ?? 0),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Opening Value",
        value: formatAmount(data?.summary?.opening_value),
        colors: ["#8B5CF6", "#6D28D9"] as const,
      },
      {
        label: "Total In Qty",
        value: String(data?.summary?.total_in_qty ?? 0),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Total Out Qty",
        value: String(data?.summary?.total_out_qty ?? 0),
        colors: ["#EF4444", "#DC2626"] as const,
      },
      {
        label: "Total In Value",
        value: formatAmount(data?.summary?.total_in_value),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Total Out Value",
        value: formatAmount(data?.summary?.total_out_value),
        colors: ["#0EA5E9", "#0284C7"] as const,
      },
    ],
    [data],
  );

  const products = data?.products ?? [];
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
        <Text style={styles.headerTitle}>Bin Card</Text>
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
              <Text style={styles.label}>Product</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={productId ?? ""}
                  onValueChange={(value) =>
                    setProductId(value ? Number(value) : undefined)
                  }>
                  <Picker.Item label="All Products" value="" />
                  {products.map((product) => (
                    <Picker.Item
                      key={product.id}
                      label={product.name || "Product"}
                      value={product.id}
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
            <Text style={styles.loadingText}>Loading bin card...</Text>
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
              <Text style={styles.sectionTitle}>Movements</Text>
              {records.length ? (
                records.map((item, index) => (
                  <View style={styles.recordCard} key={`${item.date}-${index}`}>
                    <Text style={styles.recordTitle}>
                      {item.date || "Date"} • {item.particulars || "-"}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      {item.vch_type || ""} {item.vch_no || ""}
                    </Text>
                    <Text style={styles.recordSubtext}>
                      In: {item.in_qty ?? 0} ({formatAmount(item.in_value)}) •
                      Out: {item.out_qty ?? 0} ({formatAmount(item.out_value)})
                    </Text>
                    <Text style={styles.recordSubtext}>
                      Closing: {item.closing_qty ?? 0} (
                      {formatAmount(item.closing_value)})
                    </Text>
                    {item.created_by ? (
                      <Text style={styles.recordSubtext}>
                        By: {item.created_by}
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No bin card records found.</Text>
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
