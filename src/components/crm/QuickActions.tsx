import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import { voucherTypeService } from "../../features/accounting/vouchertype/services/voucherTypeService";

export default function QuickActions() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  const handleReceiptVoucher = async () => {
    try {
      const voucherTypes = await voucherTypeService.search("", "accounting");
      const receiptType = voucherTypes.find((type) => {
        const code = type.code?.toLowerCase() || "";
        const name = type.name?.toLowerCase() || "";
        return code.includes("receipt") || name.includes("receipt");
      });

      if (!receiptType) {
        Alert.alert(
          "Not found",
          "Receipt voucher type is not available for this company.",
          [{ text: "OK" }],
        );
        return;
      }

      navigation.navigate("Accounting", {
        screen: "VoucherForm",
        params: {
          voucherTypeId: receiptType.id,
          voucherTypeCode: receiptType.code,
          voucherTypeName: receiptType.name,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load voucher types",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() =>
            navigation.navigate("CRM", { screen: "CustomerCreate" })
          }>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#3b82f6" }]}>
            <Text style={styles.quickActionEmoji}>👥</Text>
          </View>
          <Text style={styles.quickActionLabel}>Add Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() =>
            navigation.navigate("CRM", { screen: "VendorCreate" })
          }>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#8b5cf6" }]}>
            <Text style={styles.quickActionEmoji}>🏪</Text>
          </View>
          <Text style={styles.quickActionLabel}>Add Vendor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() =>
            navigation.navigate("Accounting", {
              screen: "InvoiceCreate",
              params: { type: "sales" },
            })
          }>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#10b981" }]}>
            <Text style={styles.quickActionEmoji}>📄</Text>
          </View>
          <Text style={styles.quickActionLabel}>New Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleReceiptVoucher}>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#f59e0b" }]}>
            <Text style={styles.quickActionEmoji}>💰</Text>
          </View>
          <Text style={styles.quickActionLabel}>Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
});
