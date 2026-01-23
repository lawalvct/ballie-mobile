import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { AccountingStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function VouchersSection() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vouchers</Text>
        <TouchableOpacity onPress={() => navigation.navigate("VoucherHome")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vouchersGrid}>
        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.voucherEmoji}>📄</Text>
          </View>
          <Text style={styles.voucherLabel}>Sales Invoice</Text>
          <Text style={styles.voucherCount}>24</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#fee2e2" }]}>
            <Text style={styles.voucherEmoji}>🧾</Text>
          </View>
          <Text style={styles.voucherLabel}>Purchase Invoice</Text>
          <Text style={styles.voucherCount}>18</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#e0e7ff" }]}>
            <Text style={styles.voucherEmoji}>📝</Text>
          </View>
          <Text style={styles.voucherLabel}>Journal Entry</Text>
          <Text style={styles.voucherCount}>32</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#ddd6fe" }]}>
            <Text style={styles.voucherEmoji}>💳</Text>
          </View>
          <Text style={styles.voucherLabel}>Payment Entry</Text>
          <Text style={styles.voucherCount}>45</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#dcfce7" }]}>
            <Text style={styles.voucherEmoji}>💰</Text>
          </View>
          <Text style={styles.voucherLabel}>Receipt</Text>
          <Text style={styles.voucherCount}>52</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#fef9c3" }]}>
            <Text style={styles.voucherEmoji}>🔄</Text>
          </View>
          <Text style={styles.voucherLabel}>Contra</Text>
          <Text style={styles.voucherCount}>8</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#fecaca" }]}>
            <Text style={styles.voucherEmoji}>📉</Text>
          </View>
          <Text style={styles.voucherLabel}>Credit Note</Text>
          <Text style={styles.voucherCount}>6</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.voucherCard}>
          <View style={[styles.voucherIcon, { backgroundColor: "#fed7aa" }]}>
            <Text style={styles.voucherEmoji}>📈</Text>
          </View>
          <Text style={styles.voucherLabel}>Debit Note</Text>
          <Text style={styles.voucherCount}>4</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  vouchersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  voucherCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  voucherEmoji: {
    fontSize: 28,
  },
  voucherLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  voucherCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
  },
});
