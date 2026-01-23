import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { bankService } from "../services/bankService";
import type { BankDetailResponse, BankTransaction } from "../types";

const statusBadgeMap: Record<string, { bg: string; text: string }> = {
  active: { bg: "#d1fae5", text: "#065f46" },
  inactive: { bg: "#e5e7eb", text: "#6b7280" },
  closed: { bg: "#fee2e2", text: "#b91c1c" },
  suspended: { bg: "#fef3c7", text: "#92400e" },
};

const reconciliationStatusMap: Record<string, { bg: string; text: string }> = {
  disabled: { bg: "#e5e7eb", text: "#6b7280" },
  never: { bg: "#fef3c7", text: "#92400e" },
  current: { bg: "#d1fae5", text: "#065f46" },
  due: { bg: "#fef3c7", text: "#92400e" },
  overdue: { bg: "#fee2e2", text: "#b91c1c" },
};

const getCurrencySymbol = (currency?: string): string => {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency || "NGN"] || currency || "₦";
};

const formatAmount = (
  amount: number | string | null | undefined,
  currency?: string,
): string => {
  const num = typeof amount === "number" ? amount : amount ? Number(amount) : 0;
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${num.toLocaleString()}`;
};

type Props = NativeStackScreenProps<AccountingStackParamList, "BankShow">;

export default function BankShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<BankDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankService.show(id);
      setDetail(response);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load bank details";
      setError(errorMsg);
      Alert.alert("Error", errorMsg, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const toNumber = (value: number | string | null | undefined) =>
    typeof value === "number" ? value : value ? Number(value) : 0;

  const bank = detail?.bank;
  const transactions = detail?.recent_transactions || [];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bank) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏦</Text>
          <Text style={styles.emptyTitle}>Bank not found</Text>
          <Text style={styles.emptyText}>
            {error || "Unable to load bank details."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = statusBadgeMap[bank.status || ""] || {
    bg: "#e5e7eb",
    text: "#6b7280",
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.bankName}>{bank.bank_name}</Text>
              <Text style={styles.accountName}>{bank.account_name}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {(bank.status || "unknown").toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.accountNumber}>
            {bank.masked_account_number || bank.account_number}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {bank.account_type_display || bank.account_type || "-"}
            </Text>
            <Text style={styles.metaText}>{bank.currency || "NGN"}</Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.sectionTitle}>Balances</Text>
          <View style={styles.balanceGrid}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <Text style={styles.balanceValue}>
                {formatAmount(bank.opening_balance, bank.currency)}
              </Text>
              <Text style={styles.balanceLabel}>Opening Balance</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <Text style={styles.balanceValue}>
                {formatAmount(bank.current_balance, bank.currency)}
              </Text>
              <Text style={styles.balanceLabel}>Current Balance</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <Text style={styles.balanceValue}>
                {formatAmount(bank.available_balance, bank.currency)}
              </Text>
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </LinearGradient>
            {toNumber(bank.overdraft_limit) > 0 && (
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}>
                <Text style={styles.balanceValue}>
                  {formatAmount(bank.overdraft_limit, bank.currency)}
                </Text>
                <Text style={styles.balanceLabel}>Overdraft Limit</Text>
              </LinearGradient>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>{bank.branch_name || "-"}</Text>
            </View>
            {(bank.swift_code ||
              bank.iban ||
              bank.routing_number ||
              bank.sort_code) && (
              <>
                {bank.swift_code && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>SWIFT Code</Text>
                    <Text style={styles.infoValue}>{bank.swift_code}</Text>
                  </View>
                )}
                {bank.iban && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>IBAN</Text>
                    <Text style={styles.infoValue}>{bank.iban}</Text>
                  </View>
                )}
                {bank.routing_number && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Routing Number</Text>
                    <Text style={styles.infoValue}>{bank.routing_number}</Text>
                  </View>
                )}
                {bank.sort_code && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sort Code</Text>
                    <Text style={styles.infoValue}>{bank.sort_code}</Text>
                  </View>
                )}
              </>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Primary</Text>
              <Text style={styles.infoValue}>
                {bank.is_primary ? "✓ Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payroll Account</Text>
              <Text style={styles.infoValue}>
                {bank.is_payroll_account ? "✓ Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reconciliation</Text>
              <View
                style={[
                  styles.reconciliationBadge,
                  {
                    backgroundColor:
                      reconciliationStatusMap[
                        bank.reconciliation_status || "disabled"
                      ]?.bg || "#e5e7eb",
                  },
                ]}>
                <Text
                  style={[
                    styles.reconciliationText,
                    {
                      color:
                        reconciliationStatusMap[
                          bank.reconciliation_status || "disabled"
                        ]?.text || "#6b7280",
                    },
                  ]}>
                  {(bank.reconciliation_status || "disabled").toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Reconciled</Text>
              <Text style={styles.infoValue}>
                {bank.last_reconciliation_date || "Never"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() =>
              navigation.navigate("BankEdit", {
                id: bank.id,
                onUpdated: loadData,
              })
            }>
            <Text style={styles.actionButtonIcon}>✏️</Text>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() =>
              navigation.navigate("BankStatement", { id: bank.id })
            }>
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonTextLight}>Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={() => {
              Alert.alert(
                "Delete Bank Account",
                `Are you sure you want to delete ${bank.bank_name} - ${bank.masked_account_number}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert(
                        "Coming soon",
                        "Delete functionality pending",
                      ),
                  },
                ],
              );
            }}>
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Full transaction history screen pending",
                  [{ text: "OK" }],
                )
              }>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsIcon}>📋</Text>
              <Text style={styles.emptyTransactionsText}>
                No recent transactions
              </Text>
              <Text style={styles.emptyTransactionsSubtext}>
                Transactions will appear here once recorded
              </Text>
            </View>
          ) : (
            transactions.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                currency={bank.currency}
              />
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionRow({
  transaction,
  currency,
}: {
  transaction: BankTransaction;
  currency?: string;
}) {
  const debit = typeof transaction.debit === "number" ? transaction.debit : 0;
  const credit =
    typeof transaction.credit === "number" ? transaction.credit : 0;

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => {
        Alert.alert(
          "Transaction Details",
          `Voucher: ${transaction.voucher_number}\nDate: ${transaction.voucher_date}\nType: ${transaction.voucher_type}\n\nFull voucher view coming soon.`,
          [{ text: "OK" }],
        );
      }}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>
          {transaction.particulars || transaction.voucher_type || "Transaction"}
        </Text>
        <Text style={styles.transactionDate}>
          {transaction.voucher_date || "-"}
        </Text>
      </View>
      <Text style={styles.transactionSubtitle}>
        {transaction.voucher_number || "-"}
      </Text>
      <View style={styles.transactionAmounts}>
        <View>
          <Text style={styles.amountLabel}>Debit</Text>
          <Text style={[styles.amountValue, debit > 0 && styles.debitAmount]}>
            {formatAmount(debit, currency)}
          </Text>
        </View>
        <View style={styles.amountRight}>
          <Text style={styles.amountLabel}>Credit</Text>
          <Text style={[styles.amountValue, credit > 0 && styles.creditAmount]}>
            {formatAmount(credit, currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bankName: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  accountName: {
    fontSize: 13,
    color: "#6b7280",
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  balanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    minWidth: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonIcon: {
    fontSize: 14,
  },
  actionButtonPrimary: {
    backgroundColor: "#10b981",
  },
  actionButtonSecondary: {
    backgroundColor: "#e0e7ff",
  },
  actionButtonDanger: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  actionButtonTextLight: {
    fontSize: 13,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  transactionCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
    marginRight: 8,
  },
  transactionDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  transactionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  transactionAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  amountValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  amountRight: {
    alignItems: "flex-end",
  },
  emptyTransactions: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
  },
  emptyTransactionsIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTransactionsText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  emptyTransactionsSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  reconciliationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reconciliationText: {
    fontSize: 10,
    fontWeight: "700",
  },
  debitAmount: {
    color: "#dc2626",
  },
  creditAmount: {
    color: "#059669",
  },
});
