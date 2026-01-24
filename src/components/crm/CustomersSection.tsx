import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CRMStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { CustomerListItem } from "../../features/crm/customers/types";

type CustomersSectionProps = {
  customers: CustomerListItem[];
  loading?: boolean;
};

const formatCurrency = (value: number | string | null | undefined) => {
  let amount = 0;
  if (typeof value === "number") {
    amount = value;
  } else if (typeof value === "string") {
    amount = parseFloat(value) || 0;
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CustomersSection({
  customers,
  loading = false,
}: CustomersSectionProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<CRMStackParamList>>();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Customers</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CustomerHome")}>
          <Text style={styles.viewAll}>Manage →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading customers...</Text>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No customers yet</Text>
        </View>
      ) : (
        customers.map((customer) => {
          const name =
            customer.display_name ||
            [customer.first_name, customer.last_name]
              .filter(Boolean)
              .join(" ") ||
            "Unknown";
          const companyLabel =
            customer.company_name ||
            (customer.customer_type === "business" ? name : "Individual");
          const balanceValue =
            customer.outstanding_balance ??
            customer.ledger_account?.current_balance ??
            0;
          const isActive = customer.status !== "inactive";
          const statusLabel = isActive ? "Active" : "Inactive";
          const statusBg = isActive ? "#d1fae5" : "#fee2e2";
          const statusColor = isActive ? "#059669" : "#dc2626";
          const balanceColor =
            Number(balanceValue) === 0 ? "#10b981" : "#f59e0b";

          return (
            <TouchableOpacity key={customer.id} style={styles.customerCard}>
              <View style={styles.customerLeft}>
                <View
                  style={[styles.customerIcon, { backgroundColor: "#dbeafe" }]}>
                  <Text style={styles.customerEmoji}>👤</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{name}</Text>
                  <Text style={styles.customerCompany}>{companyLabel}</Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.customerRight}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={[styles.balanceValue, { color: balanceColor }]}>
                  ₦{formatCurrency(balanceValue)}
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
  emptyState: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
  customerCard: {
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
  customerLeft: {
    flexDirection: "row",
    flex: 1,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  customerEmoji: {
    fontSize: 24,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  customerCompany: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  customerRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
