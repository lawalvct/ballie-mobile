import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { invoiceService } from "../services/invoiceService";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type { InvoiceDetails } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "InvoiceShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: {
    id: number;
  };
};

export default function InvoiceShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const invoiceId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.show(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load invoice",
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    Alert.alert(
      "Confirm Post",
      "Are you sure you want to post this invoice? Once posted, the invoice cannot be edited.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Post",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              await invoiceService.post(invoiceId);
              Alert.alert("Success", "Invoice posted successfully");
              loadInvoice();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to post invoice",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleUnpost = async () => {
    Alert.alert(
      "Confirm Unpost",
      "Are you sure you want to unpost this invoice? This will revert it to draft status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpost",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await invoiceService.unpost(invoiceId);
              Alert.alert("Success", "Invoice unposted successfully");
              loadInvoice();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to unpost invoice",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await invoiceService.delete(invoiceId);
              Alert.alert("Success", "Invoice deleted successfully", [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete invoice",
              );
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  const statusColor =
    invoice.status === "posted"
      ? "#10b981"
      : invoice.status === "draft"
        ? "#f59e0b"
        : "#6b7280";

  const statusBg =
    invoice.status === "posted"
      ? "#d1fae5"
      : invoice.status === "draft"
        ? "#fef3c7"
        : "#f3f4f6";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{invoice.voucher_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voucher Type:</Text>
              <Text style={styles.infoValue}>
                {invoice.voucher_type_name || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{invoice.voucher_date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Party:</Text>
              <Text style={styles.infoValue}>{invoice.party_name}</Text>
            </View>
            {invoice.narration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Narration:</Text>
                <Text style={styles.infoValue}>{invoice.narration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Invoice Items */}
        {invoice.items && invoice.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Items</Text>
            {invoice.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemAmount}>
                    {item.amount?.toFixed(2) || "0.00"}
                  </Text>
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemDetailLabel}>Quantity:</Text>
                    <Text style={styles.itemDetailValue}>{item.quantity}</Text>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemDetailLabel}>Rate:</Text>
                    <Text style={styles.itemDetailValue}>
                      {item.rate?.toFixed(2)}
                    </Text>
                  </View>
                  {(item.discount ?? 0) > 0 && (
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.itemDetailLabel}>Discount:</Text>
                      <Text style={styles.itemDetailValue}>
                        {item.discount}%
                      </Text>
                    </View>
                  )}
                  {(item.vat_rate ?? 0) > 0 && (
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.itemDetailLabel}>VAT:</Text>
                      <Text style={styles.itemDetailValue}>
                        {item.vat_rate}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Additional Charges */}
        {invoice.additional_charges &&
          invoice.additional_charges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Charges</Text>
              {invoice.additional_charges.map((charge, index) => (
                <View key={index} style={styles.chargeCard}>
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeAccount}>
                      {charge.ledger_account_name}
                    </Text>
                    <Text style={styles.chargeAmount}>
                      {charge.amount?.toFixed(2) || "0.00"}
                    </Text>
                  </View>
                  {charge.description && (
                    <Text style={styles.chargeDescription}>
                      {charge.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Ledger Entries */}
        {invoice.entries && invoice.entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ledger Entries</Text>
            {invoice.entries.map((entry, index) => (
              <View key={index} style={styles.entryCard}>
                <Text style={styles.entryAccount}>
                  {entry.ledger_account_name}
                </Text>
                <View style={styles.entryAmounts}>
                  <View style={styles.entryAmountBox}>
                    <Text style={styles.entryAmountLabel}>Debit</Text>
                    <Text style={styles.entryAmountValue}>
                      {entry.debit_amount?.toFixed(2) || "-"}
                    </Text>
                  </View>
                  <View style={styles.entryAmountBox}>
                    <Text style={styles.entryAmountLabel}>Credit</Text>
                    <Text style={styles.entryAmountValue}>
                      {entry.credit_amount?.toFixed(2) || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>
                {invoice.total_amount?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {invoice.status === "draft" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.postButton]}
                onPress={handlePost}
                disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>📮 Post Invoice</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {invoice.status === "posted" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.unpostButton]}
              onPress={handleUnpost}
              disabled={actionLoading}>
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>↩️ Unpost Invoice</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
  },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    flex: 1,
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  itemDetails: {
    gap: 8,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemDetailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  itemDetailValue: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  chargeCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chargeAccount: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
  },
  chargeAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  chargeDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  entryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  entryAccount: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  entryAmounts: {
    flexDirection: "row",
    gap: 12,
  },
  entryAmountBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  entryAmountLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  entryAmountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: BRAND_COLORS.darkPurple,
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
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
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
