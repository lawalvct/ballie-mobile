import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  RefreshControl,
  Alert,
  Share,
  Linking,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { voucherService } from "../services/voucherService";
import type { VoucherDetails } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "VoucherShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = toNumber(value);
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getTypeColor = (code: string) => {
  const colors: Record<string, string> = {
    JV: "#8b5cf6",
    PV: "#ef4444",
    RV: "#10b981",
    CV: "#06b6d4",
    CN: "#f97316",
    DN: "#ec4899",
  };
  return colors[code] || "#6b7280";
};

export default function VoucherShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const voucherId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [voucher, setVoucher] = useState<VoucherDetails | null>(null);

  useEffect(() => {
    loadVoucher();
  }, [voucherId]);

  const loadVoucher = async () => {
    try {
      setLoading(true);
      const response = await voucherService.show(voucherId);
      setVoucher(response);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load voucher",
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadVoucher();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = () => {
    if (!voucher) return;
    // Navigate to edit screen (to be implemented)
    Alert.alert("Edit", "Edit functionality will be implemented");
  };

  const handlePost = () => {
    if (!voucher) return;
    Alert.alert(
      "Post Voucher",
      "Are you sure you want to post this voucher? Posted vouchers cannot be edited or deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Post",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const updated = await voucherService.post(voucher.id);
              setVoucher(updated);
              Alert.alert("Success", "Voucher posted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  error.message ||
                  "Failed to post voucher",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleUnpost = () => {
    if (!voucher) return;
    Alert.alert(
      "Unpost Voucher",
      "Are you sure you want to unpost this voucher? This will revert it to draft status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpost",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const updated = await voucherService.unpost(voucher.id);
              setVoucher(updated);
              Alert.alert("Success", "Voucher unposted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  error.message ||
                  "Failed to unpost voucher",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!voucher) return;
    Alert.alert(
      "Delete Voucher",
      "Are you sure you want to delete this voucher? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await voucherService.delete(voucher.id);
              Alert.alert("Success", "Voucher deleted successfully");
              navigation.goBack();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  error.message ||
                  "Failed to delete voucher",
              );
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDuplicate = async () => {
    if (!voucher) return;
    try {
      setActionLoading(true);
      const duplicateData = await voucherService.getDuplicate(voucher.id);
      // Navigate to create screen with pre-filled data
      Alert.alert("Duplicate", "Duplicate functionality will be implemented");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to duplicate voucher",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    if (!voucher) return;
    try {
      await Share.share({
        message: `Voucher ${voucher.voucher_number}\nType: ${voucher.voucher_type_name}\nDate: ${voucher.voucher_date}\nAmount: ₦${formatCurrency(voucher.total_amount)}\nStatus: ${voucher.status}`,
      });
    } catch (error: any) {
      // Share dismissed or failed
    }
  };

  const handleDownloadPDF = async () => {
    if (!voucher) return;
    try {
      setActionLoading(true);

      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const token = await AsyncStorage.getItem("auth_token");
      const tenantSlug = await AsyncStorage.getItem("tenant_slug");

      if (!token || !tenantSlug) {
        throw new Error("Authentication required. Please log in again.");
      }

      const fileName = `Voucher-${voucher.voucher_number || voucher.id}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const apiBaseUrl = "https://ballie.co/api/v1";
      const pdfUrl = `${apiBaseUrl}/tenant/${tenantSlug}/accounting/vouchers/${voucher.id}/pdf`;

      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      if (downloadResult.status !== 200) {
        throw new Error(
          `Failed to download PDF. Server returned status: ${downloadResult.status}`,
        );
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share ${fileName}`,
          UTI: "com.adobe.pdf",
        });
        Alert.alert("Success", "PDF is ready to share.", [{ text: "OK" }]);
      } else {
        Alert.alert(
          "PDF Downloaded",
          Platform.OS === "android"
            ? "Voucher saved to app storage."
            : "Voucher saved to Files.",
          Platform.OS === "ios"
            ? [
                {
                  text: "Open",
                  onPress: () => Linking.openURL(downloadResult.uri),
                },
                { text: "OK" },
              ]
            : [{ text: "OK" }],
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to download PDF");
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!voucher?.entries) return { debit: 0, credit: 0 };
    const debit = voucher.entries.reduce(
      (sum, entry) => sum + toNumber(entry.debit_amount),
      0,
    );
    const credit = voucher.entries.reduce(
      (sum, entry) => sum + toNumber(entry.credit_amount),
      0,
    );
    return { debit, credit };
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
          <Text style={styles.headerTitle}>Voucher Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading voucher...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!voucher) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Voucher not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totals = calculateTotals();
  const hasActions =
    voucher.can_be_edited ||
    voucher.can_be_posted ||
    voucher.can_be_unposted ||
    voucher.can_be_deleted;

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
        <Text style={styles.headerTitle}>Voucher Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.typeBadge}>
              <View
                style={[
                  styles.typeDot,
                  { backgroundColor: getTypeColor(voucher.voucher_type_code) },
                ]}
              />
              <Text style={styles.typeText}>{voucher.voucher_type_name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                voucher.status === "posted"
                  ? styles.statusPosted
                  : styles.statusDraft,
              ]}>
              <Text style={styles.statusText}>{voucher.status}</Text>
            </View>
          </View>

          <Text style={styles.voucherNumber}>{voucher.voucher_number}</Text>
          <Text style={styles.voucherDate}>{voucher.voucher_date}</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>
              ₦{formatCurrency(voucher.total_amount)}
            </Text>
          </View>

          {voucher.narration ? (
            <View style={styles.narrationContainer}>
              <Text style={styles.narrationLabel}>Narration</Text>
              <Text style={styles.narration}>{voucher.narration}</Text>
            </View>
          ) : null}

          {voucher.reference_number ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reference</Text>
              <Text style={styles.metaValue}>{voucher.reference_number}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        {hasActions && (
          <View style={styles.actionsCard}>
            <View style={styles.actionsRow}>
              {voucher.can_be_edited && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={handleEdit}
                  disabled={actionLoading}>
                  <Text style={styles.actionButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
              )}
              {voucher.can_be_posted && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.postButton]}
                  onPress={handlePost}
                  disabled={actionLoading}>
                  <Text style={styles.actionButtonText}>✓ Post</Text>
                </TouchableOpacity>
              )}
              {voucher.can_be_unposted && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.unpostButton]}
                  onPress={handleUnpost}
                  disabled={actionLoading}>
                  <Text style={styles.actionButtonText}>↶ Unpost</Text>
                </TouchableOpacity>
              )}
              {voucher.can_be_deleted && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={actionLoading}>
                  <Text style={styles.actionButtonText}>🗑 Delete</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.actionsRow}>
              {/*
              <TouchableOpacity
                style={[styles.actionButton, styles.duplicateButton]}
                onPress={handleDuplicate}
                disabled={actionLoading}>
                <Text style={styles.actionButtonText}>📋 Duplicate</Text>
              </TouchableOpacity>
              */}
              <TouchableOpacity
                style={[styles.actionButton, styles.pdfButton]}
                onPress={handleDownloadPDF}
                disabled={actionLoading}>
                <Text style={styles.actionButtonText}>📄 PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={actionLoading}>
                <Text style={styles.actionButtonText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Entries Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Entries</Text>
          <Text style={styles.sectionCount}>
            {voucher.entries?.length || 0} items
          </Text>
        </View>

        {voucher.entries?.length ? (
          <>
            {voucher.entries.map((entry, index) => (
              <View key={entry.id || index} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryAccount}>
                    {entry.ledger_account_display_name ||
                      entry.ledger_account_name ||
                      `Account #${entry.ledger_account_id}`}
                  </Text>
                  {entry.account_group_name && (
                    <Text style={styles.entryGroup}>
                      {entry.account_group_name}
                    </Text>
                  )}
                </View>
                <View style={styles.entryAmounts}>
                  <View style={styles.entryAmountCol}>
                    <Text style={styles.entryLabel}>Debit</Text>
                    <Text
                      style={[
                        styles.entryValue,
                        toNumber(entry.debit_amount) > 0 &&
                          styles.entryValueActive,
                      ]}>
                      ₦{formatCurrency(entry.debit_amount)}
                    </Text>
                  </View>
                  <View style={styles.entryAmountCol}>
                    <Text style={styles.entryLabel}>Credit</Text>
                    <Text
                      style={[
                        styles.entryValue,
                        toNumber(entry.credit_amount) > 0 &&
                          styles.entryValueActive,
                      ]}>
                      ₦{formatCurrency(entry.credit_amount)}
                    </Text>
                  </View>
                </View>
                {entry.description ? (
                  <Text style={styles.entryDescription}>
                    {entry.description}
                  </Text>
                ) : null}
              </View>
            ))}

            {/* Totals Card */}
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Debits</Text>
                <Text style={styles.totalValue}>
                  ₦{formatCurrency(totals.debit)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Credits</Text>
                <Text style={styles.totalValue}>
                  ₦{formatCurrency(totals.credit)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Difference</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    Math.abs(totals.debit - totals.credit) < 0.01
                      ? styles.balanceBalanced
                      : styles.balanceUnbalanced,
                  ]}>
                  ₦{formatCurrency(Math.abs(totals.debit - totals.credit))}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No Entries</Text>
            <Text style={styles.emptyText}>No voucher entries found</Text>
          </View>
        )}

        {/* Audit Trail */}
        <View style={styles.auditCard}>
          <Text style={styles.auditTitle}>Audit Trail</Text>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Created by</Text>
            <Text style={styles.auditValue}>
              {voucher.created_by?.name || "N/A"} •{" "}
              {new Date(voucher.created_at).toLocaleString()}
            </Text>
          </View>
          {voucher.updated_at !== voucher.created_at && (
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Updated by</Text>
              <Text style={styles.auditValue}>
                {voucher.updated_by?.name || "N/A"} •{" "}
                {new Date(voucher.updated_at).toLocaleString()}
              </Text>
            </View>
          )}
          {voucher.posted_at && (
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Posted by</Text>
              <Text style={styles.auditValue}>
                {voucher.posted_by?.name || "N/A"} •{" "}
                {new Date(voucher.posted_at).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
  },
  errorText: {
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
  },
  summaryCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDraft: {
    backgroundColor: "#fef9c3",
  },
  statusPosted: {
    backgroundColor: "#dcfce7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textTransform: "capitalize",
  },
  voucherNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  voucherDate: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  narrationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  narrationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  narration: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  metaLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  actionsCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  postButton: {
    backgroundColor: "#10b981",
  },
  unpostButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  duplicateButton: {
    backgroundColor: "#8b5cf6",
  },
  pdfButton: {
    backgroundColor: "#0ea5e9",
  },
  shareButton: {
    backgroundColor: "#06b6d4",
  },
  sectionHeaderRow: {
    marginTop: 20,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  sectionCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  entryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    marginBottom: 10,
  },
  entryAccount: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  entryGroup: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
  },
  entryAmounts: {
    flexDirection: "row",
    gap: 16,
  },
  entryAmountCol: {
    flex: 1,
  },
  entryLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  entryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  entryValueActive: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  entryDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  totalsCard: {
    backgroundColor: "#fef9c3",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: BRAND_COLORS.gold,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  balanceBalanced: {
    color: "#10b981",
  },
  balanceUnbalanced: {
    color: "#ef4444",
  },
  auditCard: {
    backgroundColor: "#f9fafb",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  auditRow: {
    marginBottom: 8,
  },
  auditLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  auditValue: {
    fontSize: 12,
    color: "#374151",
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
