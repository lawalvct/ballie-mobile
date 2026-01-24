import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import AccountingOverview from "../components/accounting/AccountingOverview";
import QuickActions from "../components/accounting/QuickActions";
import AccountManagement from "../components/accounting/AccountManagement";
import VouchersSection from "../components/accounting/VouchersSection";
import BankingSection from "../components/accounting/BankingSection";
import ReconciliationSection from "../components/accounting/ReconciliationSection";
import { ledgerAccountService } from "../features/accounting/ledgeraccount/services/ledgerAccountService";
import { voucherService } from "../features/accounting/voucher/services/voucherService";
import { bankService } from "../features/accounting/bank/services/bankService";

type Props = NativeStackScreenProps<AccountingStackParamList, "AccountingHome">;

export default function AccountingScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState({
    totalAccounts: 0,
    pendingVouchers: 0,
    bankBalance: 0,
    needsReconciliation: 0,
  });

  const loadOverview = async () => {
    try {
      const [ledgerRes, voucherRes, bankRes] = await Promise.all([
        ledgerAccountService.list({ page: 1, per_page: 1 }),
        voucherService.list({ page: 1, per_page: 1 }),
        bankService.list({ page: 1, per_page: 1 }),
      ]);

      setOverview({
        totalAccounts: ledgerRes?.statistics?.total_accounts ?? 0,
        pendingVouchers: voucherRes?.statistics?.draft_vouchers ?? 0,
        bankBalance: bankRes?.statistics?.total_balance ?? 0,
        needsReconciliation: bankRes?.statistics?.needs_reconciliation ?? 0,
      });
    } catch {
      setOverview((prev) => prev);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOverview();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <AccountingOverview
          totalAccounts={overview.totalAccounts}
          pendingVouchers={overview.pendingVouchers}
          bankBalance={overview.bankBalance}
          needsReconciliation={overview.needsReconciliation}
        />
        <QuickActions />
        <AccountManagement />
        <VouchersSection />
        <BankingSection />
        <ReconciliationSection />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
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
});
