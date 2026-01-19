import React, { useState, useEffect } from "react";
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
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { voucherTypeService } from "../services/voucherTypeService";
import { VoucherType } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "VoucherTypeShow"
>;

export default function VoucherTypeShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [voucherType, setVoucherType] = useState<VoucherType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadVoucherType();
  }, [id]);

  const loadVoucherType = async () => {
    try {
      setLoading(true);
      const data = await voucherTypeService.show(id);
      setVoucherType(data);
    } catch (error: any) {
      showToast(error.message || "Failed to load voucher type", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!voucherType) return;

    const action = voucherType.is_active ? "deactivate" : "activate";
    const confirmMessage = `Are you sure you want to ${action} this voucher type?`;

    Alert.alert("Confirm Action", confirmMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: action.charAt(0).toUpperCase() + action.slice(1),
        style: "destructive",
        onPress: async () => {
          try {
            setToggling(true);
            await voucherTypeService.toggle(voucherType.id);
            showToast(`✅ Voucher type ${action}d successfully`, "success");
            loadVoucherType(); // Refresh data
          } catch (error: any) {
            showToast(error.message || `Failed to ${action}`, "error");
          } finally {
            setToggling(false);
          }
        },
      },
    ]);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "accounting":
        return "#3b82f6";
      case "inventory":
        return "#10b981";
      case "pos":
        return "#f59e0b";
      case "payroll":
        return "#8b5cf6";
      case "ecommerce":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      accounting: "Accounting",
      inventory: "Inventory",
      pos: "POS",
      payroll: "Payroll",
      ecommerce: "Ecommerce",
    };
    return labels[category.toLowerCase()] || category;
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Voucher Type Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading voucher type...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!voucherType) {
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
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Voucher type not found</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher Type Details</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("VoucherTypeEdit", {
              id: voucherType.id,
              onUpdated: loadVoucherType,
            } as any)
          }
          style={styles.headerEditButton}>
          <Text style={styles.headerEditButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{voucherType.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Code</Text>
            <Text style={[styles.value, styles.monoValue]}>
              {voucherType.code}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Abbreviation</Text>
            <Text style={[styles.value, styles.monoValue]}>
              {voucherType.abbreviation}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Category</Text>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor:
                    getCategoryColor(voucherType.category) + "20",
                },
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(voucherType.category) },
                ]}>
                {getCategoryLabel(voucherType.category)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Type</Text>
            <View
              style={[
                styles.typeBadge,
                voucherType.is_system_defined
                  ? styles.typeBadgeSystem
                  : styles.typeBadgeCustom,
              ]}>
              <Text
                style={[
                  styles.typeText,
                  voucherType.is_system_defined
                    ? styles.typeTextSystem
                    : styles.typeTextCustom,
                ]}>
                {voucherType.is_system_defined ? "System Defined" : "Custom"}
              </Text>
            </View>
          </View>

          {voucherType.description && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{voucherType.description}</Text>
            </View>
          )}
        </View>

        {/* Numbering Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Numbering Configuration</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Numbering Method</Text>
            <Text style={styles.value}>
              {voucherType.numbering_method === "auto" ? "Automatic" : "Manual"}
            </Text>
          </View>

          {voucherType.prefix && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Prefix</Text>
              <Text style={[styles.value, styles.monoValue]}>
                {voucherType.prefix}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Starting Number</Text>
            <Text style={[styles.value, styles.monoValue]}>
              {voucherType.starting_number}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Number</Text>
            <Text style={[styles.value, styles.monoValue]}>
              {voucherType.current_number}
            </Text>
          </View>

          {voucherType.numbering_method === "auto" && voucherType.prefix && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Next Number</Text>
              <Text style={[styles.value, styles.monoValue, styles.nextNumber]}>
                {voucherType.prefix}
                {String(voucherType.current_number + 1).padStart(
                  String(voucherType.starting_number).length,
                  "0",
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Behavior Flags Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Behavior & Effects</Text>

          <View style={styles.flagsGrid}>
            <View style={styles.flagItem}>
              <View
                style={[
                  styles.flagIndicator,
                  voucherType.has_reference
                    ? styles.flagActive
                    : styles.flagInactive,
                ]}>
                <Text style={styles.flagIcon}>
                  {voucherType.has_reference ? "✓" : "✗"}
                </Text>
              </View>
              <Text style={styles.flagLabel}>Has Reference</Text>
            </View>

            <View style={styles.flagItem}>
              <View
                style={[
                  styles.flagIndicator,
                  voucherType.affects_inventory
                    ? styles.flagActive
                    : styles.flagInactive,
                ]}>
                <Text style={styles.flagIcon}>
                  {voucherType.affects_inventory ? "✓" : "✗"}
                </Text>
              </View>
              <Text style={styles.flagLabel}>Affects Inventory</Text>
            </View>

            <View style={styles.flagItem}>
              <View
                style={[
                  styles.flagIndicator,
                  voucherType.affects_cashbank
                    ? styles.flagActive
                    : styles.flagInactive,
                ]}>
                <Text style={styles.flagIcon}>
                  {voucherType.affects_cashbank ? "✓" : "✗"}
                </Text>
              </View>
              <Text style={styles.flagLabel}>Affects Cash/Bank</Text>
            </View>

            <View style={styles.flagItem}>
              <View
                style={[
                  styles.flagIndicator,
                  voucherType.is_active
                    ? styles.flagActive
                    : styles.flagInactive,
                ]}>
                <Text style={styles.flagIcon}>
                  {voucherType.is_active ? "✓" : "✗"}
                </Text>
              </View>
              <Text style={styles.flagLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Statistics Card */}
        {(voucherType as any).voucher_count !== undefined && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: "#3b82f6" }]}>
                <Text style={styles.statValue}>
                  {(voucherType as any).voucher_count || 0}
                </Text>
                <Text style={styles.statLabel}>Total Vouchers</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Vouchers Card */}
        {voucherType.recent_vouchers &&
          voucherType.recent_vouchers.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Vouchers</Text>

              {voucherType.recent_vouchers.map((voucher, index) => (
                <View
                  key={voucher.id}
                  style={[
                    styles.voucherItem,
                    index === voucherType.recent_vouchers!.length - 1 &&
                      styles.voucherItemLast,
                  ]}>
                  <View style={styles.voucherHeader}>
                    <Text style={styles.voucherNumber}>
                      {voucher.voucher_number}
                    </Text>
                    <Text style={styles.voucherDate}>{voucher.date}</Text>
                  </View>
                  <View style={styles.voucherDetails}>
                    {voucher.reference && (
                      <Text style={styles.voucherReference}>
                        Ref: {voucher.reference}
                      </Text>
                    )}
                    <Text style={styles.voucherAmount}>
                      ₦
                      {voucher.amount.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Timestamps Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timestamps</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {new Date(voucherType.created_at).toLocaleString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Updated</Text>
            <Text style={styles.value}>
              {new Date(voucherType.updated_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("VoucherTypeEdit", {
                id: voucherType.id,
                onUpdated: loadVoucherType,
              } as any)
            }>
            <Text style={styles.editButtonText}>Edit Voucher Type</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              voucherType.is_active
                ? styles.deactivateButton
                : styles.activateButton,
            ]}
            onPress={handleToggleStatus}
            disabled={toggling}>
            {toggling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.toggleButtonText}>
                {voucherType.is_active ? "Deactivate" : "Activate"}
              </Text>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: BRAND_COLORS.gold,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  headerEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerEditButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#374151",
    flex: 2,
    textAlign: "right",
  },
  monoValue: {
    fontFamily: "monospace",
    fontWeight: "600",
  },
  nextNumber: {
    color: BRAND_COLORS.gold,
    fontWeight: "bold",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-end",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-end",
  },
  typeBadgeSystem: {
    backgroundColor: "#dbeafe",
  },
  typeBadgeCustom: {
    backgroundColor: "#fef3c7",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeTextSystem: {
    color: "#1e40af",
  },
  typeTextCustom: {
    color: "#92400e",
  },
  flagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  flagItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  flagIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  flagActive: {
    backgroundColor: "#10b981",
  },
  flagInactive: {
    backgroundColor: "#e5e7eb",
  },
  flagIcon: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  flagLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  statCard: {
    width: "100%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  editButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  activateButton: {
    backgroundColor: "#10b981",
  },
  deactivateButton: {
    backgroundColor: "#dc2626",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  voucherItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  voucherItemLast: {
    borderBottomWidth: 0,
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  voucherNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    fontFamily: "monospace",
  },
  voucherDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  voucherDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voucherReference: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  voucherAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
});
