// Product Home Screen - List all products
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
  const [filters, setFilters] = useState<ListParams>({
    page: 1,
    per_page: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
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
        response.pagination || { current_page: 1, last_page: 1, total: 0 }
      );
      setStatistics(
        response.statistics || {
          total_products: 0,
          active_products: 0,
          low_stock_count: 0,
        }
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

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.total_products}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.active_products}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, styles.warningCard]}>
          <Text style={[styles.statValue, styles.warningText]}>
            {statistics.low_stock_count}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      {/* Filters Section - Placeholder */}
      <View style={styles.filtersPlaceholder}>
        <Text style={styles.filtersText}>🔍 Filters & Search</Text>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Products</Text>
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
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProductCreate", { onCreated: loadProducts })
          }
          style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          products.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }
      />
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
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 24,
    fontWeight: "600",
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
  list: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  emptyList: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  headerSection: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  warningCard: {
    backgroundColor: "#fef3c7",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  warningText: {
    color: "#d97706",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  filtersPlaceholder: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersText: {
    fontSize: 14,
    color: "#9ca3af",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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
});
