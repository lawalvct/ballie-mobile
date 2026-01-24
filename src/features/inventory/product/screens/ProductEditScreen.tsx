import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { productService } from "../services/productService";
import type { CreateProductData, FormData, Product } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "ProductEdit">;

export default function ProductEditScreen({ navigation, route }: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [product, setProduct] = useState<CreateProductData | null>(null);

  const mapProductToForm = useCallback(
    (payload: Product): CreateProductData => {
      const categoryId =
        payload.category_id ?? (payload as any)?.category?.id ?? undefined;
      const primaryUnitId =
        payload.primary_unit_id ?? (payload as any)?.primary_unit?.id ?? 0;
      const stockAssetAccountId =
        payload.stock_asset_account_id ??
        (payload as any)?.stock_asset_account?.id ??
        undefined;
      const salesAccountId =
        payload.sales_account_id ??
        (payload as any)?.sales_account?.id ??
        undefined;
      const purchaseAccountId =
        payload.purchase_account_id ??
        (payload as any)?.purchase_account?.id ??
        undefined;

      return {
        type: payload.type,
        name: payload.name || "",
        sku: payload.sku || "",
        description: payload.description || "",
        category_id:
          categoryId !== null && categoryId !== undefined
            ? Number(categoryId)
            : undefined,
        brand: payload.brand || "",
        hsn_code: payload.hsn_code || "",
        barcode: payload.barcode || "",
        purchase_rate: payload.purchase_rate ?? 0,
        sales_rate: payload.sales_rate ?? 0,
        mrp: payload.mrp ?? undefined,
        primary_unit_id: primaryUnitId ? Number(primaryUnitId) : 0,
        secondary_unit_id:
          payload.secondary_unit_id !== null &&
          payload.secondary_unit_id !== undefined
            ? Number(payload.secondary_unit_id)
            : undefined,
        conversion_factor: payload.conversion_factor ?? undefined,
        opening_stock: payload.opening_stock ?? undefined,
        reorder_level: payload.reorder_level ?? undefined,
        maintain_stock: payload.maintain_stock ?? true,
        stock_asset_account_id:
          stockAssetAccountId !== null && stockAssetAccountId !== undefined
            ? Number(stockAssetAccountId)
            : undefined,
        sales_account_id:
          salesAccountId !== null && salesAccountId !== undefined
            ? Number(salesAccountId)
            : undefined,
        purchase_account_id:
          purchaseAccountId !== null && purchaseAccountId !== undefined
            ? Number(purchaseAccountId)
            : undefined,
        tax_rate: payload.tax_rate ?? undefined,
        is_active: payload.is_active ?? true,
        is_visible_online: payload.is_visible_online ?? true,
        is_featured: payload.is_featured ?? false,
        slug: payload.slug || "",
        meta_title: payload.meta_title || "",
        meta_description: payload.meta_description || "",
      };
    },
    [],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [formResponse, productResponse] = await Promise.all([
        productService.getFormData(),
        productService.show(id),
      ]);
      const payload = (productResponse as any)?.data ?? productResponse;
      setFormData(formResponse);
      setProduct(mapProductToForm(payload));
    } catch (error: any) {
      showToast(error.message || "Failed to load product", "error");
    } finally {
      setLoading(false);
    }
  }, [id, mapProductToForm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleSubmit = useCallback(async () => {
    if (!product) return;

    if (!product.name.trim()) {
      showToast("Please enter product name", "error");
      return;
    }
    if (product.purchase_rate <= 0 || product.sales_rate <= 0) {
      showToast("Please enter valid purchase and sales rates", "error");
      return;
    }
    if (!product.primary_unit_id) {
      showToast("Please select primary unit", "error");
      return;
    }

    try {
      setSubmitting(true);
      await productService.update(id, product);
      showToast("Product updated successfully", "success");
      if (onUpdated) {
        onUpdated(id);
      }
      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (error: any) {
      showToast(error.message || "Failed to update product", "error");
    } finally {
      setSubmitting(false);
    }
  }, [id, navigation, onUpdated, product]);

  if (loading) {
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
          <Text style={styles.headerTitle}>Edit Product</Text>
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
          <Text style={styles.headerTitle}>Edit Product</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Product not found.</Text>
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Basic Information</Text>

          <Text style={styles.label}>Product Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.type}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  type: value,
                  maintain_stock:
                    value === "service" ? false : product.maintain_stock,
                })
              }
              style={styles.picker}>
              <Picker.Item label="Item (Physical)" value="item" />
              <Picker.Item label="Service" value="service" />
            </Picker>
          </View>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={product.name}
            onChangeText={(value) => setProduct({ ...product, name: value })}
            placeholder="Enter product name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            value={product.sku}
            onChangeText={(value) => setProduct({ ...product, sku: value })}
            placeholder="Enter SKU"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Barcode</Text>
          <TextInput
            style={styles.input}
            value={product.barcode}
            onChangeText={(value) => setProduct({ ...product, barcode: value })}
            placeholder="Enter barcode"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={product.brand}
            onChangeText={(value) => setProduct({ ...product, brand: value })}
            placeholder="Enter brand"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>HSN Code</Text>
          <TextInput
            style={styles.input}
            value={product.hsn_code}
            onChangeText={(value) =>
              setProduct({ ...product, hsn_code: value })
            }
            placeholder="Enter HSN code"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.category_id ?? null}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  category_id:
                    value === null || value === undefined
                      ? undefined
                      : Number(value),
                })
              }
              style={styles.picker}>
              <Picker.Item label="Select Category" value={null} />
              {formData?.categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(value) =>
              setProduct({ ...product, description: value })
            }
            placeholder="Enter description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing & Units</Text>

          <Text style={styles.label}>Primary Unit *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.primary_unit_id}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  primary_unit_id: Number(value || 0),
                })
              }
              style={styles.picker}>
              <Picker.Item label="Select Unit" value={null} />
              {formData?.units.map((unit) => (
                <Picker.Item
                  key={unit.id}
                  label={`${unit.name} (${unit.symbol})`}
                  value={unit.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Purchase Rate *</Text>
          <TextInput
            style={styles.input}
            value={
              product.purchase_rate > 0
                ? product.purchase_rate.toLocaleString()
                : ""
            }
            onChangeText={(value) =>
              setProduct({
                ...product,
                purchase_rate: parseFloat(value.replace(/,/g, "")) || 0,
              })
            }
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Sales Rate *</Text>
          <TextInput
            style={styles.input}
            value={
              product.sales_rate > 0 ? product.sales_rate.toLocaleString() : ""
            }
            onChangeText={(value) =>
              setProduct({
                ...product,
                sales_rate: parseFloat(value.replace(/,/g, "")) || 0,
              })
            }
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>MRP</Text>
          <TextInput
            style={styles.input}
            value={product.mrp ? product.mrp.toLocaleString() : ""}
            onChangeText={(value) =>
              setProduct({
                ...product,
                mrp: value ? parseFloat(value.replace(/,/g, "")) : undefined,
              })
            }
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Tax Rate (%)</Text>
          <TextInput
            style={styles.input}
            value={product.tax_rate?.toString() || ""}
            onChangeText={(value) =>
              setProduct({
                ...product,
                tax_rate: value ? parseFloat(value) : undefined,
              })
            }
            placeholder="0"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />
        </View>

        {product.type === "item" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Stock</Text>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Maintain Stock</Text>
              <Switch
                value={product.maintain_stock}
                onValueChange={(value) =>
                  setProduct({ ...product, maintain_stock: value })
                }
                trackColor={{
                  false: "#d1d5db",
                  true: BRAND_COLORS.gold,
                }}
                thumbColor={SEMANTIC_COLORS.white}
              />
            </View>

            {product.maintain_stock && (
              <>
                <Text style={styles.label}>Opening Stock</Text>
                <TextInput
                  style={styles.input}
                  value={product.opening_stock?.toString() || ""}
                  onChangeText={(value) =>
                    setProduct({
                      ...product,
                      opening_stock: value ? parseFloat(value) : undefined,
                    })
                  }
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Reorder Level</Text>
                <TextInput
                  style={styles.input}
                  value={product.reorder_level?.toString() || ""}
                  onChangeText={(value) =>
                    setProduct({
                      ...product,
                      reorder_level: value ? parseFloat(value) : undefined,
                    })
                  }
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📒 Accounts</Text>

          <Text style={styles.label}>Stock Asset Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.stock_asset_account_id ?? null}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  stock_asset_account_id:
                    value === null || value === undefined
                      ? undefined
                      : Number(value),
                })
              }
              style={styles.picker}>
              <Picker.Item label="Select Account" value={null} />
              {formData?.ledger_accounts.map((acc) => (
                <Picker.Item
                  key={`stock-${acc.id}`}
                  label={acc.display_name || acc.name}
                  value={acc.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Sales Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.sales_account_id ?? null}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  sales_account_id:
                    value === null || value === undefined
                      ? undefined
                      : Number(value),
                })
              }
              style={styles.picker}>
              <Picker.Item label="Select Account" value={null} />
              {formData?.ledger_accounts.map((acc) => (
                <Picker.Item
                  key={`sales-${acc.id}`}
                  label={acc.display_name || acc.name}
                  value={acc.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Purchase Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.purchase_account_id ?? null}
              onValueChange={(value) =>
                setProduct({
                  ...product,
                  purchase_account_id:
                    value === null || value === undefined
                      ? undefined
                      : Number(value),
                })
              }
              style={styles.picker}>
              <Picker.Item label="Select Account" value={null} />
              {formData?.ledger_accounts.map((acc) => (
                <Picker.Item
                  key={`purchase-${acc.id}`}
                  label={acc.display_name || acc.name}
                  value={acc.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Visibility & Status</Text>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={product.is_active}
              onValueChange={(value) =>
                setProduct({ ...product, is_active: value })
              }
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold,
              }}
              thumbColor={SEMANTIC_COLORS.white}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Visible Online</Text>
            <Switch
              value={product.is_visible_online ?? false}
              onValueChange={(value) =>
                setProduct({ ...product, is_visible_online: value })
              }
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold,
              }}
              thumbColor={SEMANTIC_COLORS.white}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Featured</Text>
            <Switch
              value={product.is_featured ?? false}
              onValueChange={(value) =>
                setProduct({ ...product, is_featured: value })
              }
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold,
              }}
              thumbColor={SEMANTIC_COLORS.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧩 SEO</Text>
          <Text style={styles.label}>Slug</Text>
          <TextInput
            style={styles.input}
            value={product.slug}
            onChangeText={(value) => setProduct({ ...product, slug: value })}
            placeholder="Enter slug"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Meta Title</Text>
          <TextInput
            style={styles.input}
            value={product.meta_title}
            onChangeText={(value) =>
              setProduct({ ...product, meta_title: value })
            }
            placeholder="Enter meta title"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Meta Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={product.meta_description}
            onChangeText={(value) =>
              setProduct({ ...product, meta_description: value })
            }
            placeholder="Enter meta description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={BRAND_COLORS.darkPurple} />
          ) : (
            <Text style={styles.submitButtonText}>Update Product</Text>
          )}
        </TouchableOpacity>

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
  form: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContent: {
    padding: 20,
  },
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    backgroundColor: SEMANTIC_COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: SEMANTIC_COLORS.white,
    height: 50,
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  picker: {
    height: 50,
    color: BRAND_COLORS.darkPurple,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
