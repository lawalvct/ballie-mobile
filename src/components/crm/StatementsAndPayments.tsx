import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function StatementsAndPayments() {
  return (
    <View style={styles.section}>
      {/* Statements Section */}
      <View style={styles.subsection}>
        <Text style={styles.sectionTitle}>Statements</Text>

        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.menuEmoji}>📊</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Customer Statement</Text>
            <Text style={styles.menuSubtitle}>
              View customer account history
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.menuIcon, { backgroundColor: "#e0e7ff" }]}>
            <Text style={styles.menuEmoji}>📈</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Vendor Statement</Text>
            <Text style={styles.menuSubtitle}>View vendor account history</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Payments Section */}
      <View style={styles.subsection}>
        <Text style={styles.sectionTitle}>Payments</Text>

        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.menuIcon, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.menuEmoji}>💰</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Record Payment</Text>
            <Text style={styles.menuSubtitle}>
              Receive payment from customer
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.menuIcon, { backgroundColor: "#fee2e2" }]}>
            <Text style={styles.menuEmoji}>💸</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Make Payment</Text>
            <Text style={styles.menuSubtitle}>Pay vendor or supplier</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.menuIcon, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.menuEmoji}>🔔</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Payment Reminder</Text>
            <Text style={styles.menuSubtitle}>Send reminders to customers</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Payments */}
      <View style={styles.subsection}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>

        <View style={styles.paymentCard}>
          <View style={styles.paymentLeft}>
            <View style={[styles.paymentIcon, { backgroundColor: "#d1fae5" }]}>
              <Text style={styles.paymentEmoji}>💰</Text>
            </View>
            <View>
              <Text style={styles.paymentCustomer}>John Doe</Text>
              <Text style={styles.paymentDate}>Today, 2:30 PM</Text>
            </View>
          </View>
          <Text style={[styles.paymentAmount, { color: "#10b981" }]}>
            +₦450,000
          </Text>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.paymentLeft}>
            <View style={[styles.paymentIcon, { backgroundColor: "#fee2e2" }]}>
              <Text style={styles.paymentEmoji}>💸</Text>
            </View>
            <View>
              <Text style={styles.paymentCustomer}>Global Supplies Inc</Text>
              <Text style={styles.paymentDate}>Yesterday, 11:45 AM</Text>
            </View>
          </View>
          <Text style={[styles.paymentAmount, { color: "#ef4444" }]}>
            -₦280,000
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  subsection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
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
  paymentCard: {
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
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentEmoji: {
    fontSize: 20,
  },
  paymentCustomer: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
