import React, { useEffect, useRef, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { quotationService } from "../services/quotationService";
import type {
  QuotationCustomerSearchItem,
  QuotationItem,
  QuotationProductSearchItem,
} from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "QuotationCreate"
>;

interface ItemRow extends QuotationItem {
  local_id: string;
}

export default function QuotationCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [submitting, setSubmitting] = useState(false);

  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [customerLedgerId, setCustomerLedgerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<
    QuotationCustomerSearchItem[]
  >([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [subject, setSubject] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [showQuotationDatePicker, setShowQuotationDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [productSearches, setProductSearches] = useState<
    Record<string, string>
  >({});
  const [productResults, setProductResults] = useState<
    Record<string, QuotationProductSearchItem[]>
  >({});
  const [searchingProducts, setSearchingProducts] = useState<
    Record<string, boolean>
  >({});
  const productSearchTimers = useRef<Record<string, any>>({});

  useEffect(() => {
    const searchCustomers = async () => {
      if (!customerSearch || customerSearch.trim().length < 2) {
        setCustomerResults([]);
        return;
      }

      try {
        setSearchingCustomers(true);
        const results = await quotationService.searchCustomers(
          customerSearch.trim(),
        );
        setCustomerResults(Array.isArray(results) ? results : []);
      } catch (_error) {
        setCustomerResults([]);
      } finally {
        setSearchingCustomers(false);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 500);
    return () => clearTimeout(timeoutId);
  }, [customerSearch]);

  useEffect(() => {
    if (!customerSearch) return;
    const normalized = customerSearch.trim().toLowerCase();
    if (!normalized) return;

    const match = customerResults.find(
      (customer) =>
        customer.name && customer.name.trim().toLowerCase() === normalized,
    );

    if (match && String(match.ledger_account_id) !== customerLedgerId) {
      setCustomerLedgerId(String(match.ledger_account_id));
    }
  }, [customerSearch, customerResults, customerLedgerId]);

  const handleQuotationDateChange = (_event: any, selected?: Date) => {
    setShowQuotationDatePicker(false);
    if (!selected) return;
    setQuotationDate(selected.toISOString().split("T")[0]);
  };

  const handleExpiryDateChange = (_event: any, selected?: Date) => {
    setShowExpiryDatePicker(false);
    if (!selected) return;
    setExpiryDate(selected.toISOString().split("T")[0]);
  };

  const addItemRow = () => {
    const localId = Date.now().toString();
    setItems((prev) => [
      ...prev,
      {
        local_id: localId,
        product_id: null,
        product_name: "",
        description: "",
        quantity: null,
        rate: null,
        discount: 0,
        tax: 0,
        amount: 0,
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
        const results = await quotationService.searchProducts(value.trim());
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
    product: QuotationProductSearchItem,
  ) => {
    updateItem(local_id, "product_id", product.id);
    updateItem(local_id, "product_name", product.name);
    if (product.description) {
      updateItem(local_id, "description", product.description);
    }
    if (typeof product.sales_rate === "number") {
      updateItem(local_id, "rate", product.sales_rate);
    } else if (typeof product.rate === "number") {
      updateItem(local_id, "rate", product.rate);
    }

    setProductSearches((prev) => ({ ...prev, [local_id]: product.name }));
    setProductResults((prev) => ({ ...prev, [local_id]: [] }));
  };

  const calculateAmount = (item: ItemRow) => {
    const quantity = item.quantity || 0;
    const rate = item.rate || 0;
    const discount = item.discount || 0;
    const tax = item.tax || 0;
    const subtotal = quantity * rate - discount;
    const taxAmount = subtotal * (tax / 100);
    return Math.max(0, subtotal + taxAmount);
  };

  const updateItem = (local_id: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.local_id !== local_id) return item;
        const updated = { ...item, [field]: value } as ItemRow;
        updated.amount = calculateAmount(updated);
        return updated;
      }),
    );
  };

  const getTotalAmount = () =>
    items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const validateForm = () => {
    if (!quotationDate) {
      Alert.alert("Validation Error", "Please enter quotation date");
      return false;
    }
    if (!customerLedgerId) {
      Alert.alert("Validation Error", "Please select a customer");
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
      if (item.rate === null || item.rate < 0) {
        Alert.alert("Validation Error", "Rate must be valid");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (action: "save" | "save_and_send") => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        quotation_date: quotationDate,
        expiry_date: expiryDate || undefined,
        customer_ledger_id: Number(customerLedgerId),
        subject: subject || undefined,
        reference_number: referenceNumber || undefined,
        terms_and_conditions: terms || undefined,
        notes: notes || undefined,
        items: items
          .filter((item) => item.product_id && item.quantity)
          .map((item) => ({
            product_id: item.product_id as number,
            description: item.description || undefined,
            quantity: Number(item.quantity),
            rate: Number(item.rate || 0),
            discount: Number(item.discount || 0),
            tax: Number(item.tax || 0),
          })),
        action,
      };

      await quotationService.create(payload);
      Alert.alert(
        "Success",
        action === "save_and_send"
          ? "Quotation created and sent"
          : "Quotation saved as draft",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create quotation");
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
        <Text style={styles.headerTitle}>Create Quotation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Quotation Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Quotation Date *</Text>
            <TouchableOpacity onPress={() => setShowQuotationDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={quotationDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showQuotationDatePicker && (
              <DateTimePicker
                value={new Date(quotationDate)}
                mode="date"
                display="default"
                onChange={handleQuotationDateChange}
              />
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity onPress={() => setShowExpiryDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={expiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showExpiryDatePicker && (
              <DateTimePicker
                value={expiryDate ? new Date(expiryDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleExpiryDateChange}
              />
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer *</Text>
            <TextInput
              style={styles.input}
              value={customerSearch}
              onChangeText={(value) => {
                setCustomerSearch(value);
                if (!value) setCustomerLedgerId("");
              }}
              placeholder="Search customer (min 2 chars)..."
              placeholderTextColor="#9ca3af"
            />
            {searchingCustomers && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={BRAND_COLORS.darkPurple}
                />
                <Text style={styles.searchingText}>Searching customers...</Text>
              </View>
            )}
            {customerSearch &&
              customerResults.length > 0 &&
              !searchingCustomers && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {customerResults.map((customer) => (
                      <TouchableOpacity
                        key={customer.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCustomerSearch(customer.name);
                          setCustomerLedgerId(
                            String(customer.ledger_account_id),
                          );
                          setCustomerResults([]);
                        }}>
                        <Text style={styles.dropdownItemText}>
                          {customer.name}
                        </Text>
                        <Text style={styles.dropdownItemSubtext}>
                          Ledger ID: {customer.ledger_account_id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            {customerSearch &&
              customerSearch.trim().length >= 2 &&
              customerResults.length === 0 &&
              !searchingCustomers && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No customers found.</Text>
                </View>
              )}
            {customerLedgerId ? (
              <Text style={styles.selectedHelper}>
                Selected Ledger ID: {customerLedgerId}
              </Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder="Reference"
            />
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
                              {(product.sales_rate ?? product.rate) !==
                                undefined && (
                                <Text style={styles.dropdownItemSubtext}>
                                  ₦
                                  {(
                                    product.sales_rate ??
                                    product.rate ??
                                    0
                                  ).toLocaleString()}
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

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={item.description || ""}
                    onChangeText={(value) =>
                      updateItem(item.local_id, "description", value)
                    }
                    placeholder="Description"
                  />
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
                    <Text style={styles.label}>Rate *</Text>
                    <TextInput
                      style={styles.input}
                      value={item.rate ? String(item.rate) : ""}
                      onChangeText={(value) =>
                        updateItem(
                          item.local_id,
                          "rate",
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
                      value={item.tax ? String(item.tax) : ""}
                      onChangeText={(value) =>
                        updateItem(item.local_id, "tax", parseFloat(value) || 0)
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.amountValue}>
                    ₦{(item.amount || 0).toLocaleString()}
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
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryAmount}>
                ₦{getTotalAmount().toLocaleString()}
              </Text>
            </View>
          </View>
        )}

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
            onPress={() => handleSubmit("save_and_send")}
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
