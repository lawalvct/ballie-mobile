import React from "react";
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
import { useAccountingOverview } from "../features/accounting/hooks/useAccountingOverview";

type Props = NativeStackScreenProps<AccountingStackParamList, "AccountingHome">;

export default function AccountingScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const { overview, isRefreshing, refresh } = useAccountingOverview();

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
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <AccountingOverview
          totalAccounts={overview.totalAccounts}
          pendingVouchers={overview.pendingVouchers}
          bankBalance={overview.bankBalance}
          needsReconciliation={overview.needsReconciliation}
          onAccountsPress={() => navigation.navigate("LedgerAccountHome")}
          onVouchersPress={() => navigation.navigate("VoucherHome")}
          onBankBalancePress={() => navigation.navigate("BankHome")}
          onReconciliationPress={() =>
            navigation.navigate("ReconciliationHome")
          }
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
