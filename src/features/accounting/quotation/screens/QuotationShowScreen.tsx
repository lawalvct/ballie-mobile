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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { quotationService } from "../services/quotationService";
import type { Quotation } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "QuotationShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function QuotationShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const data = await quotationService.show(id);
      setQuotation(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!quotation) return;
    Alert.alert("Confirm Delete", "Delete this quotation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessing(true);
            await quotationService.delete(quotation.id);
            Alert.alert("Success", "Quotation deleted", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete");
          } finally {
            setProcessing(false);
          }
        },
      },
    ]);
  };

  const handleAction = async (
    action: "send" | "accept" | "reject" | "convert",
  ) => {
    if (!quotation) return;
    try {
      setProcessing(true);
      const updated =
        action === "send"
          ? await quotationService.send(quotation.id)
          : action === "accept"
            ? await quotationService.accept(quotation.id)
            : action === "reject"
              ? await quotationService.reject(quotation.id)
              : await quotationService.convert(quotation.id);
      setQuotation(updated);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !quotation) {
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
          <Text style={styles.headerTitle}>Quotation</Text>
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
        <Text style={styles.headerTitle}>Quotation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quotation Information</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{quotation.status}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quotation Number</Text>
            <Text style={styles.value}>
              {quotation.quotation_number || `#${quotation.id}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{quotation.quotation_date}</Text>
          </View>
          {quotation.expiry_date ? (
            <View style={styles.row}>
              <Text style={styles.label}>Expiry</Text>
              <Text style={styles.value}>{quotation.expiry_date}</Text>
            </View>
          ) : null}
          {quotation.customer_name || quotation.customer?.name ? (
            <View style={styles.row}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>
                {quotation.customer_name || quotation.customer?.name}
              </Text>
            </View>
          ) : null}
          {quotation.reference_number ? (
            <View style={styles.row}>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{quotation.reference_number}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Items ({quotation.items?.length || 0})
          </Text>
          {quotation.items && quotation.items.length > 0 ? (
            quotation.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemCard}>
                <Text style={styles.itemTitle}>
                  {item.product_name || `Product #${item.product_id}`}
                </Text>
                {item.description ? (
                  <Text style={styles.itemSubtitle}>{item.description}</Text>
                ) : null}
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Qty</Text>
                  <Text style={styles.itemValue}>{item.quantity}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Rate</Text>
                  <Text style={styles.itemValue}>₦{item.rate}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>Amount</Text>
                  <Text style={styles.itemValueAmount}>
                    ₦{item.amount || 0}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items</Text>
          )}
        </View>

        {quotation.notes ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.value}>{quotation.notes}</Text>
          </View>
        ) : null}

        {quotation.terms_and_conditions ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.value}>{quotation.terms_and_conditions}</Text>
          </View>
        ) : null}

        <View style={styles.actionsSection}>
          {quotation.status === "draft" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("QuotationEdit", { id: quotation.id })
              }
              disabled={processing}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}

          {quotation.status === "draft" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.postButton]}
              onPress={() => handleAction("send")}
              disabled={processing}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
          ) : null}

          {quotation.status === "sent" ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAction("accept")}
                disabled={processing}>
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleAction("reject")}
                disabled={processing}>
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {quotation.status === "sent" || quotation.status === "accepted" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.convertButton]}
              onPress={() => handleAction("convert")}
              disabled={processing}>
              <Text style={styles.actionButtonText}>Convert</Text>
            </TouchableOpacity>
          ) : null}

          {quotation.status === "draft" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={processing}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
  itemSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
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
  editButton: {
    backgroundColor: "#fef3c7",
  },
  postButton: {
    backgroundColor: "#d1fae5",
  },
  acceptButton: {
    backgroundColor: "#d1fae5",
  },
  rejectButton: {
    backgroundColor: "#fee2e2",
  },
  convertButton: {
    backgroundColor: "#e0e7ff",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
});
