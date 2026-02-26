import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../navigation/types";
import { BRAND_COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import AccountingOverview from "../components/accounting/AccountingOverview";
import QuickActions from "../components/accounting/QuickActions";
import AccountManagement from "../components/accounting/AccountManagement";
import VouchersSection from "../components/accounting/VouchersSection";
import BankingSection from "../components/accounting/BankingSection";
import ReconciliationSection from "../components/accounting/ReconciliationSection";
import { useAccountingOverview } from "../features/accounting/hooks/useAccountingOverview";

type Props = NativeStackScreenProps<AccountingStackParamList, "AccountingHome">;

/* ── helpers ── */
const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/*  */

export default function AccountingScreen({ navigation }: Props) {
  const { user, tenant, logout } = useAuth();
  const { overview, isRefreshing, refresh } = useAccountingOverview();
  const [showDropdown, setShowDropdown] = useState(false);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
            progressBackgroundColor="#2d1f5e"
          />
        }>
        {/*  HEADER HERO  */}
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}>
          <View style={styles.headerRow}>
            {/* Company name + date */}
            <View style={styles.headerLeft}>
              <Text style={styles.companyName} numberOfLines={1}>
                {tenant?.name || "Your Business"}
              </Text>
              <Text style={styles.headerDate}>{todayFormatted()}</Text>
            </View>

            {/* Notification + Profile */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/*  BODY  */}
        <View style={styles.body}>
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

          {/*  FOOTER  */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerBrand}>Ballie Accounting</Text>
            <Text style={styles.footerSub}>
              Powered by BallieAI Made for Nigerian businesses
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() => navigation.navigate("AccountingActions")}>
                <Text style={styles.footerLink}>All Actions</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}></Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("LedgerAccountHome")}>
                <Text style={styles.footerLink}>Ledger</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}></Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/*  AVATAR DROPDOWN  */}
      {showDropdown && (
        <Modal
          transparent
          visible={showDropdown}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdown}>
              <View style={styles.ddHeader}>
                <View style={styles.ddAvatar}>
                  <Text style={styles.ddAvatarText}>{avatarLetter}</Text>
                </View>
                <View style={styles.ddInfo}>
                  <Text style={styles.ddName}>{user?.name || "User"}</Text>
                  <Text style={styles.ddRole}>{user?.role || "Admin"}</Text>
                </View>
              </View>
              <View style={styles.ddDivider} />
              <TouchableOpacity style={styles.ddItem}>
                <Text style={styles.ddItemIcon}></Text>
                <Text style={styles.ddItemText}>Profile Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ddItem}
                onPress={() => {
                  setShowDropdown(false);
                  logout();
                }}>
                <Text style={styles.ddItemIcon}></Text>
                <Text style={styles.ddItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/*  */
/*  STYLES   */
/*  */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#2d1f5e",
  },

  /* ── Header ── */
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerDate: {
    fontSize: 12,
    color: "rgba(209,176,94,0.85)",
    fontWeight: "500",
    marginTop: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#2d1f5e",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a0f33",
  },

  /*  Body  */
  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
    paddingTop: 4,
  },

  /*  AI banner  */
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

  /*  Footer  */
  footer: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  footerDivider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 16,
  },
  footerBrand: {
    fontSize: 15,
    fontWeight: "800",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
  },
  footerSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 14,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.blue,
  },
  footerDot: {
    fontSize: 10,
    color: "#d1d5db",
  },

  /*  Avatar dropdown  */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    minWidth: 230,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  ddHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ddAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  ddAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  ddInfo: {
    flex: 1,
  },
  ddName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  ddRole: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  ddDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  ddItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ddItemIcon: {
    fontSize: 18,
  },
  ddItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: BRAND_COLORS.darkPurple,
  },
});
