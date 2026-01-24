import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import * as stockJournalService from "../services/stockJournalService";
import type { StockJournalEntry } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  InventoryStackParamList,
  "StockJournalDetail"
>;

export default function StockJournalDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [entry, setEntry] = useState<StockJournalEntry | null>(null);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const response = await stockJournalService.show(id);
      setEntry(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load entry", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!entry) return;

    Alert.alert(
      "Post Entry",
      "Are you sure you want to post this entry? This will finalize the stock movements.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Post",
          style: "default",
          onPress: async () => {
            try {
              setProcessing(true);
              await stockJournalService.post(id);
              showToast("Entry posted successfully", "success");
              loadEntry();
            } catch (error: any) {
              showToast(error.message || "Failed to post entry", "error");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = async () => {
    if (!entry) return;

    Alert.alert(
      "Cancel Entry",
      "Are you sure you want to cancel this entry? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);
              await stockJournalService.cancel(id);
              showToast("Entry cancelled successfully", "success");
              loadEntry();
            } catch (error: any) {
              showToast(error.message || "Failed to cancel entry", "error");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!entry) return;

    if (entry.status !== "draft") {
      showToast("Only draft entries can be deleted", "error");
      return;
    }

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);
              await stockJournalService.deleteEntry(id);
              showToast("Entry deleted successfully", "success");
              navigation.goBack();
            } catch (error: any) {
              showToast(error.message || "Failed to delete entry", "error");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "posted":
        return styles.statusBadgePosted;
      case "cancelled":
        return styles.statusBadgeCancelled;
      default:
        return styles.statusBadgeDraft;
    }
  };

  const getMovementTypeBadge = (movementType: "in" | "out") => {
    return movementType === "in" ? (
      <View style={styles.movementBadgeIn}>
        <Text style={styles.movementBadgeText}>IN</Text>
      </View>
    ) : (
      <View style={styles.movementBadgeOut}>
        <Text style={styles.movementBadgeText}>OUT</Text>
      </View>
    );
  };

  if (loading || !entry) {
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
          <Text style={styles.headerTitle}>Entry Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading entry...</Text>
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entry Information</Text>
            <View style={getStatusBadgeStyle(entry.status)}>
              <Text style={styles.statusBadgeText}>
                {entry.status_display || entry.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Journal Number</Text>
            <Text style={styles.value}>{entry.journal_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Entry Type</Text>
            <Text style={styles.value}>
              {entry.entry_type_display || entry.entry_type}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Journal Date</Text>
            <Text style={styles.value}>{entry.journal_date}</Text>
          </View>
          {entry.reference_number ? (
            <View style={styles.row}>
              <Text style={styles.label}>Reference Number</Text>
              <Text style={styles.value}>{entry.reference_number}</Text>
            </View>
          ) : null}
          {entry.narration ? (
            <View style={styles.row}>
              <Text style={styles.label}>Narration</Text>
              <Text style={styles.value}>{entry.narration}</Text>
            </View>
          ) : null}
        </View>

        {/* Items Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Items ({entry.total_items || entry.items?.length || 0})
          </Text>

          {entry.items && entry.items.length > 0 ? (
            entry.items.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemHeaderLeft}>
                    <Text style={styles.itemTitle}>
                      {item.product?.name || `Product #${item.product_id}`}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {item.product?.sku || "-"}
                    </Text>
                  </View>
                {getMovementTypeBadge(item.movement_type)}
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemLabel}>Quantity:</Text>
                    <Text style={styles.itemValue}>
                      {item.quantity}{" "}
                      {typeof item.product?.unit === "string"
                        ? item.product?.unit
                        : item.product?.unit?.name || "units"}
                    </Text>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemLabel}>Rate:</Text>
                    <Text style={styles.itemValue}>
                      ₦{item.rate.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <Text style={styles.itemLabel}>Amount:</Text>
                    <Text style={styles.itemValueAmount}>
                      ₦{item.amount.toLocaleString()}
                    </Text>
                  </View>
                  {item.batch_number ? (
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.itemLabel}>Batch:</Text>
                      <Text style={styles.itemValue}>{item.batch_number}</Text>
                    </View>
                  ) : null}
                  {item.remarks ? (
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.itemLabel}>Remarks:</Text>
                      <Text style={styles.itemValue}>{item.remarks}</Text>
                    </View>
                  ) : null}
                  {entry.status === "posted" &&
                  item.stock_before !== undefined &&
                  item.stock_after !== undefined ? (
                    <View style={styles.stockChangeBox}>
                      <Text style={styles.stockChangeText}>
                        Stock: {item.stock_before} → {item.stock_after}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items</Text>
          )}
        </View>

        {/* Stock Movements Section - Only show if posted */}
        {entry.status === "posted" &&
        entry.stock_movements &&
        entry.stock_movements.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Stock Movements ({entry.stock_movements.length})
            </Text>
            {entry.stock_movements.map((movement) => (
              <View key={movement.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listTitle}>{movement.product.name}</Text>
                  <Text style={styles.listSubtitle}>
                    {movement.product.sku} • {movement.reference}
                  </Text>
                </View>
                <Text style={styles.listMeta}>
                  {movement.quantity} {movement.product.unit}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Summary Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Items</Text>
            <Text style={styles.value}>
              {entry.total_items || entry.items?.length || 0}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.valueAmount}>
              ₦{entry.total_amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {entry.can_edit ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("StockJournalEdit", {
                  id: entry.id,
                })
              }
              disabled={processing}>
              <Text style={styles.actionButtonText}>✏️ Edit Entry</Text>
            </TouchableOpacity>
          ) : null}

          {entry.can_post ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.postButton]}
              onPress={handlePost}
              disabled={processing}>
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonTextWhite}>📮 Post Entry</Text>
              )}
            </TouchableOpacity>
          ) : null}

          {entry.can_cancel ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={processing}>
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonTextWhite}>
                  ❌ Cancel Entry
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          {entry.status === "draft" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={processing}>
              {processing ? (
                <ActivityIndicator color="#b91c1c" />
              ) : (
                <Text style={styles.deleteButtonText}>🗑️ Delete Entry</Text>
              )}
            </TouchableOpacity>
          ) : null}
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
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
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  sectionCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  valueAmount: {
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
    textAlign: "right",
  },
  statusBadgeDraft: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgePosted: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeCancelled: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f2937",
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  itemHeaderLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  movementBadgeIn: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  movementBadgeOut: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  movementBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1f2937",
  },
  itemDetails: {
    gap: 6,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  itemValue: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  itemValueAmount: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  stockChangeBox: {
    backgroundColor: "#dbeafe",
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  stockChangeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e40af",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  listSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  listMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde047",
  },
  postButton: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  cancelButton: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  actionButtonTextWhite: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b91c1c",
  },
});
