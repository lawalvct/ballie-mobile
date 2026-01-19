import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { Picker } from "@react-native-picker/picker";
import { showToast } from "../../../../utils/toast";
import { voucherTypeService } from "../services/voucherTypeService";
import type { FormData, VoucherType } from "../types";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "VoucherTypeEdit"
>;

export default function VoucherTypeEditScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const onUpdated = (route.params as any)?.onUpdated;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSystemDefined, setIsSystemDefined] = useState(false);

  const [voucherType, setVoucherType] = useState({
    name: "",
    code: "",
    abbreviation: "",
    description: "",
    category: "" as any,
    numbering_method: "auto" as "auto" | "manual",
    prefix: "",
    starting_number: 1,
    has_reference: false,
    affects_inventory: false,
    affects_cashbank: false,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formDataResult, voucherTypeResult] = await Promise.all([
        voucherTypeService.getFormData(),
        voucherTypeService.show(id),
      ]);
      setFormData(formDataResult);
      setIsSystemDefined(voucherTypeResult.is_system_defined);
      setVoucherType({
        name: voucherTypeResult.name,
        code: voucherTypeResult.code,
        abbreviation: voucherTypeResult.abbreviation,
        description: voucherTypeResult.description || "",
        category: voucherTypeResult.category,
        numbering_method: voucherTypeResult.numbering_method,
        prefix: voucherTypeResult.prefix || "",
        starting_number: voucherTypeResult.starting_number,
        has_reference: voucherTypeResult.has_reference,
        affects_inventory: voucherTypeResult.affects_inventory,
        affects_cashbank: voucherTypeResult.affects_cashbank,
        is_active: voucherTypeResult.is_active,
      });
    } catch (error: any) {
      showToast(error.message || "Failed to load data", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isSystemDefined) {
      if (!voucherType.name.trim()) {
        newErrors.name = "Name is required";
      } else if (voucherType.name.length > 255) {
        newErrors.name = "Name must not exceed 255 characters";
      }

      if (!voucherType.code.trim()) {
        newErrors.code = "Code is required";
      } else if (voucherType.code.length > 30) {
        newErrors.code = "Code must not exceed 30 characters";
      } else if (!/^[A-Z0-9_-]+$/.test(voucherType.code)) {
        newErrors.code =
          "Code: uppercase letters, numbers, hyphens, underscores only";
      }
    }

    if (!voucherType.abbreviation.trim()) {
      newErrors.abbreviation = "Abbreviation is required";
    } else if (voucherType.abbreviation.length > 5) {
      newErrors.abbreviation = "Abbreviation must not exceed 5 characters";
    } else if (!/^[A-Z]+$/.test(voucherType.abbreviation)) {
      newErrors.abbreviation = "Abbreviation: uppercase letters only";
    }

    if (!voucherType.category) {
      newErrors.category = "Category is required";
    }

    if (voucherType.starting_number < 1) {
      newErrors.starting_number = "Starting number must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        abbreviation: voucherType.abbreviation.toUpperCase(),
        description: voucherType.description || null,
        category: voucherType.category,
        numbering_method: voucherType.numbering_method,
        prefix: voucherType.prefix || null,
        starting_number: voucherType.starting_number,
        has_reference: voucherType.has_reference,
        is_active: voucherType.is_active,
      };

      if (!isSystemDefined) {
        payload.name = voucherType.name;
        payload.code = voucherType.code.toUpperCase();
        payload.affects_inventory = voucherType.affects_inventory;
        payload.affects_cashbank = voucherType.affects_cashbank;
      }

      await voucherTypeService.update(id, payload);

      showToast("🎉 Voucher type updated successfully", "success");

      if (onUpdated) {
        onUpdated();
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
        const firstError = Object.values(error.errors)[0];
        showToast(
          Array.isArray(firstError) ? firstError[0] : (firstError as string),
          "error",
        );
      } else {
        showToast(error.message || "Failed to update voucher type", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading voucher type...</Text>
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
        <Text style={styles.headerTitle}>Edit Voucher Type</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isSystemDefined && (
          <View style={styles.systemNotice}>
            <Text style={styles.systemNoticeText}>
              ⚠️ This is a system-defined voucher type. Some fields are
              restricted and cannot be modified.
            </Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.name && styles.inputError,
              isSystemDefined && styles.inputDisabled,
            ]}
            placeholder="e.g., Sales Invoice"
            value={voucherType.name}
            onChangeText={(text) =>
              !isSystemDefined &&
              setVoucherType((prev) => ({ ...prev, name: text }))
            }
            placeholderTextColor="#9ca3af"
            editable={!isSystemDefined}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Code */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Code <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helpText}>
            Uppercase letters, numbers, hyphens, underscores only (max 30 chars)
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.code && styles.inputError,
              isSystemDefined && styles.inputDisabled,
            ]}
            placeholder="e.g., SI"
            value={voucherType.code}
            onChangeText={(text) =>
              !isSystemDefined &&
              setVoucherType((prev) => ({ ...prev, code: text.toUpperCase() }))
            }
            autoCapitalize="characters"
            placeholderTextColor="#9ca3af"
            editable={!isSystemDefined}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        {/* Abbreviation */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Abbreviation <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helpText}>
            Uppercase letters only (max 5 chars)
          </Text>
          <TextInput
            style={[styles.input, errors.abbreviation && styles.inputError]}
            placeholder="e.g., SI"
            value={voucherType.abbreviation}
            onChangeText={(text) =>
              setVoucherType((prev) => ({
                ...prev,
                abbreviation: text.toUpperCase(),
              }))
            }
            autoCapitalize="characters"
            maxLength={5}
            placeholderTextColor="#9ca3af"
          />
          {errors.abbreviation && (
            <Text style={styles.errorText}>{errors.abbreviation}</Text>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={voucherType.category}
              onValueChange={(value) =>
                setVoucherType((prev) => ({ ...prev, category: value }))
              }
              style={styles.picker}>
              <Picker.Item label="Select Category" value="" />
              {formData &&
                Object.entries(formData.categories).map(([key, label]) => (
                  <Picker.Item label={label} value={key} />
                ))}
            </Picker>
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description..."
            value={voucherType.description}
            onChangeText={(text) =>
              setVoucherType((prev) => ({ ...prev, description: text }))
            }
            multiline
            numberOfLines={3}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Numbering Method */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Numbering Method <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={voucherType.numbering_method}
              onValueChange={(value) =>
                setVoucherType((prev) => ({
                  ...prev,
                  numbering_method: value as "auto" | "manual",
                }))
              }
              style={styles.picker}>
              {formData &&
                Object.entries(formData.numbering_methods).map(
                  ([key, label]) => <Picker.Item label={label} value={key} />,
                )}
            </Picker>
          </View>
        </View>

        {/* Prefix */}
        <View style={styles.section}>
          <Text style={styles.label}>Prefix (Optional)</Text>
          <Text style={styles.helpText}>Max 10 characters</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., SI-"
            value={voucherType.prefix}
            onChangeText={(text) =>
              setVoucherType((prev) => ({ ...prev, prefix: text }))
            }
            maxLength={10}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Starting Number */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Starting Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.starting_number && styles.inputError]}
            placeholder="1"
            value={String(voucherType.starting_number)}
            onChangeText={(text) =>
              setVoucherType((prev) => ({
                ...prev,
                starting_number: parseInt(text) || 1,
              }))
            }
            keyboardType="number-pad"
            placeholderTextColor="#9ca3af"
          />
          {errors.starting_number && (
            <Text style={styles.errorText}>{errors.starting_number}</Text>
          )}
        </View>

        {/* Boolean Flags */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Has Reference Field</Text>
            <Switch
              value={voucherType.has_reference}
              onValueChange={(value) =>
                setVoucherType((prev) => ({ ...prev, has_reference: value }))
              }
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold,
              }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {!isSystemDefined && (
          <>
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Affects Inventory</Text>
                <Switch
                  value={voucherType.affects_inventory}
                  onValueChange={(value) =>
                    setVoucherType((prev) => ({
                      ...prev,
                      affects_inventory: value,
                    }))
                  }
                  trackColor={{
                    false: "#d1d5db",
                    true: BRAND_COLORS.gold,
                  }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Affects Cash/Bank</Text>
                <Switch
                  value={voucherType.affects_cashbank}
                  onValueChange={(value) =>
                    setVoucherType((prev) => ({
                      ...prev,
                      affects_cashbank: value,
                    }))
                  }
                  trackColor={{
                    false: "#d1d5db",
                    true: BRAND_COLORS.gold,
                  }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={voucherType.is_active}
              onValueChange={(value) =>
                setVoucherType((prev) => ({ ...prev, is_active: value }))
              }
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold,
              }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={BRAND_COLORS.darkPurple} />
            ) : (
              <Text style={styles.submitButtonText}>Update Voucher Type</Text>
            )}
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  systemNotice: {
    backgroundColor: "#fef3c7",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  systemNoticeText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
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
  helpText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 45,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
