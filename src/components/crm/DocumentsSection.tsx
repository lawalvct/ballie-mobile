import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainTabParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

type DocumentsSectionProps = {
  invoiceCount: number;
  quotationCount: number;
  purchaseOrderCount: number;
  receiptCount: number;
  loading?: boolean;
};

export default function DocumentsSection({
  invoiceCount,
  quotationCount,
  purchaseOrderCount,
  receiptCount,
  loading = false,
}: DocumentsSectionProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  const displayCount = (value: number) => (loading ? "—" : String(value || 0));

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Documents & Transactions</Text>

      <View style={styles.documentsGrid}>
        <TouchableOpacity style={styles.docCard}>
          <View style={[styles.docIcon, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.docEmoji}>📄</Text>
          </View>
          <Text style={styles.docLabel}>Invoices</Text>
          <Text style={styles.docCount}>{displayCount(invoiceCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.docCard}
          onPress={() =>
            navigation.navigate("Accounting", {
              screen: "QuotationHome",
            })
          }>
          <View style={[styles.docIcon, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.docEmoji}>📝</Text>
          </View>
          <Text style={styles.docLabel}>Quotes</Text>
          <Text style={styles.docCount}>{displayCount(quotationCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.docCard}
          onPress={() =>
            navigation.navigate("Accounting", {
              screen: "PurchaseOrderHome",
            })
          }>
          <View style={[styles.docIcon, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.docEmoji}>📋</Text>
          </View>
          <Text style={styles.docLabel}>LPO</Text>
          <Text style={styles.docCount}>
            {displayCount(purchaseOrderCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.docCard}>
          <View style={[styles.docIcon, { backgroundColor: "#e0e7ff" }]}>
            <Text style={styles.docEmoji}>🧾</Text>
          </View>
          <Text style={styles.docLabel}>Receipts</Text>
          <Text style={styles.docCount}>{displayCount(receiptCount)}</Text>
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
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  docCard: {
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
  docIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  docEmoji: {
    fontSize: 28,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  docCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
  },
});
