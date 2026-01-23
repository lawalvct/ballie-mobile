import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "AccountingActions"
>;

export default function AccountingActionsScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>All Accounting Actions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Voucher Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#3b82f6" }]}>
              <Text style={styles.sectionIconText}>📄</Text>
            </View>
            <Text style={styles.sectionTitle}>Voucher Management</Text>
          </View>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#3b82f6" }]}
              onPress={() => navigation.navigate("VoucherTypeHome")}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#2563eb" },
                ]}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Voucher Types</Text>
                <Text style={styles.cardSubtitle}>Manage categories</Text>
              </View>
              <Text style={styles.cardDescription}>
                Configure voucher types for better accounting management.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#10b981" }]}
              onPress={() => navigation.navigate("VoucherCreate")}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#059669" },
                ]}>
                <Text style={styles.cardIcon}>➕</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Create Voucher</Text>
                <Text style={styles.cardSubtitle}>Add new voucher</Text>
              </View>
              <Text style={styles.cardDescription}>
                Create new vouchers for recording financial transactions.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#8b5cf6" }]}
              onPress={() => navigation.navigate("VoucherHome")}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#7c3aed" },
                ]}>
                <Text style={styles.cardIcon}>📑</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>View Vouchers</Text>
                <Text style={styles.cardSubtitle}>Browse all vouchers</Text>
              </View>
              <Text style={styles.cardDescription}>
                View and manage all your existing vouchers.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#ec4899" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#db2777" },
                ]}>
                <Text style={styles.cardIcon}>✏️</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Journal Entries</Text>
                <Text style={styles.cardSubtitle}>Manage entries</Text>
              </View>
              <Text style={styles.cardDescription}>
                Create and view journal entries for accurate records.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Reports Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#f97316" }]}>
              <Text style={styles.sectionIconText}>📊</Text>
            </View>
            <Text style={styles.sectionTitle}>Financial Reports</Text>
          </View>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#f97316" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#ea580c" },
                ]}>
                <Text style={styles.cardIcon}>📈</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Profit & Loss</Text>
                <Text style={styles.cardSubtitle}>Income statement</Text>
              </View>
              <Text style={styles.cardDescription}>
                View comprehensive income statement and profit analysis.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#14b8a6" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#0d9488" },
                ]}>
                <Text style={styles.cardIcon}>🧮</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Balance Sheet</Text>
                <Text style={styles.cardSubtitle}>Financial position</Text>
              </View>
              <Text style={styles.cardDescription}>
                View assets, liabilities, and equity statements.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#6366f1" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#4f46e5" },
                ]}>
                <Text style={styles.cardIcon}>⚖️</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Trial Balance</Text>
                <Text style={styles.cardSubtitle}>Account balances</Text>
              </View>
              <Text style={styles.cardDescription}>
                View all account balances and verify accuracy.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#06b6d4" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#0891b2" },
                ]}>
                <Text style={styles.cardIcon}>💰</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Cash Flow</Text>
                <Text style={styles.cardSubtitle}>Money movement</Text>
              </View>
              <Text style={styles.cardDescription}>
                Track cash inflows and outflows over time.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#eab308" }]}>
              <Text style={styles.sectionIconText}>🏢</Text>
            </View>
            <Text style={styles.sectionTitle}>Account Management</Text>
          </View>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#eab308" }]}
              onPress={() => navigation.navigate("LedgerAccountHome")}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#ca8a04" },
                ]}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Ledger Accounts</Text>
                <Text style={styles.cardSubtitle}>Account structure</Text>
              </View>
              <Text style={styles.cardDescription}>
                Manage your complete chart of accounts structure.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#ef4444" }]}
              onPress={() => navigation.navigate("AccountGroupHome")}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#dc2626" },
                ]}>
                <Text style={styles.cardIcon}>📁</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Account Groups</Text>
                <Text style={styles.cardSubtitle}>Group management</Text>
              </View>
              <Text style={styles.cardDescription}>
                Organize accounts into logical groups and categories.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#10b981" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#059669" },
                ]}>
                <Text style={styles.cardIcon}>🏦</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Bank Accounts</Text>
                <Text style={styles.cardSubtitle}>Banking setup</Text>
              </View>
              <Text style={styles.cardDescription}>
                Manage your business bank accounts and reconciliation.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#8b5cf6" }]}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: "#7c3aed" },
                ]}>
                <Text style={styles.cardIcon}>✅</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Reconciliation</Text>
                <Text style={styles.cardSubtitle}>Balance matching</Text>
              </View>
              <Text style={styles.cardDescription}>
                Reconcile bank statements with your records.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
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
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  actionCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardDescription: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
  },
});
