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
  useCoupon,
  useCreateCoupon,
  useUpdateCoupon,
} from "../hooks/useCoupons";
import type { CouponForm, CouponType } from "../types";

type Route = NativeStackScreenProps<
  EcommerceStackParamList,
  "CouponForm"
>["route"];

const COUPON_TYPES: { label: string; value: CouponType }[] = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

export default function CouponFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const editId = route.params?.id;
  const isEdit = !!editId;

  const { coupon, isLoading: loadingCoupon } = useCoupon(editId || 0);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon(editId || 0);

  const [form, setForm] = useState<CouponForm>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    is_active: true,
  });

  useEffect(() => {
    if (isEdit && coupon) {
      setForm({
        code: coupon.code,
        description: coupon.description || "",
        type: coupon.type,
        value: coupon.value,
        minimum_amount: coupon.minimum_amount ?? undefined,
        maximum_discount: coupon.maximum_discount ?? undefined,
        usage_limit: coupon.usage_limit ?? undefined,
        valid_from: coupon.valid_from ?? undefined,
        valid_to: coupon.valid_to ?? undefined,
        is_active: coupon.is_active,
      });
    }
  }, [coupon, isEdit]);

  const update = (key: keyof CouponForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.code.trim() || !form.value) return;
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(form, { onSuccess: () => navigation.goBack() });
  };

  if (isEdit && loadingCoupon) {
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
          {isEdit ? "Edit Coupon" : "New Coupon"}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSaving}
          style={styles.saveBtn}>
          <Text style={[styles.saveText, isSaving && { opacity: 0.4 }]}>
            {isSaving ? "..." : "Save"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Coupon Code *</Text>
          <TextInput
            style={styles.input}
            value={form.code}
            onChangeText={(v) => update("code", v.toUpperCase())}
            placeholder="e.g. SAVE20"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
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

          {/* Type Selector */}
          <Text style={styles.label}>Discount Type *</Text>
          <View style={styles.typeRow}>
            {COUPON_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typeBtn,
                  form.type === t.value && styles.typeBtnActive,
                ]}
                onPress={() => update("type", t.value)}>
                <Text
                  style={[
                    styles.typeBtnText,
                    form.type === t.value && styles.typeBtnTextActive,
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Value * {form.type === "percentage" ? "(%)" : "(₦)"}
          </Text>
          <TextInput
            style={styles.input}
            value={form.value ? String(form.value) : ""}
            onChangeText={(v) => update("value", parseFloat(v) || 0)}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Minimum Order Amount (₦)</Text>
          <TextInput
            style={styles.input}
            value={form.minimum_amount ? String(form.minimum_amount) : ""}
            onChangeText={(v) =>
              update("minimum_amount", parseFloat(v) || undefined)
            }
            keyboardType="decimal-pad"
            placeholder="Optional"
            placeholderTextColor="#9ca3af"
          />

          {form.type === "percentage" && (
            <>
              <Text style={styles.label}>Maximum Discount (₦)</Text>
              <TextInput
                style={styles.input}
                value={
                  form.maximum_discount ? String(form.maximum_discount) : ""
                }
                onChangeText={(v) =>
                  update("maximum_discount", parseFloat(v) || undefined)
                }
                keyboardType="decimal-pad"
                placeholder="Optional cap"
                placeholderTextColor="#9ca3af"
              />
            </>
          )}

          <Text style={styles.label}>Usage Limit</Text>
          <TextInput
            style={styles.input}
            value={form.usage_limit ? String(form.usage_limit) : ""}
            onChangeText={(v) =>
              update("usage_limit", parseInt(v) || undefined)
            }
            keyboardType="number-pad"
            placeholder="Unlimited"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Valid From (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={form.valid_from || ""}
            onChangeText={(v) => update("valid_from", v || undefined)}
            placeholder="Optional start date"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Valid To (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={form.valid_to || ""}
            onChangeText={(v) => update("valid_to", v || undefined)}
            placeholder="Optional end date"
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
  saveBtn: { width: 70, alignItems: "flex-end" },
  saveText: { color: BRAND_COLORS.gold, fontSize: 15, fontWeight: "700" },
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
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: BRAND_COLORS.darkPurple },
  typeBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  typeBtnTextActive: { color: "#fff" },
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
});
