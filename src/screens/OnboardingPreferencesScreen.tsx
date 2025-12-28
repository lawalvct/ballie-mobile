import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { onboardingAPI } from "../api/endpoints/onboarding";

interface OnboardingPreferencesScreenProps {
  tenantSlug: string;
  onNext: () => void;
  onBack: () => void;
}

interface PreferencesFormData {
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  fiscalYearStart: string;
  defaultTaxRate: string;
  paymentMethods: string[];
}

const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira (NGN)", symbol: "₦" },
  { code: "USD", name: "US Dollar (USD)", symbol: "$" },
  { code: "GBP", name: "British Pound (GBP)", symbol: "£" },
  { code: "EUR", name: "Euro (EUR)", symbol: "€" },
];

const TIMEZONES = [
  "Africa/Lagos",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const DATE_FORMATS = [
  { value: "d/m/Y", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "m/d/Y", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "Y-m-d", label: "YYYY-MM-DD (2024-12-31)" },
];

const TIME_FORMATS = [
  { value: "12", label: "12-hour (03:30 PM)" },
  { value: "24", label: "24-hour (15:30)" },
];

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash" },
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "card", name: "Card Payment" },
  { id: "mobile_money", name: "Mobile Money" },
  { id: "cheque", name: "Cheque" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function OnboardingPreferencesScreen({
  tenantSlug,
  onNext,
  onBack,
}: OnboardingPreferencesScreenProps) {
  const [formData, setFormData] = useState<PreferencesFormData>({
    defaultCurrency: "NGN",
    timezone: "Africa/Lagos",
    dateFormat: "d/m/Y",
    timeFormat: "12",
    fiscalYearStart: "01-01",
    defaultTaxRate: "7.5",
    paymentMethods: ["cash", "bank_transfer"],
  });

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [showDateFormatPicker, setShowDateFormatPicker] = useState(false);
  const [showTimeFormatPicker, setShowTimeFormatPicker] = useState(false);
  const [showFiscalYearPicker, setShowFiscalYearPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePaymentMethod = (methodId: string) => {
    if (formData.paymentMethods.includes(methodId)) {
      setFormData({
        ...formData,
        paymentMethods: formData.paymentMethods.filter((id) => id !== methodId),
      });
    } else {
      setFormData({
        ...formData,
        paymentMethods: [...formData.paymentMethods, methodId],
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.defaultCurrency) {
      Alert.alert("Validation Error", "Please select a currency");
      return false;
    }

    if (!formData.timezone) {
      Alert.alert("Validation Error", "Please select a timezone");
      return false;
    }

    const taxRate = parseFloat(formData.defaultTaxRate);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      Alert.alert(
        "Validation Error",
        "Tax rate must be a number between 0 and 100"
      );
      return false;
    }

    if (formData.paymentMethods.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please select at least one payment method"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await onboardingAPI.savePreferences(tenantSlug, {
        default_currency: formData.defaultCurrency,
        timezone: formData.timezone,
        date_format: formData.dateFormat,
        time_format: formData.timeFormat,
        fiscal_year_start: formData.fiscalYearStart,
        default_tax_rate: parseFloat(formData.defaultTaxRate),
        payment_methods: formData.paymentMethods,
      });

      onNext();
    } catch (error: any) {
      // Handle validation errors from backend
      let errorMessage = "Failed to save preferences";

      if (error.response?.data) {
        const data = error.response.data;

        // Check if there are specific field errors
        if (data.errors && typeof data.errors === "object") {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const fieldName = field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return `${fieldName}: ${
                Array.isArray(messages) ? messages[0] : messages
              }`;
            })
            .join("\n");
          errorMessage = errorMessages;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Validation Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyLabel = () => {
    const currency = CURRENCIES.find(
      (c) => c.code === formData.defaultCurrency
    );
    return currency ? currency.name : "Select currency";
  };

  const getDateFormatLabel = () => {
    const format = DATE_FORMATS.find((f) => f.value === formData.dateFormat);
    return format ? format.label : "Select date format";
  };

  const getTimeFormatLabel = () => {
    const format = TIME_FORMATS.find((f) => f.value === formData.timeFormat);
    return format ? format.label : "Select time format";
  };

  const getFiscalYearLabel = () => {
    const [month, day] = formData.fiscalYearStart.split("-");
    return `${MONTHS[parseInt(month) - 1]} ${day}`;
  };

  return (
    <LinearGradient colors={["#3c2c64", "#2a1f4a"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Business Preferences</Text>
          <Text style={styles.subtitle}>Customize your settings</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDotInactive} />
        </View>
        <Text style={styles.progressText}>Step 2 of 2</Text>

        {/* Currency & Timezone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regional Settings</Text>

          <Text style={styles.label}>
            Default Currency <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCurrencyPicker(true)}>
            <Text style={styles.inputText}>{getCurrencyLabel()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Timezone <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimezonePicker(true)}>
            <Text style={styles.inputText}>{formData.timezone}</Text>
          </TouchableOpacity>
        </View>

        {/* Format Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Format Settings</Text>

          <Text style={styles.label}>Date Format</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDateFormatPicker(true)}>
            <Text style={styles.inputText}>{getDateFormatLabel()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Time Format</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimeFormatPicker(true)}>
            <Text style={styles.inputText}>{getTimeFormatLabel()}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Fiscal Year Start</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowFiscalYearPicker(true)}>
            <Text style={styles.inputText}>{getFiscalYearLabel()}</Text>
          </TouchableOpacity>
        </View>

        {/* Tax Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Settings</Text>

          <Text style={styles.label}>Default Tax Rate (%)</Text>
          <TextInput
            style={styles.input}
            value={formData.defaultTaxRate}
            onChangeText={(text) =>
              setFormData({ ...formData, defaultTaxRate: text })
            }
            placeholder="7.5"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Methods <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helperText}>
            Select the payment methods you accept
          </Text>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.checkbox}
              onPress={() => togglePaymentMethod(method.id)}>
              <View
                style={[
                  styles.checkboxBox,
                  formData.paymentMethods.includes(method.id) &&
                    styles.checkboxBoxChecked,
                ]}>
                {formData.paymentMethods.includes(method.id) && (
                  <Text style={styles.checkboxCheck}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Complete Setup</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, defaultCurrency: currency.code });
                  setShowCurrencyPicker(false);
                }}>
                <Text style={styles.modalOptionText}>
                  {currency.symbol} {currency.name}
                </Text>
                {formData.defaultCurrency === currency.code && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimezonePicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimezonePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Timezone</Text>
            <ScrollView style={styles.modalScroll}>
              {TIMEZONES.map((tz) => (
                <TouchableOpacity
                  key={tz}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData({ ...formData, timezone: tz });
                    setShowTimezonePicker(false);
                  }}>
                  <Text style={styles.modalOptionText}>{tz}</Text>
                  {formData.timezone === tz && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Format Picker Modal */}
      <Modal
        visible={showDateFormatPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateFormatPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDateFormatPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Format</Text>
            {DATE_FORMATS.map((format) => (
              <TouchableOpacity
                key={format.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, dateFormat: format.value });
                  setShowDateFormatPicker(false);
                }}>
                <Text style={styles.modalOptionText}>{format.label}</Text>
                {formData.dateFormat === format.value && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Format Picker Modal */}
      <Modal
        visible={showTimeFormatPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeFormatPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeFormatPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time Format</Text>
            {TIME_FORMATS.map((format) => (
              <TouchableOpacity
                key={format.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, timeFormat: format.value });
                  setShowTimeFormatPicker(false);
                }}>
                <Text style={styles.modalOptionText}>{format.label}</Text>
                {formData.timeFormat === format.value && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fiscal Year Picker Modal */}
      <Modal
        visible={showFiscalYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFiscalYearPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFiscalYearPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Fiscal Year Start</Text>
            <ScrollView style={styles.modalScroll}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={styles.modalOption}
                  onPress={() => {
                    const monthNum = (index + 1).toString().padStart(2, "0");
                    setFormData({
                      ...formData,
                      fiscalYearStart: `${monthNum}-01`,
                    });
                    setShowFiscalYearPicker(false);
                  }}>
                  <Text style={styles.modalOptionText}>{month} 1</Text>
                  {formData.fiscalYearStart ===
                    `${(index + 1).toString().padStart(2, "0")}-01` && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#d1b05e",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#d1b05e",
  },
  progressDotInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#555",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#555",
  },
  progressText: {
    fontSize: 14,
    color: "#d1b05e",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1b05e",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  required: {
    color: "#ff6b6b",
  },
  helperText: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1b05e",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#d1b05e",
    borderColor: "#d1b05e",
  },
  checkboxCheck: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#fff",
  },
  button: {
    backgroundColor: "#d1b05e",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonArrow: {
    color: "#fff",
    fontSize: 18,
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3c2c64",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalCheckmark: {
    fontSize: 18,
    color: "#d1b05e",
    marginLeft: 8,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#d1b05e",
    fontSize: 16,
    fontWeight: "600",
  },
});
