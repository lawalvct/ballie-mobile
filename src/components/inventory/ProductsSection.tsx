import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import { productService } from "../../features/inventory/product/services/productService";
import type {
  ListResponse,
  Product,
} from "../../features/inventory/product/types";

type NavigationProp = NativeStackNavigationProp<MainTabParamList, "Inventory">;

export default function ProductsSection() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = (await productService.list({
        per_page: 4,
        sort_by: "created_at",
        sort_order: "desc",
      })) as ListResponse["data"];
      setProducts(response?.products || []);
    } catch {
      setProducts([]);
    }
  };

  const handleViewAll = () => {
    navigation.navigate("Inventory", {
      screen: "InventoryActions",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "#10b981";
      case "low-stock":
        return "#f59e0b";
      case "out-of-stock":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-stock":
        return "In Stock";
      case "low-stock":
        return "Low Stock";
      case "out-of-stock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  const getStatus = (product: Product) => {
    if (!product.maintain_stock) {
      return "in-stock";
    }

    const stockValue =
      typeof product.current_stock === "number" ? product.current_stock : 0;
    if (stockValue <= 0) return "out-of-stock";
    if (
      typeof product.reorder_level === "number" &&
      stockValue <= product.reorder_level
    ) {
      return "low-stock";
    }
    return "in-stock";
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "₦0";
    return `₦${value.toLocaleString()}`;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>More Actions →</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      ) : (
        products.map((product) => {
          const status = getStatus(product);
          const stockValue =
            typeof product.current_stock === "number"
              ? product.current_stock
              : 0;

          return (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productLeft}>
                <View
                  style={[styles.productIcon, { backgroundColor: "#e0e7ff" }]}>
                  <Text style={styles.productEmoji}>📦</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSku}>SKU: {product.sku}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productPrice}>
                      {formatCurrency(product.sales_rate)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(status) + "20" },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(status) },
                        ]}>
                        {getStatusText(status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.stockLabel}>Stock</Text>
                <Text
                  style={[
                    styles.stockValue,
                    { color: getStatusColor(status) },
                  ]}>
                  {stockValue}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productLeft: {
    flexDirection: "row",
    flex: 1,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productEmoji: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  productRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  stockLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyState: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
