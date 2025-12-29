import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import { ListParams } from "../types";

interface LedgerAccountFiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  onSearch: () => void;
}

export default function LedgerAccountFilters({
  filters,
  setFilters,
  onSearch,
}: LedgerAccountFiltersProps) {
  const handleFilterChange = (key: keyof ListParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sort: "code",
      direction: "asc",
      view_mode: filters.view_mode || "list", // Keep view mode
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search accounts..."
          value={filters.search || ""}
          onChangeText={(text) => handleFilterChange("search", text)}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}>
        {/* Account Type Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.account_type && styles.filterChipActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "account_type",
              filters.account_type ? undefined : "assets"
            )
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.account_type && styles.filterChipTextActive,
            ]}>
            {filters.account_type
              ? filters.account_type.charAt(0).toUpperCase() +
                filters.account_type.slice(1)
              : "Type"}
          </Text>
        </TouchableOpacity>

        {/* Status Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.status === "active" && styles.filterChipActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "status",
              filters.status === "active" ? undefined : "active"
            )
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.status === "active" && styles.filterChipTextActive,
            ]}>
            Active Only
          </Text>
        </TouchableOpacity>

        {/* With Balance Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.has_balance && styles.filterChipActive,
          ]}
          onPress={() =>
            handleFilterChange("has_balance", !filters.has_balance)
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.has_balance && styles.filterChipTextActive,
            ]}>
            With Balance
          </Text>
        </TouchableOpacity>

        {/* Parent Only Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.parent_id === null && styles.filterChipActive,
          ]}
          onPress={() =>
            handleFilterChange(
              "parent_id",
              filters.parent_id === null ? undefined : null
            )
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.parent_id === null && styles.filterChipTextActive,
            ]}>
            Parents Only
          </Text>
        </TouchableOpacity>

        {/* Sort Order */}
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() =>
            handleFilterChange(
              "direction",
              filters.direction === "asc" ? "desc" : "asc"
            )
          }>
          <Text style={styles.filterChipText}>
            {filters.direction === "asc" ? "↑ A-Z" : "↓ Z-A"}
          </Text>
        </TouchableOpacity>

        {/* Clear Button */}
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    fontSize: 15,
  },
  filtersRow: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  filterChipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
});
