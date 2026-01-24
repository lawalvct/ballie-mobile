import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { purchaseOrderService } from "../services/purchaseOrderService";
import type {
  PurchaseOrderItem,
  PurchaseOrderProductSearchItem,
  PurchaseOrderVendorSearchItem,
} from "../types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

type RouteProp = {
  key: string;
  name: string;
  params?: { vendorId?: number };
};

interface ItemRow extends PurchaseOrderItem {
  local_id: string;
}

export default function PurchaseOrderCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const presetVendorId = route.params?.vendorId;

  const [submitting, setSubmitting] = useState(false);

  const [lpoDate, setLpoDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorResults, setVendorResults] = useState<
    PurchaseOrderVendorSearchItem[]
  >([]);
  const [searchingVendors, setSearchingVendors] = useState(false);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [showLpoDatePicker, setShowLpoDatePicker] = useState(false);
  const [showExpectedDatePicker, setShowExpectedDatePicker] = useState(false);
  const [productSearches, setProductSearches] = useState<
    Record<string, string>
  >({});
  const [productResults, setProductResults] = useState<
    Record<string, PurchaseOrderProductSearchItem[]>
  >({});
  const [searchingProducts, setSearchingProducts] = useState<
    Record<string, boolean>
  >({});
  const productSearchTimers = useRef<Record<string, any>>({});

  const handleLpoDateChange = (_event: any, selected?: Date) => {
    setShowLpoDatePicker(false);
    if (!selected) return;
    setLpoDate(selected.toISOString().split("T")[0]);
  };

  const handleExpectedDateChange = (_event: any, selected?: Date) => {
    setShowExpectedDatePicker(false);
    if (!selected) return;
    setExpectedDeliveryDate(selected.toISOString().split("T")[0]);
  };

  useEffect(() => {
    if (presetVendorId && !vendorId) {
      setVendorId(String(presetVendorId));
    }
  }, [presetVendorId, vendorId]);

  useEffect(() => {
    const searchVendors = async () => {
      if (!vendorSearch || vendorSearch.trim().length < 2) {
        setVendorResults([]);
        return;
      }

      try {
        setSearchingVendors(true);
        const results = await purchaseOrderService.searchVendors(
          vendorSearch.trim(),
        );
        setVendorResults(Array.isArray(results) ? results : []);
      } catch (_error) {
        setVendorResults([]);
      } finally {
        setSearchingVendors(false);
      }
    };

    const timeoutId = setTimeout(searchVendors, 500);
    return () => clearTimeout(timeoutId);
  }, [vendorSearch]);

  useEffect(() => {
    if (!vendorSearch) return;
    const normalized = vendorSearch.trim().toLowerCase();
    if (!normalized) return;

    const match = vendorResults.find(
      (vendor) =>
        vendor.name && vendor.name.trim().toLowerCase() === normalized,
    );

    if (match && String(match.id) !== vendorId) {
      setVendorId(String(match.id));
    }
  }, [vendorSearch, vendorResults, vendorId]);

  const addItemRow = () => {
    const localId = Date.now().toString();
    setItems((prev) => [
      ...prev,
      {
        local_id: localId,
        product_id: null,
        product_name: "",
        quantity: null,
        unit_price: null,
        discount: 0,
        tax_rate: 0,
        total: 0,
      },
    ]);
    setProductSearches((prev) => ({ ...prev, [localId]: "" }));
  };

  const removeItemRow = (local_id: string) => {
    setItems((prev) => prev.filter((item) => item.local_id !== local_id));
    setProductSearches((prev) => {
      const next = { ...prev };
      delete next[local_id];
      return next;
    });
    setProductResults((prev) => {
      const next = { ...prev };
      delete next[local_id];
      return next;
    });
    setSearchingProducts((prev) => {
      const next = { ...prev };
      delete next[local_id];
      return next;
    });
    if (productSearchTimers.current[local_id]) {
      clearTimeout(productSearchTimers.current[local_id]);
      delete productSearchTimers.current[local_id];
    }
  };

  const handleProductSearch = (local_id: string, value: string) => {
    setProductSearches((prev) => ({ ...prev, [local_id]: value }));

    if (!value || value.trim().length < 2) {
      setProductResults((prev) => ({ ...prev, [local_id]: [] }));
      setSearchingProducts((prev) => ({ ...prev, [local_id]: false }));
      return;
    }

    if (productSearchTimers.current[local_id]) {
      clearTimeout(productSearchTimers.current[local_id]);
    }

    setSearchingProducts((prev) => ({ ...prev, [local_id]: true }));
    productSearchTimers.current[local_id] = setTimeout(async () => {
      try {
        const results = await purchaseOrderService.searchProducts(value.trim());
        setProductResults((prev) => ({
          ...prev,
          [local_id]: Array.isArray(results) ? results : [],
        }));
      } catch (_error) {
        setProductResults((prev) => ({ ...prev, [local_id]: [] }));
      } finally {
        setSearchingProducts((prev) => ({ ...prev, [local_id]: false }));
      }
    }, 500);
  };

  const handleProductSelect = (
    local_id: string,
    product: PurchaseOrderProductSearchItem,
  ) => {
    updateItem(local_id, "product_id", product.id);
    updateItem(local_id, "product_name", product.name);
    if (product.unit_price !== undefined && product.unit_price !== null) {
      updateItem(local_id, "unit_price", product.unit_price);
    }

    setProductSearches((prev) => ({ ...prev, [local_id]: product.name }));
    setProductResults((prev) => ({ ...prev, [local_id]: [] }));
  };

  const calculateAmount = (item: ItemRow) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unit_price || 0;
    const discount = item.discount || 0;
    const taxRate = item.tax_rate || 0;
    const subtotal = quantity * unitPrice - discount;
    const taxAmount = subtotal * (taxRate / 100);
    return Math.max(0, subtotal + taxAmount);
  };

  const updateItem = (local_id: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.local_id !== local_id) return item;
        const updated = { ...item, [field]: value } as ItemRow;
        updated.total = calculateAmount(updated);
        return updated;
      }),
    );
  };

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unit_price || 0;
        const discount = item.discount || 0;
        const taxRate = item.tax_rate || 0;
        const lineSubtotal = quantity * unitPrice;
        const lineTaxable = Math.max(0, lineSubtotal - discount);
        const lineTax = lineTaxable * (taxRate / 100);
        const lineTotal = Math.max(0, lineTaxable + lineTax);

        return {
          subtotal: acc.subtotal + lineSubtotal,
          discount: acc.discount + discount,
          tax: acc.tax + lineTax,
          total: acc.total + lineTotal,
        };
      },
      { subtotal: 0, discount: 0, tax: 0, total: 0 },
    );
  }, [items]);

  const validateForm = () => {
    if (!lpoDate) {
      Alert.alert("Validation Error", "Please enter LPO date");
      return false;
    }
    if (!vendorId) {
      Alert.alert("Validation Error", "Please select a vendor");
      return false;
    }
    if (items.length === 0) {
      Alert.alert("Validation Error", "Please add at least one item");
      return false;
    }

    const validItems = items.filter((item) => item.product_id && item.quantity);
    if (validItems.length === 0) {
      Alert.alert("Validation Error", "Please add valid items");
      return false;
    }

    for (const item of validItems) {
      if (!item.product_id) {
        Alert.alert("Validation Error", "Please select a product");
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        Alert.alert("Validation Error", "Quantity must be greater than 0");
        return false;
      }
      if (item.unit_price === null || item.unit_price < 0) {
        Alert.alert("Validation Error", "Unit price must be valid");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (action: "draft" | "send") => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        vendor_id: Number(vendorId),
        lpo_date: lpoDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        notes: notes || undefined,
        terms_conditions: terms || undefined,
        items: items
          .filter((item) => item.product_id && item.quantity)
          .map((item) => ({
            product_id: item.product_id as number,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price || 0),
            discount: Number(item.discount || 0),
            tax_rate: Number(item.tax_rate || 0),
          })),
        action,
      };

      await purchaseOrderService.create(payload);
      Alert.alert(
        "Success",
        action === "send"
          ? "Purchase order created and sent"
          : "Purchase order saved as draft",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Create LPO</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Purchase Order Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>LPO Date *</Text>
            <TouchableOpacity onPress={() => setShowLpoDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={lpoDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showLpoDatePicker && (
              <DateTimePicker
                value={new Date(lpoDate)}
                mode="date"
                display="default"
                onChange={handleLpoDateChange}
              />
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expected Delivery Date</Text>
            <TouchableOpacity onPress={() => setShowExpectedDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={expectedDeliveryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showExpectedDatePicker && (
              <DateTimePicker
                value={
                  expectedDeliveryDate
                    ? new Date(expectedDeliveryDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={handleExpectedDateChange}
              />
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Vendor *</Text>
            <TextInput
              style={styles.input}
              value={vendorSearch}
              onChangeText={(value) => {
                setVendorSearch(value);
                if (!value) setVendorId("");
              }}
              placeholder="Search vendor (min 2 chars)..."
              placeholderTextColor="#9ca3af"
            />
            {searchingVendors && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={BRAND_COLORS.darkPurple}
                />
                <Text style={styles.searchingText}>Searching vendors...</Text>
              </View>
            )}
            {vendorSearch && vendorResults.length > 0 && !searchingVendors && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {vendorResults.map((vendor) => (
                    <TouchableOpacity
                      key={vendor.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setVendorSearch(vendor.name);
                        setVendorId(String(vendor.id));
                        setVendorResults([]);
                      }}>
                      <Text style={styles.dropdownItemText}>{vendor.name}</Text>
                      {vendor.email && (
                        <Text style={styles.dropdownItemSubtext}>
                          {vendor.email}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {vendorSearch &&
              vendorSearch.trim().length >= 2 &&
              vendorResults.length === 0 &&
              !searchingVendors && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No vendors found.</Text>
                </View>
              )}
            {vendorId ? (
              <Text style={styles.selectedHelper}>
                Selected Vendor ID: {vendorId}
              </Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Terms & Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={terms}
              onChangeText={setTerms}
              placeholder="Terms"
              multiline
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              multiline
            />
          </View>
        </View>

        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addItemRow}>
              <Text style={styles.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsIcon}>📦</Text>
              <Text style={styles.emptyItemsText}>
                No items added yet. Click "Add Item" to begin.
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View key={item.local_id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardTitle}>Item #{index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeItemRow(item.local_id)}
                    style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Product *</Text>
                  <TextInput
                    style={styles.input}
                    value={
                      productSearches[item.local_id] ?? item.product_name ?? ""
                    }
                    onChangeText={(value) =>
                      handleProductSearch(item.local_id, value)
                    }
                    placeholder="Search product (min 2 chars)..."
                    placeholderTextColor="#9ca3af"
                  />
                  {searchingProducts[item.local_id] && (
                    <View style={styles.searchingIndicator}>
                      <ActivityIndicator
                        size="small"
                        color={BRAND_COLORS.darkPurple}
                      />
                      <Text style={styles.searchingText}>Searching...</Text>
                    </View>
                  )}
                  {productSearches[item.local_id] &&
                    productResults[item.local_id]?.length > 0 &&
                    !searchingProducts[item.local_id] && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled>
                          {productResults[item.local_id].map((product) => (
                            <TouchableOpacity
                              key={product.id}
                              style={styles.dropdownItem}
                              onPress={() =>
                                handleProductSelect(item.local_id, product)
                              }>
                              <Text style={styles.dropdownItemText}>
                                {product.name}
                              </Text>
                              {product.unit_price !== undefined && (
                                <Text style={styles.dropdownItemSubtext}>
                                  ₦{(product.unit_price || 0).toLocaleString()}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  {productSearches[item.local_id] &&
                    productSearches[item.local_id].trim().length >= 2 &&
                    (productResults[item.local_id]?.length ?? 0) === 0 &&
                    !searchingProducts[item.local_id] && (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>
                          No products found.
                        </Text>
                      </View>
                    )}
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Qty *</Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity ? String(item.quantity) : ""}
                      onChangeText={(value) =>
                        updateItem(
                          item.local_id,
                          "quantity",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Unit Price *</Text>
                    <TextInput
                      style={styles.input}
                      value={item.unit_price ? String(item.unit_price) : ""}
                      onChangeText={(value) =>
                        updateItem(
                          item.local_id,
                          "unit_price",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Discount</Text>
                    <TextInput
                      style={styles.input}
                      value={item.discount ? String(item.discount) : ""}
                      onChangeText={(value) =>
                        updateItem(
                          item.local_id,
                          "discount",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Tax %</Text>
                    <TextInput
                      style={styles.input}
                      value={item.tax_rate ? String(item.tax_rate) : ""}
                      onChangeText={(value) =>
                        updateItem(
                          item.local_id,
                          "tax_rate",
                          parseFloat(value) || 0,
                        )
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ₦{(item.total || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {items.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryAmount}>
                ₦{totals.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryAmount}>
                ₦{totals.discount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryAmount}>
                ₦{totals.tax.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>
                ₦{totals.total.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.submitBtn, styles.draftBtn]}
            onPress={() => handleSubmit("draft")}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Save as Draft</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, styles.postBtn]}
            onPress={() => handleSubmit("send")}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Save & Send</Text>
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
  searchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  searchingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  dropdown: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  noResultsContainer: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  selectedHelper: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
