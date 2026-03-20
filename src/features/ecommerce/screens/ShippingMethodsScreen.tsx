import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useShippingMethods,
  useDeleteShippingMethod,
  useToggleShippingMethod,
} from "../hooks/useShippingMethods";
import type { ShippingMethod } from "../types";

type Nav = NativeStackNavigationProp<
  EcommerceStackParamList,
  "ShippingMethods"
>;

export default function ShippingMethodsScreen() {
  const navigation = useNavigation<Nav>();
  const { methods, isLoading } = useShippingMethods();
  const deleteMutation = useDeleteShippingMethod();
  const toggleMutation = useToggleShippingMethod();

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
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
        <Text style={styles.headerTitle}>Shipping Methods</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ShippingMethodForm", {})}
            style={styles.createBtn}
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Add Shipping Method</Text>
          </TouchableOpacity>
        </View>

        {methods.map((m: ShippingMethod) => (
          <View key={m.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodName}>{m.name}</Text>
                {m.description && (
                  <Text style={styles.desc}>{m.description}</Text>
                )}
              </View>
              <Switch
                value={m.is_active}
                onValueChange={() => toggleMutation.mutate(m.id)}
                trackColor={{ true: BRAND_COLORS.gold }}
              />
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.cost}>₦{m.cost.toLocaleString()}</Text>
              {m.estimated_days != null && (
                <Text style={styles.days}>
                  {m.estimated_days} day{m.estimated_days !== 1 ? "s" : ""}
                </Text>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ShippingMethodForm", { id: m.id })
                  }
                  style={styles.editBtn}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(m.id, m.name)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {methods.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No shipping methods</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate("ShippingMethodForm", {})}>
              <Text style={styles.emptyBtnText}>Add Shipping Method</Text>
            </TouchableOpacity>
          </View>
        )}

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
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  actionsSection: {
    paddingBottom: 14,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a0f33",
    lineHeight: 24,
  },
  createBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a0f33",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  methodName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  desc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cost: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.gold },
  days: { fontSize: 13, color: "#6b7280", marginLeft: 12 },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  editBtn: {},
  editText: { color: BRAND_COLORS.darkPurple, fontWeight: "600", fontSize: 13 },
  deleteText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#6b7280", fontSize: 15, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
