import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useUserFormData, useCreateUser } from "../hooks/useUsers";
import type { CreateUserPayload } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "UserCreate">;

export default function UserCreateScreen() {
  const navigation = useNavigation<Nav>();
  const { roles, isLoading: loadingForm } = useUserFormData();
  const createUser = useCreateUser();

  const [form, setForm] = useState<CreateUserPayload>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const updateField = (field: keyof CreateUserPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = () => {
    // Basic client-side validation
    const newErrors: Record<string, string[]> = {};
    if (!form.first_name.trim())
      newErrors.first_name = ["First name is required"];
    if (!form.last_name.trim()) newErrors.last_name = ["Last name is required"];
    if (!form.email.trim()) newErrors.email = ["Email is required"];
    if (!form.password || form.password.length < 8)
      newErrors.password = ["Password must be at least 8 characters"];
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = ["Passwords do not match"];
    if (!form.role_id) newErrors.role_id = ["Please select a role"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createUser.mutate(form, {
      onSuccess: () => navigation.goBack(),
      onError: (error: any) => {
        if (error?.errors) {
          setErrors(error.errors);
        }
      },
    });
  };

  if (loadingForm) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create User</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        <View style={styles.formCard}>
          {/* First Name */}
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.first_name && styles.inputError]}
            value={form.first_name}
            onChangeText={(v) => updateField("first_name", v)}
            placeholder="Enter first name"
            placeholderTextColor="#9ca3af"
          />
          {errors.first_name && (
            <Text style={styles.errorText}>{errors.first_name[0]}</Text>
          )}

          {/* Last Name */}
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[styles.input, errors.last_name && styles.inputError]}
            value={form.last_name}
            onChangeText={(v) => updateField("last_name", v)}
            placeholder="Enter last name"
            placeholderTextColor="#9ca3af"
          />
          {errors.last_name && (
            <Text style={styles.errorText}>{errors.last_name[0]}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email[0]}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={form.password}
            onChangeText={(v) => updateField("password", v)}
            placeholder="Minimum 8 characters"
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password[0]}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={[
              styles.input,
              errors.password_confirmation && styles.inputError,
            ]}
            value={form.password_confirmation}
            onChangeText={(v) => updateField("password_confirmation", v)}
            placeholder="Repeat password"
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />
          {errors.password_confirmation && (
            <Text style={styles.errorText}>
              {errors.password_confirmation[0]}
            </Text>
          )}

          {/* Role Picker */}
          <Text style={styles.label}>Role *</Text>
          {errors.role_id && (
            <Text style={styles.errorText}>{errors.role_id[0]}</Text>
          )}
          <View style={styles.roleGrid}>
            {roles.map(
              (role: {
                id: number;
                name: string;
                description: string | null;
              }) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleOption,
                    form.role_id === role.id && styles.roleOptionSelected,
                  ]}
                  onPress={() => updateField("role_id", role.id)}>
                  <Text
                    style={[
                      styles.roleOptionText,
                      form.role_id === role.id && styles.roleOptionTextSelected,
                    ]}>
                    {role.name}
                  </Text>
                  {role.description && (
                    <Text style={styles.roleDesc}>{role.description}</Text>
                  )}
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              createUser.isPending && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createUser.isPending}>
            {createUser.isPending ? (
              <ActivityIndicator color="#1a0f33" />
            ) : (
              <Text style={styles.submitBtnText}>Create User</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  loadingLabel: { marginTop: 12, color: "#6b7280", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 60 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 60 },
  body: { flex: 1, backgroundColor: "#f3f4f8" },
  bodyContent: { padding: 20 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  roleGrid: { gap: 8, marginTop: 4 },
  roleOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  roleOptionSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: BRAND_COLORS.gold + "15",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  roleOptionTextSelected: { color: BRAND_COLORS.darkPurple },
  roleDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  submitBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },
});
