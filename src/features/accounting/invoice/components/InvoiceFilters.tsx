import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { ListParams } from "../types";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InvoiceFiltersProps {
  filters: ListParams;
  onFilterChange: (filters: ListParams) => void;
}

export default function InvoiceFilters({
  filters,
  onFilterChange,
}: InvoiceFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const updateFilter = (key: keyof ListParams, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      type: filters.type,
      status: undefined,
      from_date: undefined,
      to_date: undefined,
      search: undefined,
      sort: "voucher_date",
      direction: "desc",
    });
  };

  const activeFilterCount = [
    filters.status,
    filters.from_date,
    filters.to_date,
    filters.search,
  ].filter((f) => f).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices..."
          value={filters.search || ""}
          onChangeText={(text) => updateFilter("search", text)}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.filterButton} onPress={toggleExpanded}>
          <Text style={styles.filterIcon}>🔍</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Badges */}
      {activeFilterCount > 0 && (
        <View style={styles.badgesContainer}>
          {filters.status && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>Status: {filters.status}</Text>
              <TouchableOpacity
                onPress={() => updateFilter("status", undefined)}>
                <Text style={styles.filterTagClose}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.from_date && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>
                From: {filters.from_date}
              </Text>
              <TouchableOpacity
                onPress={() => updateFilter("from_date", undefined)}>
                <Text style={styles.filterTagClose}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.to_date && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>To: {filters.to_date}</Text>
              <TouchableOpacity
                onPress={() => updateFilter("to_date", undefined)}>
                <Text style={styles.filterTagClose}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Advanced Filters */}
      {expanded && (
        <View style={styles.advancedFilters}>
          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status || "all"}
                onValueChange={(value) =>
                  updateFilter("status", value === "all" ? undefined : value)
                }
                style={styles.picker}>
                <Picker.Item label="All Status" value="all" />
                <Picker.Item label="Draft" value="draft" />
                <Picker.Item label="Posted" value="posted" />
              </Picker>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>From Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={filters.from_date || ""}
              onChangeText={(text) => updateFilter("from_date", text)}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>To Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={filters.to_date || ""}
              onChangeText={(text) => updateFilter("to_date", text)}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.sort || "voucher_date"}
                onValueChange={(value) => updateFilter("sort", value)}
                style={styles.picker}>
                <Picker.Item label="Date" value="voucher_date" />
                <Picker.Item label="Invoice Number" value="voucher_number" />
                <Picker.Item label="Amount" value="total_amount" />
              </Picker>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Direction</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.direction || "desc"}
                onValueChange={(value) => updateFilter("direction", value)}
                style={styles.picker}>
                <Picker.Item label="Descending" value="desc" />
                <Picker.Item label="Ascending" value="asc" />
              </Picker>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  filterTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  filterTagClose: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  advancedFilters: {
    marginTop: 16,
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 44,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
});
