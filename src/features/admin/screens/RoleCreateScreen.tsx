import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useRoleFormData, useCreateRole } from "../hooks/useRoles";
import type { CreateRolePayload, ModulePermissions } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "RoleCreate">;

const COLOR_OPTIONS = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#DC2626",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#3B82F6",
];

export default function RoleCreateScreen() {
  const navigation = useNavigation<Nav>();
  const { permissionsByModule, isLoading: loadingForm } = useRoleFormData();
  const createRole = useCreateRole();

  const [form, setForm] = useState<CreateRolePayload>({
    name: "",
    description: "",
    permissions: [],
    is_active: true,
    color: "#4F46E5",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  const togglePermission = (permId: number) => {
    setForm((prev) => {
      const current = prev.permissions || [];
      const next = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      return { ...prev, permissions: next };
    });
  };

  const toggleAllInModule = (module: ModulePermissions) => {
    const permIds = module.permissions.map((p) => p.id);
    const allSelected = permIds.every((id) => form.permissions?.includes(id));

    setForm((prev) => {
      const current = prev.permissions || [];
      let next: number[];
      if (allSelected) {
        next = current.filter((id) => !permIds.includes(id));
      } else {
        next = [...new Set([...current, ...permIds])];
      }
      return { ...prev, permissions: next };
    });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string[]> = {};
    if (!form.name.trim()) newErrors.name = ["Role name is required"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createRole.mutate(form, {
      onSuccess: () => navigation.goBack(),
      onError: (error: any) => {
        if (error?.errors) setErrors(error.errors);
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
        <Text style={styles.headerTitle}>Create Role</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}>
        <View style={styles.formCard}>
          {/* Name */}
          <Text style={styles.label}>Role Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(v) => {
              setForm((prev) => ({ ...prev, name: v }));
              setErrors((prev) => {
                const n = { ...prev };
                delete n.name;
                return n;
              });
            }}
            placeholder="e.g. Supervisor"
            placeholderTextColor="#9ca3af"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name[0]}</Text>
          )}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={form.description}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, description: v }))
            }
            placeholder="Optional description"
            multiline
            placeholderTextColor="#9ca3af"
          />

          {/* Color Picker */}
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  form.color === color && styles.colorOptionSelected,
                ]}
                onPress={() => setForm((prev) => ({ ...prev, color }))}
              />
            ))}
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <Text style={styles.sectionSubtitle}>
            Select permissions for this role ({form.permissions?.length || 0}{" "}
            selected)
          </Text>

          {permissionsByModule.map((module: ModulePermissions) => {
            const isExpanded = expandedModules.has(module.module);
            const permIds = module.permissions.map((p) => p.id);
            const selectedCount = permIds.filter((id) =>
              form.permissions?.includes(id),
            ).length;
            const allSelected = selectedCount === permIds.length;

            return (
              <View key={module.module} style={styles.moduleSection}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(module.module)}>
                  <View style={styles.moduleLeft}>
                    <Text style={styles.moduleArrow}>
                      {isExpanded ? "▼" : "▶"}
                    </Text>
                    <Text style={styles.moduleName}>
                      {module.module.charAt(0).toUpperCase() +
                        module.module.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.moduleCount}>
                    {selectedCount}/{permIds.length}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.moduleContent}>
                    {/* Select All */}
                    <TouchableOpacity
                      style={styles.selectAllRow}
                      onPress={() => toggleAllInModule(module)}>
                      <View
                        style={[
                          styles.checkbox,
                          allSelected && styles.checkboxSelected,
                        ]}>
                        {allSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.selectAllText}>Select All</Text>
                    </TouchableOpacity>

                    {module.permissions.map((perm) => {
                      const selected = form.permissions?.includes(perm.id);
                      return (
                        <TouchableOpacity
                          key={`perm-${perm.id}`}
                          style={styles.permissionRow}
                          onPress={() => togglePermission(perm.id)}>
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxSelected,
                            ]}>
                            {selected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <Text style={styles.permissionName}>
                            {perm.display_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            createRole.isPending && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createRole.isPending}>
          {createRole.isPending ? (
            <ActivityIndicator color="#1a0f33" />
          ) : (
            <Text style={styles.submitBtnText}>Create Role</Text>
          )}
        </TouchableOpacity>

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
  bodyContent: { padding: 20, gap: 16 },
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
  colorRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 12,
  },
  moduleSection: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  moduleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  moduleArrow: { fontSize: 10, color: "#6b7280" },
  moduleName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textTransform: "capitalize",
  },
  moduleCount: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  moduleContent: { padding: 12, gap: 8 },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 4,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  permissionName: { fontSize: 13, color: "#374151" },
  checkbox: {
    width: 20,
    height: 20,
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
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  submitBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },
});
