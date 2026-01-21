import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { invoiceService } from "../services/invoiceService";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type {
  FormData,
  UpdateInvoicePayload,
  InvoiceItem,
  AdditionalCharge,
  Party,
} from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "InvoiceEdit"
>;

type RouteProp = {
  key: string;
  name: string;
  params: {
    id: number;
    onUpdated?: (id: number) => void;
  };
};

export default function InvoiceEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const invoiceId = route.params.id;
  const onUpdated = route.params.onUpdated;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [invoiceType, setInvoiceType] = useState<"sales" | "purchase">("sales");

  // Form state
  const [voucherTypeId, setVoucherTypeId] = useState<number | null>(null);
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [partyId, setPartyId] = useState<number | null>(null);
  const [narration, setNarration] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<
    AdditionalCharge[]
  >([]);

  // Search states
  const [partySearch, setPartySearch] = useState("");
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [searchingParties, setSearchingParties] = useState(false);

  useEffect(() => {
    loadInvoiceAndFormData();
  }, [invoiceId]);

  useEffect(() => {
    const searchParties = async () => {
      if (!partySearch || partySearch.trim().length < 2) {
        setFilteredParties([]);
        return;
      }

      try {
        setSearchingParties(true);
        const partyType = invoiceType === "sales" ? "customer" : "vendor";
        const results = await invoiceService.searchCustomers(
          partySearch,
          partyType,
        );

        if (results && Array.isArray(results) && results.length > 0) {
          setFilteredParties(results);
        } else {
          setFilteredParties([]);
        }
      } catch (error: any) {
        setFilteredParties([]);
      } finally {
        setSearchingParties(false);
      }
    };

    const timeoutId = setTimeout(searchParties, 500);
    return () => clearTimeout(timeoutId);
  }, [partySearch, invoiceType]);

  useEffect(() => {
    if (!partySearch) return;
    const normalized = partySearch.trim().toLowerCase();
    if (!normalized) return;

    const candidates = [
      ...(filteredParties || []),
      ...(formData?.parties || []),
    ];

    const match = candidates.find(
      (party) => party.name && party.name.trim().toLowerCase() === normalized,
    );

    if (match && match.id !== partyId) {
      setPartyId(match.id);
    }
  }, [partySearch, filteredParties, formData?.parties, partyId]);

  const loadInvoiceAndFormData = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.show(invoiceId);
      const invoice = response?.invoice;

      if (!invoice) {
        throw new Error("Failed to load invoice details");
      }

      const type = invoice.type || "sales";
      setInvoiceType(type);

      const data = await invoiceService.getFormData(type);
      if (!data) {
        throw new Error("Failed to load form data");
      }

      setFormData(data);
      setFilteredParties(data.parties || []);

      setVoucherTypeId(invoice.voucher_type_id || null);
      setVoucherDate(invoice.voucher_date || voucherDate);
      setPartyId(invoice.party_id || response.party?.id || null);
      setPartySearch(
        invoice.party_name || response.party?.name || partySearch || "",
      );
      setNarration(invoice.narration || "");

      const mappedItems: InvoiceItem[] = (invoice.items || []).map((item) => {
        const discount =
          (item as any).discount ?? (item as any).discount_percentage ?? 0;
        const vatRate =
          (item as any).vat_rate ?? (item as any).tax_percentage ?? 0;
        const amount = Number(item.amount ?? (item as any).total ?? 0);

        return {
          id: item.id,
          product_id: item.product_id ?? item.product?.id ?? null,
          product: item.product,
          description: item.description,
          quantity: Number(item.quantity || 0),
          unit_id: item.unit_id,
          rate: Number(item.rate || 0),
          discount,
          vat_rate: vatRate,
          amount,
        };
      });

      const mappedCharges: AdditionalCharge[] =
        (invoice.additional_charges || []).map((charge) => ({
          id: charge.id,
          ledger_account_id: charge.ledger_account_id ?? null,
          ledger_account: charge.ledger_account,
          ledger_account_name: charge.ledger_account_name,
          amount: Number(charge.amount || 0),
          description: charge.description || charge.narration || "",
        })) || [];

      setItems(mappedItems);
      setAdditionalCharges(mappedCharges);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load invoice",
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      product_id: null,
      quantity: 1,
      rate: 0,
      discount: 0,
      vat_rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    const item = updatedItems[index];
    const subtotal = (item.quantity || 0) * (item.rate || 0);
    const discountAmount = ((item.discount || 0) / 100) * subtotal;
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = ((item.vat_rate || 0) / 100) * afterDiscount;
    item.amount = afterDiscount + vatAmount;

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addCharge = () => {
    const newCharge: AdditionalCharge = {
      ledger_account_id: null,
      amount: 0,
      description: "",
    };
    setAdditionalCharges([...additionalCharges, newCharge]);
  };

  const updateCharge = (
    index: number,
    field: keyof AdditionalCharge,
    value: any,
  ) => {
    const updatedCharges = [...additionalCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setAdditionalCharges(updatedCharges);
  };

  const removeCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const chargesTotal = additionalCharges.reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0,
    );
    return {
      itemsTotal,
      chargesTotal,
      grandTotal: itemsTotal + chargesTotal,
    };
  };

  const validateForm = (): boolean => {
    if (!voucherTypeId) {
      Alert.alert("Validation Error", "Please select a voucher type");
      return false;
    }
    if (!partyId) {
      Alert.alert("Validation Error", "Please select a party");
      return false;
    }
    if (items.length === 0) {
      Alert.alert("Validation Error", "Please add at least one item");
      return false;
    }
    for (const item of items) {
      if (!item.product_id) {
        Alert.alert(
          "Validation Error",
          "Please select a product for all items",
        );
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        Alert.alert("Validation Error", "Item quantity must be greater than 0");
        return false;
      }
    }
    for (const charge of additionalCharges) {
      if (!charge.ledger_account_id) {
        Alert.alert(
          "Validation Error",
          "Please select a ledger account for all charges",
        );
        return false;
      }
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload: UpdateInvoicePayload = {
        voucher_type_id: voucherTypeId || undefined,
        voucher_date: voucherDate,
        party_id: partyId || undefined,
        narration: narration || undefined,
        items: items.map((item) => ({
          product_id: item.product_id!,
          quantity: item.quantity!,
          rate: item.rate!,
          discount: item.discount || 0,
          vat_rate: item.vat_rate || 0,
        })),
        additional_charges:
          additionalCharges.length > 0
            ? additionalCharges.map((charge) => ({
                ledger_account_id: charge.ledger_account_id!,
                amount: charge.amount!,
                description: charge.description || undefined,
              }))
            : undefined,
      };

      await invoiceService.update(invoiceId, payload);

      showToast("✅ Invoice updated successfully", "success");
      if (onUpdated) {
        onUpdated(invoiceId);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update invoice",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  const totals = calculateTotals();

  const handleDateChange = (_event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    const nextDate = selected.toISOString().split("T")[0];
    setVoucherDate(nextDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Edit {invoiceType === "sales" ? "Sales" : "Purchase"} Invoice
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Voucher Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={voucherTypeId}
                onValueChange={setVoucherTypeId}
                style={styles.picker}
                itemStyle={styles.pickerItem}>
                <Picker.Item
                  label="Select Voucher Type"
                  value={null}
                  color="#9ca3af"
                />
                {formData?.voucher_types.map((type) => (
                  <Picker.Item
                    key={type.id}
                    label={type.name}
                    value={type.id}
                    color={BRAND_COLORS.darkPurple}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Voucher Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={voucherDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(voucherDate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {invoiceType === "sales" ? "Customer" : "Supplier"}{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={partySearch}
              onChangeText={setPartySearch}
              placeholder={`Search ${
                invoiceType === "sales" ? "customer" : "supplier"
              } (min 2 chars)...`}
              placeholderTextColor="#9ca3af"
            />
            {searchingParties && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={BRAND_COLORS.darkPurple}
                />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            )}
            {partySearch && filteredParties.length > 0 && !searchingParties && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll}>
                  {filteredParties.map((party) => (
                    <TouchableOpacity
                      key={party.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPartyId(party.id);
                        setPartySearch(party.name || "");
                        setFilteredParties([]);
                      }}>
                      <Text style={styles.dropdownItemText}>
                        {party.name || "Unnamed Party"}
                      </Text>
                      {(party.email || party.phone || party.mobile) && (
                        <Text style={styles.dropdownItemSubtext}>
                          {[party.email, party.phone || party.mobile]
                            .filter(Boolean)
                            .join(" • ")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {partySearch &&
              partySearch.length >= 2 &&
              filteredParties.length === 0 &&
              !searchingParties && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    No {invoiceType === "sales" ? "customers" : "suppliers"}{" "}
                    found
                  </Text>
                </View>
              )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Narration</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={narration}
              onChangeText={setNarration}
              placeholder="Add notes or description..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Invoice Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Invoice Items</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Item {index + 1}</Text>
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={item.product_id}
                    onValueChange={(value) =>
                      updateItem(index, "product_id", value)
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Product" value={null} />
                    {formData?.products.map((product) => (
                      <Picker.Item
                        key={product.id}
                        label={product.name}
                        value={product.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    value={item.quantity?.toString() || ""}
                    onChangeText={(text) =>
                      updateItem(index, "quantity", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Rate *</Text>
                  <TextInput
                    style={styles.input}
                    value={item.rate?.toString() || ""}
                    onChangeText={(text) =>
                      updateItem(index, "rate", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Discount %</Text>
                  <TextInput
                    style={styles.input}
                    value={item.discount?.toString() || ""}
                    onChangeText={(text) =>
                      updateItem(index, "discount", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>VAT %</Text>
                  <TextInput
                    style={styles.input}
                    value={item.vat_rate?.toString() || ""}
                    onChangeText={(text) =>
                      updateItem(index, "vat_rate", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.amountText}>
                  ₦{(item.amount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Charges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Additional Charges</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCharge}>
              <Text style={styles.addButtonText}>+ Add Charge</Text>
            </TouchableOpacity>
          </View>

          {additionalCharges.map((charge, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Charge {index + 1}</Text>
                <TouchableOpacity onPress={() => removeCharge(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ledger Account *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={charge.ledger_account_id}
                    onValueChange={(value) =>
                      updateCharge(index, "ledger_account_id", value)
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Account" value={null} />
                    {formData?.ledger_accounts.map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={`${account.name} (${account.code})`}
                        value={account.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={charge.amount?.toString() || ""}
                  onChangeText={(text) =>
                    updateCharge(index, "amount", parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={charge.description || ""}
                  onChangeText={(text) =>
                    updateCharge(index, "description", text)
                  }
                  placeholder="Add description..."
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Total:</Text>
              <Text style={styles.summaryValue}>
                {totals.itemsTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Additional Charges:</Text>
              <Text style={styles.summaryValue}>
                {totals.chargesTotal.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Grand Total:</Text>
              <Text style={styles.summaryTotalValue}>
                {totals.grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, styles.postButton]}
            onPress={handleUpdate}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  pickerItem: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  searchingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
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
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 12,
    color: "#6b7280",
  },
  addButton: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  removeButton: {
    fontSize: 18,
    color: "#ef4444",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  summaryTotalValue: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "700",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  postButton: {
    backgroundColor: BRAND_COLORS.gold,
  },
});
