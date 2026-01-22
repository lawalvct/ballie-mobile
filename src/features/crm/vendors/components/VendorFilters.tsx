import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { VendorListParams } from "../types";

interface Props {
  filters: VendorListParams;
  setFilters: (filters: VendorListParams) => void;
  onSearch: () => void;
}

export default function VendorFilters({
  filters,
  setFilters,
  onSearch,
}: Props) {
  const [searchText, setSearchText] = React.useState(filters.search || "");

  const handleSearch = () => {
    setFilters({ ...filters, search: searchText, page: 1 });
    onSearch();
  };

  const handleFilterToggle = (
    key: keyof VendorListParams,
    value: string | undefined,
  ) => {
    setFilters({
      ...filters,
      [key]: filters[key] === value ? undefined : value,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSearchText("");
    setFilters({
      sort: "created_at",
      direction: "desc",
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.vendor_type || filters.status || filters.search;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search vendors..."
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {/* Type Filters */}
        <TouchableOpacity
          style={[
            styles.chip,
            filters.vendor_type === "individual" && styles.chipActive,
          ]}
          onPress={() => handleFilterToggle("vendor_type", "individual")}>
          <Text
            style={[
              styles.chipText,
              filters.vendor_type === "individual" && styles.chipTextActive,
            ]}>
            Individual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filters.vendor_type === "business" && styles.chipActive,
          ]}
          onPress={() => handleFilterToggle("vendor_type", "business")}>
          <Text
            style={[
              styles.chipText,
              filters.vendor_type === "business" && styles.chipTextActive,
            ]}>
            Business
          </Text>
        </TouchableOpacity>

        {/* Status Filters */}
        <TouchableOpacity
          style={[
            styles.chip,
            filters.status === "active" && styles.chipActive,
          ]}
          onPress={() => handleFilterToggle("status", "active")}>
          <Text
            style={[
              styles.chipText,
              filters.status === "active" && styles.chipTextActive,
            ]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filters.status === "inactive" && styles.chipActive,
          ]}
          onPress={() => handleFilterToggle("status", "inactive")}>
          <Text
            style={[
              styles.chipText,
              filters.status === "inactive" && styles.chipTextActive,
            ]}>
            Inactive
          </Text>
        </TouchableOpacity>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "600",
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  chipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  chipText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
  },
  clearButtonText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "600",
  },
});
