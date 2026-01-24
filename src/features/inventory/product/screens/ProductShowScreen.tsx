import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { productService } from "../services/productService";
import type { Product } from "../types";
import { showToast } from "../../../../utils/toast";
import * as Print from "expo-print";

type Props = NativeStackScreenProps<InventoryStackParamList, "ProductShow">;

export default function ProductShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.show(id);
      const payload = (response as any)?.data ?? response;
      setProduct(payload || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load product", "error");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadProduct();
    } finally {
      setRefreshing(false);
    }
  }, [loadProduct]);

  const exportPDF = useCallback(async () => {
    if (!product) return;

    const categoryName =
      product.category_name || (product as any)?.category?.name || "-";

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2d3748; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #2d3748; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; color: #4a5568; }
            .value { color: #2d3748; }
          </style>
        </head>
        <body>
          <h1>Product Details</h1>

          <div class="section">
            <div class="section-title">📦 Basic Information</div>
            <div class="row"><span class="label">Name:</span> <span class="value">${product.name}</span></div>
            <div class="row"><span class="label">Type:</span> <span class="value">${product.type === "item" ? "Item" : "Service"}</span></div>
            <div class="row"><span class="label">SKU:</span> <span class="value">${product.sku || "-"}</span></div>
            <div class="row"><span class="label">Category:</span> <span class="value">${categoryName}</span></div>
            <div class="row"><span class="label">Brand:</span> <span class="value">${product.brand || "-"}</span></div>
            <div class="row"><span class="label">Barcode:</span> <span class="value">${product.barcode || "-"}</span></div>
            <div class="row"><span class="label">HSN Code:</span> <span class="value">${product.hsn_code || "-"}</span></div>
            <div class="row"><span class="label">Status:</span> <span class="value">${product.is_active ? "Active" : "Inactive"}</span></div>
            <div class="row"><span class="label">Visibility:</span> <span class="value">${product.is_visible_online ? "Visible" : "Hidden"}</span></div>
            <div class="row"><span class="label">Featured:</span> <span class="value">${product.is_featured ? "Yes" : "No"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">💰 Pricing</div>
            <div class="row"><span class="label">Sales Rate:</span> <span class="value">${product.sales_rate || "-"}</span></div>
            <div class="row"><span class="label">Purchase Rate:</span> <span class="value">${product.purchase_rate || "-"}</span></div>
            <div class="row"><span class="label">MRP:</span> <span class="value">${product.mrp || "-"}</span></div>
            <div class="row"><span class="label">Tax Rate (%):</span> <span class="value">${product.tax_rate || "-"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">📦 Stock</div>
            <div class="row"><span class="label">Opening Stock:</span> <span class="value">${product.opening_stock || "-"}</span></div>
            <div class="row"><span class="label">Current Stock:</span> <span class="value">${product.current_stock || "-"}</span></div>
            <div class="row"><span class="label">Reorder Level:</span> <span class="value">${product.reorder_level || "-"}</span></div>
            <div class="row"><span class="label">Unit:</span> <span class="value">${(product as any)?.primary_unit?.short_name || "-"}</span></div>
          </div>

          <div class="section">
            <div class="section-title">📝 Description</div>
            <p>${product.description || "No description available."}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printAsync({
        html,
        base64: false,
      });
      showToast("PDF exported successfully", "success");
    } catch (error) {
      showToast("Failed to export PDF", "error");
    }
  }, [product]);

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
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
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
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Product not found</Text>
          <Text style={styles.emptyText}>Please try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryName =
    product.category_name || (product as any)?.category?.name || "-";
  const primaryUnitName =
    product.primary_unit_name || (product as any)?.primary_unit?.name || "-";
  const primaryUnitShortName = (product as any)?.primary_unit?.short_name || "";
  const salesAccountName =
    product.sales_account_name || (product as any)?.sales_account?.name || "-";
  const purchaseAccountName =
    product.purchase_account_name ||
    (product as any)?.purchase_account?.name ||
    "-";
  const stockAssetAccountName =
    product.stock_asset_account_name ||
    (product as any)?.stock_asset_account?.name ||
    "-";

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("ProductEdit", {
                id,
                onUpdated: (updatedId) => {
                  if (updatedId === id) {
                    loadProduct();
                  }
                },
              })
            }>
            <Text style={styles.editButtonText}>✏️ Edit </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfButton} onPress={exportPDF}>
            <Text style={styles.pdfButtonText}>📄 Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Basic Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{product.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>
              {product.type === "item" ? "Item" : "Service"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SKU</Text>
            <Text style={styles.value}>{product.sku || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{categoryName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{product.brand || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Barcode</Text>
            <Text style={styles.value}>{product.barcode || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HSN Code</Text>
            <Text style={styles.value}>{product.hsn_code || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {product.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Visibility</Text>
            <Text style={styles.value}>
              {product.is_visible_online ? "Visible" : "Hidden"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Featured</Text>
            <Text style={styles.value}>
              {product.is_featured ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tax Rate</Text>
            <Text style={styles.value}>
              {product.tax_rate ? `${product.tax_rate}%` : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purchase Rate</Text>
            <Text style={styles.value}>
              ₦{product.purchase_rate.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sales Rate</Text>
            <Text style={styles.value}>
              ₦{product.sales_rate.toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>MRP</Text>
            <Text style={styles.value}>
              {product.mrp ? `₦${product.mrp.toLocaleString()}` : "-"}
            </Text>
          </View>
        </View>

        {product.maintain_stock && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Stock</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Unit</Text>
              <Text style={styles.value}>{primaryUnitName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Current Stock</Text>
              <Text style={styles.value}>
                {product.current_stock ?? 0} {primaryUnitShortName}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Opening Stock</Text>
              <Text style={styles.value}>
                {product.opening_stock ?? 0} {primaryUnitShortName}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Reorder Level</Text>
              <Text style={styles.value}>
                {product.reorder_level ?? 0} {primaryUnitShortName}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧾 Accounts</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sales Account</Text>
            <Text style={styles.value}>{salesAccountName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purchase Account</Text>
            <Text style={styles.value}>{purchaseAccountName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Stock Asset Account</Text>
            <Text style={styles.value}>{stockAssetAccountName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.longText}>
            {product.description || "No description provided."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 SEO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Slug</Text>
            <Text style={styles.value}>{product.slug || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Meta Title</Text>
            <Text style={styles.value}>{product.meta_title || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Meta Description</Text>
            <Text style={styles.value}>{product.meta_description || "-"}</Text>
          </View>
        </View>

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
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
  pdfButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.darkPurple,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginLeft: 8,
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
    textAlign: "center",
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    maxWidth: "60%",
    textAlign: "right",
  },
  longText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
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
  },
});
