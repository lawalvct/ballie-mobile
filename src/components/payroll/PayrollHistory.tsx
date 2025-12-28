import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function PayrollHistory() {
  const history = [
    {
      month: "December 2025",
      employees: 248,
      amount: "₦18,450,000",
      status: "Processed",
      date: "25 Dec 2025",
    },
    {
      month: "November 2025",
      employees: 245,
      amount: "₦17,890,000",
      status: "Processed",
      date: "25 Nov 2025",
    },
    {
      month: "October 2025",
      employees: 242,
      amount: "₦17,650,000",
      status: "Processed",
      date: "25 Oct 2025",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Payroll History</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {history.map((item, index) => (
        <View key={index} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.month}>{item.month}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.historyDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Employees</Text>
              <Text style={styles.detailValue}>{item.employees}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={styles.detailValue}>{item.amount}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Processed Date</Text>
              <Text style={styles.detailValue}>{item.date}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  header: {
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
    fontSize: 13,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  month: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
});
