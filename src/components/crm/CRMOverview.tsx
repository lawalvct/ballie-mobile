import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";

type CRMOverviewProps = {
  totalCustomers: number;
  totalVendors: number;
  pendingInvoices: number;
  outstandingReceivable: number;
  loading?: boolean;
};

const formatCurrency = (value: number | null | undefined) => {
  const amount = typeof value === "number" ? value : 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CRMOverview({
  totalCustomers,
  totalVendors,
  pendingInvoices,
  outstandingReceivable,
  loading = false,
}: CRMOverviewProps) {
  const customerValue = loading ? "—" : String(totalCustomers || 0);
  const vendorValue = loading ? "—" : String(totalVendors || 0);
  const pendingValue = loading ? "—" : String(pendingInvoices || 0);
  const outstandingValue = loading
    ? "—"
    : `₦${formatCurrency(outstandingReceivable)}`;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>CRM Overview</Text>

      <View style={styles.overviewGrid}>
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Total Customers</Text>
          <Text style={styles.overviewValue}>{customerValue}</Text>
          <Text style={styles.overviewSubtext}>Active clients</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Vendors</Text>
          <Text style={styles.overviewValue}>{vendorValue}</Text>
          <Text style={styles.overviewSubtext}>Suppliers</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Pending Invoices</Text>
          <Text style={styles.overviewValue}>{pendingValue}</Text>
          <Text style={styles.overviewSubtext}>Awaiting payment</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#f59e0b", "#d97706"]}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.overviewLabel}>Outstanding</Text>
          <Text style={styles.overviewValue}>{outstandingValue}</Text>
          <Text style={styles.overviewSubtext}>Receivables</Text>
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
