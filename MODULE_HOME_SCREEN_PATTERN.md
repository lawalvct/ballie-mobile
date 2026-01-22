# Module Home/Index Screen Layout Pattern

## Overview

This document defines the standardized layout pattern for all module home/index screens in the Ballie Mobile application. This pattern ensures consistency across the app and provides a familiar user experience.

---

## Screen Structure

The standard layout follows this hierarchy:

```
SafeAreaView (container)
├── StatusBar
├── Header
│   ├── Back Button (left)
│   ├── Title (center)
│   └── Placeholder (right)
└── ScrollView (with RefreshControl)
    ├── Action Buttons Section
    │   ├── Primary Action Button (Create/Add)
    │   └── Secondary Action Buttons (Export, Import, etc.)
    ├── Statistics Cards Section
    ├── Filters Section
    ├── List/Table Section
    └── Pagination Section (if needed)
```

---

## Implementation Guide

### 1. Imports

```typescript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../theme/colors";
```

### 2. Component Structure

```typescript
export default function ModuleHomeScreen() {
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    sort: "created_at",
    direction: "desc",
    page: 1,
  });

  // Load data on mount and filter changes
  useEffect(() => {
    loadData();
  }, [filters]);

  // Data loading function
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await moduleService.list(filters);
      setItems(response.data || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state UI
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Module Name</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main content UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Module Name</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          {/* Primary Action - Create */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleCreatePress}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Create New Item</Text>
          </TouchableOpacity>

          {/* Secondary Actions Row (Optional) */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport}>
              <Text style={styles.secondaryBtnIcon}>📥</Text>
              <Text style={styles.secondaryBtnText}>Import</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportExcel}>
              <Text style={styles.secondaryBtnIcon}>📊</Text>
              <Text style={styles.secondaryBtnText}>Export Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportPdf}>
              <Text style={styles.secondaryBtnIcon}>📄</Text>
              <Text style={styles.secondaryBtnText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        {statistics && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.total_items}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.active_items}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </LinearGradient>
              {/* Add more stat cards as needed */}
            </View>
          </View>
        )}

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search items..."
              placeholderTextColor="#9ca3af"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Section */}
        <View style={styles.listSection}>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Items Found</Text>
              <Text style={styles.emptyText}>
                Create your first item to get started
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <ModuleCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item)}
              />
            ))
          )}
        </View>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from} to {pagination.to} of {pagination.total}
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 && styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === 1 &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  ← Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === pagination.last_page &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === pagination.last_page &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### 3. Standard Styles

```typescript
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },

  // Header
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
    width: 60, // Matches back button width for centering
  },

  // Content
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Loading
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

  // Action Buttons
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },

  // Statistics Section (with LinearGradient)
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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

  // Filters Section
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },

  // List Section
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Empty State
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  // Pagination (Enhanced Layout)
  paginationContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  paginationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
```

---

## Key Features

### 1. **Consistent Header**

- Back button on the left (gold color)
- Centered title (white text)
- Placeholder on the right for visual balance

### 2. **Action Buttons**

- Large primary button for main action (Create/Add)
- Optional secondary buttons for auxiliary actions (Import/Export)
- Gold primary button, white secondary buttons

### 3. **Pull-to-Refresh**

- Implemented via RefreshControl on ScrollView
- Shows loading indicator while refreshing
- Reloads data on pull down

### 4. **Statistics Section (Enhanced)**

- **Section Title**: "Overview" label above stats cards
- **LinearGradient Cards**: Beautiful gradient backgrounds for visual appeal
  - Purple gradient: `["#8B5CF6", "#6D28D9"]` - Primary/Total metrics
  - Green gradient: `["#10B981", "#059669"]` - Active/Success metrics
  - Orange gradient: `["#F59E0B", "#D97706"]` - Warning/Pending metrics
  - Blue gradient: `["#3B82F6", "#2563EB"]` - Info/Secondary metrics
- **Large Values**: fontSize 32 with white text for better readability
- **Grid Layout**: 2x2 responsive grid (47% width per card with gap)
- **Enhanced Shadows**: shadowOpacity 0.1, shadowRadius 8 for better depth

### 5. **Filters Section (Enhanced)**

- **Search Container**: Input field with dedicated Search button
- **Button Styling**: Gold background matching primary action color
- **Keyboard Support**: returnKeyType="search" for better UX
- **Responsive Layout**: Flex layout with gap between input and button
- Updates list in real-time
- Resets pagination to page 1 on filter change

### 6. **List/Table Section**

- Renders items as cards or table rows
- Empty state with icon and helpful message
- Scrollable within main ScrollView

### 7. **Pagination (Enhanced)**

- **Two-tier Layout**: Info section above button row
- **Primary Info**: "Page X of Y" in bold text
- **Secondary Info**: "Showing X to Y of Z" in smaller, gray text
- **Arrow Icons**: ← and → for better visual affordance
- **Button Layout**: Centered with equal width (minWidth: 120)
- **Disabled State**: Grayed out with reduced opacity at boundaries
- Only shows if multiple pages exist (last_page > 1)

### 8. **Loading States**

- Full-screen loading on initial load
- Subtle refreshing state for pull-to-refresh
- ActivityIndicator with brand colors

---

## Color Scheme

- **Primary Purple**: `BRAND_COLORS.darkPurple` - Header, text
- **Gold**: `BRAND_COLORS.gold` - Primary actions, highlights
- **White**: `#fff` - Cards, buttons
- **Gray Backgrounds**: `#f5f5f5` - Content background
- **Gray Text**: `#6b7280` - Secondary text

---

## Responsive Considerations

- Use `flex` for responsive layouts
- `gap` property for spacing (may need polyfill for older RN versions)
- Percentage widths for grid layouts (48% for 2-column)
- Proper padding/margins for touch targets (minimum 44px)

---

## Styling Guidelines

### LinearGradient for Statistics

**Installation Required**: `npx expo install expo-linear-gradient`

**Recommended Gradient Colors**:

- **Purple** `["#8B5CF6", "#6D28D9"]` - Total/Primary metrics
- **Green** `["#10B981", "#059669"]` - Active/Success states
- **Orange** `["#F59E0B", "#D97706"]` - Warning/Pending items
- **Blue** `["#3B82F6", "#2563EB"]` - Info/Secondary data
- **Red** `["#EF4444", "#DC2626"]` - Error/Inactive states
- **Teal** `["#14B8A6", "#0D9488"]` - Additional metrics

**Usage**:

```tsx
<LinearGradient
  colors={["#8B5CF6", "#6D28D9"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.statCard}>
  <Text style={styles.statValue}>{value}</Text>
  <Text style={styles.statLabel}>{label}</Text>
</LinearGradient>
```

### Shadow Enhancements

**Standard Card Shadows**:

```typescript
shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 3, // Android
```

**Primary Button Shadows** (more prominent):

```typescript
shadowColor: "#000",
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
elevation: 5,
```

### Typography Scale

- **Section Titles**: fontSize 18, fontWeight "bold"
- **Stat Values**: fontSize 32, fontWeight "bold", color "#fff"
- **Stat Labels**: fontSize 14, fontWeight "500", color "rgba(255, 255, 255, 0.9)"
- **Card Titles**: fontSize 15-16, fontWeight "700"
- **Body Text**: fontSize 14, fontWeight "400"
- **Meta/Secondary**: fontSize 12, color "#6b7280"
- **Button Text**: fontSize 14-16, fontWeight "600"

### Spacing System

- **Screen Horizontal Padding**: 20px
- **Section Vertical Padding**: 16px
- **Card Padding**: 16-20px
- **Button Padding**: Vertical 12-16px, Horizontal 20-24px
- **Gap Between Elements**: 8-12px
- **Border Radius**: 8-16px (larger for cards, smaller for buttons)

---

## Component-Based Architecture

For better code organization and reusability, consider breaking down the home screen into separate components:

### Stats Component Pattern

**File**: `ModuleStats.tsx` (e.g., `LedgerAccountStats.tsx`, `CustomerStats.tsx`)

**Purpose**: Display overview statistics with gradient cards

**Props Interface**:

```typescript
interface ModuleStatsProps {
  statistics: Statistics | null;
}
```

**Component Structure**:

```tsx
export default function ModuleStats({ statistics }: ModuleStatsProps) {
  if (!statistics) return null;

  const stats = [
    {
      label: "Total Items",
      value: statistics.total_items,
      gradient: ["#8B5CF6", "#6D28D9"],
    },
    {
      label: "Active Items",
      value: statistics.active_items,
      gradient: ["#10B981", "#059669"],
    },
    // Add more stats as needed
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
```

**Key Styles**:

- Container: paddingHorizontal 20px, paddingVertical 16px
- Title: fontSize 18, fontWeight "bold", color BRAND_COLORS.darkPurple
- Stats Grid: flexDirection "row", flexWrap "wrap", gap 12px
- Stat Card: flex 1, minWidth "47%", padding 20px, borderRadius 16px
- Stat Value: fontSize 32, fontWeight "bold", color "#fff"
- Stat Label: fontSize 14, color "rgba(255, 255, 255, 0.9)"

---

### Filters Component Pattern

**File**: `ModuleFilters.tsx` (e.g., `LedgerAccountFilters.tsx`, `CustomerFilters.tsx`)

**Purpose**: Handle search, filtering, and sorting with interactive chips

**Props Interface**:

```typescript
interface ModuleFiltersProps {
  filters: ListParams;
  setFilters: React.Dispatch<React.SetStateAction<ListParams>>;
  onSearch: () => void;
}
```

**Component Structure**:

```tsx
export default function ModuleFilters({
  filters,
  setFilters,
  onSearch,
}: ModuleFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search || "");

  const handleFilterChange = (key: keyof ListParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchText("");
    setFilters({
      sort: "created_at",
      direction: "desc",
      search: undefined,
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
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
        style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, isActive && styles.filterChipActive]}
          onPress={handleFilterToggle}>
          <Text
            style={[
              styles.filterChipText,
              isActive && styles.filterChipTextActive,
            ]}>
            Filter Name
          </Text>
        </TouchableOpacity>

        {/* Clear Button */}
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
```

**Key Styles**:

- Container: paddingHorizontal 20px, paddingVertical 12px, backgroundColor "#fff"
- Search Container: flexDirection "row", gap 12px
- Search Input: flex 1, height 44px, backgroundColor "#f3f4f6", borderRadius 8px, paddingHorizontal 16px
- Search Button: backgroundColor BRAND_COLORS.gold, paddingHorizontal 20px, borderRadius 8px
- Filter Chip: paddingHorizontal 16px, paddingVertical 8px, borderRadius 20px (pill shape), backgroundColor "#f3f4f6"
- Filter Chip Active: backgroundColor BRAND_COLORS.darkPurple, color "#fff"
- Clear Button: backgroundColor "#fee2e2" (light red), color "#dc2626" (red text)

**Filter Chip Pattern**:

- Inactive: Gray background (#f3f4f6) with gray text (#6b7280)
- Active: Purple background (BRAND_COLORS.darkPurple) with white text
- Horizontal scrollable row for overflow handling
- Toggle behavior on press

---

### List Component Pattern

**File**: `ModuleList.tsx` (e.g., `LedgerAccountList.tsx`, `CustomerList.tsx`)

**Purpose**: Display items in table/tree view with actions and pagination

**Props Interface**:

```typescript
interface ModuleListProps {
  items: Item[];
  pagination: PaginationInfo | null;
  viewMode?: "list" | "tree";
  onToggleView?: () => void;
  onDelete?: (id: number) => void;
  onItemUpdated?: (id: number) => void;
  onPageChange: (page: number) => void;
}
```

**Component Structure**:

```tsx
export default function ModuleList({
  items,
  pagination,
  viewMode = "list",
  onToggleView,
  onDelete,
  onItemUpdated,
  onPageChange,
}: ModuleListProps) {
  const navigation = useNavigation();

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Title and View Toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Items ({pagination?.total || 0})</Text>
        {onToggleView && (
          <TouchableOpacity style={styles.viewToggle} onPress={onToggleView}>
            <Text style={styles.viewToggleText}>
              {viewMode === "list" ? "🌳 Tree" : "📋 List"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items Display */}
      <ScrollView>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {/* Item content */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}>
                <Text style={styles.actionButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <View style={styles.pagination}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Page {pagination.current_page} of {pagination.last_page}
            </Text>
            <Text style={styles.paginationSubtext}>
              Showing {pagination.from} to {pagination.to} of {pagination.total}
            </Text>
          </View>
          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                disabled && styles.paginationButtonDisabled,
              ]}
              onPress={() => onPageChange(pagination.current_page - 1)}>
              <Text style={styles.paginationButtonText}>← Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                disabled && styles.paginationButtonDisabled,
              ]}
              onPress={() => onPageChange(pagination.current_page + 1)}>
              <Text style={styles.paginationButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
```

**Key Styles**:

- Container: marginHorizontal 20px, marginVertical 16px, backgroundColor "#fff", borderRadius 12px, with shadow
- Header: flexDirection "row", justifyContent "space-between", padding 16px, borderBottom 1px
- Title: fontSize 18, fontWeight "bold", color BRAND_COLORS.darkPurple
- View Toggle: backgroundColor BRAND_COLORS.gold, paddingHorizontal 16px, paddingVertical 8px, borderRadius 8px
- Action Buttons: flexDirection "row", gap 8px
  - View Button: backgroundColor "#dbeafe" (light blue)
  - Edit Button: backgroundColor "#fef3c7" (light yellow)
  - Delete Button: backgroundColor "#fee2e2" (light red)
- Action Button Text: fontSize 13, fontWeight "600", color "#1f2937"
- Status Badge: paddingHorizontal 12px, paddingVertical 4px, borderRadius 12px
  - Active: backgroundColor "#d1fae5" (light green)
  - Inactive: backgroundColor "#fee2e2" (light red)

**Empty State Pattern**:

```tsx
<View style={styles.emptyContainer}>
  <Text style={styles.emptyIcon}>📋</Text>
  <Text style={styles.emptyTitle}>No Items Found</Text>
  <Text style={styles.emptyText}>Create your first item to get started</Text>
</View>
```

**Pagination Inside Component**:

- Two-tier layout: Info section above buttons
- Centered alignment with gap between buttons
- Disabled state with opacity 0.6 and gray background
- Min width 120px per button for consistency

---

### Component File Structure

```
src/features/module/submodule/
├── components/
│   ├── ModuleStats.tsx
│   ├── ModuleFilters.tsx
│   ├── ModuleList.tsx
│   └── ModuleCard.tsx (optional)
├── screens/
│   ├── ModuleHomeScreen.tsx
│   ├── ModuleCreateScreen.tsx
│   └── ModuleEditScreen.tsx
├── services/
│   └── moduleService.ts
└── types/
    └── index.ts
```

**Example Implementation**:

```
src/features/accounting/ledgeraccount/
├── components/
│   ├── LedgerAccountStats.tsx      ⭐ Reference
│   ├── LedgerAccountFilters.tsx    ⭐ Reference
│   └── LedgerAccountList.tsx       ⭐ Reference
├── screens/
│   ├── LedgerAccountHomeScreen.tsx (uses above components)
│   ├── LedgerAccountCreateScreen.tsx
│   └── LedgerAccountEditScreen.tsx
```

**Benefits of Component-Based Approach**:

1. **Reusability**: Components can be used across multiple screens
2. **Maintainability**: Changes to styling affect all instances
3. **Testability**: Easier to unit test individual components
4. **Readability**: Home screen remains clean and focused
5. **Consistency**: Enforces uniform patterns across modules

---

## Examples

### Implemented Modules

1. **Ledger Account Home Screen** - `src/screens/LedgerAccountHomeScreen.tsx` ⭐ Reference implementation
2. **Customer Home Screen** - `src/features/crm/customers/screens/CustomerHomeScreen.tsx` ⭐ Latest pattern
3. **Invoice Home Screen** - `src/features/accounting/invoice/screens/InvoiceHomeScreen.tsx`

### Upcoming Modules

- Vendor Home Screen (CRM)
- Product Home Screen (Inventory)
- Voucher Home Screen (Accounting)
- Reports Home Screen

---

## Best Practices

1. **Always use SafeAreaView** for proper insets on iOS
2. **StatusBar configuration** should match header color
3. **ScrollView over FlatList** for better control and nested content
4. **Consistent spacing** - 20px horizontal padding, 16-24px vertical
5. **Shadow/elevation** for cards to create depth
6. **Loading states** - always show feedback to user
7. **Error handling** - use Alert or Toast for errors
8. **Pull-to-refresh** - provide manual refresh option
9. **Empty states** - guide users on what to do next
10. **Pagination** - only show when needed (>1 page)

---

## Version History

- **v1.0** - January 21, 2026 - Initial pattern documentation
  - Applied to Ledger Account and Invoice modules
- **v1.1** - January 22, 2026 - Enhanced styling patterns
  - Added LinearGradient for statistics cards
  - Enhanced pagination with two-tier layout
  - Added search button to filter section
  - Increased stat value font size to 32
  - Added section titles ("Overview")
  - Improved shadow properties for better depth
  - Applied to Customer Home Screen

---

**Maintained By:** Mobile Development Team
**Last Updated:** January 22, 2026
