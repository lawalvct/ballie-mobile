import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import TaxModuleHeader from "../../../components/tax/TaxModuleHeader";
import { useTaxSettings, useUpdateTaxSettings } from "../hooks/useTax";
import type { TaxSettingsUpdatePayload } from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "TaxSettings">;

export default function TaxSettingsScreen({ navigation }: Props) {
  const { settings, isLoading, isRefreshing, refresh } = useTaxSettings();
  const updateSettings = useUpdateTaxSettings();

  const [editing, setEditing] = useState(false);
  const [vatRate, setVatRate] = useState("");
  const [vatReg, setVatReg] = useState("");
  const [tin, setTin] = useState("");

  const startEdit = useCallback(() => {
    setVatRate(String(settings?.vat_rate ?? ""));
    setVatReg(settings?.vat_registration_number ?? "");
    setTin(settings?.tax_identification_number ?? "");
    setEditing(true);
  }, [settings]);

  const handleSave = useCallback(() => {
    const parsed = parseFloat(vatRate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      Alert.alert("Invalid", "VAT rate must be between 0 and 100.");
      return;
    }
    const payload: TaxSettingsUpdatePayload = {
      vat_rate: parsed,
      vat_registration_number: vatReg.trim() || null,
      tax_identification_number: tin.trim() || null,
    };
    updateSettings.mutate(payload, {
      onSuccess: () => setEditing(false),
    });
  }, [vatRate, vatReg, tin, updateSettings]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="Tax Settings"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          </View>
        ) : (
          <>
            {/* Edit / Save Button */}
            <TouchableOpacity
              style={[
                styles.editSaveBtn,
                editing && styles.editSaveBtnActive,
              ]}
              onPress={editing ? handleSave : startEdit}
              disabled={updateSettings.isPending}
              activeOpacity={0.8}>
              {updateSettings.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.editSaveBtnText,
                    editing && styles.editSaveBtnTextActive,
                  ]}>
                  {editing ? "Save Changes" : "Edit Settings"}
                </Text>
              )}
            </TouchableOpacity>

            {/* VAT & Registration */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>General</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>VAT Rate (%)</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={vatRate}
                    onChangeText={setVatRate}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {settings?.vat_rate ?? "—"}%
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>VAT Reg. Number</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={vatReg}
                    onChangeText={setVatReg}
                    placeholder="Enter VAT registration number"
                    placeholderTextColor="#9ca3af"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {settings?.vat_registration_number || "Not set"}
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tax Identification (TIN)</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={tin}
                    onChangeText={setTin}
                    placeholder="Enter TIN"
                    placeholderTextColor="#9ca3af"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {settings?.tax_identification_number || "Not set"}
                  </Text>
                )}
              </View>

              {editing && (
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setEditing(false)}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Statutory Rates */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Statutory Rates</Text>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Pension (Employee)</Text>
                <Text style={styles.rateValue}>
                  {settings?.statutory_rates?.pension_employee ?? "—"}%
                </Text>
              </View>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Pension (Employer)</Text>
                <Text style={styles.rateValue}>
                  {settings?.statutory_rates?.pension_employer ?? "—"}%
                </Text>
              </View>
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>NSITF</Text>
                <Text style={styles.rateValue}>
                  {settings?.statutory_rates?.nsitf ?? "—"}%
                </Text>
              </View>
            </View>

            {/* Tax Rates Table */}
            {(settings?.tax_rates ?? []).length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tax Rates</Text>
                {settings!.tax_rates.map((rate) => (
                  <View key={`rate-${rate.id}`} style={styles.taxRateRow}>
                    <View style={styles.taxRateLeft}>
                      <Text style={styles.taxRateName}>{rate.name}</Text>
                      {rate.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.taxRateValue}>
                      {rate.rate}
                      {rate.type === "percentage" ? "%" : " (fixed)"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f3f4f6" },
  editSaveBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.darkPurple,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  editSaveBtnActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  editSaveBtnText: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  editSaveBtnTextActive: { color: "#fff" },
  loadingWrap: { paddingVertical: 60, alignItems: "center" },

  card: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 12 },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 4 },
  fieldValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  cancelEditBtn: { alignSelf: "flex-start", marginTop: 4 },
  cancelEditText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },

  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  rateLabel: { fontSize: 14, color: "#374151" },
  rateValue: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.darkPurple },

  taxRateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  taxRateLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  taxRateName: { fontSize: 14, color: "#374151" },
  defaultBadge: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: { fontSize: 10, fontWeight: "700", color: "#10b981" },
  taxRateValue: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
});
