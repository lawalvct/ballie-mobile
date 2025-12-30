import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { ListParams, VoucherType } from "../types";

interface VoucherFiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  voucherTypes: VoucherType[];
}

export default function VoucherFilters({
  filters,
  setFilters,
  voucherTypes,
}: VoucherFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search || "");

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchText || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchText("");
    setFilters({
      page: 1,
      per_page: 20,
      sort_by: "voucher_date",
      sort_direction: "desc",
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vouchers..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}>
        {/* Voucher Type Filter */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filters.voucher_type_id || ""}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                voucher_type_id: value === "" ? undefined : Number(value),
                page: 1,
              }))
            }
            style={styles.picker}>
            <Picker.Item label="All Types" value="" />
            {voucherTypes.map((type) => (
              <Picker.Item
                key={type.id}
                label={`${type.code} - ${type.name}`}
                value={type.id}
              />
            ))}
          </Picker>
        </View>

        {/* Status Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.status === "draft" && styles.filterChipActive,
          ]}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: prev.status === "draft" ? undefined : "draft",
              page: 1,
            }))
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.status === "draft" && styles.filterChipTextActive,
            ]}>
            Draft
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.status === "posted" && styles.filterChipActive,
          ]}
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: prev.status === "posted" ? undefined : "posted",
              page: 1,
            }))
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.status === "posted" && styles.filterChipTextActive,
            ]}>
            Posted
          </Text>
        </TouchableOpacity>

        {/* Clear Filters */}
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  filtersRow: {
    paddingHorizontal: 20,
  },
  pickerWrapper: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    overflow: "hidden",
    minWidth: 160,
  },
  picker: {
    height: 40,
  },
  filterChip: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterChipTextActive: {
    color: BRAND_COLORS.darkPurple,
  },
  clearButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },
});
