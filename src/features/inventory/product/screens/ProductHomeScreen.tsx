// Product Home Screen - List all products
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { productService } from "../services/productService";
import type { Product, ListParams } from "../types";

type Props = NativeStackScreenProps<InventoryStackParamList, "ProductHome">;

export default function ProductHomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<ListParams>({
    page: 1,
    per_page: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });
  const [statistics, setStatistics] = useState({
    total_products: 0,
    active_products: 0,
    low_stock_count: 0,
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.list(filters);
      setProducts(response.products || []);
      setPagination(
        response.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0,
          from: 0,
          to: 0,
        },
      );
      setStatistics(
        response.statistics || {
          total_products: 0,
          active_products: 0,
          low_stock_count: 0,
        },
      );
    } catch (error: any) {
      console.error("Error loading products:", error);
      showToast(error.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [filters]);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchText.trim() || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleProductPress = (id: number) => {
    navigation.navigate("ProductShow", { id });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.is_active ? styles.activeBadge : styles.inactiveBadge,
          ]}>
          <Text
            style={[
              styles.statusText,
              item.is_active ? styles.activeText : styles.inactiveText,
            ]}>
            {item.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>
            {item.type === "item" ? "📦 Item" : "🔧 Service"}
          </Text>
        </View>
        {item.category_name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category_name}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sales Rate:</Text>
          <Text style={styles.detailValue}>
            ₦{item.sales_rate.toLocaleString()}
          </Text>
        </View>
        {item.maintain_stock && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text
              style={[
                styles.detailValue,
                item.current_stock !== undefined &&
                item.reorder_level !== null &&
                item.current_stock <= item.reorder_level
                  ? styles.lowStock
                  : undefined,
              ]}>
              {item.current_stock || 0} {item.primary_unit_name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptyText}>Start by creating your first product</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() =>
          navigation.navigate("ProductCreate", { onCreated: loadProducts })
        }>
        <Text style={styles.createButtonText}>+ Create Product</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Products</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading products...</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("ProductCreate", { onCreated: loadProducts })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Create New Product</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.total_products}</Text>
              <Text style={styles.statLabel}>Total Products</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.active_products}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.low_stock_count}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Section */}
        <View style={styles.listSection}>
          {products.length === 0
            ? renderEmpty()
            : products.map((item) => (
                <View key={item.id}>{renderProductItem({ item })}</View>
              ))}
        </View>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from} to {pagination.to} of{" "}
                {pagination.total}
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
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
  },
  backButtonText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
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
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
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
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
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
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  productCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: "#d1fae5",
  },
  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activeText: {
    color: "#065f46",
  },
  inactiveText: {
    color: "#991b1b",
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  lowStock: {
    color: "#dc2626",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: SEMANTIC_COLORS.white,
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
