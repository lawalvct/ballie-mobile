import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { vendorService } from "../services/vendorService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type { VendorStatementDetail } from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "VendorStatementDetail"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

const formatCurrency = (value: number | null | undefined) => {
  const amount = typeof value === "number" ? value : 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function VendorStatementDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const vendorId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<VendorStatementDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [vendorId, startDate, endDate]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const response = await vendorService.statementDetail(
        vendorId,
        startDate,
        endDate,
      );
      setDetail(response);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
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
        <Text style={styles.title}>Vendor Statement</Text>
        <Text style={styles.subtitle}>Transaction history and balance</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.darkPurple]}
            tintColor={BRAND_COLORS.darkPurple}
          />
        }>
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Date Range</Text>
          <View style={styles.filtersRow}>
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
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowStartPicker(false);
              if (selected) setStartDate(selected.toISOString().split("T")[0]);
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
              if (selected) setEndDate(selected.toISOString().split("T")[0]);
            }}
          />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            <Text style={styles.loadingText}>Loading statement...</Text>
          </View>
        ) : (
          detail && (
            <>
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {detail.vendor?.company_name ||
                    detail.vendor?.display_name ||
                    "Vendor"}
                </Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Opening</Text>
                    <Text style={styles.summaryValue}>
                      ₦{formatCurrency(detail.opening_balance)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Debits</Text>
                    <Text style={styles.summaryValue}>
                      ₦{formatCurrency(detail.total_debits)}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Credits</Text>
                    <Text style={styles.summaryValue}>
                      ₦{formatCurrency(detail.total_credits)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Closing</Text>
                    <Text style={[styles.summaryValue, styles.closingBalance]}>
                      ₦{formatCurrency(detail.closing_balance)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>📝 Transactions</Text>
                <Text style={styles.transactionsCount}>
                  {detail.transactions.length} entries
                </Text>
              </View>

              <View style={styles.listSection}>
                {detail.transactions.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📄</Text>
                    <Text style={styles.emptyTitle}>No Transactions</Text>
                    <Text style={styles.emptyText}>
                      No transactions found for this period
                    </Text>
                  </View>
                ) : (
                  detail.transactions.map((tx, idx) => (
                    <View key={idx} style={styles.txCard}>
                      <View style={styles.txHeader}>
                        <Text style={styles.txDate}>{tx.date}</Text>
                        {tx.debit && tx.debit > 0 ? (
                          <View style={styles.debitBadge}>
                            <Text style={styles.debitText}>DR</Text>
                          </View>
                        ) : (
                          <View style={styles.creditBadge}>
                            <Text style={styles.creditText}>CR</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.txParticulars}>{tx.particulars}</Text>
                      {tx.voucher_number && (
                        <View style={styles.txMetaRow}>
                          <Text style={styles.txMeta}>{tx.voucher_type}</Text>
                          <Text style={styles.txMeta}>•</Text>
                          <Text style={styles.txMeta}>{tx.voucher_number}</Text>
                        </View>
                      )}
                      <View style={styles.txFooter}>
                        <Text style={styles.txAmountLabel}>Amount</Text>
                        <Text style={styles.txAmount}>
                          ₦{formatCurrency(tx.debit || tx.credit || 0)}
                        </Text>
                      </View>
                      {tx.running_balance !== undefined && (
                        <View style={styles.txBalanceRow}>
                          <Text style={styles.txBalanceLabel}>Balance</Text>
                          <Text style={styles.txBalance}>
                            ₦{formatCurrency(tx.running_balance)}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            </>
          )
        )}

        <View style={{ height: 40 }} />
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
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  filterValue: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  summaryCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  closingBalance: {
    fontSize: 20,
  },
  transactionsHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  transactionsCount: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  listSection: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 20,
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
  txCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  txDate: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  debitBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  debitText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "700",
  },
  creditBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  creditText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "700",
  },
  txParticulars: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  txMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  txMeta: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  txFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  txAmountLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  txBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  txBalanceLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "600",
  },
  txBalance: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});
