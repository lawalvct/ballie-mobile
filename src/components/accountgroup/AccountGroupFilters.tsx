import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function AccountGroupFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedNature, setSelectedNature] = useState("All Natures");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");

  const statuses = ["All Statuses", "Active", "Inactive"];
  const natures = [
    "All Natures",
    "Assets",
    "Liabilities",
    "Equity",
    "Income",
    "Expenses",
  ];
  const levels = ["All Levels", "Parent", "Child"];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.headerText}>Filters</Text>
        <Text style={styles.arrow}>{isExpanded ? "▼" : "▶"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.filtersContent}>
          {/* Search */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Search</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by name..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Status */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipContainer}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    selectedStatus === status && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedStatus(status)}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedStatus === status && styles.chipTextSelected,
                    ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nature */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Nature</Text>
            <View style={styles.chipContainer}>
              {natures.map((nature) => (
                <TouchableOpacity
                  key={nature}
                  style={[
                    styles.chip,
                    selectedNature === nature && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedNature(nature)}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedNature === nature && styles.chipTextSelected,
                    ]}>
                    {nature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Level */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Level</Text>
            <View style={styles.chipContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.chip,
                    selectedLevel === level && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedLevel(level)}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedLevel === level && styles.chipTextSelected,
                    ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  arrow: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
  },
  filtersContent: {
    padding: 16,
    paddingTop: 0,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: SEMANTIC_COLORS.background,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  chip: {
    backgroundColor: SEMANTIC_COLORS.background,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  chipText: {
    fontSize: 13,
    color: "#6b7280",
  },
  chipTextSelected: {
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.background,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  applyButton: {
    flex: 2,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
