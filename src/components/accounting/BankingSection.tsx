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
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { AccountingStackParamList } from "../../navigation/types";
import { bankService } from "../../features/accounting/bank/services/bankService";
import type { BankAccount } from "../../features/accounting/bank/types";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function BankingSection() {
  const navigation = useNavigation<NavigationProp>();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankService.list({
        page: 1,
        per_page: 2,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setBanks(response.banks || []);
    } catch {
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBanks();
    }, [loadBanks]),
  );

  const getCurrencySymbol = (currency?: string): string => {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency || "NGN"] || currency || "₦";
  };

  const formatAmount = (
    amount: number | string | null | undefined,
    currency?: string,
  ): string => {
    const num =
      typeof amount === "number" ? amount : amount ? Number(amount) : 0;
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${num.toLocaleString()}`;
  };

  const gradients = [
    ["#3b82f6", "#1d4ed8"],
    ["#10b981", "#059669"],
    ["#f59e0b", "#d97706"],
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Banking</Text>
        <TouchableOpacity onPress={() => navigation.navigate("BankHome")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {loading && banks.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading bank accounts...</Text>
        </View>
      ) : banks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No bank accounts yet.</Text>
        </View>
      ) : (
        banks.map((bank, index) => (
          <TouchableOpacity
            key={bank.id}
            style={styles.bankCard}
            onPress={() => navigation.navigate("BankShow", { id: bank.id })}>
            <LinearGradient
              colors={gradients[index % gradients.length]}
              style={styles.bankCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.bankCardHeader}>
                <Text style={styles.bankName}>
                  {bank.display_name || bank.bank_name}
                </Text>
                <Text style={styles.bankType}>
                  {bank.account_type_display || bank.account_type || "Account"}
                </Text>
              </View>
              <Text style={styles.bankBalance}>
                {formatAmount(bank.current_balance, bank.currency)}
              </Text>
              <Text style={styles.bankAccount}>
                {bank.masked_account_number || bank.account_number}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate("BankCreate")}>
        <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.menuEmoji}>🏦</Text>
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Add Bank Account</Text>
          <Text style={styles.menuSubtitle}>Connect a new bank account</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
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
  bankCard: {
    marginBottom: 12,
  },
  bankCardGradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  bankType: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  bankBalance: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  bankAccount: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1,
  },
  menuCard: {
    flexDirection: "row",
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
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
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
