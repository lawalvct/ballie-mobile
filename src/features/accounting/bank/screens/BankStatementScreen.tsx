import React, { useEffect, useMemo, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { bankService } from "../services/bankService";
import type { BankStatementResponse, BankStatementTransaction } from "../types";

type Props = NativeStackScreenProps<AccountingStackParamList, "BankStatement">;

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

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const sanitizeFileName = (value: string) =>
  value.replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_");

const toCsvValue = (value: string | number | null | undefined) => {
  const safe = value === null || value === undefined ? "" : String(value);
  const escaped = safe.replace(/"/g, '""');
  return `"${escaped}"`;
};

const buildCsv = (statement: BankStatementResponse) => {
  const { bank, date_range, opening_balance, totals, transactions } = statement;
  const headers = [
    "Date",
    "Particulars",
    "Voucher Type",
    "Voucher Number",
    "Debit",
    "Credit",
    "Running Balance",
  ];

  const rows = transactions.map((txn) =>
    [
      txn.date,
      txn.particulars || "",
      txn.voucher_type || "",
      txn.voucher_number || "",
      txn.debit ?? "",
      txn.credit ?? "",
      txn.running_balance ?? "",
    ]
      .map(toCsvValue)
      .join(","),
  );

  const meta = [
    ["Bank", bank.bank_name],
    ["Account Number", bank.account_number],
    ["Start Date", date_range.start_date],
    ["End Date", date_range.end_date],
    ["Opening Balance", opening_balance],
    ["Total Debits", totals.total_debits],
    ["Total Credits", totals.total_credits],
    ["Closing Balance", totals.closing_balance],
  ]
    .map((row) => row.map(toCsvValue).join(","))
    .join("\n");

  return `${meta}\n\n${headers.join(",")}\n${rows.join("\n")}`;
};

export default function BankStatementScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(
    () => formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    [today],
  );
  const defaultEnd = useMemo(() => formatDate(today), [today]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statement, setStatement] = useState<BankStatementResponse | null>(
    null,
  );
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const loadStatement = async () => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      Alert.alert("Invalid date", "Please use YYYY-MM-DD format", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setLoading(true);
      const response = await bankService.statement(id, {
        start_date: startDate,
        end_date: endDate,
      });
      setStatement(response);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load bank statement",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatement();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStatement();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    if (!statement) return;

    try {
      setExporting(format);
      const safeName = sanitizeFileName(statement.bank.bank_name || "bank");
      const fileBase = `${safeName}_statement_${startDate}_to_${endDate}`;

      if (format === "excel") {
        const csv = buildCsv(statement);
        const baseDir = FileSystem.documentDirectory || "";
        const fileUri = `${baseDir}${fileBase}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Bank Statement",
          });
        } else {
          Alert.alert("Exported", `File saved to:\n${fileUri}`);
        }
        return;
      }

      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; color: #111827; }
              h1 { font-size: 20px; margin-bottom: 4px; }
              .meta { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 11px; }
              th { background: #f3f4f6; text-align: left; }
              .totals { margin-top: 12px; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>${statement.bank.bank_name} Bank Statement</h1>
            <div class="meta">
              Account: ${statement.bank.account_number}<br />
              Period: ${statement.date_range.start_date} to ${statement.date_range.end_date}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Voucher Type</th>
                  <th>Voucher Number</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                ${statement.transactions
                  .map(
                    (txn) => `
                      <tr>
                        <td>${txn.date}</td>
                        <td>${txn.particulars || ""}</td>
                        <td>${txn.voucher_type || ""}</td>
                        <td>${txn.voucher_number || ""}</td>
                        <td>${txn.debit ?? ""}</td>
                        <td>${txn.credit ?? ""}</td>
                        <td>${txn.running_balance ?? ""}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="totals">
              Opening Balance: ${statement.opening_balance}<br />
              Total Debits: ${statement.totals.total_debits}<br />
              Total Credits: ${statement.totals.total_credits}<br />
              Closing Balance: ${statement.totals.closing_balance}
            </div>
          </body>
        </html>
      `;

      const file = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Bank Statement",
        });
      } else {
        Alert.alert("Exported", `File saved to:\n${file.uri}`);
      }
    } catch (error: any) {
      Alert.alert("Export Failed", error.message || "Unable to export file");
    } finally {
      setExporting(null);
    }
  };

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
          <Text style={styles.headerTitle}>Bank Statement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading statement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!statement) {
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
          <Text style={styles.headerTitle}>Bank Statement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No statement found</Text>
          <Text style={styles.emptyText}>
            Adjust the date range and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStatement}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bank = statement.bank;
  const transactions = statement.transactions || [];

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
        <Text style={styles.headerTitle}>Bank Statement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.summaryCard}>
          <Text style={styles.bankName}>{bank.bank_name}</Text>
          <Text style={styles.accountNumber}>{bank.account_number}</Text>
          <Text style={styles.dateRangeText}>
            {statement.date_range.start_date} → {statement.date_range.end_date}
          </Text>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={styles.filterButton}>
              <Text style={styles.filterLabel}>📅 From</Text>
              <Text style={styles.filterValue}>{startDate}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={styles.filterButton}>
              <Text style={styles.filterLabel}>📅 To</Text>
              <Text style={styles.filterValue}>{endDate}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={loadStatement}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport("pdf")}
            disabled={!!exporting}>
            <Text style={styles.exportButtonText}>
              {exporting === "pdf" ? "Exporting..." : "📄 Export PDF"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, styles.exportButtonSecondary]}
            onPress={() => handleExport("excel")}
            disabled={!!exporting}>
            <Text style={styles.exportButtonText}>
              {exporting === "excel" ? "Exporting..." : "📥 Export Excel"}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowStartPicker(false);
              if (selected) setStartDate(formatDate(selected));
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={new Date(endDate)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowEndPicker(false);
              if (selected) setEndDate(formatDate(selected));
            }}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totals</Text>
          <View style={styles.totalsGrid}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}>
              <Text style={styles.totalValue}>
                {formatAmount(statement.opening_balance, bank.currency)}
              </Text>
              <Text style={styles.totalLabel}>Opening Balance</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}>
              <Text style={styles.totalValue}>
                {formatAmount(statement.totals.total_debits, bank.currency)}
              </Text>
              <Text style={styles.totalLabel}>Total Debits</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}>
              <Text style={styles.totalValue}>
                {formatAmount(statement.totals.total_credits, bank.currency)}
              </Text>
              <Text style={styles.totalLabel}>Total Credits</Text>
            </LinearGradient>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}>
              <Text style={styles.totalValue}>
                {formatAmount(statement.totals.closing_balance, bank.currency)}
              </Text>
              <Text style={styles.totalLabel}>Closing Balance</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsIcon}>📋</Text>
              <Text style={styles.emptyTransactionsText}>
                No transactions in this period
              </Text>
            </View>
          ) : (
            transactions.map((txn, index) => (
              <StatementRow
                key={`${txn.voucher_number || "txn"}-${index}`}
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

function StatementRow({
  transaction,
  currency,
}: {
  transaction: BankStatementTransaction;
  currency?: string;
}) {
  const debit = typeof transaction.debit === "number" ? transaction.debit : 0;
  const credit =
    typeof transaction.credit === "number" ? transaction.credit : 0;

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>
          {transaction.particulars || transaction.voucher_type || "Transaction"}
        </Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
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
      {transaction.running_balance !== undefined && (
        <View style={styles.runningBalanceRow}>
          <Text style={styles.runningBalanceLabel}>Running Balance</Text>
          <Text style={styles.runningBalanceValue}>
            {formatAmount(transaction.running_balance, currency)}
          </Text>
        </View>
      )}
    </View>
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
  bankName: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  accountNumber: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  dateRangeText: {
    marginTop: 10,
    fontSize: 12,
    color: "#9ca3af",
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  filterValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
  },
  applyButton: {
    marginTop: 12,
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  exportRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  exportButtonSecondary: {
    backgroundColor: BRAND_COLORS.gold,
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  totalCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  totalLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
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
  debitAmount: {
    color: "#dc2626",
  },
  creditAmount: {
    color: "#059669",
  },
  runningBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  runningBalanceLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  runningBalanceValue: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyTransactions: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyTransactionsIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTransactionsText: {
    fontSize: 13,
    fontWeight: "600",
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
    textAlign: "center",
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
});
