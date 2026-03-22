import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompanySettingsStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useCompanySettings,
  useUpdateBusinessDetails,
} from "../hooks/useCompanySettings";
import type { BusinessType } from "../types";

type Props = NativeStackScreenProps<CompanySettingsStackParamList, "BusinessDetails">;

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "retail", label: "Retail & E-commerce" },
  { value: "service", label: "Service Business" },
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "wholesale", label: "Wholesale & Distribution" },
  { value: "other", label: "Other" },
];

export default function BusinessDetailsScreen({ navigation }: Props) {
  const { data, isLoading } = useCompanySettings();
  const updateBusiness = useUpdateBusinessDetails();

  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [regNumber, setRegNumber] = useState("");
  const [tin, setTin] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (data?.business) {
      const b = data.business;
      setBusinessType(b.business_type || "");
      setRegNumber(b.business_registration_number || "");
      setTin(b.tax_identification_number || "");
      setFiscalYearStart(b.fiscal_year_start || "");
      setPaymentTerms(b.payment_terms != null ? String(b.payment_terms) : "");
    }
  }, [data?.business]);

  const handleSave = () => {
    const terms = parseInt(paymentTerms, 10);
    updateBusiness.mutate(
      {
        business_type: businessType || undefined,
        business_registration_number: regNumber.trim() || undefined,
        tax_identification_number: tin.trim() || undefined,
        fiscal_year_start: fiscalYearStart.trim() || undefined,
        payment_terms: !isNaN(terms) ? Math.min(365, Math.max(0, terms)) : undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const selectedLabel =
    BUSINESS_TYPES.find((t) => t.value === businessType)?.label || "Select type";

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Details</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>
        <View style={[styles.body, { alignItems: "center", paddingTop: 60 }]}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Details</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {/* Business Type */}
            <Text style={styles.fieldLabel}>Business Type</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowTypePicker(true)}>
              <Text
                style={[
                  styles.pickerText,
                  !businessType && { color: "#9ca3af" },
                ]}>
                {selectedLabel}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            {/* Registration Number */}
            <Text style={styles.fieldLabel}>Business Registration Number</Text>
            <TextInput
              style={styles.input}
              value={regNumber}
              onChangeText={setRegNumber}
              placeholder="e.g. RC123456"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />

            {/* TIN */}
            <Text style={styles.fieldLabel}>Tax Identification Number</Text>
            <TextInput
              style={styles.input}
              value={tin}
              onChangeText={setTin}
              placeholder="e.g. 12345678-0001"
              placeholderTextColor="#9ca3af"
            />

            {/* Fiscal Year Start */}
            <Text style={styles.fieldLabel}>Fiscal Year Start</Text>
            <TextInput
              style={styles.input}
              value={fiscalYearStart}
              onChangeText={setFiscalYearStart}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />

            {/* Payment Terms */}
            <Text style={styles.fieldLabel}>Default Payment Terms (days)</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  const v = Math.max(0, (parseInt(paymentTerms, 10) || 0) - 1);
                  setPaymentTerms(String(v));
                }}>
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                value={paymentTerms}
                onChangeText={(t) => {
                  const cleaned = t.replace(/\D/g, "");
                  setPaymentTerms(cleaned);
                }}
                keyboardType="number-pad"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  const v = Math.min(365, (parseInt(paymentTerms, 10) || 0) + 1);
                  setPaymentTerms(String(v));
                }}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Number of days for payment due date (0–365)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, updateBusiness.isPending && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={updateBusiness.isPending}>
            <Text style={styles.saveBtnText}>
              {updateBusiness.isPending ? "Saving…" : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Business Type Picker Modal */}
      <Modal
        transparent
        visible={showTypePicker}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Business Type</Text>
            <FlatList
              data={BUSINESS_TYPES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    businessType === item.value && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    setBusinessType(item.value);
                    setShowTypePicker(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      businessType === item.value && styles.pickerOptionTextActive,
                    ]}>
                    {item.label}
                  </Text>
                  {businessType === item.value && (
                    <Text style={styles.pickerCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 32, color: "#fff", marginTop: -4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
  },
  bodyContent: { paddingTop: 24 },

  formCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  helperText: { fontSize: 11, color: "#9ca3af", marginTop: 4 },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerText: { fontSize: 15, color: "#1f2937" },
  pickerArrow: { fontSize: 10, color: "#9ca3af" },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BRAND_COLORS.darkPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: { fontSize: 20, color: "#fff", fontWeight: "600" },
  stepperInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    maxHeight: 400,
    overflow: "hidden",
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    padding: 20,
    paddingBottom: 10,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerOptionActive: { backgroundColor: "rgba(209,176,94,0.08)" },
  pickerOptionText: { fontSize: 15, color: "#374151" },
  pickerOptionTextActive: { fontWeight: "600", color: BRAND_COLORS.darkPurple },
  pickerCheck: { fontSize: 16, color: BRAND_COLORS.gold, fontWeight: "700" },
});
