import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
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

type Props = NativeStackScreenProps<AccountingStackParamList, "AccountingHome">;

export default function AccountingScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - you can add actual data fetching here
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        <AccountingOverview />
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
