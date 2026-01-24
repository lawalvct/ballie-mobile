import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { purchaseOrderService } from "../services/purchaseOrderService";
import type { PurchaseOrder } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "PurchaseOrderShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function PurchaseOrderShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<PurchaseOrder | null>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderService.show(id);
      setOrder(data);

      if (data?.vendor?.email) {
        setEmailTo(data.vendor.email);
      }
      if (data?.lpo_number) {
        setEmailSubject(`Purchase Order ${data.lpo_number}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number | null) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    try {
      setProcessing(true);
      const token = await AsyncStorage.getItem("auth_token");
      const tenantSlug = await AsyncStorage.getItem("tenant_slug");

      if (!token || !tenantSlug) {
        throw new Error("Authentication required. Please log in again.");
      }

      const fileName = `LPO-${order.lpo_number || order.id}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const apiBaseUrl = "https://ballie.co/api/v1";
      const pdfUrl = `${apiBaseUrl}/tenant/${tenantSlug}/procurement/purchase-orders/${order.id}/pdf`;

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
            ? "LPO saved to app storage."
            : "LPO saved to Files.",
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
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!order) return;
    if (!emailTo || !emailSubject) {
      Alert.alert("Validation", "Email and subject are required");
      return;
    }

    try {
      setProcessing(true);
      await purchaseOrderService.sendEmail(order.id, {
        to: emailTo,
        subject: emailSubject,
        message: emailMessage,
      });
      setShowEmailModal(false);
      await loadOrder();
      Alert.alert("Success", "Purchase order sent successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send email");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>LPO Number</Text>
            <Text style={styles.value}>
              {order.lpo_number || `#${order.id}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{order.lpo_date}</Text>
          </View>
          {order.expected_delivery_date ? (
            <View style={styles.row}>
              <Text style={styles.label}>Expected Delivery</Text>
              <Text style={styles.value}>{order.expected_delivery_date}</Text>
            </View>
          ) : null}
          {order.vendor_name || order.vendor?.name ? (
            <View style={styles.row}>
              <Text style={styles.label}>Vendor</Text>
              <Text style={styles.value}>
                {order.vendor_name || order.vendor?.name}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Items ({order.items?.length || 0})
          </Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemCard}>
                <Text style={styles.itemTitle}>
                  {item.product_name || `Product #${item.product_id}`}
                </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Qty</Text>
                  <Text style={styles.itemValue}>{item.quantity}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Unit Price</Text>
                  <Text style={styles.itemValue}>
                    ₦{formatCurrency(item.unit_price)}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Discount</Text>
                  <Text style={styles.itemValue}>
                    ₦{formatCurrency(item.discount)}
                  </Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Tax %</Text>
                  <Text style={styles.itemValue}>{item.tax_rate || 0}%</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Total</Text>
                  <Text style={styles.itemValueAmount}>
                    ₦{formatCurrency(item.total)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Totals</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>₦{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={styles.value}>
              ₦{formatCurrency(order.discount_amount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>
              ₦{formatCurrency(order.tax_amount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>
              ₦{formatCurrency(order.total_amount)}
            </Text>
          </View>
        </View>

        {order.notes ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.value}>{order.notes}</Text>
          </View>
        ) : null}

        {order.terms_conditions ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.value}>{order.terms_conditions}</Text>
          </View>
        ) : null}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={() => setShowEmailModal(true)}
            disabled={processing}>
            <Text style={styles.actionButtonText}>✉️ Send Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.pdfButton]}
            onPress={handleDownloadPDF}
            disabled={processing}>
            <Text style={styles.actionButtonText}>📄 Download PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Purchase Order</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>To *</Text>
              <TextInput
                style={styles.input}
                value={emailTo}
                onChangeText={setEmailTo}
                placeholder="Email address"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={emailSubject}
                onChangeText={setEmailSubject}
                placeholder="Subject"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={emailMessage}
                onChangeText={setEmailMessage}
                placeholder="Message"
                multiline
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowEmailModal(false)}
                disabled={processing}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.sendButton]}
                onPress={handleSendEmail}
                disabled={processing}>
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
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
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
  },
  value: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  itemLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  itemValue: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  itemValueAmount: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  emailButton: {
    backgroundColor: "#dbeafe",
  },
  pdfButton: {
    backgroundColor: "#fef3c7",
  },
  sendButton: {
    backgroundColor: BRAND_COLORS.gold,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
});
