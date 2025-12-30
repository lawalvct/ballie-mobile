import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import { ledgerAccountService } from "../services/ledgerAccountService";
import type { LedgerAccount } from "../types";
import { showToast, showConfirm } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "LedgerAccountShow"
>;

interface AccountDetails {
  ledger_account: LedgerAccount & {
    account_type_label?: string;
    opening_balance?: number;
    opening_balance_date?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  children?: LedgerAccount[];
  statistics?: {
    total_transactions: number;
    children_count: number;
    can_be_deleted: boolean;
  };
  recent_transactions?: any[];
}

export default function LedgerAccountShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "children">("details");

  useEffect(() => {
    loadAccountDetails();
  }, [id]);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      const response = await ledgerAccountService.show(id);

      // The API might return just the account or wrapped in data
      const accountData = response as any;

      setAccount({
        ledger_account: accountData,
        children: [],
        statistics: {
          total_transactions: 0,
          children_count: accountData.children_count || 0,
          can_be_deleted: !accountData.has_children,
        },
        recent_transactions: [],
      });

      // Load children if account has any
      if (accountData.has_children) {
        loadChildren();
      }
    } catch (error: any) {
      showToast(error.message || "Failed to load account details", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async () => {
    try {
      const children = await ledgerAccountService.getChildren(id);
      setAccount((prev) => (prev ? { ...prev, children } : null));
    } catch (error) {
      console.error("Failed to load children:", error);
    }
  };

  const handleToggleStatus = async () => {
    if (!account) return;

    showConfirm(
      `${account.ledger_account.is_active ? "Deactivate" : "Activate"} Account`,
      `Are you sure you want to ${
        account.ledger_account.is_active ? "deactivate" : "activate"
      } this account?`,
      async () => {
        try {
          await ledgerAccountService.toggleStatus(id);
          showToast(
            `✅ Account ${
              account.ledger_account.is_active ? "deactivated" : "activated"
            } successfully`,
            "success"
          );
          loadAccountDetails();
        } catch (error: any) {
          showToast(error.message || "Failed to toggle status", "error");
        }
      },
      {
        confirmText: account.ledger_account.is_active
          ? "Deactivate"
          : "Activate",
        destructive: account.ledger_account.is_active,
      }
    );
  };

  const handleDelete = () => {
    if (!account?.statistics?.can_be_deleted) {
      showToast(
        "This account cannot be deleted because it has child accounts or transactions.",
        "error"
      );
      return;
    }

    showConfirm(
      "Delete Account",
      "Are you sure you want to delete this account? This action cannot be undone.",
      async () => {
        try {
          await ledgerAccountService.delete(id);
          showToast("✅ Account deleted successfully", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(error.message || "Failed to delete account", "error");
        }
      },
      {
        confirmText: "Delete",
        destructive: true,
      }
    );
  };

  const handleEdit = () => {
    navigation.navigate("LedgerAccountEdit", {
      id,
      onUpdated: () => loadAccountDetails(),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Account Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!account) {
    return null;
  }

  const { ledger_account } = account;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Account Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View style={styles.headerCardLeft}>
              <Text style={styles.accountCode}>{ledger_account.code}</Text>
              <Text style={styles.accountName}>{ledger_account.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  ledger_account.is_active
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}>
                <Text style={styles.statusText}>
                  {ledger_account.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                (ledger_account.balance || 0) >= 0
                  ? styles.debitBalance
                  : styles.creditBalance,
              ]}>
              {ledger_account.formatted_balance}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}>
              <Text style={styles.actionButtonText}>✏️{"\n"} Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={handleToggleStatus}>
              <Text style={styles.actionButtonText}>
                {ledger_account.is_active ? "🔴 \n Deactivate" : "🟢 Activate"}
              </Text>
            </TouchableOpacity>
            {account.statistics?.can_be_deleted && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}>
                <Text style={styles.actionButtonTextDanger}>🗑️ Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "details" && styles.tabActive]}
            onPress={() => setActiveTab("details")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.tabTextActive,
              ]}>
              Details
            </Text>
          </TouchableOpacity>
          {(account.statistics?.children_count || 0) > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === "children" && styles.tabActive]}
              onPress={() => setActiveTab("children")}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === "children" && styles.tabTextActive,
                ]}>
                Sub-accounts ({account.statistics?.children_count})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Content */}
        {activeTab === "details" && (
          <View style={styles.detailsTab}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Code</Text>
                <Text style={styles.detailValue}>{ledger_account.code}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Name</Text>
                <Text style={styles.detailValue}>{ledger_account.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Type</Text>
                <Text style={styles.detailValue}>
                  {ledger_account.account_type}
                </Text>
              </View>

              {ledger_account.account_group && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Group</Text>
                  <Text style={styles.detailValue}>
                    {ledger_account.account_group.code} -{" "}
                    {ledger_account.account_group.name}
                  </Text>
                </View>
              )}

              {ledger_account.parent && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Parent Account</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push("LedgerAccountShow", {
                        id: ledger_account.parent!.id,
                      })
                    }>
                    <Text style={[styles.detailValue, styles.linkText]}>
                      {ledger_account.parent.code} -{" "}
                      {ledger_account.parent.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {ledger_account.description && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {ledger_account.description}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Level</Text>
                <Text style={styles.detailValue}>{ledger_account.level}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    ledger_account.is_active
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}>
                  <Text style={styles.statusText}>
                    {ledger_account.is_active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            {(ledger_account.address ||
              ledger_account.phone ||
              ledger_account.email) && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                {ledger_account.address && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>
                      {ledger_account.address}
                    </Text>
                  </View>
                )}

                {ledger_account.phone && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>
                      {ledger_account.phone}
                    </Text>
                  </View>
                )}

                {ledger_account.email && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>
                      {ledger_account.email}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Metadata */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Metadata</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created At</Text>
                <Text style={styles.detailValue}>
                  {new Date(ledger_account.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Updated At</Text>
                <Text style={styles.detailValue}>
                  {new Date(ledger_account.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "children" && (
          <View style={styles.childrenTab}>
            {account.children && account.children.length > 0 ? (
              account.children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childCard}
                  onPress={() =>
                    navigation.push("LedgerAccountShow", { id: child.id })
                  }>
                  <View style={styles.childCardHeader}>
                    <View>
                      <Text style={styles.childCode}>{child.code}</Text>
                      <Text style={styles.childName}>{child.name}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        child.is_active
                          ? styles.statusActive
                          : styles.statusInactive,
                      ]}>
                      <Text style={styles.statusText}>
                        {child.is_active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.childCardFooter}>
                    <Text style={styles.childBalance}>
                      {child.formatted_balance}
                    </Text>
                    {child.has_children && (
                      <Text style={styles.childrenCount}>
                        {child.children_count} sub-accounts
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No sub-accounts found</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCardTop: {
    marginBottom: 16,
  },
  headerCardLeft: {
    flex: 1,
  },
  accountCode: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  accountName: {
    fontSize: 22,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  balanceCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  debitBalance: {
    color: "#059669",
  },
  creditBalance: {
    color: "#dc2626",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
      backgroundColor: "#fef3c7",

  },
  toggleButton: {
      backgroundColor: "#dbeafe",
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
      alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
      color: "#1f2937",



  },
  actionButtonTextDanger: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: BRAND_COLORS.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: BRAND_COLORS.darkPurple,
  },
  detailsTab: {
    marginTop: 16,
  },
  detailSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  linkText: {
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
  childrenTab: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  childCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  childCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  childCode: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  childCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  childBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  childrenCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  bottomSpacer: {
    height: 40,
  },
});
