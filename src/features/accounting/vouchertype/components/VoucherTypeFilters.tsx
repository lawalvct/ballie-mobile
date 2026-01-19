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
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { ListParams } from "../types";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface VoucherTypeFiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  onSearch: () => void;
}

export default function VoucherTypeFilters({
  filters,
  setFilters,
  onSearch,
}: VoucherTypeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const activeFilterCount = [
    filters.status,
    filters.type,
    filters.category,
    filters.sort !== "name" ? filters.sort : undefined,
  ].filter((f) => f && f !== "all").length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, code..."
            placeholderTextColor="#9ca3af"
            value={filters.search || ""}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterToggleButton,
            isExpanded && styles.filterToggleButtonActive,
            activeFilterCount > 0 && styles.filterToggleButtonHasFilters,
          ]}
          onPress={toggleFilters}>
          <Text
            style={[
              styles.filterIcon,
              (isExpanded || activeFilterCount > 0) && styles.filterIconActive,
            ]}>
            ⚙️
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.advancedFilters}>
          <Text style={styles.sectionTitle}>Filter Options</Text>
          <View style={styles.grid}>
            {/* Status Filter */}
            <View style={styles.filterItem}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status:
                        value === "all"
                          ? undefined
                          : (value as "active" | "inactive"),
                    })
                  }
                  style={styles.picker}>
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="Active" value="active" />
                  <Picker.Item label="Inactive" value="inactive" />
                </Picker>
              </View>
            </View>

            {/* Type Filter */}
            <View style={styles.filterItem}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.type || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      type:
                        value === "all"
                          ? undefined
                          : (value as "system" | "custom"),
                    })
                  }
                  style={styles.picker}>
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="System" value="system" />
                  <Picker.Item label="Custom" value="custom" />
                </Picker>
              </View>
            </View>

            {/* Category Filter */}
            <View style={[styles.filterItem, styles.fullWidth]}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.category || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      category:
                        value === "all"
                          ? undefined
                          : (value as
                              | "accounting"
                              | "inventory"
                              | "POS"
                              | "payroll"
                              | "ecommerce"),
                    })
                  }
                  style={styles.picker}>
                  <Picker.Item label="All Categories" value="all" />
                  <Picker.Item label="Accounting" value="accounting" />
                  <Picker.Item label="Inventory" value="inventory" />
                  <Picker.Item label="POS" value="POS" />
                  <Picker.Item label="Payroll" value="payroll" />
                  <Picker.Item label="Ecommerce" value="ecommerce" />
                </Picker>
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterItem}>
              <Text style={styles.label}>Sort By</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.sort || "name"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      sort: value as
                        | "name"
                        | "code"
                        | "created_at"
                        | "is_active",
                    })
                  }
                  style={styles.picker}>
                  <Picker.Item label="Name" value="name" />
                  <Picker.Item label="Code" value="code" />
                  <Picker.Item label="Date" value="created_at" />
                  <Picker.Item label="Status" value="is_active" />
                </Picker>
              </View>
            </View>

            {/* Sort Direction */}
            <View style={styles.filterItem}>
              <Text style={styles.label}>Order</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.direction || "asc"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      direction: value as "asc" | "desc",
                    })
                  }
                  style={styles.picker}>
                  <Picker.Item label="Ascending" value="asc" />
                  <Picker.Item label="Descending" value="desc" />
                </Picker>
              </View>
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
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    height: "100%",
  },
  filterToggleButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  filterToggleButtonActive: {
    backgroundColor: BRAND_COLORS.gold + "20",
    borderColor: BRAND_COLORS.gold,
  },
  filterToggleButtonHasFilters: {
    borderColor: BRAND_COLORS.gold,
  },
  filterIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  filterIconActive: {
    opacity: 1,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  filterItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
  },
  picker: {
    height: 40,
    color: BRAND_COLORS.darkPurple,
    // Adjust scale for Android to fit better if needed, usually default is ok
  },
});
