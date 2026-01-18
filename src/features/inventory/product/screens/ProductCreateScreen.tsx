// Product Create Screen - Create new product
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Switch,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { productService } from "../services/productService";
import type { FormData, CreateProductData } from "../types";

type Props = NativeStackScreenProps<InventoryStackParamList, "ProductCreate">;

export default function ProductCreateScreen({ navigation, route }: Props) {
  const { onCreated } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const [product, setProduct] = useState<CreateProductData>({
    type: "item",
    name: "",
    sku: "",
    barcode: "",
    description: "",
    category_id: undefined,
    brand: "",
    primary_unit_id: 0, // Will be set to actual value
    secondary_unit_id: undefined,
    conversion_factor: undefined,
    purchase_rate: 0,
    sales_rate: 0,
    mrp: undefined,
    maintain_stock: true,
    opening_stock: undefined,
    reorder_level: undefined,
    purchase_account_id: null, // Start with null, will be set from defaults
    sales_account_id: null, // Start with null, will be set from defaults
    is_active: true,
    image: undefined,
    gallery_images: [],
  });

  useEffect(() => {
    loadFormData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload images."
      );
    }
  };

  const pickPrimaryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSize = asset.fileSize || 0;

        // Check file size (max 2MB)
        if (fileSize > 2 * 1024 * 1024) {
          showToast("Image size must be less than 2MB", "error");
          return;
        }

        const fileName = asset.uri.split("/").pop() || "image.jpg";
        const fileType = `image/${fileName.split(".").pop()}`;

        setProduct({
          ...product,
          image: {
            uri: asset.uri,
            name: fileName,
            type: fileType,
          },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("Failed to pick image", "error");
    }
  };

  const pickGalleryImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets
          .filter((asset) => {
            const fileSize = asset.fileSize || 0;
            if (fileSize > 2 * 1024 * 1024) {
              showToast(
                `${asset.fileName || "Image"} exceeds 2MB limit`,
                "error"
              );
              return false;
            }
            return true;
          })
          .map((asset) => {
            const fileName = asset.uri.split("/").pop() || "image.jpg";
            const fileType = `image/${fileName.split(".").pop()}`;
            return {
              uri: asset.uri,
              name: fileName,
              type: fileType,
            };
          });

        setProduct({
          ...product,
          gallery_images: [...(product.gallery_images || []), ...newImages],
        });
      }
    } catch (error) {
      console.error("Error picking gallery images:", error);
      showToast("Failed to pick images", "error");
    }
  };

  const removePrimaryImage = () => {
    setProduct({ ...product, image: undefined });
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(product.gallery_images || [])];
    updatedGallery.splice(index, 1);
    setProduct({ ...product, gallery_images: updatedGallery });
  };

  const loadFormData = async () => {
    try {
      setLoading(true);
      const data: FormData = await productService.getFormData();

      // Set default accounts from API response
      if (data.default_accounts) {
        setProduct((prev) => ({
          ...prev,
          purchase_account_id: data.default_accounts?.purchase?.id || null,
          sales_account_id: data.default_accounts?.sales?.id || null,
        }));
      }

      setFormData(data);
    } catch (error: any) {
      console.error("Error loading form data:", error);
      showToast(error.message || "Failed to load form data", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFormData();
    setRefreshing(false);
  }, []);

  const handleSubmit = async () => {
    // Validation
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
      await productService.create(product);
      showToast("Product created successfully", "success");

      // Navigate back and callback
      if (onCreated) {
        onCreated();
      }
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error("Error creating product:", error);
      showToast(error.message || "Failed to create product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Product</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading form...</Text>
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
        <Text style={styles.headerTitle}>Create Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {/* Product Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Basic Information</Text>

          <Text style={styles.label}>
            Product Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.type}
              onValueChange={(value) => setProduct({ ...product, type: value })}
              style={styles.picker}>
              <Picker.Item label="Item (Physical)" value="item" />
              <Picker.Item label="Service" value="service" />
            </Picker>
          </View>

          {/* Name */}
          <Text style={styles.label}>
            Product Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={product.name}
            onChangeText={(value) => setProduct({ ...product, name: value })}
            placeholder="Enter product name"
            placeholderTextColor="#9ca3af"
          />

          {/* SKU */}
          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            value={product.sku}
            onChangeText={(value) => setProduct({ ...product, sku: value })}
            placeholder="Enter SKU"
            placeholderTextColor="#9ca3af"
          />

          {/* Barcode */}
          <Text style={styles.label}>Barcode</Text>
          <TextInput
            style={styles.input}
            value={product.barcode}
            onChangeText={(value) => setProduct({ ...product, barcode: value })}
            placeholder="Enter barcode (optional)"
            placeholderTextColor="#9ca3af"
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.category_id}
              onValueChange={(value) =>
                setProduct({ ...product, category_id: value })
              }
              style={styles.picker}>
              <Picker.Item label="Select Category" value={null} />
              {formData?.categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>

          {/* Brand */}
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={product.brand}
            onChangeText={(value) => setProduct({ ...product, brand: value })}
            placeholder="Enter brand (optional)"
            placeholderTextColor="#9ca3af"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(value) =>
              setProduct({ ...product, description: value })
            }
            placeholder="Enter description (optional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖼️ Product Images</Text>

          {/* Primary Image */}
          <Text style={styles.label}>Primary Image</Text>
          {product.image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.image.uri }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removePrimaryImage}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickPrimaryImage}>
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderLabel}>
                Tap to select image
              </Text>
              <Text style={styles.imagePlaceholderHint}>
                Max size: 2MB (JPG, PNG, WEBP)
              </Text>
            </TouchableOpacity>
          )}

          {/* Gallery Images */}
          <Text style={[styles.label, { marginTop: 20 }]}>Gallery Images</Text>
          <View style={styles.galleryContainer}>
            {product.gallery_images && product.gallery_images.length > 0 && (
              <View style={styles.galleryGrid}>
                {product.gallery_images.map((img, index) => (
                  <View key={index} style={styles.galleryImageContainer}>
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.galleryImagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeGalleryImageButton}
                      onPress={() => removeGalleryImage(index)}>
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.addGalleryButton}
              onPress={pickGalleryImages}>
              <Text style={styles.addGalleryButtonText}>
                + Add Gallery Images
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing & Units</Text>

          {/* Primary Unit */}
          <Text style={styles.label}>
            Primary Unit <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={product.primary_unit_id}
              onValueChange={(value) =>
                setProduct({ ...product, primary_unit_id: value })
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

          {/* Purchase Rate */}
          <Text style={styles.label}>
            Purchase Rate <Text style={styles.required}>*</Text>
          </Text>
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

          {/* Sales Rate */}
          <Text style={styles.label}>
            Sales Rate <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={
              product.sales_rate > 0 ? product.sales_rate.toLocaleString() : ""
            }
            onChangeText={(value) => {
              const numericValue = parseFloat(value.replace(/,/g, "")) || 0;
              setProduct({
                ...product,
                sales_rate: numericValue,
                mrp: numericValue > 0 ? numericValue : undefined,
              });
            }}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />

          {/* MRP */}
          <Text style={styles.label}>MRP (Maximum Retail Price)</Text>
          <TextInput
            style={styles.input}
            value={product.mrp ? product.mrp.toLocaleString() : ""}
            onChangeText={(value) =>
              setProduct({
                ...product,
                mrp: value ? parseFloat(value.replace(/,/g, "")) : undefined,
              })
            }
            placeholder="0.00 (optional)"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Stock Management */}
        {product.type === "item" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Stock Management</Text>

            {/* Maintain Stock */}
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
                {/* Opening Stock */}
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
                  placeholder="0.00 (optional)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />

                {/* Reorder Level */}
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
                  placeholder="0.00 (optional)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </View>
        )}

        {/* Ledger Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📒 Ledger Accounts</Text>

          {/* Purchase Account */}
          <Text style={styles.label}>Purchase Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              key={`purchase-${product.purchase_account_id}`}
              selectedValue={product.purchase_account_id}
              onValueChange={(value) =>
                setProduct({ ...product, purchase_account_id: value })
              }
              style={styles.picker}>
              <Picker.Item label="Select Account" value={null} />
              {formData?.ledger_accounts.map((acc) => (
                <Picker.Item
                  key={acc.id}
                  label={`${acc.name} (${acc.code})`}
                  value={acc.id}
                />
              ))}
            </Picker>
          </View>

          {/* Sales Account */}
          <Text style={styles.label}>Sales Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              key={`sales-${product.sales_account_id}`}
              selectedValue={product.sales_account_id}
              onValueChange={(value) =>
                setProduct({ ...product, sales_account_id: value })
              }
              style={styles.picker}>
              <Picker.Item label="Select Account" value={null} />
              {formData?.ledger_accounts.map((acc) => (
                <Picker.Item
                  key={acc.id}
                  label={`${acc.name} (${acc.code})`}
                  value={acc.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
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
        </View>

        {/* Submit Button */}
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
            <Text style={styles.submitButtonText}>Create Product</Text>
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
    width: 50,
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
  required: {
    color: "#dc2626",
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
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
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    backgroundColor: "#f3f4f6",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  removeImageText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  imagePlaceholderHint: {
    fontSize: 12,
    color: "#9ca3af",
  },
  galleryContainer: {
    marginTop: 8,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  galleryImageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  galleryImagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeGalleryImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addGalleryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "#fffbeb",
    alignItems: "center",
  },
  addGalleryButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
});
