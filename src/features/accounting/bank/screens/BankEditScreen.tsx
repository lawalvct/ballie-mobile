import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { bankService } from "../services/bankService";
import type { BankFormOption, BankDetailResponse } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<AccountingStackParamList, "BankEdit">;

export default function BankEditScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountTypes, setAccountTypes] = useState<BankFormOption[]>([]);
  const [currencies, setCurrencies] = useState<BankFormOption[]>([]);
  const [statuses, setStatuses] = useState<BankFormOption[]>([]);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [branchName, setBranchName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isPayrollAccount, setIsPayrollAccount] = useState(false);
  const [enableReconciliation, setEnableReconciliation] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load form options and bank details in parallel
      const [formDataResponse, bankDetailsResponse] = await Promise.all([
        bankService.getFormData(),
        bankService.show(id),
      ]);

      // Set form options
      setAccountTypes(formDataResponse.account_types || []);
      setCurrencies(formDataResponse.currencies || []);
      setStatuses(formDataResponse.statuses || []);

      // Pre-fill form with bank data
      const bank = bankDetailsResponse.bank;
      if (bank) {
        setBankName(bank.bank_name || "");
        setAccountName(bank.account_name || "");
        setAccountNumber(bank.account_number || "");
        setAccountType(bank.account_type || "");
        setCurrency(bank.currency || "");
        setStatus(bank.status || "");
        setOpeningBalance(bank.opening_balance?.toString() || "");
        setBranchName(bank.branch_name || "");
        setDescription(bank.description || "");
        setIsPrimary(bank.is_primary || false);
        setIsPayrollAccount(bank.is_payroll_account || false);
        setEnableReconciliation(bank.enable_reconciliation !== false);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load bank data",
        [{ text: "Go Back", onPress: () => navigation.goBack() }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankName.trim()) {
      showToast("Bank name is required", "error");
      return;
    }
    if (!accountName.trim()) {
      showToast("Account name is required", "error");
      return;
    }
    if (!accountNumber.trim()) {
      showToast("Account number is required", "error");
      return;
    }
    if (!currency) {
      showToast("Currency is required", "error");
      return;
    }
    if (!status) {
      showToast("Status is required", "error");
      return;
    }

    const payload = {
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      account_number: accountNumber.trim(),
      currency,
      status,
      account_type: accountType || undefined,
      branch_name: branchName.trim() || undefined,
      description: description.trim() || undefined,
      is_primary: isPrimary,
      is_payroll_account: isPayrollAccount,
      enable_reconciliation: enableReconciliation,
    };

    try {
      setSaving(true);
      await bankService.update(id, payload);
      showToast("✅ Bank account updated", "success");

      if (route.params?.onUpdated) {
        route.params.onUpdated();
      }

      navigation.goBack();
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to update bank account",
        "error",
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
          <Text style={styles.headerTitle}>Edit Bank Account</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
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

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Bank Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentBody}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Name *</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. Access Bank"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Name *</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="e.g. Ballie Nigeria Ltd"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Number *</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="e.g. 3012345678"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={accountType}
                onValueChange={setAccountType}
                style={styles.picker}>
                <Picker.Item label="Select account type" value="" />
                {accountTypes.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Currency *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currency}
                onValueChange={setCurrency}
                style={styles.picker}>
                {currencies.map((curr) => (
                  <Picker.Item
                    key={curr.value}
                    label={curr.label}
                    value={curr.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={setStatus}
                style={styles.picker}>
                {statuses.map((st) => (
                  <Picker.Item
                    key={st.value}
                    label={st.label}
                    value={st.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Opening Balance (Read-only)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={openingBalance}
              editable={false}
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>
              Opening balance cannot be edited after creation
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Branch Name</Text>
            <TextInput
              style={styles.input}
              value={branchName}
              onChangeText={setBranchName}
              placeholder="e.g. Lagos Island"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes or description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>Primary Account</Text>
              <Text style={styles.switchDescription}>
                Set as default bank account
              </Text>
            </View>
            <Switch
              value={isPrimary}
              onValueChange={setIsPrimary}
              trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
              thumbColor={isPrimary ? SEMANTIC_COLORS.white : "#f4f3f4"}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>Payroll Account</Text>
              <Text style={styles.switchDescription}>
                Use for salary payments
              </Text>
            </View>
            <Switch
              value={isPayrollAccount}
              onValueChange={setIsPayrollAccount}
              trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
              thumbColor={isPayrollAccount ? SEMANTIC_COLORS.white : "#f4f3f4"}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>Enable Reconciliation</Text>
              <Text style={styles.switchDescription}>
                Track and reconcile transactions
              </Text>
            </View>
            <Switch
              value={enableReconciliation}
              onValueChange={setEnableReconciliation}
              trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
              thumbColor={
                enableReconciliation ? SEMANTIC_COLORS.white : "#f4f3f4"
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={SEMANTIC_COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Update Bank Account</Text>
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
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentBody: {
    padding: 20,
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
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
    fontStyle: "italic",
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
    color: BRAND_COLORS.darkPurple,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  switchDescription: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
});
