import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../navigation/types";
import { reconciliationService } from "../../features/accounting/reconciliation/services/reconciliationService";
import type {
  ReconciliationRecord,
  ReconciliationBankOption,
} from "../../features/accounting/reconciliation/types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function ReconciliationSection() {
  const navigation = useNavigation<NavigationProp>();
  const [reconciliations, setReconciliations] = useState<
    ReconciliationRecord[]
  >([]);
  const [bankMap, setBankMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const loadReconciliations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reconciliationService.list({
        page: 1,
        per_page: 2,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setReconciliations(response.reconciliations || []);
      const banks = (response.banks || []) as ReconciliationBankOption[];
      const nextMap = banks.reduce<Record<number, string>>((acc, bank) => {
        acc[bank.id] = bank.bank_name;
        return acc;
      }, {});
      setBankMap(nextMap);
    } catch {
      setReconciliations([]);
      setBankMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReconciliations();
    }, [loadReconciliations]),
  );

  const formatMonthYear = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const getStatusMeta = (record: ReconciliationRecord) => {
    const status = record.status?.toLowerCase();
    if (status === "completed") {
      return {
        icon: "✅",
        iconBg: "#d1fae5",
        text: "Fully reconciled",
        textColor: "#10b981",
        action: "View",
        actionBg: "#f3f4f6",
        actionColor: "#6b7280",
      };
    }
    return {
      icon: "⚠️",
      iconBg: "#fef3c7",
      text: `${record.unreconciled_transactions ?? 0} unreconciled transactions`,
      textColor: "#f59e0b",
      action: "Reconcile",
      actionBg: BRAND_COLORS.blue,
      actionColor: SEMANTIC_COLORS.white,
    };
  };

  const renderTitle = (record: ReconciliationRecord) => {
    const bankName =
      record.bank?.bank_name || bankMap[record.bank_id] || "Bank";
    const period = formatMonthYear(
      record.statement_end_date || record.reconciliation_date,
    );
    return period ? `${bankName} - ${period}` : bankName;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reconciliation</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ReconciliationHome")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {loading && reconciliations.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading reconciliations...</Text>
        </View>
      ) : reconciliations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No reconciliations yet.</Text>
        </View>
      ) : (
        reconciliations.map((record) => {
          const meta = getStatusMeta(record);
          return (
            <TouchableOpacity
              key={record.id}
              style={styles.reconCard}
              onPress={() =>
                navigation.navigate("ReconciliationShow", { id: record.id })
              }>
              <View style={styles.reconLeft}>
                <View
                  style={[styles.reconIcon, { backgroundColor: meta.iconBg }]}>
                  <Text style={styles.reconEmoji}>{meta.icon}</Text>
                </View>
                <View>
                  <Text style={styles.reconTitle}>{renderTitle(record)}</Text>
                  <Text style={[styles.reconStatus, { color: meta.textColor }]}>
                    {meta.text}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.reconButton,
                  { backgroundColor: meta.actionBg },
                ]}>
                <Text
                  style={[styles.reconButtonText, { color: meta.actionColor }]}>
                  {meta.action}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
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
  reconCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reconLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reconIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reconEmoji: {
    fontSize: 20,
  },
  reconTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  reconStatus: {
    fontSize: 12,
    color: "#f59e0b",
  },
  reconButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.blue,
  },
  reconButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
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
