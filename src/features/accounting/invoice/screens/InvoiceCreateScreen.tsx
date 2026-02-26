import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../../../utils/toast";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { invoiceService } from "../services/invoiceService";
import { useInvoiceForm } from "../hooks/useInvoiceForm";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type {
  CreateInvoicePayload,
  InvoiceItem,
  AdditionalCharge,
  Party,
  AIInvoicePrefillData,
} from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "InvoiceCreate"
>;

type RouteProp = {
  key: string;
  name: string;
  params: {
    type: "sales" | "purchase";
    prefillData?: AIInvoicePrefillData;
  };
};

/* ════════════════════════════════════════════════════════════════════════════ */

export default function InvoiceCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const invoiceType = route.params.type;

  /* ── TanStack Query: form data + mutation ── */
  const { formData, isLoading, isError, error, createInvoice, isSubmitting } =
    useInvoiceForm(invoiceType);

  /* ── Local form state ── */
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

  /* ── Ref to avoid stale closures when accessing formData in callbacks ── */
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  /* ── Party search ── */
  const [partySearch, setPartySearch] = useState("");
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [searchingParties, setSearchingParties] = useState(false);

  /* Auto-select voucher type once form data loads */
  useEffect(() => {
    if (!formData || voucherTypeId) return;
    const types = formData.voucher_types ?? [];
    if (types.length === 0) return;
    const target = invoiceType === "sales" ? "sales" : "purchase";
    const match = types.find((t) => t.name?.toLowerCase() === target);
    setVoucherTypeId(match ? match.id : types[0].id);
  }, [formData, invoiceType, voucherTypeId]);

  /* ── AI prefill: populate form when navigated from AIInvoiceScreen ── */
  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    const prefillData = route.params?.prefillData;
    if (!prefillData || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;

    if (prefillData.voucher_type_id) {
      setVoucherTypeId(prefillData.voucher_type_id);
    }
    if (prefillData.voucher_date) {
      setVoucherDate(prefillData.voucher_date);
    }
    if (prefillData.customer_id) {
      setPartyId(prefillData.customer_id);
    }
    if (prefillData.customer_name) {
      setPartySearch(prefillData.customer_name);
    }
    if (prefillData.narration) {
      setNarration(prefillData.narration);
    }
    if (prefillData.items && prefillData.items.length > 0) {
      setItems(
        prefillData.items.map((ai) => ({
          product_id: ai.product_id,
          product_name: ai.product_name || undefined,
          description: ai.description || undefined,
          quantity: ai.quantity || 1,
          rate: ai.rate || 0,
          unit: ai.unit || undefined,
          discount: 0,
          vat_rate: 0,
          amount: ai.amount || (ai.quantity || 1) * (ai.rate || 0),
        })),
      );
    }
    showToast("AI Invoice applied — review and fix any ⚠ warnings", "info");
  }, [route.params?.prefillData]);

  /* Debounced party search (500 ms) */
  useEffect(() => {
    if (!partySearch || partySearch.trim().length < 2) {
      setFilteredParties([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchingParties(true);
        const partyType = invoiceType === "sales" ? "customer" : "vendor";
        const results = await invoiceService.searchCustomers(
          partySearch,
          partyType,
        );
        setFilteredParties(Array.isArray(results) ? results : []);
      } catch {
        setFilteredParties([]);
      } finally {
        setSearchingParties(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [partySearch, invoiceType]);

  /* Auto-match typed name to a party from results / formData */
  useEffect(() => {
    if (!partySearch) return;
    const normalized = partySearch.trim().toLowerCase();
    if (!normalized) return;
    const candidates = [
      ...(filteredParties ?? []),
      ...(formData?.parties ?? []),
    ];
    const match = candidates.find(
      (p) => p.name?.trim().toLowerCase() === normalized,
    );
    if (match && match.id !== partyId) setPartyId(match.id);
  }, [partySearch, filteredParties, formData?.parties, partyId]);

  /* ── Item helpers ── */
  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        product_id: null,
        quantity: 1,
        rate: 0,
        discount: 0,
        vat_rate: 0,
        amount: 0,
      },
    ]);
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItem, value: any) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        const item = next[index];
        const subtotal = (item.quantity || 0) * (item.rate || 0);
        const discountAmt = ((item.discount || 0) / 100) * subtotal;
        const afterDiscount = subtotal - discountAmt;
        const vatAmt = ((item.vat_rate || 0) / 100) * afterDiscount;
        item.amount = afterDiscount + vatAmt;
        return next;
      });
    },
    [],
  );

  /** Helper: extract a non-null rate from a product-like object */
  const extractRate = useCallback(
    (p: any): number => {
      if (!p) return 0;
      const isSalesType = invoiceType === "sales";
      const candidates = isSalesType
        ? [
            p.sales_rate,
            p.sales_price,
            p.sale_rate,
            p.default_price,
            p.price,
            p.rate,
          ]
        : [
            p.purchase_rate,
            p.purchase_price,
            p.buy_rate,
            p.default_price,
            p.cost,
            p.rate,
          ];
      for (const val of candidates) {
        if (val !== null && val !== undefined) {
          const parsed = Number(val);
          if (Number.isFinite(parsed) && parsed > 0) return parsed;
        }
      }
      return 0;
    },
    [invoiceType],
  );

  /** Atomically set product_id + rate into items state */
  const applyProductRate = useCallback(
    (index: number, productId: number | null, rate: number) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], product_id: productId, rate };
        const item = next[index];
        const subtotal = (item.quantity || 0) * (item.rate || 0);
        const discountAmt = ((item.discount || 0) / 100) * subtotal;
        const afterDiscount = subtotal - discountAmt;
        const vatAmt = ((item.vat_rate || 0) / 100) * afterDiscount;
        item.amount = afterDiscount + vatAmt;
        return next;
      });
    },
    [],
  );

  /**
   * Select product and auto-fill rate.
   * 1. Try to resolve rate from form-data product (instant).
   * 2. If rate is 0 (backend returned null prices), fetch full product
   *    details from GET /inventory/products/{id} which has sales_rate.
   */
  const selectProduct = useCallback(
    (index: number, rawValue: any) => {
      /* ── 1. Skip placeholder selection ── */
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return;
      }

      /* ── 2. Find the product from latest formData (via ref) ── */
      const products = formDataRef.current?.products ?? [];
      const valStr = String(rawValue);
      const valNum = Number(rawValue);
      const product =
        products.find((p: any) => String(p.id) === valStr) ??
        products.find(
          (p: any) => Number.isFinite(valNum) && Number(p.id) === valNum,
        ) ??
        null;

      const productId = product
        ? product.id
        : Number.isFinite(valNum)
          ? valNum
          : null;

      /* ── 3. Try resolving rate from form-data product ── */
      const localRate = extractRate(product);

      /* ── 4. Apply immediately (rate may be 0 temporarily) ── */
      applyProductRate(index, productId, localRate);

      /* ── 5. If rate is still 0, fetch full product details as fallback ── */
      if (localRate === 0 && productId) {
        invoiceService.getProductById(productId).then((fullProduct) => {
          if (!fullProduct) return;
          const fetchedRate = extractRate(fullProduct);
          if (fetchedRate > 0) {
            applyProductRate(index, productId, fetchedRate);
          }
        });
      }
    },
    [invoiceType, extractRate, applyProductRate],
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ── Charge helpers ── */
  const addCharge = useCallback(() => {
    setAdditionalCharges((prev) => [
      ...prev,
      { ledger_account_id: null, amount: 0, description: "" },
    ]);
  }, []);

  const updateCharge = useCallback(
    (index: number, field: keyof AdditionalCharge, value: any) => {
      setAdditionalCharges((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    [],
  );

  const removeCharge = useCallback((index: number) => {
    setAdditionalCharges((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ── Totals (memoised) ── */
  const totals = useMemo(() => {
    const itemsTotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    const chargesTotal = additionalCharges.reduce(
      (s, c) => s + (c.amount || 0),
      0,
    );
    return { itemsTotal, chargesTotal, grandTotal: itemsTotal + chargesTotal };
  }, [items, additionalCharges]);

  /* ── Validation ── */
  const validateForm = (): boolean => {
    if (!voucherTypeId) {
      Alert.alert("Validation Error", "Please select a voucher type");
      return false;
    }
    if (!partyId) {
      Alert.alert(
        "Validation Error",
        `Please select a ${invoiceType === "sales" ? "customer" : "supplier"}`,
      );
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

  /* ── Submit (uses mutation) ── */
  const handleSubmit = async (status: "draft" | "posted") => {
    if (!validateForm()) return;

    const payload: CreateInvoicePayload = {
      voucher_type_id: voucherTypeId!,
      voucher_date: voucherDate,
      party_id: partyId!,
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
          ? additionalCharges.map((c) => ({
              ledger_account_id: c.ledger_account_id!,
              amount: c.amount!,
              description: c.description || undefined,
            }))
          : undefined,
      status,
    };

    try {
      const invoice = await createInvoice(payload);
      showToast(
        `Invoice ${status === "draft" ? "saved as draft" : "created and posted"} successfully`,
        "success",
      );
      // replace so "Back" from InvoiceShow goes to InvoiceHome, not back here
      navigation.replace("InvoiceShow", { id: invoice.id });
    } catch (err: any) {
      // apiClient interceptor rejects with error.response?.data directly
      const apiMessage =
        typeof err === "string"
          ? err
          : err?.message ||
            (err?.errors
              ? Object.values(err.errors as Record<string, string[]>)
                  .flat()
                  .join("\n")
              : null);
      Alert.alert("Error", apiMessage || "Failed to create invoice");
    }
  };

  const handleDateChange = (_event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    setVoucherDate(selected.toISOString().split("T")[0]);
  };

  const isSales = invoiceType === "sales";
  const partyLabel = isSales ? "Customer" : "Supplier";

  /* ══════════════════════════  RENDER  ══════════════════════════ */

  /* Loading state */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingText}>Loading form data…</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  /* Error state */
  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          style={styles.loadingGradient}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>
            {(error as any)?.response?.data?.message ||
              (error as Error)?.message ||
              "Failed to load form data"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* ── Gradient Header ── */}
      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isSales ? "Sales" : "Purchase"} Invoice
          </Text>
          <View style={{ width: 50 }} />
        </View>
        {/* Sub-heading badge */}
        <View style={styles.headerBadgeRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isSales
                  ? "rgba(16,185,129,0.25)"
                  : "rgba(59,130,246,0.25)",
              },
            ]}>
            <Text
              style={[
                styles.typeBadgeText,
                { color: isSales ? "#6ee7b7" : "#93c5fd" },
              ]}>
              {isSales ? "Sales" : "Purchase"}
            </Text>
          </View>
          <Text style={styles.headerSub}>New Invoice</Text>
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* ── Basic Information ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Voucher Type */}
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
                    color="#1a0f33"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Voucher Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Voucher Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{voucherDate}</Text>
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

          {/* Party search */}
          <View style={[styles.formGroup, { zIndex: 10 }]}>
            <Text style={styles.label}>
              {partyLabel} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={partySearch}
              onChangeText={setPartySearch}
              placeholder={`Search ${partyLabel.toLowerCase()} (min 2 chars)…`}
              placeholderTextColor="#9ca3af"
            />
            {searchingParties && (
              <View style={styles.searchingRow}>
                <ActivityIndicator size="small" color="#d1b05e" />
                <Text style={styles.searchingText}>Searching…</Text>
              </View>
            )}
            {partySearch && filteredParties.length > 0 && !searchingParties && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
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
                        <Text style={styles.dropdownItemSub}>
                          {[party.email, party.phone || party.mobile]
                            .filter(Boolean)
                            .join(" · ")}
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
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No {partyLabel.toLowerCase()}s found
                  </Text>
                </View>
              )}
          </View>

          {/* Narration */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Narration</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={narration}
              onChangeText={setNarration}
              placeholder="Add notes or description…"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* ── Invoice Items ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Invoice Items{" "}
              <Text style={styles.countBadge}>({items.length})</Text>
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNumberBadge}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemTitle}>Item {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItem(index)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={item.product_id}
                    onValueChange={(v) => selectProduct(index, v)}
                    style={styles.picker}>
                    <Picker.Item label="Select Product" value={null} />
                    {formData?.products.map((p) => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
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
                    onChangeText={(t) =>
                      updateItem(index, "quantity", parseFloat(t) || 0)
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
                    onChangeText={(t) =>
                      updateItem(index, "rate", parseFloat(t) || 0)
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
                    onChangeText={(t) =>
                      updateItem(index, "discount", parseFloat(t) || 0)
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
                    onChangeText={(t) =>
                      updateItem(index, "vat_rate", parseFloat(t) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>
                  {item.amount?.toFixed(2) || "0.00"}
                </Text>
              </View>
            </View>
          ))}

          {items.length === 0 && (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>
                No items added yet. Tap "+ Add Item" to start.
              </Text>
            </View>
          )}
        </View>

        {/* ── Additional Charges ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Additional Charges{" "}
              <Text style={styles.countBadge}>
                ({additionalCharges.length})
              </Text>
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={addCharge}>
              <Text style={styles.addButtonText}>+ Add Charge</Text>
            </TouchableOpacity>
          </View>

          {additionalCharges.map((charge, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNumberBadge}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemTitle}>Charge {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeCharge(index)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ledger Account *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={charge.ledger_account_id}
                    onValueChange={(v) =>
                      updateCharge(index, "ledger_account_id", v)
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Account" value={null} />
                    {formData?.ledger_accounts.map((a) => (
                      <Picker.Item key={a.id} label={a.name} value={a.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={charge.amount?.toString() || ""}
                  onChangeText={(t) =>
                    updateCharge(index, "amount", parseFloat(t) || 0)
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
                  onChangeText={(t) => updateCharge(index, "description", t)}
                  placeholder="Add description…"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ))}

          {additionalCharges.length === 0 && (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>
                No additional charges. Tap "+ Add Charge" if needed.
              </Text>
            </View>
          )}
        </View>

        {/* ── Summary ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <LinearGradient
            colors={["#f8f6f0", "#f1ede3"]}
            style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Total</Text>
              <Text style={styles.summaryValue}>
                {totals.itemsTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Additional Charges</Text>
              <Text style={styles.summaryValue}>
                {totals.chargesTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Grand Total</Text>
              <Text style={styles.summaryTotalValue}>
                {totals.grandTotal.toFixed(2)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.draftBtn]}
            onPress={() => handleSubmit("draft")}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Save as Draft</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.postBtn]}
            onPress={() => handleSubmit("posted")}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#1a0f33" size="small" />
            ) : (
              <Text style={[styles.actionBtnText, { color: "#1a0f33" }]}>
                Create & Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ═══════════════════════════  STYLES  ═══════════════════════════ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },

  /* Loading / Error */
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  errorIcon: { fontSize: 40 },
  errorText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#d1b05e",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#1a0f33",
    fontWeight: "700",
    fontSize: 14,
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  /* Content */
  content: {
    flex: 1,
    backgroundColor: "#f3f4f8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentInner: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a0f33",
    marginBottom: 14,
  },
  countBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },

  /* Form */
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: { color: "#ef4444" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1a0f33",
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#1a0f33",
  },
  pickerItem: {
    fontSize: 14,
    height: 50,
  },

  /* Date */
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateIcon: { fontSize: 16 },
  dateText: { fontSize: 14, fontWeight: "600", color: "#1a0f33" },

  /* Party dropdown */
  dropdown: {
    position: "absolute",
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a0f33",
  },
  dropdownItemSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: "#fefce8",
    borderRadius: 8,
  },
  searchingText: { fontSize: 13, color: "#92400e" },
  noResults: {
    padding: 14,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    marginTop: 6,
    alignItems: "center",
  },
  noResultsText: { fontSize: 13, color: "#991b1b" },

  /* Item / Charge cards */
  itemCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  itemNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1a0f33",
    alignItems: "center",
    justifyContent: "center",
  },
  itemNumberText: {
    color: "#d1b05e",
    fontSize: 12,
    fontWeight: "700",
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1a0f33",
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  flex1: { flex: 1 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d1b05e",
  },

  /* Empty states */
  emptyBlock: {
    paddingVertical: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 28 },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },

  /* Add button */
  addButton: {
    backgroundColor: "#d1b05e",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#1a0f33",
    fontSize: 13,
    fontWeight: "700",
  },

  /* Summary */
  summaryCard: {
    borderRadius: 10,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a0f33",
  },
  summaryDivider: {
    height: 2,
    backgroundColor: "#1a0f33",
    borderRadius: 1,
    marginVertical: 6,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a0f33",
  },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d1b05e",
  },

  /* Action buttons */
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  draftBtn: {
    backgroundColor: "#6b7280",
  },
  postBtn: {
    backgroundColor: "#d1b05e",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
