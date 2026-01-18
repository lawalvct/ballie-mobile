import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";

export default function DashboardScreen() {
  const { user, tenant, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>

          <View style={styles.statsGrid}>
            <LinearGradient
              colors={["#249484", "#69a2a4"]}
              style={[styles.statCard, styles.largeCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>₦2,450,890</Text>
              <Text style={styles.statChange}>+12.5% from last month</Text>
            </LinearGradient>

            <View style={styles.smallCardsRow}>
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                style={[styles.statCard, styles.smallCard]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValueSmall}>₦823,456</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#d1b05e", "#c9a556"]}
                style={[styles.statCard, styles.smallCard]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.statLabel}>Net Profit</Text>
                <Text style={styles.statValueSmall}>₦1,627,434</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📄</Text>
              </View>
              <Text style={styles.actionLabel}>New Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>💰</Text>
              </View>
              <Text style={styles.actionLabel}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>👥</Text>
              </View>
              <Text style={styles.actionLabel}>New Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            <TransactionItem
              title="Invoice #INV-2025-001"
              amount="₦145,000"
              date="Today, 2:30 PM"
              type="income"
            />
            <TransactionItem
              title="Office Supplies"
              amount="₦12,500"
              date="Today, 10:15 AM"
              type="expense"
            />
            <TransactionItem
              title="Invoice #INV-2025-002"
              amount="₦89,000"
              date="Yesterday, 4:45 PM"
              type="income"
            />
            <TransactionItem
              title="Internet Bill"
              amount="₦25,000"
              date="Yesterday, 11:20 AM"
              type="expense"
            />
          </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          <View style={styles.pendingCard}>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingCount}>3</Text>
            </View>
            <View style={styles.pendingContent}>
              <Text style={styles.pendingTitle}>Expense Reports</Text>
              <Text style={styles.pendingDescription}>
                3 expense reports awaiting your approval
              </Text>
            </View>
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TransactionItemProps {
  title: string;
  amount: string;
  date: string;
  type: "income" | "expense";
}

function TransactionItem({ title, amount, date, type }: TransactionItemProps) {
  const isIncome = type === "income";

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: isIncome ? SEMANTIC_COLORS.success : "#ef4444" },
        ]}>
        <Text style={styles.transactionIconText}>{isIncome ? "↓" : "↑"}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isIncome ? SEMANTIC_COLORS.success : "#ef4444" },
        ]}>
        {isIncome ? "+" : "-"}
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c2c64",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
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
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  largeCard: {
    minHeight: 120,
  },
  smallCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    minHeight: 100,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 20,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  statChange: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_COLORS.lavender + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
  transactionsList: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionIconText: {
    fontSize: 20,
    color: SEMANTIC_COLORS.white,
    fontWeight: "bold",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pendingCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  pendingDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.blue,
  },
  reviewButtonText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
