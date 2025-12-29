import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { ListParams } from "../types";

interface AccountGroupFiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  onSearch: () => void;
}

export default function AccountGroupFilters({
  filters,
  setFilters,
  onSearch,
}: AccountGroupFiltersProps) {
  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or code..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
          onSubmitEditing={onSearch}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}>
        {/* Nature Filter */}
        <TouchableOpacity
          style={[styles.filterChip, filters.nature && styles.filterChipActive]}
          onPress={() =>
            setFilters({
              ...filters,
              nature:
                filters.nature === "assets"
                  ? "liabilities"
                  : filters.nature === "liabilities"
                  ? "equity"
                  : filters.nature === "equity"
                  ? "income"
                  : filters.nature === "income"
                  ? "expenses"
                  : filters.nature === "expenses"
                  ? undefined
                  : "assets",
            })
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.nature && styles.filterChipTextActive,
            ]}>
            {filters.nature
              ? `Nature: ${
                  filters.nature.charAt(0).toUpperCase() +
                  filters.nature.slice(1)
                }`
              : "All Natures"}
          </Text>
        </TouchableOpacity>

        {/* Status Filter */}
        <TouchableOpacity
          style={[styles.filterChip, filters.status && styles.filterChipActive]}
          onPress={() =>
            setFilters({
              ...filters,
              status:
                filters.status === "active"
                  ? "inactive"
                  : filters.status === "inactive"
                  ? undefined
                  : "active",
            })
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.status && styles.filterChipTextActive,
            ]}>
            {filters.status
              ? `Status: ${
                  filters.status.charAt(0).toUpperCase() +
                  filters.status.slice(1)
                }`
              : "All Status"}
          </Text>
        </TouchableOpacity>

        {/* Level Filter */}
        <TouchableOpacity
          style={[styles.filterChip, filters.level && styles.filterChipActive]}
          onPress={() =>
            setFilters({
              ...filters,
              level:
                filters.level === "parent"
                  ? "child"
                  : filters.level === "child"
                  ? undefined
                  : "parent",
            })
          }>
          <Text
            style={[
              styles.filterChipText,
              filters.level && styles.filterChipTextActive,
            ]}>
            {filters.level
              ? `Level: ${
                  filters.level.charAt(0).toUpperCase() + filters.level.slice(1)
                }`
              : "All Levels"}
          </Text>
        </TouchableOpacity>

        {/* Sort */}
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() =>
            setFilters({
              ...filters,
              direction: filters.direction === "asc" ? "desc" : "asc",
            })
          }>
          <Text style={styles.filterChipText}>
            Sort: {filters.sort} {filters.direction === "asc" ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>

        {/* Clear Filters */}
        {(filters.search ||
          filters.status ||
          filters.nature ||
          filters.level) && (
          <TouchableOpacity
            style={[styles.filterChip, styles.clearChip]}
            onPress={() =>
              setFilters({
                sort: "name",
                direction: "asc",
              })
            }>
            <Text style={styles.clearChipText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
  },
  chipsContainer: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: SEMANTIC_COLORS.background,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#d1b05e20",
    borderColor: BRAND_COLORS.gold,
  },
  filterChipText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  clearChip: {
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
  },
  clearChipText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "600",
  },
});
