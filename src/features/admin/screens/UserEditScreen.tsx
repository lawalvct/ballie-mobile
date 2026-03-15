import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useUserDetail, useUpdateUser } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import type { UpdateUserPayload } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "UserEdit">;
type Route = RouteProp<AdminStackParamList, "UserEdit">;

export default function UserEditScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;

  const { user, isLoading: loadingUser } = useUserDetail(id);
  const { roles: availableRoles } = useRoles({ per_page: 50 });
  const updateUser = useUpdateUser(id);

  const [form, setForm] = useState<UpdateUserPayload>({
    name: "",
    email: "",
    is_active: true,
    roles: [],
  });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        is_active: user.is_active,
        roles: user.roles?.map((r: any) => r.id) || [],
      });
    }
  }, [user]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleRole = (roleId: number) => {
    setForm((prev) => {
      const current = prev.roles || [];
      const next = current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId];
      return { ...prev, roles: next };
    });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string[]> = {};
    if (!form.name.trim()) newErrors.name = ["Name is required"];
    if (!form.email.trim()) newErrors.email = ["Email is required"];
    if (password && password.length < 8)
      newErrors.password = ["Password must be at least 8 characters"];
    if (password && password !== passwordConfirmation)
      newErrors.password_confirmation = ["Passwords do not match"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: UpdateUserPayload = { ...form };
    if (password) {
      payload.password = password;
      payload.password_confirmation = passwordConfirmation;
    }

    updateUser.mutate(payload, {
      onSuccess: () => navigation.goBack(),
      onError: (error: any) => {
        if (error?.errors) {
          setErrors(error.errors);
        }
      },
    });
  };

  if (loadingUser || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading user...</Text>
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
        <Text style={styles.headerTitle}>Edit User</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        <View style={styles.formCard}>
          {/* Name */}
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Full name"
            placeholderTextColor="#9ca3af"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name[0]}</Text>
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

          {/* Password (optional) */}
          <Text style={styles.label}>New Password (optional)</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current"
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password[0]}</Text>
          )}

          {password.length > 0 && (
            <>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.password_confirmation && styles.inputError,
                ]}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Repeat new password"
                secureTextEntry
                placeholderTextColor="#9ca3af"
              />
              {errors.password_confirmation && (
                <Text style={styles.errorText}>
                  {errors.password_confirmation[0]}
                </Text>
              )}
            </>
          )}

          {/* Active Toggle */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch
              value={form.is_active}
              onValueChange={(v) => updateField("is_active", v)}
              trackColor={{
                false: "#d1d5db",
                true: BRAND_COLORS.gold + "80",
              }}
              thumbColor={form.is_active ? BRAND_COLORS.gold : "#f4f3f4"}
            />
          </View>

          {/* Roles */}
          <Text style={styles.label}>Roles</Text>
          <View style={styles.roleGrid}>
            {(availableRoles || []).map((role: any) => {
              const selected = form.roles?.includes(role.id);
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleOption,
                    selected && styles.roleOptionSelected,
                  ]}
                  onPress={() => toggleRole(role.id)}>
                  <View style={styles.roleOptionRow}>
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.roleOptionText,
                        selected && styles.roleOptionTextSelected,
                      ]}>
                      {role.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              updateUser.isPending && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={updateUser.isPending}>
            {updateUser.isPending ? (
              <ActivityIndicator color="#1a0f33" />
            ) : (
              <Text style={styles.submitBtnText}>Update User</Text>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  roleGrid: { gap: 8, marginTop: 4 },
  roleOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  roleOptionSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: BRAND_COLORS.gold + "15",
  },
  roleOptionRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: BRAND_COLORS.gold,
  },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  roleOptionTextSelected: { color: BRAND_COLORS.darkPurple },
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
