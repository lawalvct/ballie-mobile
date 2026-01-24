import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

type Props = {
  totalAccounts?: number;
  pendingVouchers?: number;
  bankBalance?: number;
  needsReconciliation?: number;
};

const formatCurrency = (value?: number) => {
  const amount = typeof value === "number" ? value : 0;
  return amount.toLocaleString();
};

export default function AccountingOverview({
  totalAccounts = 0,
  pendingVouchers = 0,
  bankBalance = 0,
  needsReconciliation = 0,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accounting Overview</Text>

      <View style={styles.overviewGrid}>
        <LinearGradient
          colors={["#249484", "#69a2a4"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Total Accounts</Text>
          <Text style={styles.overviewValue}>{totalAccounts}</Text>
          <Text style={styles.overviewSubtext}>Active ledgers</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#ef4444", "#dc2626"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Pending Vouchers</Text>
          <Text style={styles.overviewValue}>{pendingVouchers}</Text>
          <Text style={styles.overviewSubtext}>Awaiting approval</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#d1b05e", "#c9a556"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Bank Balance</Text>
          <Text style={styles.overviewValue}>
            ₦{formatCurrency(bankBalance)}
          </Text>
          <Text style={styles.overviewSubtext}>Across 3 accounts</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#7e3af2", "#6d28d9"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Needs Reconciliation</Text>
          <Text style={styles.overviewValue}>{needsReconciliation}</Text>
          <Text style={styles.overviewSubtext}>Transactions</Text>
        </LinearGradient>
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
    color: "#3c2c64",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    minHeight: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  overviewSubtext: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
