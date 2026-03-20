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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useShippingMethod,
  useCreateShippingMethod,
  useUpdateShippingMethod,
} from "../hooks/useShippingMethods";
import type { ShippingMethodForm } from "../types";

type Route = NativeStackScreenProps<
  EcommerceStackParamList,
  "ShippingMethodForm"
>["route"];

export default function ShippingMethodFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const editId = route.params?.id;
  const isEdit = !!editId;

  const { method, isLoading: loadingMethod } = useShippingMethod(editId || 0);
  const createMutation = useCreateShippingMethod();
  const updateMutation = useUpdateShippingMethod(editId || 0);

  const [form, setForm] = useState<ShippingMethodForm>({
    name: "",
    description: "",
    cost: 0,
    estimated_days: undefined,
    is_active: true,
  });

  useEffect(() => {
    if (isEdit && method) {
      setForm({
        name: method.name,
        description: method.description || "",
        cost: method.cost,
        estimated_days: method.estimated_days ?? undefined,
        is_active: method.is_active,
      });
    }
  }, [method, isEdit]);

  const update = (key: keyof ShippingMethodForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(form, { onSuccess: () => navigation.goBack() });
  };

  if (isEdit && loadingMethod) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Method" : "New Method"}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => update("name", v)}
            placeholder="e.g. Standard Delivery"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => update("description", v)}
            placeholder="Optional description"
            placeholderTextColor="#9ca3af"
            multiline
          />

          <Text style={styles.label}>Cost (₦) *</Text>
          <TextInput
            style={styles.input}
            value={form.cost ? String(form.cost) : ""}
            onChangeText={(v) => update("cost", parseFloat(v) || 0)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Estimated Days</Text>
          <TextInput
            style={styles.input}
            value={
              form.estimated_days != null ? String(form.estimated_days) : ""
            }
            onChangeText={(v) =>
              update("estimated_days", parseInt(v) || undefined)
            }
            keyboardType="number-pad"
            placeholder="e.g. 3"
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch
              value={form.is_active ?? true}
              onValueChange={(v) => update("is_active", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSaving}
          style={[styles.submitBtn, isSaving && { opacity: 0.6 }]}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[BRAND_COLORS.gold, "#b8962e"]}
            style={styles.submitGradient}>
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Save Method</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 70 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 70 },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 14,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  switchLabel: { fontSize: 14, fontWeight: "600", color: "#374151" },
  submitBtn: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
