# Feature Development Guide

This guide outlines the architecture pattern and best practices used in the Account Groups feature. Follow this template when building similar features like Ledger Accounts, Customers, Vendors, etc.

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Architecture Pattern](#architecture-pattern)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Code Templates](#code-templates)
5. [Best Practices](#best-practices)

---

## Folder Structure

```
src/features/{module-name}/
├── index.ts                          # Public exports
├── README.md                         # Feature documentation
├── components/                       # Presentational components
│   ├── {Module}Stats.tsx            # Statistics cards
│   ├── {Module}Filters.tsx          # Search & filters
│   └── {Module}List.tsx             # Data table/list
├── screens/                          # Screen components (containers)
│   ├── {Module}HomeScreen.tsx       # Main dashboard (data hub)
│   ├── {Module}CreateScreen.tsx     # Create form
│   ├── {Module}EditScreen.tsx       # Edit form
│   └── {Module}ShowScreen.tsx       # Detail view
├── services/                         # API service layer
│   └── {module}Service.ts           # HTTP requests
└── types/                            # TypeScript definitions
    └── index.ts                      # Type definitions
```

**Example:** For "Ledger Accounts", replace `{module-name}` with `ledgeraccount`, `{Module}` with `LedgerAccount`.

---

## Architecture Pattern

### Container/Presentational Pattern

**Home Screen (Container):**

- Fetches all data from API
- Manages loading, refreshing, and filter states
- Handles business logic (create, update, delete, toggle)
- Distributes data to child components via props

**Child Components (Presentational):**

- Receive data via props
- Display UI only
- Emit events to parent via callbacks
- No direct API calls

### Data Flow

```
API ← Service ← HomeScreen → Stats Component
                    ↓ → Filters Component
                    ↓ → List Component
```

---

## Step-by-Step Implementation

### 1. Define Types (`types/index.ts`)

```typescript
// Main entity interface
export interface {Module} {
  id: number;
  name: string;
  code?: string;
  // ... other fields
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// List parameters with filters
export interface ListParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  // ... other filters
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// Pagination info
export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Statistics
export interface Statistics {
  total: number;
  active: number;
  // ... other stats
}

// Form data response
export interface FormDataResponse {
  // ... dropdown options, etc.
}

// API response wrapper
export interface ListResponse {
  {modules}: {Module}[];  // e.g., ledger_accounts
  pagination: PaginationInfo;
  statistics: Statistics;
}

// Payloads
export interface Create{Module}Payload {
  name: string;
  // ... required fields
}

export interface Update{Module}Payload {
  name: string;
  // ... fields to update
}
```

### 2. Create Service Layer (`services/{module}Service.ts`)

```typescript
import apiClient from "../../../../api/client";
import type {
  {Module},
  ListParams,
  ListResponse,
  FormDataResponse,
  Create{Module}Payload,
  Update{Module}Payload,
} from "../types";

const BASE_PATH = "/tenant/{slug}/{module-path}";

export const {module}Service = {
  /**
   * Get form data (dropdowns, options)
   */
  async getFormData(): Promise<FormDataResponse> {
    const response = await apiClient.get(`${BASE_PATH}/create`);
    return response.data;
  },

  /**
   * Create new record
   */
  async create(data: Create{Module}Payload): Promise<{Module}> {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data.{module};  // Adjust based on API response
  },

  /**
   * List records with filters
   */
  async list(params: ListParams = {}): Promise<ListResponse> {
    // Clean params: remove undefined, null, empty string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) =>
          value !== undefined && value !== null && value !== ""
      )
    );

    const response = await apiClient.get(BASE_PATH, { params: cleanParams });
    return response.data;  // apiClient interceptor unwraps response.data
  },

  /**
   * Get single record
   */
  async show(id: number): Promise<{Module}> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data.{module};
  },

  /**
   * Update record
   */
  async update(
    id: number,
    data: Update{Module}Payload
  ): Promise<{Module}> {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data.{module};
  },

  /**
   * Toggle active status
   */
  async toggleStatus(id: number): Promise<{Module}> {
    const response = await apiClient.patch(
      `${BASE_PATH}/${id}/toggle-status`
    );
    return response.data.{module};
  },

  /**
   * Delete record
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
```

**Important:** The `apiClient` has a response interceptor that returns `response.data`, so service methods should return `response.data` (not `response.data.data`).

### 3. Build Home Screen (`screens/{Module}HomeScreen.tsx`)

```typescript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import {Module}Stats from "../components/{Module}Stats";
import {Module}Filters from "../components/{Module}Filters";
import {Module}List from "../components/{Module}List";
import { {module}Service } from "../services/{module}Service";
import { {Module}, ListParams, PaginationInfo, Statistics } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "{Module}Home"
>;

export default function {Module}HomeScreen({ navigation }: Props) {
  // State
  const [{modules}, set{Module}s] = useState<{Module}[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ListParams>({
    sort: "name",
    direction: "asc",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await {module}Service.list(filters);

      set{Module}s(response.{modules} || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await {module}Service.toggleStatus(id);
      showToast("✅ Status updated successfully", "success");
      loadData();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  // Targeted update for edit (no full reload)
  const handleItemUpdated = async (id: number) => {
    try {
      const updated = await {module}Service.show(id);
      set{Module}s((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      showToast("✅ Updated successfully", "success");
    } catch (error: any) {
      // Fallback to full reload if fetch fails
      loadData();
    }
  };

  // Full reload for create (to maintain proper ordering)
  const handleItemCreated = () => {
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{Module}s</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{Module}s</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Add New Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("{Module}Create", {
                onCreated: handleItemCreated,
              } as any)
            }>
            <Text style={styles.addButtonText}>+ Add New {Module}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <{Module}Stats statistics={statistics} />

        {/* Filters Section */}
        <{Module}Filters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* List Section */}
        <{Module}List
          {modules}={{modules}}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
          onItemUpdated={handleItemUpdated}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
```

### 4. Build Child Components

#### Stats Component (`components/{Module}Stats.tsx`)

```typescript
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../../../../theme/colors";
import { Statistics } from "../types";

interface {Module}StatsProps {
  statistics: Statistics | null;
}

export default function {Module}Stats({ statistics }: {Module}StatsProps) {
  if (!statistics) return null;

  const stats = [
    {
      label: "Total",
      value: statistics.total,
      gradient: ["#8B5CF6", "#6D28D9"],
    },
    {
      label: "Active",
      value: statistics.active,
      gradient: ["#10B981", "#059669"],
    },
    // Add more stats...
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <LinearGradient
            key={index}
            colors={stat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
```

#### Filters Component (`components/{Module}Filters.tsx`)

```typescript
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

interface {Module}FiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  onSearch: () => void;
}

export default function {Module}Filters({
  filters,
  setFilters,
  onSearch,
}: {Module}FiltersProps) {
  const handleFilterChange = (key: keyof ListParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sort: "name",
      direction: "asc",
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
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

        {/* Add more filters... */}

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearFilters}>
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
```

#### List Component (`components/{Module}List.tsx`)

```typescript
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BRAND_COLORS } from "../../../../theme/colors";
import { {Module}, PaginationInfo } from "../types";

interface {Module}ListProps {
  {modules}: {Module}[];
  pagination: PaginationInfo | null;
  onToggleStatus: (id: number) => void;
  onItemUpdated: (id: number) => void;
}

export default function {Module}List({
  {modules},
  pagination,
  onToggleStatus,
  onItemUpdated,
}: {Module}ListProps) {
  const navigation = useNavigation();

  if (!{modules} || {modules}.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No records found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Records ({pagination?.total || 0})</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerCell, styles.codeColumn]}>Code</Text>
            <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionsColumn]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {{modules}.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
              <Text style={[styles.cell, styles.codeColumn]}>{item.code}</Text>
              <View style={[styles.cell, styles.statusColumn]}>
                <View
                  style={[
                    styles.statusBadge,
                    item.is_active
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}>
                  <Text style={styles.statusText}>
                    {item.is_active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, styles.actionsColumn]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                      navigation.navigate("{Module}Show", { id: item.id } as any)
                    }>
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() =>
                      navigation.navigate("{Module}Edit", {
                        id: item.id,
                        onUpdated: onItemUpdated,
                      } as any)
                    }>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      item.is_active
                        ? styles.deactivateButton
                        : styles.activateButton,
                    ]}
                    onPress={() => onToggleStatus(item.id)}>
                    <Text style={styles.actionButtonText}>
                      {item.is_active ? "Deactivate" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination Info */}
      {pagination && (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Showing {pagination.from} to {pagination.to} of {pagination.total}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  table: {
    minWidth: 1000,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerCell: {
    padding: 16,
    fontWeight: "600",
    fontSize: 14,
    color: "#374151",
  },
  cell: {
    padding: 16,
    fontSize: 14,
    color: "#1f2937",
  },
  nameColumn: { width: 300 },
  codeColumn: { width: 150 },
  statusColumn: { width: 150 },
  actionsColumn: { width: 400 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: "#dbeafe",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  deactivateButton: {
    backgroundColor: "#fee2e2",
  },
  activateButton: {
    backgroundColor: "#d1fae5",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  pagination: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
```

### 5. Create/Edit Screens

#### Create Screen Template

```typescript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { {module}Service } from "../services/{module}Service";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<AccountingStackParamList, "{Module}Create">;

export default function {Module}CreateScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    // ... other fields
  });

  // Extract callback from route params
  const onCreated = (route.params as any)?.onCreated;

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    try {
      setLoading(true);
      await {module}Service.create(formData);
      showToast("✅ Created successfully", "success");

      // Trigger callback to refresh list
      if (onCreated) {
        onCreated();
      }

      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to create", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create {Module}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter name"
          />
        </View>

        {/* Add more fields... */}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: BRAND_COLORS.darkPurple,
    gap: 20,
  },
  backButton: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "bold",
  },
});
```

#### Edit Screen Template

Similar to Create Screen, but:

1. Fetch existing data in `useEffect`
2. Pre-populate form fields
3. Call `{module}Service.update(id, formData)`
4. Extract `onUpdated` callback and call `onUpdated(id)` after success

### 6. Update Navigation

#### Add to `navigation/types.ts`:

```typescript
export type AccountingStackParamList = {
  // ... existing routes

  // {Module}s Module
  {Module}Home: undefined;
  {Module}Create: undefined;
  {Module}Show: { id: number };
  {Module}Edit: { id: number };
};
```

#### Add to `navigation/AccountingNavigator.tsx`:

```typescript
import {Module}HomeScreen from "../features/accounting/{module}/screens/{Module}HomeScreen";
import {Module}CreateScreen from "../features/accounting/{module}/screens/{Module}CreateScreen";
import {Module}EditScreen from "../features/accounting/{module}/screens/{Module}EditScreen";
import {Module}ShowScreen from "../features/accounting/{module}/screens/{Module}ShowScreen";

// Inside Stack.Navigator:
<Stack.Screen
  name="{Module}Home"
  component={{Module}HomeScreen}
  options={{ title: "{Module}s" }}
/>
<Stack.Screen
  name="{Module}Create"
  component={{Module}CreateScreen}
  options={{ title: "Create {Module}" }}
/>
<Stack.Screen
  name="{Module}Edit"
  component={{Module}EditScreen}
  options={{ title: "Edit {Module}" }}
/>
<Stack.Screen
  name="{Module}Show"
  component={{Module}ShowScreen}
  options={{ title: "{Module} Details" }}
/>
```

---

## Best Practices

### 1. **API Response Handling**

```typescript
// ✅ CORRECT - apiClient interceptor unwraps response.data
async list(): Promise<ListResponse> {
  const response = await apiClient.get(BASE_PATH);
  return response.data;  // This is already the actual data
}

// ❌ WRONG - Double unwrapping
async list(): Promise<ListResponse> {
  const response = await apiClient.get(BASE_PATH);
  return response.data.data;  // Too deep!
}
```

### 2. **Update Strategies**

- **Edit (Targeted Update):** Fetch single updated item, update in-place

  - ✅ No jarring full reload
  - ✅ Smooth UX

- **Create (Full Reload):** Reload entire list
  - ✅ Maintains proper ordering (newest first, sorted, etc.)
  - ✅ Updates pagination/statistics

### 3. **Filter Parameter Cleaning**

Always clean params before sending to API:

```typescript
const cleanParams = Object.fromEntries(
  Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ""
  )
);
```

### 4. **Callback Pattern**

Pass callbacks via navigation params:

```typescript
// Parent (Home Screen)
navigation.navigate("{Module}Edit", {
  id: item.id,
  onUpdated: handleItemUpdated,
} as any);

// Child (Edit Screen)
const onUpdated = (route.params as any)?.onUpdated;
// After save:
if (onUpdated) {
  onUpdated(id);
}
navigation.goBack();
```

### 5. **Toast Notifications**

```typescript
import { showToast } from "../../../../utils/toast";

// Success
showToast("✅ Operation successful", "success");

// Error
showToast(error.message || "Operation failed", "error");
```

### 6. **Loading States**

- Show `ActivityIndicator` for initial load
- Use `RefreshControl` for pull-to-refresh
- Disable buttons during submission

### 7. **TypeScript Types**

- Define all interfaces in `types/index.ts`
- Export and import explicitly
- Use proper typing for navigation props
- Type all API responses

### 8. **Component Responsibilities**

| Component   | Responsibility                                  |
| ----------- | ----------------------------------------------- |
| HomeScreen  | Data fetching, state management, business logic |
| Stats       | Display statistics cards only                   |
| Filters     | Display filter UI, emit changes                 |
| List        | Display table, emit action events               |
| Create/Edit | Form handling, validation, submission           |
| Show        | Display read-only detail view                   |

### 9. **Navigation Back Button**

Always include back button in header:

```typescript
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backButtonText}>← Back</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Screen Title</Text>
  <View style={styles.placeholder} />
</View>
```

### 10. **Error Handling**

```typescript
try {
  // Operation
} catch (error: any) {
  showToast(error.message || "Default error message", "error");
  // Optional: Log error for debugging
  console.error("Operation failed:", error);
}
```

---

## Quick Checklist

When building a new feature, check off:

- [ ] Created folder structure in `src/features/{module-name}/`
- [ ] Defined all TypeScript types in `types/index.ts`
- [ ] Created service layer with all CRUD methods
- [ ] Built HomeScreen (container) with data fetching
- [ ] Built Stats component (presentational)
- [ ] Built Filters component (presentational)
- [ ] Built List component (presentational)
- [ ] Created Create/Edit/Show screens
- [ ] Added navigation types to `types.ts`
- [ ] Registered screens in navigator
- [ ] Implemented targeted updates for Edit
- [ ] Implemented full reload for Create
- [ ] Added back button to all screens
- [ ] Added loading states and error handling
- [ ] Added toast notifications
- [ ] Tested all CRUD operations
- [ ] Verified navigation flow

---

## Summary

This architecture provides:

✅ **Separation of Concerns:** Container vs Presentational
✅ **Reusability:** Child components can be reused
✅ **Type Safety:** Full TypeScript coverage
✅ **Performance:** Targeted updates minimize reloads
✅ **UX:** Smooth interactions with proper loading states
✅ **Maintainability:** Clear structure, easy to debug
✅ **Scalability:** Pattern applies to any CRUD feature

Follow this guide to maintain consistency across all features in the app.
