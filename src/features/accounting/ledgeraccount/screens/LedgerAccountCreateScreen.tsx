import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { ledgerAccountService } from "../services/ledgerAccountService";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "LedgerAccountCreate"
>;

import type { FormDataResponse } from "../types";

export default function LedgerAccountCreateScreen({
  navigation,
  route,
}: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataResponse | null>(null);
  const [selectedType, setSelectedType] = useState("");

  const [ledgerAccount, setLedgerAccount] = useState({
    code: "",
    name: "",
    account_type: "",
    account_group_id: null as number | null,
    parent_id: null as number | null,
    opening_balance: "",
    opening_balance_date: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await ledgerAccountService.getFormData();
      setFormData(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load form data", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Map account types to nature (API uses plural form)
  const typeToNatureMap: Record<string, string> = {
    asset: "assets",
    liability: "liabilities",
    equity: "equity",
    income: "income",
    expense: "expenses",
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setLedgerAccount((prev) => ({
      ...prev,
      account_type: type,
      account_group_id: null,
      parent_id: null,
    }));
    setFormErrors({});

    // Scroll down smoothly after a short delay to show form fields
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 300,
        animated: true,
      });
    }, 100);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!ledgerAccount.account_type) {
      errors.account_type = "Account type is required";
    }
    if (!ledgerAccount.code.trim()) {
      errors.code = "Account code is required";
    } else if (ledgerAccount.code.length > 20) {
      errors.code = "Code must not exceed 20 characters";
    }
    if (!ledgerAccount.name.trim()) {
      errors.name = "Account name is required";
    } else if (ledgerAccount.name.length > 255) {
      errors.name = "Name must not exceed 255 characters";
    }
    if (!ledgerAccount.account_group_id) {
      errors.account_group_id = "Account group is required";
    }
    if (
      ledgerAccount.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ledgerAccount.email)
    ) {
      errors.email = "Invalid email format";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setSubmitting(true);

      await ledgerAccountService.create({
        code: ledgerAccount.code.toUpperCase(),
        name: ledgerAccount.name,
        account_type: ledgerAccount.account_type,
        account_group_id: ledgerAccount.account_group_id!,
        parent_id: ledgerAccount.parent_id,
        description: ledgerAccount.description || undefined,
        is_active: ledgerAccount.is_active,
      });

      showToast("✅ Ledger account created successfully", "success");

      // Call onCreated callback if provided
      if (route.params?.onCreated) {
        route.params.onCreated();
      }

      navigation.goBack();
    } catch (error: any) {
      if (error.errors) {
        setFormErrors(error.errors);
        const firstError = Object.values(error.errors)[0];
        showToast(
          Array.isArray(firstError) ? firstError[0] : String(firstError),
          "error"
        );
      } else {
        showToast(error.message || "Failed to create ledger account", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter account groups by selected type
  const availableGroups = (() => {
    if (!selectedType || !formData) return [];

    // Map account type to nature (e.g., "asset" -> "assets")
    const nature = typeToNatureMap[selectedType];
    if (!nature) return [];

    // Find the nature group and return its groups
    const natureGroup = formData.account_groups.find(
      (group) => group.nature === nature
    );

    return natureGroup?.groups || [];
  })();

  // Filter parent accounts by selected type
  const availableParents =
    formData?.parent_accounts.filter(
      (parent) => parent.account_type === selectedType
    ) || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Ledger Account</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Ledger Account</Text>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content}>
        {/* Account Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Type *</Text>
          <Text style={styles.helpText}>
            Select the type of account. This determines its category.
          </Text>

          <View style={styles.typeGrid}>
            {formData?.account_types.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => handleTypeSelect(type.value)}
                style={[
                  styles.typeCard,
                  selectedType === type.value && styles.typeCardSelected,
                ]}
                activeOpacity={0.7}>
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDesc}>{type.description}</Text>
                <View
                  style={[
                    styles.balanceTypeBadge,
                    type.balance_type === "debit"
                      ? styles.debitBadge
                      : styles.creditBadge,
                  ]}>
                  <Text style={styles.balanceTypeText}>
                    {type.balance_type === "debit" ? "Dr" : "Cr"} Balance
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {formErrors.account_type && (
            <Text style={styles.errorText}>{formErrors.account_type}</Text>
          )}
        </View>

        {/* Show rest of form only after type is selected */}
        {selectedType && (
          <>
            {/* Account Code */}
            <View style={styles.section}>
              <Text style={styles.label}>Account Code *</Text>
              <Text style={styles.helpText}>
                Unique identifier (max 20 characters)
              </Text>
              <TextInput
                style={[styles.input, formErrors.code && styles.inputError]}
                placeholder="e.g., ACC001"
                value={ledgerAccount.code}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({
                    ...prev,
                    code: text.toUpperCase(),
                  }))
                }
                autoCapitalize="characters"
                maxLength={20}
              />
              {formErrors.code && (
                <Text style={styles.errorText}>{formErrors.code}</Text>
              )}
            </View>

            {/* Account Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Account Name *</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="e.g., Cash on Hand"
                value={ledgerAccount.name}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({ ...prev, name: text }))
                }
              />
              {formErrors.name && (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              )}
            </View>

            {/* Account Group */}
            <View style={styles.section}>
              <Text style={styles.label}>Account Group *</Text>
              <Text style={styles.helpText}>
                Select the group for this account
              </Text>
              {availableGroups.length > 0 ? (
                <View
                  style={[
                    styles.pickerContainer,
                    formErrors.account_group_id && styles.inputError,
                  ]}>
                  <Picker
                    selectedValue={ledgerAccount.account_group_id}
                    onValueChange={(value) =>
                      setLedgerAccount((prev) => ({
                        ...prev,
                        account_group_id: value,
                      }))
                    }
                    style={styles.picker}>
                    <Picker.Item label="Select account group..." value={null} />
                    {availableGroups.map((group) => (
                      <Picker.Item
                        key={group.id}
                        label={`${group.code} - ${group.name}`}
                        value={group.id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.infoText}>
                  No groups available for {selectedType}
                </Text>
              )}
              {formErrors.account_group_id && (
                <Text style={styles.errorText}>
                  {formErrors.account_group_id}
                </Text>
              )}
            </View>

            {/* Parent Account (Optional) */}
            <View style={styles.section}>
              <Text style={styles.label}>Parent Account (Optional)</Text>
              <Text style={styles.helpText}>
                Create hierarchy by selecting a parent account
              </Text>
              {availableParents.length > 0 ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={ledgerAccount.parent_id}
                    onValueChange={(value) =>
                      setLedgerAccount((prev) => ({
                        ...prev,
                        parent_id: value,
                      }))
                    }
                    style={styles.picker}>
                    <Picker.Item label="None (Top Level)" value={null} />
                    {availableParents.map((parent) => (
                      <Picker.Item
                        key={parent.id}
                        label={`${parent.code} - ${parent.name}`}
                        value={parent.id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.infoText}>
                  No parent accounts available
                </Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Account description..."
                value={ledgerAccount.description}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Contact Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Contact Information (Optional)
              </Text>
              <Text style={styles.helpText}>
                For customer and vendor accounts
              </Text>

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Physical address"
                value={ledgerAccount.address}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({ ...prev, address: text }))
                }
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact phone"
                value={ledgerAccount.phone}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Contact email"
                value={ledgerAccount.email}
                onChangeText={(text) =>
                  setLedgerAccount((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}
            </View>

            {/* Active Status */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.label}>Active Status</Text>
                  <Text style={styles.helpText}>
                    Inactive accounts won't appear in dropdowns
                  </Text>
                </View>
                <Switch
                  value={ledgerAccount.is_active}
                  onValueChange={(value) =>
                    setLedgerAccount((prev) => ({ ...prev, is_active: value }))
                  }
                  trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                  thumbColor={ledgerAccount.is_active ? "#fff" : "#f3f4f6"}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Create Ledger Account
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: BRAND_COLORS.darkPurple,
    gap: 20,
  },
  backButton: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  helpText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  typeCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  typeCardSelected: {
    backgroundColor: "#fef3c7",
    borderColor: BRAND_COLORS.gold,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  balanceTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  debitBadge: {
    backgroundColor: "#dbeafe",
  },
  creditBadge: {
    backgroundColor: "#fce7f3",
  },
  balanceTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  textArea: {
    height: 80,
    paddingTop: 12,
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
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});
