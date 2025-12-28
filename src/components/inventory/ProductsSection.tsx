import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

const products = [
  {
    id: 1,
    name: "Apple iPhone 14 Pro",
    sku: "IP14P-128",
    stock: 45,
    price: "₦850,000",
    status: "in-stock",
  },
  {
    id: 2,
    name: "Samsung Galaxy S23",
    sku: "SGS23-256",
    stock: 32,
    price: "₦720,000",
    status: "in-stock",
  },
  {
    id: 3,
    name: "Dell XPS 15 Laptop",
    sku: "DXP15-512",
    stock: 8,
    price: "₦1,250,000",
    status: "low-stock",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    sku: "SWH1000",
    stock: 0,
    price: "₦320,000",
    status: "out-of-stock",
  },
];

export default function ProductsSection() {
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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {products.map((product) => (
        <TouchableOpacity key={product.id} style={styles.productCard}>
          <View style={styles.productLeft}>
            <View style={[styles.productIcon, { backgroundColor: "#e0e7ff" }]}>
              <Text style={styles.productEmoji}>📦</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSku}>SKU: {product.sku}</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productPrice}>{product.price}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(product.status) + "20" },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(product.status) },
                    ]}>
                    {getStatusText(product.status)}
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
                { color: getStatusColor(product.status) },
              ]}>
              {product.stock}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
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
});
