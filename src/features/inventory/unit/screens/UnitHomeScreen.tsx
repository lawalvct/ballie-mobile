import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { unitService } from "../services/unitService";
import type {
  Unit,
  UnitListParams,
  UnitPagination,
  UnitStatistics,
} from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "UnitHome">;

export default function UnitHomeScreen({ navigation }: Props) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<UnitPagination | null>(null);
  const [statistics, setStatistics] = useState<UnitStatistics>({
    total_units: 0,
    active_units: 0,
    base_units: 0,
    derived_units: 0,
  });
  const [searchText, setSearchText] = useState("");

  const [filters, setFilters] = useState<UnitListParams>({
    sort: "name",
    direction: "asc",
    page: 1,
    per_page: 15,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await unitService.list(filters);
      const fetchedUnits = response.units || [];
      setUnits(fetchedUnits);
      setPagination(response.pagination || null);

      if (response.statistics) {
        setStatistics(response.statistics);
      } else {
        const statsResponse = await unitService.list({
          ...filters,
          page: 1,
          per_page: 10000,
        });
        const allUnits = statsResponse.units || [];
        const computedStats: UnitStatistics = {
          total_units: allUnits.length,
          active_units: allUnits.filter((unit) => unit.is_active).length,
          base_units: allUnits.filter((unit) => unit.is_base_unit).length,
          derived_units: allUnits.filter((unit) => !unit.is_base_unit).length,
        };
        setStatistics(computedStats);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to load units", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchText.trim() || undefined,
      page: 1,
    }));
  };

  const handleToggleStatus = async (unit: Unit) => {
    try {
      await unitService.toggleStatus(unit.id);
      showToast("Unit status updated", "success");
      loadData();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  const handleDelete = (unit: Unit) => {
    if (unit.can_delete === false) {
      showToast("Unit cannot be deleted", "error");
      return;
    }

    Alert.alert("Delete Unit", "Are you sure you want to delete this unit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await unitService.delete(unit.id);
            showToast("Unit deleted successfully", "success");
            loadData();
          } catch (error: any) {
            showToast(error.message || "Failed to delete unit", "error");
          }
        },
      },
    ]);
  };

  const handleItemUpdated = async (id: number) => {
    try {
      const updated = await unitService.show(id);
      setUnits((prev) =>
        prev.map((item) => (item.id === id ? updated.unit : item)),
      );
      showToast("✅ Updated successfully", "success");
    } catch (_error) {
      // Fallback to full reload if fetch fails
      loadData();
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Units</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading units...</Text>
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Units</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("UnitCreate", { onCreated: loadData })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Add Unit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.total_units}</Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.active_units}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.base_units}</Text>
              <Text style={styles.statLabel}>Base Units</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.derived_units}</Text>
              <Text style={styles.statLabel}>Derived Units</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search units..."
              placeholderTextColor="#9ca3af"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.type ?? ""}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: value || undefined,
                      page: 1,
                    }))
                  }
                  style={styles.picker}>
                  <Picker.Item label="All" value="" />
                  <Picker.Item label="Base" value="base" />
                  <Picker.Item label="Derived" value="derived" />
                </Picker>
              </View>
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status ?? ""}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value || undefined,
                      page: 1,
                    }))
                  }
                  style={styles.picker}>
                  <Picker.Item label="All" value="" />
                  <Picker.Item label="Active" value="active" />
                  <Picker.Item label="Inactive" value="inactive" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listSection}>
          {units.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📏</Text>
              <Text style={styles.emptyTitle}>No Units Found</Text>
              <Text style={styles.emptyText}>
                Create your first unit to get started.
              </Text>
            </View>
          ) : (
            units.map((unit) => (
              <View key={unit.id} style={styles.unitCard}>
                <View style={styles.unitHeader}>
                  <View style={styles.unitTitleRow}>
                    <Text style={styles.unitName}>{unit.name}</Text>
                    <Text style={styles.unitSymbol}>({unit.symbol})</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      unit.is_active
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive,
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        unit.is_active
                          ? styles.statusBadgeTextActive
                          : styles.statusBadgeTextInactive,
                      ]}>
                      {unit.status || (unit.is_active ? "Active" : "Inactive")}
                    </Text>
                  </View>
                </View>

                <View style={styles.unitInfoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>
                      {unit.type ||
                        (unit.is_base_unit ? "Base Unit" : "Derived Unit")}
                    </Text>
                  </View>
                  {unit.conversion_factor !== undefined &&
                    !unit.is_base_unit && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Conversion</Text>
                        <Text style={styles.infoValue}>
                          {unit.conversion_factor}
                        </Text>
                      </View>
                    )}
                  {typeof unit.products_count === "number" && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Products</Text>
                      <Text style={styles.infoValue}>
                        {unit.products_count}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.unitActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                      navigation.navigate("UnitShow", { id: unit.id })
                    }>
                    <Text style={styles.actionButtonText}>👁️ View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() =>
                      navigation.navigate("UnitEdit", {
                        id: unit.id,
                        onUpdated: handleItemUpdated,
                      })
                    }>
                    <Text style={styles.actionButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.deleteButton,
                      unit.can_delete === false && styles.disabledButton,
                    ]}
                    onPress={() => handleDelete(unit)}
                    disabled={unit.can_delete === false}>
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Pagination Section - Always visible for debugging */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              {pagination
                ? `Page ${pagination.current_page} of ${pagination.last_page}`
                : "Loading pagination..."}
            </Text>
            {pagination && (
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
                {pagination.total} units
              </Text>
            )}
            {!pagination && (
              <Text style={styles.paginationSubtext}>
                Total units: {units.length}
              </Text>
            )}
          </View>
          {pagination && pagination.last_page > 1 && (
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, (prev.page || 1) - 1),
                  }))
                }
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
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(pagination.last_page, (prev.page || 1) + 1),
                  }))
                }
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
          )}
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  picker: {
    height: 44,
    color: BRAND_COLORS.darkPurple,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  unitCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  unitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginRight: 6,
  },
  unitSymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#d1fae5",
  },
  statusBadgeInactive: {
    backgroundColor: "#fee2e2",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadgeTextActive: {
    color: "#065f46",
  },
  statusBadgeTextInactive: {
    color: "#b91c1c",
  },
  unitInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoItem: {
    minWidth: "30%",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  unitMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  unitDetails: {
    gap: 4,
    marginBottom: 12,
  },
  unitDetailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  unitActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  editButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde047",
  },
  toggleButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b91c1c",
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
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
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
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
