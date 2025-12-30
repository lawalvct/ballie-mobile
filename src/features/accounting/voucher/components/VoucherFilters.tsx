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
import DateTimePicker from "@react-native-community/datetimepicker";
import { ListParams, VoucherType } from "../types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";

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
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.voucher_type_id) count++;
    if (filters.status) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search vouchers..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor="#9ca3af"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
              }}
              style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Filters Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}>
        {/* Voucher Type Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterCardLabel}>📋 Type</Text>
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
              style={styles.picker}
              dropdownIconColor={BRAND_COLORS.darkPurple}>
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
        </View>

        {/* Status Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.filterCardLabel}>📊 Status</Text>
          <View style={styles.statusChipsContainer}>
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
                📝 Draft
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
                ✅ Posted
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range Toggle */}
        <TouchableOpacity
          style={[
            styles.filterCard,
            styles.advancedToggle,
            showAdvanced && styles.advancedToggleActive,
          ]}
          onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.filterCardLabel}>
            📅 Date Range {showAdvanced ? "▼" : "▶"}
          </Text>
        </TouchableOpacity>

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>
              🗑️ Clear ({activeFilterCount})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Advanced Filters - Date Range */}
      {showAdvanced && (
        <View style={styles.advancedSection}>
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateFromPicker(true)}>
                <Text style={styles.dateButtonText}>
                  {filters.date_from || "Select date"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {showDateFromPicker && (
                <DateTimePicker
                  value={
                    filters.date_from ? new Date(filters.date_from) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDateFromPicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate
                        .toISOString()
                        .split("T")[0];
                      setFilters((prev) => ({
                        ...prev,
                        date_from: formattedDate,
                        page: 1,
                      }));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateToPicker(true)}>
                <Text style={styles.dateButtonText}>
                  {filters.date_to || "Select date"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {showDateToPicker && (
                <DateTimePicker
                  value={
                    filters.date_to ? new Date(filters.date_to) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDateToPicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate
                        .toISOString()
                        .split("T")[0];
                      setFilters((prev) => ({
                        ...prev,
                        date_to: formattedDate,
                        page: 1,
                      }));
                    }
                  }}
                />
              )}
            </View>
          </View>

          {(filters.date_from || filters.date_to) && (
            <TouchableOpacity
              style={styles.clearDatesButton}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  date_from: undefined,
                  date_to: undefined,
                  page: 1,
                }))
              }>
              <Text style={styles.clearDatesText}>Clear Dates</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#f9fafb",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "600",
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  filtersRow: {
    paddingHorizontal: 20,
  },
  filtersContent: {
    paddingRight: 20,
    gap: 12,
  },
  filterCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    minWidth: 160,
  },
  picker: {

    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "500",
    height: 50,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statusChipsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
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
    fontWeight: "700",
  },
  advancedToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  advancedToggleActive: {
    backgroundColor: BRAND_COLORS.gold + "20",
    borderColor: BRAND_COLORS.gold,
  },
  clearButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#991b1b",
  },
  advancedSection: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateRangeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "500",
  },
  calendarIcon: {
    fontSize: 16,
  },
  clearDatesButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  clearDatesText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },
});
