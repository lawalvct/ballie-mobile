import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function BankingSection() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Banking</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bankCard}>
        <LinearGradient
          colors={["#3b82f6", "#1d4ed8"]}
          style={styles.bankCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.bankCardHeader}>
            <Text style={styles.bankName}>Access Bank</Text>
            <Text style={styles.bankType}>Current Account</Text>
          </View>
          <Text style={styles.bankBalance}>₦2,450,890.50</Text>
          <Text style={styles.bankAccount}>0123456789</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bankCard}>
        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.bankCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.bankCardHeader}>
            <Text style={styles.bankName}>GTBank</Text>
            <Text style={styles.bankType}>Savings Account</Text>
          </View>
          <Text style={styles.bankBalance}>₦1,680,450.00</Text>
          <Text style={styles.bankAccount}>9876543210</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard}>
        <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.menuEmoji}>🏦</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Add Bank Account</Text>
          <Text style={styles.menuSubtitle}>Connect a new bank account</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
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
  bankCard: {
    marginBottom: 12,
  },
  bankCardGradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  bankType: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  bankBalance: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  bankAccount: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
