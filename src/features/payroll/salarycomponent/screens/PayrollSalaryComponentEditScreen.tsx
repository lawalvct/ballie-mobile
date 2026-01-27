import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { salaryComponentService } from "../services/salaryComponentService";
import type {
  PayrollSalaryComponent,
  SalaryComponentCalculationType,
  SalaryComponentType,
} from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollSalaryComponentEdit"
>;

export default function PayrollSalaryComponentEditScreen({
  navigation,
  route,
}: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [component, setComponent] = useState<PayrollSalaryComponent | null>(
    null,
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [componentType, setComponentType] =
    useState<SalaryComponentType>("earning");
  const [calculationType, setCalculationType] =
    useState<SalaryComponentCalculationType>("fixed");
  const [description, setDescription] = useState("");
  const [isTaxable, setIsTaxable] = useState(true);
  const [isPensionable, setIsPensionable] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadComponent();
  }, [id]);

  const loadComponent = async () => {
    try {
      setLoading(true);
      const response = await salaryComponentService.show(id);
      setComponent(response);
      setName(response.name || "");
      setCode(response.code || "");
      setComponentType(response.type);
      setCalculationType(response.calculation_type);
      setDescription(response.description || "");
      setIsTaxable(Boolean(response.is_taxable));
      setIsPensionable(Boolean(response.is_pensionable));
      setIsActive(Boolean(response.is_active));
    } catch (error: any) {
      showToast(error.message || "Failed to load component", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter component name", "error");
      return;
    }
    if (!code.trim()) {
      showToast("Please enter component code", "error");
      return;
    }

    try {
      setSubmitting(true);
      await salaryComponentService.update(id, {
        name: name.trim(),
        code: code.trim(),
        type: componentType,
        calculation_type: calculationType,
        description: description.trim() || undefined,
        is_taxable: isTaxable,
        is_pensionable: isPensionable,
        is_active: isActive,
      });
      showToast("Component updated successfully", "success");
      onUpdated?.(id);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update component", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !component) {
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
          <Text style={styles.headerTitle}>Edit Component</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading component...</Text>
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
        <Text style={styles.headerTitle}>Edit Component</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Component Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Transport Allowance"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="e.g., TRANS"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={componentType}
                onValueChange={(value) =>
                  setComponentType(value as SalaryComponentType)
                }>
                <Picker.Item label="Earning" value="earning" />
                <Picker.Item label="Deduction" value="deduction" />
                <Picker.Item
                  label="Employer Contribution"
                  value="employer_contribution"
                />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Calculation Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={calculationType}
                onValueChange={(value) =>
                  setCalculationType(value as SalaryComponentCalculationType)
                }>
                <Picker.Item label="Fixed" value="fixed" />
                <Picker.Item label="Percentage" value="percentage" />
                <Picker.Item label="Variable" value="variable" />
                <Picker.Item label="Computed" value="computed" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Taxable</Text>
                <Text style={styles.helperText}>
                  {isTaxable ? "Included in tax" : "Not taxable"}
                </Text>
              </View>
              <Switch
                value={isTaxable}
                onValueChange={setIsTaxable}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isTaxable ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Pensionable</Text>
                <Text style={styles.helperText}>
                  {isPensionable ? "Included in pension" : "Not pensionable"}
                </Text>
              </View>
              <Switch
                value={isPensionable}
                onValueChange={setIsPensionable}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isPensionable ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.helperText}>
                  {isActive ? "Component is active" : "Component is inactive"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isActive ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Saving..." : "Update Component"}
            </Text>
          </TouchableOpacity>
        </View>

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
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    minHeight: 90,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
