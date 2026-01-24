import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { InventoryStackParamList } from "../../../../navigation/types";
import * as stockJournalService from "../services/stockJournalService";
import type {
  StockJournalEntry,
  StockJournalListParams,
  StockJournalStatistics,
  StockJournalPagination,
} from "../types";
import { Picker } from "@react-native-picker/picker";

type NavigationProp = NativeStackNavigationProp<
  InventoryStackParamList,
  "StockJournalHome"
>;

export default function StockJournalHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<StockJournalEntry[]>([]);
  const [statistics, setStatistics] = useState<StockJournalStatistics | null>(
    null,
  );
  const [pagination, setPagination] = useState<StockJournalPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const [filters, setFilters] = useState<StockJournalListParams>({
    entry_type: "",
    status: "",
    sort: "created_at",
    direction: "desc",
    page: 1,
    per_page: 20,
  });

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadEntries();
    }
  }, [isFocused, filters]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await stockJournalService.list(filters);

      const entryData = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setEntries(entryData);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
      setStatistics(response.statistics || null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to load stock journal entries",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadEntries();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText, page: 1 }));
  };

  const handleFilterChange = (
    key: keyof StockJournalListParams,
    value: any,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number, canDelete: boolean) => {
    if (!canDelete) {
      Alert.alert("Cannot Delete", "Only draft entries can be deleted.");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await stockJournalService.deleteEntry(id);
              Alert.alert("Success", "Entry deleted successfully");
              loadEntries();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete entry");
            }
          },
        },
      ],
    );
  };

  const handlePost = async (id: number, canPost: boolean) => {
    if (!canPost) {
      Alert.alert("Cannot Post", "This entry cannot be posted.");
      return;
    }

    Alert.alert(
      "Confirm Post",
      "Are you sure you want to post this entry? This will update stock levels.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Post",
          onPress: async () => {
            try {
              await stockJournalService.post(id);
              Alert.alert("Success", "Entry posted successfully");
              loadEntries();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to post entry");
            }
          },
        },
      ],
    );
  };

  const handleCancel = async (id: number, canCancel: boolean) => {
    if (!canCancel) {
      Alert.alert("Cannot Cancel", "This entry cannot be cancelled.");
      return;
    }

    Alert.alert(
      "Confirm Cancel",
      "Are you sure you want to cancel this entry?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await stockJournalService.cancel(id);
              Alert.alert("Success", "Entry cancelled successfully");
              loadEntries();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel entry");
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (statusColor: string) => {
    switch (statusColor) {
      case "green":
        return "#d1fae5";
      case "red":
        return "#fee2e2";
      case "yellow":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusTextColor = (statusColor: string) => {
    switch (statusColor) {
      case "green":
        return "#059669";
      case "red":
        return "#dc2626";
      case "yellow":
        return "#d97706";
      default:
        return "#6b7280";
    }
  };

  const getEntryTypeIcon = (entryType: string) => {
    switch (entryType) {
      case "consumption":
        return "📤";
      case "production":
        return "📥";
      case "adjustment":
        return "🔄";
      case "transfer":
        return "🔀";
      default:
        return "📋";
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stock Journal</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          <Text style={styles.loadingText}>Loading entries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Journal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.darkPurple]}
          />
        }>
        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("StockConsumption")}>
              <LinearGradient
                colors={["#fee2e2", "#fecaca"]}
                style={styles.actionGradient}>
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionLabel}>Consumption</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("StockProduction")}>
              <LinearGradient
                colors={["#d1fae5", "#a7f3d0"]}
                style={styles.actionGradient}>
                <Text style={styles.actionIcon}>📥</Text>
                <Text style={styles.actionLabel}>Production</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("StockAdjustment")}>
              <LinearGradient
                colors={["#fef3c7", "#fde68a"]}
                style={styles.actionGradient}>
                <Text style={styles.actionIcon}>🔄</Text>
                <Text style={styles.actionLabel}>Adjustment</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("StockTransfer")}>
              <LinearGradient
                colors={["#dbeafe", "#bfdbfe"]}
                style={styles.actionGradient}>
                <Text style={styles.actionIcon}>🔀</Text>
                <Text style={styles.actionLabel}>Transfer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        {statistics && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.total_entries}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.draft_entries}</Text>
                <Text style={styles.statLabel}>Draft</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  {statistics.posted_entries}
                </Text>
                <Text style={styles.statLabel}>Posted</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  {statistics.this_month_entries}
                </Text>
                <Text style={styles.statLabel}>This Month</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by reference, journal number..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Entry Type</Text>
              <Picker
                selectedValue={filters.entry_type}
                onValueChange={(value) =>
                  handleFilterChange("entry_type", value)
                }
                style={styles.picker}>
                <Picker.Item label="All Types" value="" />
                <Picker.Item label="Consumption" value="consumption" />
                <Picker.Item label="Production" value="production" />
                <Picker.Item label="Adjustment" value="adjustment" />
                <Picker.Item label="Transfer" value="transfer" />
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Status</Text>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
                style={styles.picker}>
                <Picker.Item label="All Status" value="" />
                <Picker.Item label="Draft" value="draft" />
                <Picker.Item label="Posted" value="posted" />
                <Picker.Item label="Cancelled" value="cancelled" />
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Sort By</Text>
            <Picker
              selectedValue={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
              style={styles.picker}>
              <Picker.Item label="Date (Newest)" value="created_at" />
              <Picker.Item label="Journal Number" value="journal_number" />
              <Picker.Item label="Entry Type" value="entry_type" />
              <Picker.Item label="Total Amount" value="total_amount" />
            </Picker>
          </View>
        </View>

        {/* Entries List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Entries</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Entries Found</Text>
              <Text style={styles.emptyText}>
                Create your first stock journal entry using the buttons above
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    <Text style={styles.entryIcon}>
                      {getEntryTypeIcon(entry.entry_type)}
                    </Text>
                    <View>
                      <Text style={styles.entryNumber}>
                        {entry.journal_number}
                      </Text>
                      <Text style={styles.entryType}>
                        {entry.entry_type_display}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(entry.status_color) },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusTextColor(entry.status_color) },
                      ]}>
                      {entry.status_display}
                    </Text>
                  </View>
                </View>

                <View style={styles.entryDetails}>
                  <View style={styles.entryDetailRow}>
                    <Text style={styles.entryDetailLabel}>Date:</Text>
                    <Text style={styles.entryDetailValue}>
                      {entry.journal_date}
                    </Text>
                  </View>
                  {entry.reference_number && (
                    <View style={styles.entryDetailRow}>
                      <Text style={styles.entryDetailLabel}>Reference:</Text>
                      <Text style={styles.entryDetailValue}>
                        {entry.reference_number}
                      </Text>
                    </View>
                  )}
                  <View style={styles.entryDetailRow}>
                    <Text style={styles.entryDetailLabel}>Items:</Text>
                    <Text style={styles.entryDetailValue}>
                      {entry.total_items}
                    </Text>
                  </View>
                  <View style={styles.entryDetailRow}>
                    <Text style={styles.entryDetailLabel}>Amount:</Text>
                    <Text style={styles.entryAmount}>
                      ₦{entry.total_amount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.viewBtn]}
                    onPress={() =>
                      navigation.navigate("StockJournalDetail", {
                        id: entry.id,
                      })
                    }>
                    <Text style={styles.actionBtnText}>View</Text>
                  </TouchableOpacity>

                  {entry.can_edit && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() =>
                        navigation.navigate("StockJournalEdit", {
                          id: entry.id,
                        })
                      }>
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  {entry.can_post && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.postBtn]}
                      onPress={() => handlePost(entry.id, entry.can_post)}>
                      <Text style={styles.actionBtnText}>Post</Text>
                    </TouchableOpacity>
                  )}

                  {entry.can_cancel && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelBtn]}
                      onPress={() => handleCancel(entry.id, entry.can_cancel)}>
                      <Text style={styles.actionBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  {entry.status === "draft" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() =>
                        handleDelete(entry.id, entry.status === "draft")
                      }>
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
                {pagination.total} entries
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === 1 &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  ← Previous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === pagination.last_page &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === pagination.last_page &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingHorizontal: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textAlign: "center",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    height: 50,
    color: BRAND_COLORS.darkPurple,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  entryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  entryIcon: {
    fontSize: 32,
  },
  entryNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  entryType: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  entryDetails: {
    marginBottom: 12,
  },
  entryDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  entryDetailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  entryDetailValue: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "500",
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  entryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  viewBtn: {
    backgroundColor: "#dbeafe",
  },
  editBtn: {
    backgroundColor: "#fef3c7",
  },
  postBtn: {
    backgroundColor: "#d1fae5",
  },
  cancelBtn: {
    backgroundColor: "#fee2e2",
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
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
