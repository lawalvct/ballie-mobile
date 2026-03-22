import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  useUpdatePreferences,
} from "../hooks/useCompanySettings";
import type {
  CurrencyCode,
  DateFormatStr,
  TimeFormat,
  TimezoneId,
  LanguageCode,
} from "../types";

type Props = NativeStackScreenProps<CompanySettingsStackParamList, "Preferences">;

const CURRENCIES: { value: CurrencyCode; label: string; symbol: string }[] = [
  { value: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
];

const DATE_FORMATS: { value: DateFormatStr; label: string }[] = [
  { value: "d/m/Y", label: "DD/MM/YYYY" },
  { value: "m/d/Y", label: "MM/DD/YYYY" },
  { value: "Y-m-d", label: "YYYY-MM-DD" },
];

const TIMEZONES: { value: TimezoneId; label: string }[] = [
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
];

const LANGUAGES: { value: LanguageCode; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
];

export default function PreferencesScreen({ navigation }: Props) {
  const { data, isLoading } = useCompanySettings();
  const updatePrefs = useUpdatePreferences();

  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [dateFormat, setDateFormat] = useState<DateFormatStr>("d/m/Y");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12");
  const [timezone, setTimezone] = useState<TimezoneId>("Africa/Lagos");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const [pickerField, setPickerField] = useState<string | null>(null);

  useEffect(() => {
    if (data?.preferences) {
      const p = data.preferences;
      setCurrency(p.currency);
      setDateFormat(p.date_format);
      setTimeFormat(p.time_format);
      setTimezone(p.timezone);
      setLanguage(p.language);
    }
  }, [data?.preferences]);

  const currencySymbol =
    CURRENCIES.find((c) => c.value === currency)?.symbol ?? "₦";

  const preview = useMemo(() => {
    const now = new Date();
    let dateStr = "";
    const d = now.getDate().toString().padStart(2, "0");
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    const y = now.getFullYear();
    if (dateFormat === "d/m/Y") dateStr = `${d}/${m}/${y}`;
    else if (dateFormat === "m/d/Y") dateStr = `${m}/${d}/${y}`;
    else dateStr = `${y}-${m}-${d}`;

    let timeStr = "";
    const h = now.getHours();
    const min = now.getMinutes().toString().padStart(2, "0");
    if (timeFormat === "12") {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      timeStr = `${h12}:${min} ${ampm}`;
    } else {
      timeStr = `${h.toString().padStart(2, "0")}:${min}`;
    }

    return `${currencySymbol}1,000.00 · ${dateStr} · ${timeStr}`;
  }, [currency, dateFormat, timeFormat, currencySymbol]);

  const handleSave = () => {
    updatePrefs.mutate(
      {
        currency,
        currency_symbol: currencySymbol,
        date_format: dateFormat,
        time_format: timeFormat,
        timezone,
        language,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  // Generic picker data
  const pickerData: { value: string; label: string; active: boolean }[] = useMemo(() => {
    switch (pickerField) {
      case "currency":
        return CURRENCIES.map((c) => ({
          value: c.value,
          label: `${c.label} (${c.symbol})`,
          active: c.value === currency,
        }));
      case "dateFormat":
        return DATE_FORMATS.map((d) => ({
          value: d.value,
          label: d.label,
          active: d.value === dateFormat,
        }));
      case "timezone":
        return TIMEZONES.map((t) => ({
          value: t.value,
          label: t.label,
          active: t.value === timezone,
        }));
      case "language":
        return LANGUAGES.map((l) => ({
          value: l.value,
          label: l.label,
          active: l.value === language,
        }));
      default:
        return [];
    }
  }, [pickerField, currency, dateFormat, timezone, language]);

  const handlePickerSelect = (value: string) => {
    switch (pickerField) {
      case "currency":
        setCurrency(value as CurrencyCode);
        break;
      case "dateFormat":
        setDateFormat(value as DateFormatStr);
        break;
      case "timezone":
        setTimezone(value as TimezoneId);
        break;
      case "language":
        setLanguage(value as LanguageCode);
        break;
    }
    setPickerField(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Regional Preferences</Text>
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
        <Text style={styles.headerTitle}>Regional Preferences</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Live Preview</Text>
          <Text style={styles.previewValue}>{preview}</Text>
        </View>

        <View style={styles.formCard}>
          {/* Currency */}
          <Text style={styles.fieldLabel}>Currency</Text>
          <PickerButton
            label={`${CURRENCIES.find((c) => c.value === currency)?.label} (${currencySymbol})`}
            onPress={() => setPickerField("currency")}
          />

          {/* Date Format */}
          <Text style={styles.fieldLabel}>Date Format</Text>
          <PickerButton
            label={DATE_FORMATS.find((d) => d.value === dateFormat)?.label ?? dateFormat}
            onPress={() => setPickerField("dateFormat")}
          />

          {/* Time Format */}
          <Text style={styles.fieldLabel}>Time Format</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, timeFormat === "12" && styles.toggleBtnActive]}
              onPress={() => setTimeFormat("12")}>
              <Text
                style={[
                  styles.toggleBtnText,
                  timeFormat === "12" && styles.toggleBtnTextActive,
                ]}>
                12-hour
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, timeFormat === "24" && styles.toggleBtnActive]}
              onPress={() => setTimeFormat("24")}>
              <Text
                style={[
                  styles.toggleBtnText,
                  timeFormat === "24" && styles.toggleBtnTextActive,
                ]}>
                24-hour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timezone */}
          <Text style={styles.fieldLabel}>Timezone</Text>
          <PickerButton
            label={TIMEZONES.find((t) => t.value === timezone)?.label ?? timezone}
            onPress={() => setPickerField("timezone")}
          />

          {/* Language */}
          <Text style={styles.fieldLabel}>Language</Text>
          <PickerButton
            label={LANGUAGES.find((l) => l.value === language)?.label ?? language}
            onPress={() => setPickerField("language")}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, updatePrefs.isPending && styles.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={updatePrefs.isPending}>
          <Text style={styles.saveBtnText}>
            {updatePrefs.isPending ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Generic Picker Modal */}
      <Modal
        transparent
        visible={!!pickerField}
        animationType="fade"
        onRequestClose={() => setPickerField(null)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setPickerField(null)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>
              {pickerField === "currency"
                ? "Select Currency"
                : pickerField === "dateFormat"
                  ? "Select Date Format"
                  : pickerField === "timezone"
                    ? "Select Timezone"
                    : "Select Language"}
            </Text>
            <FlatList
              data={pickerData}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    item.active && styles.pickerOptionActive,
                  ]}
                  onPress={() => handlePickerSelect(item.value)}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      item.active && styles.pickerOptionTextActive,
                    ]}>
                    {item.label}
                  </Text>
                  {item.active && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function PickerButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.pickerBtn} onPress={onPress}>
      <Text style={styles.pickerBtnText}>{label}</Text>
      <Text style={styles.pickerArrow}>▼</Text>
    </TouchableOpacity>
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

  previewCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  previewLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 },
  previewValue: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.gold },

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
  pickerBtnText: { fontSize: 15, color: "#1f2937" },
  pickerArrow: { fontSize: 10, color: "#9ca3af" },

  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  toggleBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  toggleBtnTextActive: { color: "#fff" },

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
