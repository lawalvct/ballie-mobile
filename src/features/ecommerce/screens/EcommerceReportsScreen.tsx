import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";

type Nav = NativeStackNavigationProp<
  EcommerceStackParamList,
  "EcommerceReports"
>;

const REPORTS = [
  {
    title: "Order Report",
    desc: "Order stats, status distribution & daily trends",
    screen: "OrderReport" as const,
    icon: "📦",
    color: "#ede9fe",
  },
  {
    title: "Revenue Report",
    desc: "Revenue growth, monthly breakdown & comparisons",
    screen: "RevenueReport" as const,
    icon: "💰",
    color: "#d1fae5",
  },
  {
    title: "Product Report",
    desc: "Top products, sales by category & low stock",
    screen: "ProductReport" as const,
    icon: "📊",
    color: "#dbeafe",
  },
  {
    title: "Customer Report",
    desc: "Customer stats, top buyers & lifetime value",
    screen: "CustomerReport" as const,
    icon: "👥",
    color: "#fef3c7",
  },
  {
    title: "Abandoned Cart Report",
    desc: "Cart abandonment, potential revenue & recovery",
    screen: "AbandonedCartReport" as const,
    icon: "🛒",
    color: "#fee2e2",
  },
];

export default function EcommerceReportsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        {REPORTS.map((r) => (
          <TouchableOpacity
            key={r.screen}
            style={styles.card}
            onPress={() => navigation.navigate(r.screen)}>
            <View style={[styles.iconWrap, { backgroundColor: r.color }]}>
              <Text style={styles.icon}>{r.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <Text style={styles.cardDesc}>{r.desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
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
  card: {
    flexDirection: "row",
    alignItems: "center",
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 22 },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  arrow: { fontSize: 22, color: "#9ca3af", fontWeight: "300" },
});
