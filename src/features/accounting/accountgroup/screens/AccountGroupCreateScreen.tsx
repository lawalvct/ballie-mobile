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
import { accountGroupService } from "../services/accountGroupService";
import type { FormData } from "../types";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "AccountGroupCreate"
>;

export default function AccountGroupCreateScreen({ navigation, route }: Props) {
  const onCreated = (route.params as any)?.onCreated;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedNature, setSelectedNature] = useState("");
  const [accountGroup, setAccountGroup] = useState({
    name: "",
    code: "",
    nature: "",
    parent_id: null as number | null,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const data = await accountGroupService.getFormData();
      setFormData(data);
      setAccountGroup((prev) => ({
        ...prev,
        is_active: data.defaults.is_active,
      }));
    } catch (error: any) {
      console.error("Error loading form data:", error);
      showToast(error.message || "Failed to load form data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNatureSelect = (nature: string) => {
    setSelectedNature(nature);
    setAccountGroup((prev) => ({
      ...prev,
      nature,
      parent_id: null, // Reset parent when nature changes
    }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!accountGroup.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (accountGroup.name.length > 255) {
      newErrors.name = "Name must not exceed 255 characters";
    }

    if (!accountGroup.code.trim()) {
      newErrors.code = "Group code is required";
    } else if (accountGroup.code.length > 10) {
      newErrors.code = "Code must not exceed 10 characters";
    } else if (!/^[A-Z0-9_-]+$/.test(accountGroup.code)) {
      newErrors.code =
        "Code can only contain uppercase letters, numbers, hyphens, and underscores";
    }

    if (!accountGroup.nature) {
      newErrors.nature = "Account nature is required";
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

      const result = await accountGroupService.create({
        name: accountGroup.name,
        code: accountGroup.code.toUpperCase(),
        nature: accountGroup.nature as any,
        parent_id: accountGroup.parent_id,
        is_active: accountGroup.is_active,
      });

      showToast("🎉 Account group created successfully", "success");

      // Notify parent to reload the list
      if (onCreated) {
        onCreated();
      }

      // Wait a bit for toast to show before navigating
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      if (error.errors) {
        // Validation errors from server
        setErrors(error.errors);
        const firstError = Object.values(error.errors)[0];
        showToast(
          Array.isArray(firstError) ? firstError[0] : (firstError as string),
          "error"
        );
      } else {
        showToast(error.message || "Failed to create account group", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const availableParents =
    formData?.parent_groups.filter(
      (parent) => parent.nature === selectedNature
    ) || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
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
        <Text style={styles.headerTitle}>Create Account Group</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nature Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Account Nature <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.helpText}>
            Select the type of account group. This determines its category.
          </Text>
          <View style={styles.natureGrid}>
            {formData?.natures.map((nature) => (
              <TouchableOpacity
                key={nature.value}
                onPress={() => handleNatureSelect(nature.value)}
                style={[
                  styles.natureCard,
                  selectedNature === nature.value && styles.natureCardSelected,
                ]}>
                <Text style={styles.natureIcon}>{nature.icon}</Text>
                <Text style={styles.natureLabel}>{nature.label}</Text>
                <Text style={styles.natureDesc}>{nature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.nature && (
            <Text style={styles.errorText}>{errors.nature}</Text>
          )}
        </View>

        {/* Show rest of form only after nature is selected */}
        {selectedNature && (
          <>
            {/* Group Name */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Group Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g., Current Assets"
                value={accountGroup.name}
                onChangeText={(text) =>
                  setAccountGroup((prev) => ({ ...prev, name: text }))
                }
                placeholderTextColor="#9ca3af"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Group Code */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Group Code <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.helpText}>
                Uppercase letters, numbers, hyphens, and underscores only
              </Text>
              <TextInput
                style={[styles.input, errors.code && styles.inputError]}
                placeholder="e.g., CA-001"
                value={accountGroup.code}
                onChangeText={(text) =>
                  setAccountGroup((prev) => ({
                    ...prev,
                    code: text.toUpperCase(),
                  }))
                }
                autoCapitalize="characters"
                placeholderTextColor="#9ca3af"
              />
              {errors.code && (
                <Text style={styles.errorText}>{errors.code}</Text>
              )}
            </View>

            {/* Parent Group */}
            <View style={styles.section}>
              <Text style={styles.label}>Parent Group (Optional)</Text>
              <Text style={styles.helpText}>
                Select a parent to create hierarchy. Only groups with same
                nature shown.
              </Text>
              {availableParents.length > 0 ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={accountGroup.parent_id}
                    onValueChange={(value) =>
                      setAccountGroup((prev) => ({ ...prev, parent_id: value }))
                    }
                    style={styles.picker}>
                    <Picker.Item label="None (Top Level)" value={null} />
                    {availableParents.map((parent) => (
                      <Picker.Item
                        key={parent.id}
                        label={parent.display_name}
                        value={parent.id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    No parent groups available for{" "}
                    {formData?.natures.find((n) => n.value === selectedNature)
                      ?.label || selectedNature}
                  </Text>
                </View>
              )}
            </View>

            {/* Active Status */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.label}>Active Status</Text>
                  <Text style={styles.helpText}>
                    Inactive groups won't appear in dropdowns
                  </Text>
                </View>
                <Switch
                  value={accountGroup.is_active}
                  onValueChange={(value) =>
                    setAccountGroup((prev) => ({ ...prev, is_active: value }))
                  }
                  trackColor={{
                    false: "#d1d5db",
                    true: BRAND_COLORS.gold + "80",
                  }}
                  thumbColor={
                    accountGroup.is_active
                      ? BRAND_COLORS.gold
                      : SEMANTIC_COLORS.white
                  }
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={BRAND_COLORS.darkPurple} />
              ) : (
                <Text style={styles.submitButtonText}>
                  Create Account Group
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
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
    width: 50,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  helpText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  natureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  natureCard: {
    width: "48%",
    marginHorizontal: "1%",
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  natureCardSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: BRAND_COLORS.gold + "10",
  },
  natureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  natureLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  natureDesc: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },
  input: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: BRAND_COLORS.darkPurple,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  infoBox: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
