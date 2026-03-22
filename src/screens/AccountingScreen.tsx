import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import { BRAND_COLORS } from "../theme/colors";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import AccountingOverview from "../components/accounting/AccountingOverview";
import QuickActions from "../components/accounting/QuickActions";
import AccountManagement from "../components/accounting/AccountManagement";
import VouchersSection from "../components/accounting/VouchersSection";
import BankingSection from "../components/accounting/BankingSection";
import ReconciliationSection from "../components/accounting/ReconciliationSection";
import { useAccountingOverview } from "../features/accounting/hooks/useAccountingOverview";

type Props = NativeStackScreenProps<AccountingStackParamList, "AccountingHome">;

export default function AccountingScreen({ navigation }: Props) {
  const { overview, isRefreshing, refresh } = useAccountingOverview();

  return (
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
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

          {/*  AI SHORTCUT BANNER  */}
          <View style={styles.aiBannerWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("InvoiceHome", { type: "sales" })
              }>
              <LinearGradient
                colors={[BRAND_COLORS.gold, "#c9a84c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiBanner}>
                <Text style={styles.aiBannerEmoji}></Text>
                <View style={styles.aiBannerText}>
                  <Text style={styles.aiBannerTitle}>Try BallieAI Invoice</Text>
                  <Text style={styles.aiBannerSub}>
                    Create invoices by just describing them in plain English or
                    voice
                  </Text>
                </View>
                <Text style={styles.aiBannerArrow}></Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/*  TIPS SECTION  */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsSectionTitle}> Accounting Tips</Text>

            <View style={styles.tipCard}>
              <View style={[styles.tipDot, { backgroundColor: "#10b981" }]} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Reconcile regularly</Text>
                <Text style={styles.tipDesc}>
                  Match your bank statements weekly to catch discrepancies
                  early.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <View style={[styles.tipDot, { backgroundColor: "#3b82f6" }]} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Record on time</Text>
                <Text style={styles.tipDesc}>
                  Post invoices & receipts immediately to keep your books
                  accurate.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <View
                style={[styles.tipDot, { backgroundColor: BRAND_COLORS.gold }]}
              />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Review reports monthly</Text>
                <Text style={styles.tipDesc}>
                  Check your Profit & Loss and Balance Sheet at month-end.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer removed */}

    </ModuleScreenLayout>
  );
}

/*  */
/*  STYLES   */
/*  */

const styles = StyleSheet.create({
  aiBannerWrap: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  aiBannerEmoji: {
    fontSize: 28,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a0f33",
  },
  aiBannerSub: {
    fontSize: 12,
    color: "rgba(26,15,51,0.7)",
    marginTop: 2,
    lineHeight: 17,
  },
  aiBannerArrow: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(26,15,51,0.5)",
  },

  /*  Tips section  */
  tipsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 14,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },

  /*  Footer styles removed */
});
