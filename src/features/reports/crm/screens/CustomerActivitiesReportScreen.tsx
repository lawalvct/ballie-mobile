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
  CustomerActivitiesReportResponse,
  CrmActivityRecord,
} from "../../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  ReportsStackParamList,
  "CrmActivitiesReport"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const ACTIVITY_TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Call", value: "call" },
  { label: "Email", value: "email" },
  { label: "Meeting", value: "meeting" },
  { label: "Note", value: "note" },
  { label: "Task", value: "task" },
  { label: "Follow Up", value: "follow_up" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const formatLabel = (value?: string) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveRecords = (records?: { data?: CrmActivityRecord[] }) =>
  records?.data ?? [];

export default function CustomerActivitiesReportScreen({ navigation }: Props) {
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [activityType, setActivityType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState(
    formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );
  const [dateTo, setDateTo] = useState(formatDate(new Date()));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerActivitiesReportResponse | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, [customerId, activityType, status, dateFrom, dateTo, searchQuery, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.crmActivities({
        customer_id: customerId,
        activity_type: activityType || undefined,
        status: status || undefined,
        date_from: dateFrom,
        date_to: dateTo,
        search: searchQuery || undefined,
        per_page: perPage,
        page,
      });
      setData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const records = resolveRecords(data?.records);
  const customers = data?.customers ?? [];
  const currentPage = data?.records?.current_page ?? page;
  const lastPage = data?.records?.last_page ?? 1;

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Activities",
        value: String(data?.records?.total ?? records.length ?? 0),
        colors: ["#3B82F6", "#2563EB"] as const,
      },
      {
        label: "Completed",
        value: String(
          records.filter((item) => item.status === "completed").length,
        ),
        colors: ["#10B981", "#059669"] as const,
      },
      {
        label: "Pending",
        value: String(
          records.filter((item) => item.status === "pending").length,
        ),
        colors: ["#F59E0B", "#D97706"] as const,
      },
      {
        label: "Cancelled",
        value: String(
          records.filter((item) => item.status === "cancelled").length,
        ),
        colors: ["#EF4444", "#DC2626"] as const,
      },
    ],
    [data, records],
  );

  const renderStatusBadge = (value?: string) => {
    const statusValue = value || "unknown";
    const statusColor =
      statusValue === "completed"
        ? "#10B981"
        : statusValue === "pending"
          ? "#F59E0B"
          : statusValue === "cancelled"
            ? "#EF4444"
            : "#6b7280";
    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusBadgeText}>{formatLabel(statusValue)}</Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>Customer Activities</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Text style={styles.actionButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowFromPicker(true)}>
                <Text style={styles.dateButtonText}>{dateFrom}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowToPicker(true)}>
                <Text style={styles.dateButtonText}>{dateTo}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Customer</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={customerId ?? ""}
                  onValueChange={(value) =>
                    setCustomerId(value ? Number(value) : undefined)
                  }>
                  <Picker.Item label="All Customers" value="" />
                  {customers.map((customer) => (
                    <Picker.Item
                      key={customer.id}
                      label={customer.name || "Customer"}
                      value={customer.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Activity Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={activityType}
                  onValueChange={(value) => setActivityType(String(value))}>
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
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
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={status}
                  onValueChange={(value) => setStatus(String(value))}>
                  {STATUS_OPTIONS.map((option) => (
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

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search subject"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={() => {
                setSearchQuery(searchText.trim());
                setPage(1);
              }}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                setSearchQuery(searchText.trim());
                setPage(1);
              }}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading activities...</Text>
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
              <Text style={styles.sectionTitle}>Activities</Text>
              {records.length ? (
                records.map((record) => (
                  <View style={styles.recordCard} key={record.id}>
                    <View style={styles.recordHeaderRow}>
                      <Text style={styles.recordTitle}>
                        {formatLabel(record.activity_type)}
                      </Text>
                      {renderStatusBadge(record.status)}
                    </View>
                    <Text style={styles.recordSubtext}>
                      {record.subject || "Activity"}
                    </Text>
                    {record.customer?.name ? (
                      <Text style={styles.recordSubtext}>
                        Customer: {record.customer.name}
                      </Text>
                    ) : null}
                    {record.description ? (
                      <Text style={styles.recordSubtext}>
                        {record.description}
                      </Text>
                    ) : null}
                    <Text style={styles.recordSubtext}>
                      Date: {record.activity_date || "-"} • Logged by:{" "}
                      {record.user?.name || "-"}
                    </Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionChip}
                        onPress={() => {}}>
                        <Text style={styles.actionChipText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionChip, styles.deleteChip]}
                        onPress={() => {}}>
                        <Text style={styles.actionChipText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No activities found.</Text>
              )}
            </View>

            {lastPage > 1 && (
              <View style={styles.paginationContainer}>
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    Page {currentPage} of {lastPage}
                  </Text>
                  <Text style={styles.paginationSubtext}>
                    Showing {records.length} of {data?.records?.total ?? 0}
                  </Text>
                </View>
                <View style={styles.paginationButtons}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    disabled={currentPage === 1}
                    onPress={() => setPage((prev) => Math.max(prev - 1, 1))}>
                    <Text
                      style={[
                        styles.paginationButtonText,
                        currentPage === 1 &&
                          styles.paginationButtonTextDisabled,
                      ]}>
                      ← Previous
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === lastPage &&
                        styles.paginationButtonDisabled,
                    ]}
                    disabled={currentPage === lastPage}
                    onPress={() =>
                      setPage((prev) => Math.min(prev + 1, lastPage))
                    }>
                    <Text
                      style={[
                        styles.paginationButtonText,
                        currentPage === lastPage &&
                          styles.paginationButtonTextDisabled,
                      ]}>
                      Next →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {showFromPicker && (
          <DateTimePicker
            value={new Date(dateFrom)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowFromPicker(Platform.OS === "ios");
              if (selectedDate) {
                setDateFrom(formatDate(selectedDate));
              }
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={new Date(dateTo)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowToPicker(Platform.OS === "ios");
              if (selectedDate) {
                setDateTo(formatDate(selectedDate));
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
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.gold,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
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
  recordHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  recordSubtext: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  deleteChip: {
    backgroundColor: "#fee2e2",
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  paginationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
