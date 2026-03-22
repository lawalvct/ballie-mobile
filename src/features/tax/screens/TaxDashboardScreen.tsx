import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import ModuleScreenLayout from "../../../components/ModuleScreenLayout";
import { useTaxDashboard } from "../hooks/useTax";

type Props = NativeStackScreenProps<TaxStackParamList, "TaxDashboard">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function TaxDashboardScreen({ navigation }: Props) {
  const { dashboard, isLoading, isRefreshing, refresh } = useTaxDashboard();

  return (
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
          {/* Module Intro Card */}
          <View style={styles.introCard}>
            <View style={styles.introLeft}>
              <Text style={styles.introTitle}>Tax & Statutory</Text>
              <Text style={styles.introSubtitle}>
                VAT, PAYE, Pension & NSITF compliance overview
              </Text>
            </View>
            {dashboard?.period && (
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{dashboard.period.month}</Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            </View>
          ) : (
            <>
              {/* Overdue Alert */}
              {dashboard && dashboard.compliance.overdue_filings > 0 && (
                <TouchableOpacity
                  style={styles.alertCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("TaxFilings")}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>
                      {dashboard.compliance.overdue_filings} Overdue Filing
                      {dashboard.compliance.overdue_filings > 1 ? "s" : ""}
                    </Text>
                    <Text style={styles.alertSub}>
                      Tap to view and resolve
                    </Text>
                  </View>
                  <Text style={styles.alertArrow}>›</Text>
                </TouchableOpacity>
              )}

              {/* VAT Card */}
              <TouchableOpacity
                style={styles.taxCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("VatReport")}>
                <View style={styles.taxCardHeader}>
                  <View style={styles.taxIconWrap}>
                    <Text style={styles.taxIcon}>🧾</Text>
                  </View>
                  <View style={styles.taxCardTitleWrap}>
                    <Text style={styles.taxCardTitle}>VAT</Text>
                    <Text style={styles.taxCardRate}>
                      {dashboard?.vat.rate ?? 7.5}%
                    </Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
                <View style={styles.taxCardBody}>
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>Output VAT</Text>
                    <Text style={styles.taxValue}>
                      {formatCurrency(dashboard?.vat.output ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.taxRow}>
                    <Text style={styles.taxLabel}>Input VAT</Text>
                    <Text style={styles.taxValueNeg}>
                      -{formatCurrency(dashboard?.vat.input ?? 0)}
                    </Text>
                  </View>
                  <View style={[styles.taxRow, styles.taxRowTotal]}>
                    <Text style={styles.taxLabelBold}>Net Payable</Text>
                    <Text style={styles.taxValueBold}>
                      {formatCurrency(dashboard?.vat.net_payable ?? 0)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* PAYE Card */}
              <TouchableOpacity
                style={styles.taxCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("PayeReport")}>
                <View style={styles.taxCardHeader}>
                  <View
                    style={[
                      styles.taxIconWrap,
                      { backgroundColor: "rgba(59,130,246,0.1)" },
                    ]}>
                    <Text style={styles.taxIcon}>👤</Text>
                  </View>
                  <View style={styles.taxCardTitleWrap}>
                    <Text style={styles.taxCardTitle}>PAYE</Text>
                    <Text style={styles.taxCardRate}>Income Tax</Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
                <View style={styles.taxCardBody}>
                  <View style={[styles.taxRow, styles.taxRowTotal]}>
                    <Text style={styles.taxLabelBold}>Total PAYE</Text>
                    <Text style={styles.taxValueBold}>
                      {formatCurrency(dashboard?.paye.total_tax ?? 0)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Pension Card */}
              <TouchableOpacity
                style={styles.taxCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("PensionReport")}>
                <View style={styles.taxCardHeader}>
                  <View
                    style={[
                      styles.taxIconWrap,
                      { backgroundColor: "rgba(139,92,246,0.1)" },
                    ]}>
                    <Text style={styles.taxIcon}>🏦</Text>
                  </View>
                  <View style={styles.taxCardTitleWrap}>
                    <Text style={styles.taxCardTitle}>Pension</Text>
                    <Text style={styles.taxCardRate}>
                      {dashboard?.pension.employee_rate ?? 8}% +{" "}
                      {dashboard?.pension.employer_rate ?? 10}%
                    </Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
                <View style={styles.taxCardBody}>
                  <View style={[styles.taxRow, styles.taxRowTotal]}>
                    <Text style={styles.taxLabelBold}>Total Contribution</Text>
                    <Text style={styles.taxValueBold}>
                      {formatCurrency(dashboard?.pension.total ?? 0)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* NSITF Card */}
              <TouchableOpacity
                style={styles.taxCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("NsitfReport")}>
                <View style={styles.taxCardHeader}>
                  <View
                    style={[
                      styles.taxIconWrap,
                      { backgroundColor: "rgba(16,185,129,0.1)" },
                    ]}>
                    <Text style={styles.taxIcon}>🛡️</Text>
                  </View>
                  <View style={styles.taxCardTitleWrap}>
                    <Text style={styles.taxCardTitle}>NSITF</Text>
                    <Text style={styles.taxCardRate}>
                      {dashboard?.nsitf.rate ?? 1}%
                    </Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
                <View style={styles.taxCardBody}>
                  <View style={[styles.taxRow, styles.taxRowTotal]}>
                    <Text style={styles.taxLabelBold}>Total NSITF</Text>
                    <Text style={styles.taxValueBold}>
                      {formatCurrency(dashboard?.nsitf.total ?? 0)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Quick Actions */}
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                {[
                  {
                    icon: "🧾",
                    label: "VAT Report",
                    onPress: () => navigation.navigate("VatReport"),
                  },
                  {
                    icon: "👤",
                    label: "PAYE",
                    onPress: () => navigation.navigate("PayeReport"),
                  },
                  {
                    icon: "🏦",
                    label: "Pension",
                    onPress: () => navigation.navigate("PensionReport"),
                  },
                  {
                    icon: "🛡️",
                    label: "NSITF",
                    onPress: () => navigation.navigate("NsitfReport"),
                  },
                  {
                    icon: "📋",
                    label: "Filings",
                    onPress: () => navigation.navigate("TaxFilings"),
                  },
                  {
                    icon: "⚙️",
                    label: "Settings",
                    onPress: () => navigation.navigate("TaxSettings"),
                  },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={action.onPress}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          
    </ModuleScreenLayout>
  );
}

const styles = StyleSheet.create({
  introCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  introLeft: { flex: 1 },
  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a0f33",
    letterSpacing: 0.2,
  },
  introSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6b7280",
    marginTop: 3,
  },
  periodBadge: {
    backgroundColor: "rgba(209,176,94,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodText: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },

  loadingWrap: { paddingVertical: 60, alignItems: "center" },

  alertCard: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    gap: 12,
  },
  alertIcon: { fontSize: 22 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: "700", color: "#991b1b" },
  alertSub: { fontSize: 12, color: "#b91c1c", marginTop: 2 },
  alertArrow: { fontSize: 24, color: "#ef4444", fontWeight: "700" },

  taxCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  taxCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  taxIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(209,176,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  taxIcon: { fontSize: 20 },
  taxCardTitleWrap: { flex: 1 },
  taxCardTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  taxCardRate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  cardArrow: { fontSize: 24, color: "#9ca3af", fontWeight: "700" },

  taxCardBody: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  taxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taxRowTotal: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    marginTop: 4,
  },
  taxLabel: { fontSize: 13, color: "#6b7280" },
  taxValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  taxValueNeg: { fontSize: 13, fontWeight: "600", color: "#ef4444" },
  taxLabelBold: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  taxValueBold: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  actionBtn: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
});
