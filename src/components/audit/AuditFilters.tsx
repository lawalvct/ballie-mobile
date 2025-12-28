import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function AuditFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUser, _setSelectedUser] = useState("");
  const [selectedAction, _setSelectedAction] = useState("");
  const [selectedModule, _setSelectedModule] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const _users = ["All Users", "John Doe", "Jane Smith", "Admin User"];
  const _actions = [
    "All Actions",
    "Create",
    "Update",
    "Delete",
    "View",
    "Export",
  ];
  const _modules = [
    "All Modules",
    "Accounting",
    "Inventory",
    "CRM",
    "POS",
    "Sales",
    "Purchase",
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <Text style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.filterGrid}>
            {/* Select User */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Select User</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {selectedUser || "All Users"}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </View>
            </View>

            {/* Select Action */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Select Action</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {selectedAction || "All Actions"}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </View>
            </View>

            {/* Select Module Type */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Select Module Type</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {selectedModule || "All Modules"}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </View>
            </View>

            {/* Date From */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Date From</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9ca3af"
                value={dateFrom}
                onChangeText={setDateFrom}
              />
            </View>

            {/* Date To */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Date To</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9ca3af"
                value={dateTo}
                onChangeText={setDateTo}
              />
            </View>

            {/* Search Activities */}
            <View style={[styles.filterItem, styles.searchItem]}>
              <Text style={styles.filterLabel}>Search Activities</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by description..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  headerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  expandIcon: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  filterGrid: {
    gap: 12,
  },
  filterItem: {
    marginBottom: 4,
  },
  searchItem: {
    width: "100%",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SEMANTIC_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  pickerIcon: {
    fontSize: 10,
    color: "#6b7280",
  },
  dateInput: {
    backgroundColor: SEMANTIC_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchInput: {
    backgroundColor: SEMANTIC_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.darkPurple,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.darkPurple,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
});
