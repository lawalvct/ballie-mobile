import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AccountingStackParamList } from "../../../../navigation/types";
import { voucherService } from "../services/voucherService";
import { LedgerAccountOption } from "../types";

type Props = NativeStackScreenProps<AccountingStackParamList, "VoucherForm">;

interface VoucherEntry {
  ledger_account_id: number | undefined;
  debit_amount: string;
  credit_amount: string;
  description: string;
}

interface FormState {
  voucher_date: string;
  voucher_number: string;
  narration: string;
  reference_number: string;
  entries: VoucherEntry[];
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "ADD_ENTRY" }
  | {
      type: "UPDATE_ENTRY";
      index: number;
      field: keyof VoucherEntry;
      value: string | number | undefined;
    }
  | { type: "REMOVE_ENTRY"; index: number };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_ENTRY":
      return {
        ...state,
        entries: [
          ...state.entries,
          {
            ledger_account_id: undefined,
            debit_amount: "",
            credit_amount: "",
            description: "",
          },
        ],
      };
    case "UPDATE_ENTRY":
      return {
        ...state,
        entries: state.entries.map((entry, i) =>
          i === action.index
            ? { ...entry, [action.field]: action.value }
            : entry
        ),
      };
    case "REMOVE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((_, i) => i !== action.index),
      };
    default:
      return state;
  }
}

export default function VoucherFormScreen({ navigation, route }: Props) {
  const { voucherTypeId, voucherTypeCode, voucherTypeName } = route.params;

  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccountOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [formState, dispatch] = useReducer(formReducer, {
    voucher_date: today,
    voucher_number: "",
    narration: "",
    reference_number: "",
    entries: [
      {
        ledger_account_id: undefined,
        debit_amount: "",
        credit_amount: "",
        description: "",
      },
      {
        ledger_account_id: undefined,
        debit_amount: "",
        credit_amount: "",
        description: "",
      },
    ],
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getFormData();

      // Debug: Log the response structure
      console.log("Form data response:", JSON.stringify(response, null, 2));

      // The API returns { success, data: { ledger_accounts, voucher_types } }
      const formData = response.data || response;
      const accounts = formData.ledger_accounts || [];

      console.log("Ledger accounts:", accounts.length, accounts[0]);
      setLedgerAccounts(accounts);
    } catch (error: any) {
      console.error("Error loading form data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load form data",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = () => {
    const totalDebits = formState.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debit_amount) || 0),
      0
    );
    const totalCredits = formState.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.credit_amount) || 0),
      0
    );
    return {
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  };

  const { totalDebits, totalCredits, isBalanced } = calculateBalance();
  const canSave =
    isBalanced &&
    totalDebits > 0 &&
    formState.entries.length >= 2 &&
    formState.entries.every((e) => e.ledger_account_id);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate entries
      for (const entry of formState.entries) {
        const debit = parseFloat(entry.debit_amount) || 0;
        const credit = parseFloat(entry.credit_amount) || 0;

        if (debit > 0 && credit > 0) {
          Alert.alert(
            "Validation Error",
            "Each entry must have either debit OR credit, not both"
          );
          return;
        }

        if (debit === 0 && credit === 0) {
          Alert.alert(
            "Validation Error",
            "Each entry must have either debit or credit amount"
          );
          return;
        }
      }

      const payload = {
        voucher_type_id: voucherTypeId,
        voucher_date: formState.voucher_date,
        voucher_number: formState.voucher_number || undefined,
        narration: formState.narration || undefined,
        reference_number: formState.reference_number || undefined,
        entries: formState.entries.map((entry) => ({
          ledger_account_id: entry.ledger_account_id!,
          debit_amount: parseFloat(entry.debit_amount) || 0,
          credit_amount: parseFloat(entry.credit_amount) || 0,
          description: entry.description || undefined,
        })),
        action: "save" as const,
      };

      console.log("Creating voucher:", payload);

      const response = await voucherService.create(payload);
      console.log("Voucher created:", response);

      Alert.alert(
        "Success",
        `Voucher ${response.voucher_number} created successfully`,
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
              navigation.goBack(); // Go back twice to return to VoucherHome
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to create voucher",
        [{ text: "OK" }]
      );
    } finally {
      setSaving(false);
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{voucherTypeName}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading form data...</Text>
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{voucherTypeName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Voucher Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerText}>
                {new Date(formState.voucher_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(formState.voucher_date)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    const formattedDate = selectedDate
                      .toISOString()
                      .split("T")[0];
                    dispatch({
                      type: "SET_FIELD",
                      field: "voucher_date",
                      value: formattedDate,
                    });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Voucher Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formState.voucher_number}
              onChangeText={(value) =>
                dispatch({ type: "SET_FIELD", field: "voucher_number", value })
              }
              placeholder="Auto-generated if left empty"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Narration</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formState.narration}
              onChangeText={(value) =>
                dispatch({ type: "SET_FIELD", field: "narration", value })
              }
              placeholder="Enter description..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={formState.reference_number}
              onChangeText={(value) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "reference_number",
                  value,
                })
              }
              placeholder="External reference (optional)"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Entries Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Entries <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => dispatch({ type: "ADD_ENTRY" })}>
              <Text style={styles.addButtonText}>+ Add Entry</Text>
            </TouchableOpacity>
          </View>

          {formState.entries.map((entry, index) => (
            <View key={index} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>Entry {index + 1}</Text>
                {formState.entries.length > 2 && (
                  <TouchableOpacity
                    onPress={() => dispatch({ type: "REMOVE_ENTRY", index })}>
                    <Text style={styles.removeButton}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Ledger Account <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={entry.ledger_account_id || ""}
                    onValueChange={(value) =>
                      dispatch({
                        type: "UPDATE_ENTRY",
                        index,
                        field: "ledger_account_id",
                        value: value === "" ? undefined : Number(value),
                      })
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select Account" value="" />
                    {ledgerAccounts.map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={
                          account.display_name ||
                          `${account.name} (${account.code})`
                        }
                        value={account.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.amountRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Debit Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={entry.debit_amount}
                    onChangeText={(value) =>
                      dispatch({
                        type: "UPDATE_ENTRY",
                        index,
                        field: "debit_amount",
                        value,
                      })
                    }
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Credit Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={entry.credit_amount}
                    onChangeText={(value) =>
                      dispatch({
                        type: "UPDATE_ENTRY",
                        index,
                        field: "credit_amount",
                        value,
                      })
                    }
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={entry.description}
                  onChangeText={(value) =>
                    dispatch({
                      type: "UPDATE_ENTRY",
                      index,
                      field: "description",
                      value,
                    })
                  }
                  placeholder="Entry description (optional)"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Balance Summary */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Debits:</Text>
            <Text style={styles.balanceValue}>
              ₦
              {totalDebits.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Credits:</Text>
            <Text style={styles.balanceValue}>
              ₦
              {totalCredits.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabelBold}>Difference:</Text>
            <Text
              style={[
                styles.balanceValueBold,
                isBalanced ? styles.balanceGreen : styles.balanceRed,
              ]}>
              ₦
              {Math.abs(totalDebits - totalCredits).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceStatus}>
            {isBalanced && totalDebits > 0 ? (
              <Text style={styles.balanceStatusGreen}>
                ✓ Entries are balanced
              </Text>
            ) : (
              <Text style={styles.balanceStatusRed}>
                ✗ Entries must be balanced
              </Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!canSave || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}>
          {saving ? (
            <ActivityIndicator color={BRAND_COLORS.darkPurple} />
          ) : (
            <Text style={styles.saveButtonText}>Save Voucher</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    minHeight: 80,
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
    height: 45,
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  entryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  removeButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  amountRow: {
    flexDirection: "row",
  },
  balanceCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  balanceLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  balanceValueBold: {
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceGreen: {
    color: "#10b981",
  },
  balanceRed: {
    color: "#ef4444",
  },
  balanceStatus: {
    marginTop: 8,
    alignItems: "center",
  },
  balanceStatusGreen: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  balanceStatusRed: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  saveButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#e5e7eb",
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  datePickerButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "500",
  },
  calendarIcon: {
    fontSize: 18,
  },
});
