import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import TaxModuleHeader from "../../../components/tax/TaxModuleHeader";
import { useVatReport } from "../hooks/useTax";
import type { ReportFilters, VatTransaction } from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "VatReport">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function VatReportScreen({ navigation }: Props) {
  const [filters] = useState<ReportFilters>({});
  const { report, isLoading, isRefreshing, refresh } = useVatReport(filters);

  const renderTransaction = (tx: VatTransaction, type: "output" | "input") => (
    <View key={`${type}-${tx.id}`} style={styles.txRow}>
      <View style={styles.txLeft}>
        <Text style={styles.txVoucher}>{tx.voucher_number}</Text>
        <Text style={styles.txDesc} numberOfLines={1}>
          {tx.description || tx.type || "—"}
        </Text>
        <Text style={styles.txDate}>{tx.date}</Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          type === "input" && { color: "#ef4444" },
        ]}>
        {type === "input" ? "-" : ""}
        {formatCurrency(tx.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="VAT Report"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          </View>
        ) : (
          <>
            {/* Period */}
            {report?.period && (
              <View style={styles.periodCard}>
                <Text style={styles.periodLabel}>Period</Text>
                <Text style={styles.periodValue}>
                  {report.period.start_date} → {report.period.end_date}
                </Text>
              </View>
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Output VAT</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(report?.summary.vat_output ?? 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Input VAT</Text>
                <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                  -{formatCurrency(report?.summary.vat_input ?? 0)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Net Payable</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(report?.summary.net_payable ?? 0)}
                </Text>
              </View>
              <View style={styles.rateRow}>
                <Text style={styles.rateText}>
                  VAT Rate: {report?.summary.rate ?? 7.5}%
                </Text>
              </View>
            </View>

            {/* Output Transactions */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>
                Output Transactions ({report?.output_transactions.length ?? 0})
              </Text>
              {report?.output_transactions.length === 0 ? (
                <Text style={styles.emptyText}>No output transactions</Text>
              ) : (
                report?.output_transactions.map((tx) =>
                  renderTransaction(tx, "output"),
                )
              )}
            </View>

            {/* Input Transactions */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardTitle}>
                Input Transactions ({report?.input_transactions.length ?? 0})
              </Text>
              {report?.input_transactions.length === 0 ? (
                <Text style={styles.emptyText}>No input transactions</Text>
              ) : (
                report?.input_transactions.map((tx) =>
                  renderTransaction(tx, "input"),
                )
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f3f4f6" },
  loadingWrap: { paddingVertical: 60, alignItems: "center" },

  periodCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  periodLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  periodValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  rateRow: {
    marginTop: 10,
    backgroundColor: "rgba(209,176,94,0.08)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  rateText: { fontSize: 11, fontWeight: "600", color: BRAND_COLORS.gold },

  sectionCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: { fontSize: 13, color: "#9ca3af", textAlign: "center", paddingVertical: 12 },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  txLeft: { flex: 1 },
  txVoucher: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  txDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  txDate: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
});
