import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { InventoryStackParamList } from "../../../../navigation/types";
import * as stockJournalService from "../services/stockJournalService";
import type { ProductOption } from "../types";
import { Picker } from "@react-native-picker/picker";

type NavigationProp = NativeStackNavigationProp<
  InventoryStackParamList,
  "StockTransfer"
>;

interface ItemRow {
  id: string;
  product_id: number;
  product_name: string;
  movement_type: "in" | "out";
  quantity: number;
  rate: number;
  amount: number;
  current_stock: number;
  unit: string;
  batch_number: string;
  remarks: string;
}

export default function StockTransferScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [journalDate, setJournalDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [narration, setNarration] = useState("");
  const [fromItems, setFromItems] = useState<ItemRow[]>([]);
  const [toItems, setToItems] = useState<ItemRow[]>([]);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const formData = await stockJournalService.getFormData("transfer");
      setProducts(formData?.products ?? []);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const addFromItemRow = () => {
    const newItem: ItemRow = {
      id: Date.now().toString(),
      product_id: 0,
      product_name: "",
      movement_type: "out",
      quantity: 0,
      rate: 0,
      amount: 0,
      current_stock: 0,
      unit: "",
      batch_number: "",
      remarks: "",
    };
    setFromItems([...fromItems, newItem]);
  };

  const addToItemRow = () => {
    const newItem: ItemRow = {
      id: Date.now().toString(),
      product_id: 0,
      product_name: "",
      movement_type: "in",
      quantity: 0,
      rate: 0,
      amount: 0,
      current_stock: 0,
      unit: "",
      batch_number: "",
      remarks: "",
    };
    setToItems([...toItems, newItem]);
  };

  const removeFromItemRow = (id: string) => {
    setFromItems(fromItems.filter((item) => item.id !== id));
  };

  const removeToItemRow = (id: string) => {
    setToItems(toItems.filter((item) => item.id !== id));
  };

  const updateFromItem = (id: string, field: keyof ItemRow, value: any) => {
    setFromItems(
      fromItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // Auto-calculate amount
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }

          // Load product details when product is selected
          if (field === "product_id" && value > 0) {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.product_name = product.name;
              updated.rate = product.purchase_rate;
              updated.current_stock = product.current_stock;
              updated.unit = product.unit?.name || "";
              updated.amount = updated.quantity * product.purchase_rate;
            }
          }

          return updated;
        }
        return item;
      }),
    );
  };

  const updateToItem = (id: string, field: keyof ItemRow, value: any) => {
    setToItems(
      toItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // Auto-calculate amount
          if (field === "quantity" || field === "rate") {
            updated.amount = updated.quantity * updated.rate;
          }

          // Load product details when product is selected
          if (field === "product_id" && value > 0) {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.product_name = product.name;
              updated.rate = product.purchase_rate;
              updated.current_stock = product.current_stock;
              updated.unit = product.unit?.name || "";
              updated.amount = updated.quantity * product.purchase_rate;
            }
          }

          return updated;
        }
        return item;
      }),
    );
  };

  const getTotalFromQuantity = () => {
    return fromItems
      .filter((item) => item.product_id > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalToQuantity = () => {
    return toItems
      .filter((item) => item.product_id > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    const fromTotal = fromItems.reduce((sum, item) => sum + item.amount, 0);
    const toTotal = toItems.reduce((sum, item) => sum + item.amount, 0);
    return fromTotal + toTotal;
  };

  const getTotalItems = () => {
    const fromCount = fromItems.filter((item) => item.product_id > 0).length;
    const toCount = toItems.filter((item) => item.product_id > 0).length;
    return fromCount + toCount;
  };

  const isBalanced = (): boolean => {
    return getTotalFromQuantity() === getTotalToQuantity();
  };

  const validateForm = (): boolean => {
    if (!journalDate) {
      Alert.alert("Validation Error", "Please enter journal date");
      return false;
    }

    const validFromItems = fromItems.filter((item) => item.product_id > 0);
    const validToItems = toItems.filter((item) => item.product_id > 0);

    if (validFromItems.length === 0 && validToItems.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please add at least one item in FROM or TO section",
      );
      return false;
    }

    // Validate FROM items
    for (const item of validFromItems) {
      if (item.quantity <= 0) {
        Alert.alert(
          "Validation Error",
          `Please enter quantity for ${item.product_name} in FROM section`,
        );
        return false;
      }
      if (item.rate <= 0) {
        Alert.alert(
          "Validation Error",
          `Please enter rate for ${item.product_name} in FROM section`,
        );
        return false;
      }
      if (item.quantity > item.current_stock) {
        Alert.alert(
          "Insufficient Stock",
          `${item.product_name} has only ${item.current_stock} ${item.unit} available. Cannot transfer ${item.quantity} ${item.unit}.`,
        );
        return false;
      }
    }

    // Validate TO items
    for (const item of validToItems) {
      if (item.quantity <= 0) {
        Alert.alert(
          "Validation Error",
          `Please enter quantity for ${item.product_name} in TO section`,
        );
        return false;
      }
      if (item.rate <= 0) {
        Alert.alert(
          "Validation Error",
          `Please enter rate for ${item.product_name} in TO section`,
        );
        return false;
      }
    }

    // Check balance
    if (!isBalanced()) {
      Alert.alert(
        "Unbalanced Transfer",
        `Total OUT quantity (${getTotalFromQuantity()}) must equal Total IN quantity (${getTotalToQuantity()}). Please adjust the quantities.`,
        [{ text: "OK" }],
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (action: "save" | "save_and_post") => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const validFromItems = fromItems.filter((item) => item.product_id > 0);
      const validToItems = toItems.filter((item) => item.product_id > 0);

      const allItems = [
        ...validFromItems.map((item) => ({
          product_id: item.product_id,
          movement_type: "out" as const,
          quantity: item.quantity,
          rate: item.rate,
          batch_number: item.batch_number || undefined,
          remarks: item.remarks || undefined,
        })),
        ...validToItems.map((item) => ({
          product_id: item.product_id,
          movement_type: "in" as const,
          quantity: item.quantity,
          rate: item.rate,
          batch_number: item.batch_number || undefined,
          remarks: item.remarks || undefined,
        })),
      ];

      const payload = {
        journal_date: journalDate,
        entry_type: "transfer" as const,
        reference_number: referenceNumber || undefined,
        narration: narration || undefined,
        items: allItems,
        action,
      };

      const entry = await stockJournalService.create(payload);

      Alert.alert(
        "Success",
        action === "save_and_post"
          ? "Transfer entry created and posted successfully"
          : "Transfer entry saved as draft",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create transfer entry");
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stock Transfer</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Transfer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>🔀</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stock Transfer</Text>
            <Text style={styles.infoText}>
              Transfer stock between locations. Ensure FROM and TO sides are
              balanced.
            </Text>
          </View>
        </View>

        {/* Balance Warning */}
        {(fromItems.length > 0 || toItems.length > 0) && !isBalanced() && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                Unbalanced: OUT ({getTotalFromQuantity()}) ≠ IN (
                {getTotalToQuantity()})
              </Text>
            </View>
          </View>
        )}

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Entry Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Journal Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={journalDate}
              onChangeText={setJournalDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder="Optional reference"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Narration</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={narration}
              onChangeText={setNarration}
              placeholder="Description or notes"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* FROM Section */}
        <View style={styles.itemsSection}>
          <View style={styles.sectionHeaderBanner}>
            <Text style={styles.sectionHeaderIcon}>📤</Text>
            <Text style={styles.sectionHeaderTitle}>FROM Location (Out)</Text>
          </View>

          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={addFromItemRow}>
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {fromItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsIcon}>📦</Text>
              <Text style={styles.emptyItemsText}>
                No items added yet. Click "Add Item" to begin.
              </Text>
            </View>
          ) : (
            fromItems.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardTitle}>Item #{index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeFromItemRow(item.id)}
                    style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Product <Text style={styles.required}>*</Text>
                  </Text>
                  <Picker
                    selectedValue={item.product_id}
                    onValueChange={(value) =>
                      updateFromItem(item.id, "product_id", value)
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Product" value={0} />
                    {products.map((product) => (
                      <Picker.Item
                        key={product.id}
                        label={`${product.name} (${product.sku}) - Stock: ${product.current_stock} ${product.unit?.name || ""}`}
                        value={product.id}
                      />
                    ))}
                  </Picker>
                </View>

                {item.product_id > 0 && (
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockInfoText}>
                      Available: {item.current_stock} {item.unit}
                    </Text>
                  </View>
                )}

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>
                      Quantity <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity > 0 ? item.quantity.toString() : ""}
                      onChangeText={(value) =>
                        updateFromItem(
                          item.id,
                          "quantity",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>
                      Rate <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={item.rate > 0 ? item.rate.toString() : ""}
                      onChangeText={(value) =>
                        updateFromItem(item.id, "rate", parseFloat(value) || 0)
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ₦{item.amount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Batch Number</Text>
                  <TextInput
                    style={styles.input}
                    value={item.batch_number}
                    onChangeText={(value) =>
                      updateFromItem(item.id, "batch_number", value)
                    }
                    placeholder="Optional"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Remarks</Text>
                  <TextInput
                    style={styles.input}
                    value={item.remarks}
                    onChangeText={(value) =>
                      updateFromItem(item.id, "remarks", value)
                    }
                    placeholder="Optional notes"
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* TO Section */}
        <View style={styles.itemsSection}>
          <View
            style={[
              styles.sectionHeaderBanner,
              { backgroundColor: "#d1fae5" },
            ]}>
            <Text style={styles.sectionHeaderIcon}>📥</Text>
            <Text style={styles.sectionHeaderTitle}>TO Location (In)</Text>
          </View>

          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addToItemRow}>
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {toItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsIcon}>📦</Text>
              <Text style={styles.emptyItemsText}>
                No items added yet. Click "Add Item" to begin.
              </Text>
            </View>
          ) : (
            toItems.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardTitle}>Item #{index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeToItemRow(item.id)}
                    style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Product <Text style={styles.required}>*</Text>
                  </Text>
                  <Picker
                    selectedValue={item.product_id}
                    onValueChange={(value) =>
                      updateToItem(item.id, "product_id", value)
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Product" value={0} />
                    {products.map((product) => (
                      <Picker.Item
                        key={product.id}
                        label={`${product.name} (${product.sku}) - Stock: ${product.current_stock} ${product.unit?.name || ""}`}
                        value={product.id}
                      />
                    ))}
                  </Picker>
                </View>

                {item.product_id > 0 && (
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockInfoText}>
                      Current Stock: {item.current_stock} {item.unit}
                    </Text>
                  </View>
                )}

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>
                      Quantity <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity > 0 ? item.quantity.toString() : ""}
                      onChangeText={(value) =>
                        updateToItem(
                          item.id,
                          "quantity",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>
                      Rate <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={item.rate > 0 ? item.rate.toString() : ""}
                      onChangeText={(value) =>
                        updateToItem(item.id, "rate", parseFloat(value) || 0)
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ₦{item.amount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Batch Number</Text>
                  <TextInput
                    style={styles.input}
                    value={item.batch_number}
                    onChangeText={(value) =>
                      updateToItem(item.id, "batch_number", value)
                    }
                    placeholder="Optional"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Remarks</Text>
                  <TextInput
                    style={styles.input}
                    value={item.remarks}
                    onChangeText={(value) =>
                      updateToItem(item.id, "remarks", value)
                    }
                    placeholder="Optional notes"
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Summary */}
        {(fromItems.length > 0 || toItems.length > 0) && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total OUT Quantity:</Text>
              <Text style={styles.summaryValue}>{getTotalFromQuantity()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total IN Quantity:</Text>
              <Text style={styles.summaryValue}>{getTotalToQuantity()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance Status:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isBalanced() ? "#059669" : "#dc2626" },
                ]}>
                {isBalanced() ? "✓ Balanced" : "✗ Unbalanced"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{getTotalItems()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryAmount}>
                ₦{getTotalAmount().toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.submitBtn, styles.draftBtn]}
            onPress={() => handleSubmit("save")}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Save as Draft</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, styles.postBtn]}
            onPress={() => handleSubmit("save_and_post")}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Save & Post</Text>
            )}
          </TouchableOpacity>
        </View>
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
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#1e3a8a",
    lineHeight: 18,
  },
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  formSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#dc2626",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  picker: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: BRAND_COLORS.darkPurple,
  },
  sectionHeaderBanner: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sectionHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemsSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addItemBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addItemBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  emptyItems: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyItemsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyItemsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  removeBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
  },
  stockInfo: {
    backgroundColor: "#dbeafe",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  stockInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e40af",
  },
  formRow: {
    flexDirection: "row",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    paddingVertical: 12,
  },
  summarySection: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  draftBtn: {
    backgroundColor: "#6b7280",
  },
  postBtn: {
    backgroundColor: BRAND_COLORS.gold,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
