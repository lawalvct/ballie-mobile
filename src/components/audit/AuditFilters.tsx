import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type {
  AuditUser,
  AuditAction,
  AuditDashboardFilters,
} from "../../features/audit/types";

interface Props {
  users: AuditUser[];
  onApply: (filters: AuditDashboardFilters) => void;
  onClear: () => void;
}

const ACTION_OPTIONS: { label: string; value: AuditAction | "" }[] = [
  { label: "All Actions", value: "" },
  { label: "Created", value: "created" },
  { label: "Updated", value: "updated" },
  { label: "Deleted", value: "deleted" },
  { label: "Posted", value: "posted" },
  { label: "Restored", value: "restored" },
];

const MODEL_OPTIONS: { label: string; value: string }[] = [
  { label: "All Models", value: "" },
  { label: "Customer", value: "customer" },
  { label: "Vendor", value: "vendor" },
  { label: "Product", value: "product" },
  { label: "Voucher", value: "voucher" },
];

export default function AuditFilters({ users, onApply, onClear }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [selectedAction, setSelectedAction] = useState<AuditAction | "">("");
  const [selectedModel, setSelectedModel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApply = () => {
    onApply({
      user_id: selectedUserId,
      action: selectedAction || undefined,
      model: selectedModel || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: searchQuery || undefined,
    });
  };

  const handleClear = () => {
    setSelectedUserId(undefined);
    setSelectedAction("");
    setSelectedModel("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    onClear();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.filterIcon}>🔍</Text>
          <Text style={styles.sectionTitle}>Filters</Text>
        </View>
        <View style={styles.expandBadge}>
          <Text style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search activities..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* User Chips */}
          <Text style={styles.filterLabel}>User</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}>
            <TouchableOpacity
              style={[
                styles.chip,
                !selectedUserId && styles.chipActive,
              ]}
              onPress={() => setSelectedUserId(undefined)}>
              <Text
                style={[
                  styles.chipText,
                  !selectedUserId && styles.chipTextActive,
                ]}>
                All Users
              </Text>
            </TouchableOpacity>
            {users.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.chip,
                  selectedUserId === u.id && styles.chipActive,
                ]}
                onPress={() => setSelectedUserId(u.id)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedUserId === u.id && styles.chipTextActive,
                  ]}>
                  {u.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Chips */}
          <Text style={styles.filterLabel}>Action</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}>
            {ACTION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value || "all"}
                style={[
                  styles.chip,
                  selectedAction === opt.value && styles.chipActive,
                ]}
                onPress={() => setSelectedAction(opt.value)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedAction === opt.value && styles.chipTextActive,
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Model Chips */}
          <Text style={styles.filterLabel}>Model Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}>
            {MODEL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value || "all"}
                style={[
                  styles.chip,
                  selectedModel === opt.value && styles.chipActive,
                ]}
                onPress={() => setSelectedModel(opt.value)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedModel === opt.value && styles.chipTextActive,
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Date Range */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.filterLabel}>Date From</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={dateFrom}
                onChangeText={setDateFrom}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.filterLabel}>Date To</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={dateTo}
                onChangeText={setDateTo}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  expandBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  expandIcon: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: SEMANTIC_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  chipScroll: {
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  chipTextActive: {
    color: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: SEMANTIC_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: BRAND_COLORS.darkPurple,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
