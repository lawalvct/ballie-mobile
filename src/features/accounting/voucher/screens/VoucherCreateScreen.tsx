import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AccountingStackParamList } from "../../../../navigation/types";

type Props = NativeStackScreenProps<AccountingStackParamList, "VoucherCreate">;

// Voucher types that users can create
const VOUCHER_TYPES = [
  {
    id: 1,
    code: "SI",
    name: "Sales Invoice",
    emoji: "📄",
    color: "#d1fae5",
    description: "Record sales transactions",
  },
  {
    id: 2,
    code: "PI",
    name: "Purchase Invoice",
    emoji: "🧾",
    color: "#fee2e2",
    description: "Record purchase transactions",
  },
  {
    id: 3,
    code: "JE",
    name: "Journal Entry",
    emoji: "📝",
    color: "#e0e7ff",
    description: "Manual accounting entries",
  },
  {
    id: 4,
    code: "PE",
    name: "Payment Entry",
    emoji: "💳",
    color: "#ddd6fe",
    description: "Record payments made",
  },
  {
    id: 5,
    code: "RE",
    name: "Receipt",
    emoji: "💰",
    color: "#dcfce7",
    description: "Record receipts received",
  },
  {
    id: 6,
    code: "CN",
    name: "Contra",
    emoji: "🔄",
    color: "#fef9c3",
    description: "Bank to bank transfers",
  },
  {
    id: 7,
    code: "CR",
    name: "Credit Note",
    emoji: "📉",
    color: "#fecaca",
    description: "Sales returns and adjustments",
  },
  {
    id: 8,
    code: "DN",
    name: "Debit Note",
    emoji: "📈",
    color: "#fed7aa",
    description: "Purchase returns and adjustments",
  },
];

export default function VoucherCreateScreen({ navigation }: Props) {
  const handleVoucherTypeSelect = (voucherType: (typeof VOUCHER_TYPES)[0]) => {
    // TODO: Navigate to the actual form screen with the selected type
    // For now, we'll just show which type was selected
    console.log("Selected voucher type:", voucherType);
    // navigation.navigate('VoucherForm', { voucherType: voucherType.code });
  };

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
        <Text style={styles.headerTitle}>Create Voucher</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Select Voucher Type</Text>
          <Text style={styles.instructionsText}>
            Choose the type of voucher you want to create
          </Text>
        </View>

        {/* Voucher Types Grid */}
        <View style={styles.vouchersGrid}>
          {VOUCHER_TYPES.map((voucherType) => (
            <TouchableOpacity
              key={voucherType.id}
              style={styles.voucherCard}
              onPress={() => handleVoucherTypeSelect(voucherType)}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.voucherIcon,
                  { backgroundColor: voucherType.color },
                ]}>
                <Text style={styles.voucherEmoji}>{voucherType.emoji}</Text>
              </View>
              <Text style={styles.voucherLabel}>{voucherType.name}</Text>
              <Text style={styles.voucherCode}>{voucherType.code}</Text>
              <Text style={styles.voucherDescription}>
                {voucherType.description}
              </Text>
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  instructionsContainer: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  voucherEmoji: {
    fontSize: 32,
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
    marginBottom: 6,
  },
  voucherDescription: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 14,
  },
});
