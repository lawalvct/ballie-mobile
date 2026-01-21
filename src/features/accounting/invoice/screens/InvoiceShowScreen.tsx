import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { BRAND_COLORS } from "../../../../theme/colors";
import { invoiceService } from "../services/invoiceService";
import { showToast } from "../../../../utils/toast";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type { InvoiceDetails, Party, LedgerAccount } from "../types";

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
  const [party, setParty] = useState<Party | null>(null);
  const [balanceDue, setBalanceDue] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<LedgerAccount | null>(null);
  const [bankAccounts, setBankAccounts] = useState<LedgerAccount[]>([]);
  const [bankSearchTerm, setBankSearchTerm] = useState("bank");
  const [bankSearchLoading, setBankSearchLoading] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [showEntries, setShowEntries] = useState(false);

  const formatCurrency = (value: number | null | undefined) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}. ${day}, ${date.getFullYear()}`;
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.show(invoiceId);
      if (!response || !response.invoice) {
        throw new Error("Invalid invoice response received from server");
      }

      setInvoice(response.invoice);
      setParty(response.party);
      setBalanceDue(response.balance_due || 0);
      setTotalPaid(response.total_paid || 0);

      // Pre-fill email with party email
      if (response.party?.email) {
        setEmailTo(response.party.email);
      }

      // Pre-fill payment amount with balance due
      if (response.balance_due) {
        setPaymentAmount(response.balance_due.toString());
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to load invoice");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInvoice();
    } catch (error) {
      // Error handled silently or could show alert if needed
    } finally {
      setRefreshing(false);
    }
  };

  const handleBankSearch = async (term: string) => {
    try {
      setBankSearchTerm(term);
      // avoid noisy requests when term is too short
      if (!term || term.trim().length < 2) {
        setBankAccounts([]);
        setBankSearchLoading(false);
        return;
      }
      setBankSearchLoading(true);
      const results = await invoiceService.searchLedgerAccounts(term.trim());
      setBankAccounts(results || []);
      // If nothing selected yet, auto-select first match
      if (!selectedBankAccount && results && results.length > 0) {
        setSelectedBankAccount(results[0]);
      }
    } catch (error) {
      // Bank search error handled silently
    } finally {
      setBankSearchLoading(false);
    }
  };

  useEffect(() => {
    if (showPaymentModal) {
      // prime search with a sensible default term
      handleBankSearch(bankSearchTerm || "bank");
    }
  }, [showPaymentModal]);

  const openPaymentModal = () => {
    setShowPaymentModal(true);
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
              showToast("✅ Invoice deleted successfully", "success");
              navigation.goBack();
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

  const handleRecordPayment = async () => {
    // Validate payment amount
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid payment amount");
      return;
    }

    if (amount > balanceDue) {
      Alert.alert(
        "Error",
        `Payment amount cannot exceed balance due of ₦${balanceDue.toLocaleString()}`,
      );
      return;
    }

    if (!selectedBankAccount) {
      Alert.alert("Error", "Please select a bank or cash account");
      return;
    }

    try {
      setActionLoading(true);
      // For now, we'll use a dummy bank account ID. In a real app, this should be selected by the user
      await invoiceService.recordPayment(invoiceId, {
        date: paymentDate,
        amount,
        bank_account_id: selectedBankAccount.id,
        reference: paymentReference || undefined,
        notes: paymentNotes || undefined,
      });

      showToast("✅ Payment recorded successfully", "success");
      setShowPaymentModal(false);

      // Reset payment form
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentAmount("");
      setPaymentReference("");
      setPaymentNotes("");
      setSelectedBankAccount(null);
      setBankAccounts([]);
      setBankSearchTerm("bank");

      // Reload invoice to get updated balance
      await loadInvoice();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to record payment",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!emailTo) {
      Alert.alert("Error", "Please enter recipient email address");
      return;
    }

    try {
      setActionLoading(true);
      await invoiceService.emailInvoice(invoiceId, {
        to: emailTo,
        subject: emailSubject || undefined,
        message: emailMessage || undefined,
        attach_pdf: true,
      });

      showToast("✅ Invoice emailed successfully", "success");
      setShowEmailModal(false);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to email invoice",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditInvoice = () => {
    navigation.navigate("InvoiceEdit", {
      id: invoiceId,
      onUpdated: () => loadInvoice(),
    });
  };

  const handleShareInvoice = async () => {
    try {
      setActionLoading(true);
      showToast("📤 Preparing to share...", "info");

      if (!invoice) {
        throw new Error("Invoice data not available");
      }

      // Get auth token and tenant slug
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const token = await AsyncStorage.getItem("auth_token");
      const tenantSlug = await AsyncStorage.getItem("tenant_slug");

      if (!token || !tenantSlug) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Create file name based on invoice number
      const fileName = `Invoice-${invoice.voucher_number || invoiceId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Construct the full API URL
      const apiBaseUrl = "https://ballie.co/api/v1";
      const pdfUrl = `${apiBaseUrl}/tenant/${tenantSlug}/accounting/invoices/${invoiceId}/pdf`;

      // Download PDF from API
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

      // Share the PDF file using expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share ${fileName}`,
          UTI: "com.adobe.pdf",
        });
        showToast("✅ Shared successfully", "success");
      } else {
        Alert.alert("Success", `PDF saved to: ${downloadResult.uri}`);
      }
    } catch (error: any) {
      console.error("Share Error:", error);
      Alert.alert("Error", error.message || "Failed to share invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setActionLoading(true);
      showToast("📄 Generating PDF...", "info");

      if (!invoice) {
        throw new Error("Invoice data not available");
      }

      // Get auth token and tenant slug
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const token = await AsyncStorage.getItem("auth_token");
      const tenantSlug = await AsyncStorage.getItem("tenant_slug");

      if (!token || !tenantSlug) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Create file name based on invoice number
      const fileName = `Invoice-${invoice.voucher_number || invoiceId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Construct the full API URL
      const apiBaseUrl = "https://ballie.co/api/v1";
      const pdfUrl = `${apiBaseUrl}/tenant/${tenantSlug}/accounting/invoices/${invoiceId}/pdf`;

      console.log("Downloading PDF from:", pdfUrl);

      // Download PDF from API
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      console.log("Download result:", downloadResult);

      if (downloadResult.status !== 200) {
        throw new Error(
          `Failed to download PDF. Server returned status: ${downloadResult.status}`,
        );
      }

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted && permissions.directoryUri) {
          const destinationUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              "application/pdf",
            );

          const fileBase64 = await FileSystem.readAsStringAsync(
            downloadResult.uri,
            { encoding: FileSystem.EncodingType.Base64 },
          );

          await FileSystem.writeAsStringAsync(destinationUri, fileBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          showToast("✅ PDF downloaded successfully", "success");
          Alert.alert("PDF Downloaded", "Invoice saved to selected folder.", [
            { text: "OK" },
          ]);
        } else {
          showToast("✅ PDF downloaded successfully", "success");
          Alert.alert(
            "PDF Downloaded",
            "Invoice saved to app storage. Please allow access to save in Downloads next time.",
            [{ text: "OK" }],
          );
        }
      } else {
        showToast("✅ PDF downloaded successfully", "success");
        Alert.alert("PDF Downloaded", "Invoice saved to Files.", [
          { text: "Open", onPress: () => Linking.openURL(downloadResult.uri) },
          { text: "OK" },
        ]);
      }
    } catch (error: any) {
      console.error("PDF Download Error:", error);
      Alert.alert("Error", error.message || "Failed to download PDF");
    } finally {
      setActionLoading(false);
    }
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

  const itemsSubtotal = (invoice.items || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const chargesTotal = (invoice.additional_charges || []).reduce(
    (sum, charge) => sum + Number(charge.amount || 0),
    0,
  );
  const vatAmount = Number((invoice as any)?.vat_amount || 0);
  const paymentHistory = ((invoice as any)?.payments ||
    (invoice as any)?.payment_history ||
    []) as any[];

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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.darkPurple]}
            tintColor={BRAND_COLORS.darkPurple}
            title="Refreshing invoice..."
            titleColor={BRAND_COLORS.darkPurple}
          />
        }>
        {/* Payment Status Card */}
        {invoice.status === "posted" && invoice.total_amount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            <View style={styles.paymentStatusCard}>
              <Text style={styles.balanceDueAmount}>
                ₦
                {balanceDue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.balanceDueLabel}>Balance Due</Text>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (totalPaid / invoice.total_amount) * 100)}%`,
                      backgroundColor:
                        balanceDue === 0 || balanceDue <= 0.01
                          ? "#10b981"
                          : totalPaid > 0 && balanceDue < invoice.total_amount
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                  ]}
                />
              </View>

              {/* Payment Status Label */}
              <Text
                style={[
                  styles.paymentStatusLabel,
                  {
                    color:
                      balanceDue === 0 || balanceDue <= 0.01
                        ? "#10b981"
                        : totalPaid > 0 && balanceDue < invoice.total_amount
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}>
                {balanceDue === 0 || balanceDue <= 0.01
                  ? "✓ Fully Paid"
                  : totalPaid > 0 && balanceDue < invoice.total_amount
                    ? "Partially Paid"
                    : "Unpaid"}
              </Text>

              <Text style={styles.paymentSummary}>
                ₦
                {totalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                of ₦
                {invoice.total_amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Party Information */}
        {party && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {invoice.type === "sales" ? "Customer" : "Vendor"} Information
            </Text>
            <View style={styles.partyCard}>
              <Text style={styles.partyName}>{party.name}</Text>
              {party.email && (
                <View style={styles.partyDetailRow}>
                  <Text style={styles.partyDetailIcon}>📧</Text>
                  <Text style={styles.partyDetailText}>{party.email}</Text>
                </View>
              )}
              {(party.phone || party.mobile) && (
                <View style={styles.partyDetailRow}>
                  <Text style={styles.partyDetailIcon}>📱</Text>
                  <Text style={styles.partyDetailText}>
                    {party.phone || party.mobile}
                  </Text>
                </View>
              )}
              {party.address && (
                <View style={styles.partyDetailRow}>
                  <Text style={styles.partyDetailIcon}>📍</Text>
                  <Text style={styles.partyDetailText}>{party.address}</Text>
                </View>
              )}
              {party.outstanding_balance !== undefined && (
                <View style={styles.partyDetailRow}>
                  <Text style={styles.partyDetailIcon}>💳</Text>
                  <Text style={styles.partyDetailText}>
                    Outstanding Balance: ₦
                    {formatCurrency(party.outstanding_balance)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Invoice Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Invoice Summary</Text>
            <Text style={styles.sectionTag}>#{invoice.voucher_number}</Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRowWide}>
              <Text style={styles.infoLabel}>Invoice Date:</Text>
              <Text style={styles.infoValue}>
                {formatDate(invoice.voucher_date)}
              </Text>
            </View>
            {invoice.reference_number && (
              <View style={styles.summaryRowWide}>
                <Text style={styles.infoLabel}>Reference:</Text>
                <Text style={styles.infoValue}>{invoice.reference_number}</Text>
              </View>
            )}
            <View style={styles.summaryRowWide}>
              <Text style={styles.infoLabel}>Created By:</Text>
              <Text style={styles.infoValue}>
                {invoice.created_by_user?.name || "N/A"}
              </Text>
            </View>
            {invoice.status === "posted" && (
              <View style={styles.summaryRowWide}>
                <Text style={styles.infoLabel}>Posted On:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(invoice.posted_at)}
                  {invoice.posted_by_user?.name
                    ? ` by ${invoice.posted_by_user.name}`
                    : ""}
                </Text>
              </View>
            )}
            {party?.payment_terms && (
              <View style={styles.summaryRowWide}>
                <Text style={styles.infoLabel}>Payment Terms:</Text>
                <Text style={styles.infoValue}>{party.payment_terms}</Text>
              </View>
            )}
            <View style={styles.summaryRowWide}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: statusColor }]}>
                {invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

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
              <Text style={styles.infoValue}>
                {formatDate(invoice.voucher_date)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Party:</Text>
              <Text style={styles.infoValue}>
                {invoice.party_name || party?.name || "N/A"}
              </Text>
            </View>
            {invoice.reference_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reference:</Text>
                <Text style={styles.infoValue}>{invoice.reference_number}</Text>
              </View>
            )}
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
                    ₦{formatCurrency(item.amount)}
                  </Text>
                </View>
                <View style={styles.itemDetails}>
                  {item.description &&
                    item.description !== item.product_name && (
                      <View style={styles.itemDetailRow}>
                        <Text style={styles.itemDetailLabel}>Description:</Text>
                        <Text style={styles.itemDetailValue}>
                          {item.description}
                        </Text>
                      </View>
                    )}
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemDetailLabel}>Quantity:</Text>
                    <Text style={styles.itemDetailValue}>
                      {item.quantity} {item.unit || ""}
                    </Text>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemDetailLabel}>Rate:</Text>
                    <Text style={styles.itemDetailValue}>
                      ₦{formatCurrency(item.rate)}
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
                      ₦{formatCurrency(charge.amount)}
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

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {paymentHistory.map((payment, index) => (
              <View key={index} style={styles.paymentHistoryCard}>
                <View style={styles.paymentHistoryRow}>
                  <Text style={styles.paymentHistoryLabel}>Date</Text>
                  <Text style={styles.paymentHistoryValue}>
                    {formatDate(payment.date || payment.voucher_date)}
                  </Text>
                </View>
                <View style={styles.paymentHistoryRow}>
                  <Text style={styles.paymentHistoryLabel}>Amount</Text>
                  <Text style={styles.paymentHistoryValue}>
                    ₦{formatCurrency(payment.amount)}
                  </Text>
                </View>
                {payment.method && (
                  <View style={styles.paymentHistoryRow}>
                    <Text style={styles.paymentHistoryLabel}>Method</Text>
                    <Text style={styles.paymentHistoryValue}>
                      {payment.method}
                    </Text>
                  </View>
                )}
                {payment.reference && (
                  <View style={styles.paymentHistoryRow}>
                    <Text style={styles.paymentHistoryLabel}>Reference</Text>
                    <Text style={styles.paymentHistoryValue}>
                      {payment.reference}
                    </Text>
                  </View>
                )}
                {payment.notes && (
                  <Text style={styles.paymentHistoryNotes}>
                    {payment.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Ledger Entries */}
        {invoice.entries && invoice.entries.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderRow}
              onPress={() => setShowEntries((prev) => !prev)}>
              <Text style={styles.sectionTitle}>Accounting Entries</Text>
              <Text style={styles.sectionActionText}>
                {showEntries ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
            {showEntries &&
              invoice.entries.map((entry, index) => (
                <View key={index} style={styles.entryCard}>
                  <Text style={styles.entryAccount}>
                    {entry.ledger_account_name}
                  </Text>
                  <View style={styles.entryAmounts}>
                    <View style={styles.entryAmountBox}>
                      <Text style={styles.entryAmountLabel}>Debit</Text>
                      <Text style={styles.entryAmountValue}>
                        {entry.debit_amount
                          ? `₦${formatCurrency(entry.debit_amount)}`
                          : "-"}
                      </Text>
                    </View>
                    <View style={styles.entryAmountBox}>
                      <Text style={styles.entryAmountLabel}>Credit</Text>
                      <Text style={styles.entryAmountValue}>
                        {entry.credit_amount
                          ? `₦${formatCurrency(entry.credit_amount)}`
                          : "-"}
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
              <Text style={styles.summaryLabel}>Items Subtotal:</Text>
              <Text style={styles.summaryValueSmall}>
                ₦{formatCurrency(itemsSubtotal)}
              </Text>
            </View>
            {chargesTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Additional Charges:</Text>
                <Text style={styles.summaryValueSmall}>
                  ₦{formatCurrency(chargesTotal)}
                </Text>
              </View>
            )}
            {vatAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT:</Text>
                <Text style={styles.summaryValueSmall}>
                  ₦{formatCurrency(vatAmount)}
                </Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Grand Total:</Text>
              <Text style={styles.summaryValueStrong}>
                ₦{formatCurrency(invoice.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {invoice.status === "posted" && (
            <>
              {/* Record Payment - Primary Action */}
              {balanceDue > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={openPaymentModal}
                  disabled={actionLoading}>
                  <Text style={styles.actionButtonText}>🧾 Record Payment</Text>
                </TouchableOpacity>
              )}

              {/* Secondary Actions Row */}
              <View style={styles.secondaryActionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setShowEmailModal(true)}
                  disabled={actionLoading}>
                  <Text style={styles.secondaryButtonText}>📧 Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleDownloadPDF}
                  disabled={actionLoading}>
                  <Text style={styles.secondaryButtonText}>📄 PDF</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.secondaryActionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleShareInvoice}
                  disabled={actionLoading}>
                  <Text style={styles.secondaryButtonText}>📤 Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, styles.unpostButton]}
                  onPress={handleUnpost}
                  disabled={actionLoading}>
                  <Text style={styles.secondaryButtonText}>↩️ Unpost</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {invoice.status === "draft" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleEditInvoice}
                disabled={actionLoading}>
                <Text style={styles.actionButtonText}>✏️ Edit Invoice</Text>
              </TouchableOpacity>

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
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Payment Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentDate}
                  onChangeText={setPaymentDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Bank / Cash Account</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bankSearchTerm}
                  onChangeText={(text) => handleBankSearch(text)}
                  placeholder="Search bank or cash account"
                  autoCapitalize="none"
                />
                {bankSearchLoading && (
                  <View style={styles.bankSearchLoadingRow}>
                    <ActivityIndicator
                      size="small"
                      color={BRAND_COLORS.darkPurple}
                    />
                    <Text style={styles.bankSearchLoadingText}>
                      Searching accounts...
                    </Text>
                  </View>
                )}
                {!bankSearchLoading &&
                  bankAccounts.length === 0 &&
                  bankSearchTerm.trim().length >= 2 && (
                    <Text style={styles.modalNote}>No accounts found</Text>
                  )}
                {!bankSearchLoading && bankAccounts.length > 0 && (
                  <View style={styles.bankOptionsList}>
                    {bankAccounts.slice(0, 6).map((account) => {
                      const isSelected = selectedBankAccount?.id === account.id;
                      return (
                        <TouchableOpacity
                          key={account.id}
                          style={[
                            styles.bankOption,
                            isSelected && styles.bankOptionSelected,
                          ]}
                          onPress={() => setSelectedBankAccount(account)}>
                          <View style={styles.bankOptionHeader}>
                            <Text style={styles.bankOptionName}>
                              {account.display_name || account.name}
                            </Text>
                            <Text style={styles.bankOptionCode}>
                              {account.code}
                            </Text>
                          </View>
                          <Text style={styles.bankOptionMeta}>
                            {account.account_group_name} · Balance: ₦
                            {Number(
                              account.current_balance || 0,
                            ).toLocaleString()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>
                  Amount (Balance: ₦{balanceDue.toLocaleString()})
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Reference (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentReference}
                  onChangeText={setPaymentReference}
                  placeholder="Payment reference number"
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={paymentNotes}
                  onChangeText={setPaymentNotes}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleRecordPayment}
                disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>
                    Record Payment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Email Invoice</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>To</Text>
                <TextInput
                  style={styles.modalInput}
                  value={emailTo}
                  onChangeText={setEmailTo}
                  placeholder="recipient@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Subject (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={emailSubject}
                  onChangeText={setEmailSubject}
                  placeholder={`Invoice ${invoice.voucher_number}`}
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Message (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={emailMessage}
                  onChangeText={setEmailMessage}
                  placeholder="Email message..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Text style={styles.modalNote}>
                ℹ️ PDF will be attached automatically
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEmailModal(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleEmailInvoice}
                disabled={actionLoading}>
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTag: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  sectionActionText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
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
  paymentHistoryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  paymentHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  paymentHistoryLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  paymentHistoryValue: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  paymentHistoryNotes: {
    marginTop: 6,
    fontSize: 12,
    color: "#4b5563",
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: BRAND_COLORS.darkPurple,
    borderRadius: 8,
    padding: 16,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryRowWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  summaryValueSmall: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  summaryValueStrong: {
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
  primaryButton: {
    backgroundColor: BRAND_COLORS.gold,
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
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  // Payment Status Card Styles
  paymentStatusCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: BRAND_COLORS.darkPurple,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  balanceDueAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  balanceDueLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  paymentStatusLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  paymentSummary: {
    fontSize: 14,
    color: "#6b7280",
  },
  // Party Information Card Styles
  partyCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  partyName: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  partyDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  partyDetailIcon: {
    fontSize: 16,
    width: 24,
  },
  partyDetailText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  modalClose: {
    fontSize: 28,
    color: "#6b7280",
    fontWeight: "300",
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFormGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalNote: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  bankSearchLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  bankSearchLoadingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  bankOptionsList: {
    marginTop: 10,
    gap: 8,
  },
  bankOption: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  bankOptionSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "#fff7e6",
  },
  bankOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    flex: 1,
  },
  bankOptionCode: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  bankOptionMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalCancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSubmitButton: {
    backgroundColor: BRAND_COLORS.gold,
  },
  modalSubmitButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "700",
  },
});
