import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { AccountingStackParamList } from "../../navigation/types";
import { voucherTypeService } from "../../features/accounting/vouchertype/services/voucherTypeService";
import type { VoucherType } from "../../features/accounting/vouchertype/types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function VouchersSection() {
  const navigation = useNavigation<NavigationProp>();
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVoucherTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await voucherTypeService.list({
        category: "accounting",
        per_page: 8,
        sort: "name",
        direction: "asc",
      });
      setVoucherTypes(response.data || []);
    } catch {
      setVoucherTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVoucherTypes();
    }, [loadVoucherTypes]),
  );

  const getVoucherMeta = (name: string) => {
    const map: Record<string, { emoji: string; color: string }> = {
      "Sales Invoice": { emoji: "📄", color: "#d1fae5" },
      "Purchase Invoice": { emoji: "🧾", color: "#fee2e2" },
      "Journal Entry": { emoji: "📝", color: "#e0e7ff" },
      "Payment Entry": { emoji: "💳", color: "#ddd6fe" },
      Receipt: { emoji: "💰", color: "#dcfce7" },
      Contra: { emoji: "🔄", color: "#fef9c3" },
      "Credit Note": { emoji: "📉", color: "#fecaca" },
      "Debit Note": { emoji: "📈", color: "#fed7aa" },
    };

    return map[name] || { emoji: "📄", color: "#e5e7eb" };
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vouchers</Text>
        <TouchableOpacity onPress={() => navigation.navigate("VoucherHome")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {loading && voucherTypes.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading vouchers...</Text>
        </View>
      ) : voucherTypes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No voucher types yet.</Text>
        </View>
      ) : (
        <View style={styles.vouchersGrid}>
          {voucherTypes.map((type) => {
            const meta = getVoucherMeta(type.name);

            return (
              <TouchableOpacity key={type.id} style={styles.voucherCard}>
                <View
                  style={[styles.voucherIcon, { backgroundColor: meta.color }]}>
                  <Text style={styles.voucherEmoji}>{meta.emoji}</Text>
                </View>
                <Text style={styles.voucherLabel}>{type.name}</Text>
                <Text style={styles.voucherCount}>
                  {type.voucher_count ?? 0}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND_COLORS.blue,
    fontWeight: "600",
  },
  vouchersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  voucherCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  voucherEmoji: {
    fontSize: 28,
  },
  voucherLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  voucherCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  emptyState: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
});
