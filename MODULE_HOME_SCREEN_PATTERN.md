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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
        <ModuleStats statistics={statistics} />

        {/* Filters Section */}
        <ModuleFilters filters={filters} onFilterChange={setFilters} />

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
                Previous
              </Text>
            </TouchableOpacity>

            <Text style={styles.paginationInfo}>
              Page {pagination.current_page} of {pagination.last_page}
            </Text>

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
                Next
              </Text>
            </TouchableOpacity>
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

  // Pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
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

### 4. **Statistics Section**

- Display key metrics in colorful cards
- 2x2 grid layout on mobile
- Gradient backgrounds for visual appeal

### 5. **Filters Section**

- Search, sort, and filter options
- Updates list in real-time
- Resets pagination to page 1 on filter change

### 6. **List/Table Section**

- Renders items as cards or table rows
- Empty state with icon and helpful message
- Scrollable within main ScrollView

### 7. **Pagination**

- Previous/Next buttons
- Page indicator
- Disabled state for boundaries
- Only shows if multiple pages exist

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

## Examples

### Implemented Modules

1. **Ledger Account Home Screen** - `src/screens/LedgerAccountHomeScreen.tsx`
2. **Invoice Home Screen** - `src/features/accounting/invoice/screens/InvoiceHomeScreen.tsx`

### Upcoming Modules

- Product Home Screen
- Customer/Vendor Home Screen
- Voucher Home Screen
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

---

**Maintained By:** Mobile Development Team
**Last Updated:** January 21, 2026
