import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  usePayoutFormData,
  useDeductionPreview,
  useSubmitPayout,
} from "../hooks/usePayouts";
import type {
  PayoutForm,
  Bank,
  PayoutFormData,
  DeductionPreview,
} from "../types";

export default function PayoutRequestScreen() {
  const navigation = useNavigation();
  const { formData, isLoading } = usePayoutFormData();
  const deductionMutation = useDeductionPreview();
  const submitMutation = useSubmitPayout();

  const [form, setForm] = useState<PayoutForm>({
    requested_amount: 0,
    bank_name: "",
    account_name: "",
    account_number: "",
    bank_code: "",
    notes: "",
  });
  const [amountDisplay, setAmountDisplay] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [preview, setPreview] = useState<DeductionPreview | null>(null);
  const [showBanks, setShowBanks] = useState(false);

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setAmountDisplay(parts.join("."));
    setForm((prev) => ({ ...prev, requested_amount: parseFloat(raw) || 0 }));
  };

  const fd: PayoutFormData | null = formData;

  const handleAmountBlur = () => {
    if (form.requested_amount > 0) {
      deductionMutation.mutate(form.requested_amount, {
        onSuccess: (data: any) => {
          setPreview(data?.data ?? data);
        },
      });
    }
  };

  const selectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setForm((prev) => ({
      ...prev,
      bank_name: bank.name,
      bank_code: bank.code,
    }));
    setShowBanks(false);
  };

  const handleSubmit = () => {
    if (
      !form.requested_amount ||
      !form.bank_name ||
      !form.account_name ||
      !form.account_number
    )
      return;
    submitMutation.mutate(form, { onSuccess: () => navigation.goBack() });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const isSaving = submitMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Payout</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        {/* Balance Info */}
        {fd && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Available Balance</Text>
            <Text style={styles.balance}>
              ₦{fd.available_balance.toLocaleString()}
            </Text>
            <Text style={styles.hint}>
              Min: ₦{fd.minimum_payout.toLocaleString()} • Max: ₦
              {fd.maximum_payout.toLocaleString()}
            </Text>
            {fd.deduction_description && (
              <Text style={styles.deductionInfo}>
                {fd.deduction_description}
              </Text>
            )}
          </View>
        )}

        {/* Amount */}
        <View style={styles.card}>
          <Text style={styles.label}>Amount (₦) *</Text>
          <TextInput
            style={styles.input}
            value={amountDisplay}
            onChangeText={handleAmountChange}
            onBlur={handleAmountBlur}
            keyboardType="decimal-pad"
            placeholder="Enter amount"
            placeholderTextColor="#9ca3af"
          />

          {/* Deduction Preview */}
          {preview && (
            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Requested</Text>
                <Text style={styles.previewValue}>
                  ₦{preview.requested_amount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Deduction</Text>
                <Text style={[styles.previewValue, { color: "#ef4444" }]}>
                  -₦{preview.deduction_amount.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={styles.previewTotalLabel}>You'll receive</Text>
                <Text style={styles.previewTotalValue}>
                  ₦{preview.net_amount.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.deductionDesc}>
                {preview.deduction_description}
              </Text>
            </View>
          )}
        </View>

        {/* Bank Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <Text style={styles.label}>Bank *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowBanks(!showBanks)}>
            <Text
              style={
                form.bank_name ? styles.inputText : styles.placeholderText
              }>
              {form.bank_name || "Select a bank"}
            </Text>
          </TouchableOpacity>

          {showBanks && fd?.banks && (
            <ScrollView style={styles.bankList} nestedScrollEnabled>
              {fd.banks.map((bank: Bank) => (
                <TouchableOpacity
                  key={bank.code}
                  style={[
                    styles.bankOption,
                    selectedBank?.code === bank.code && styles.bankOptionActive,
                  ]}
                  onPress={() => selectBank(bank)}>
                  <Text
                    style={[
                      styles.bankOptionText,
                      selectedBank?.code === bank.code &&
                        styles.bankOptionTextActive,
                    ]}>
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>Account Name *</Text>
          <TextInput
            style={styles.input}
            value={form.account_name}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, account_name: v }))
            }
            placeholder="Account holder name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Account Number *</Text>
          <TextInput
            style={styles.input}
            value={form.account_number}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, account_number: v }))
            }
            keyboardType="number-pad"
            placeholder="10-digit account number"
            placeholderTextColor="#9ca3af"
            maxLength={10}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.notes}
            onChangeText={(v) => setForm((prev) => ({ ...prev, notes: v }))}
            placeholder="Optional notes"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isSaving && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={isSaving}>
          <Text style={styles.submitText}>
            {isSaving ? "Submitting..." : "Submit Payout Request"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 70 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 70 },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balance: { fontSize: 28, fontWeight: "bold", color: "#10b981" },
  hint: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  deductionInfo: { fontSize: 12, color: "#f59e0b", marginTop: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
  },
  inputText: { fontSize: 14, color: "#1f2937" },
  placeholderText: { fontSize: 14, color: "#9ca3af" },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  previewBox: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  previewLabel: { fontSize: 13, color: "#6b7280" },
  previewValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  previewTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
    paddingTop: 8,
  },
  previewTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  previewTotalValue: { fontSize: 16, fontWeight: "bold", color: "#10b981" },
  deductionDesc: { fontSize: 11, color: "#9ca3af", marginTop: 6 },
  bankList: {
    maxHeight: 200,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  bankOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  bankOptionActive: { backgroundColor: BRAND_COLORS.darkPurple },
  bankOptionText: { fontSize: 13, color: "#374151" },
  bankOptionTextActive: { color: "#fff" },
  submitBtn: {
    backgroundColor: BRAND_COLORS.gold,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
