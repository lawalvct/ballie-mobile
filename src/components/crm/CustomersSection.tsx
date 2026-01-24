import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CRMStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

const customers = [
  {
    id: 1,
    name: "John Doe",
    company: "Tech Solutions Ltd",
    balance: "₦450,000",
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    company: "Marketing Pro",
    balance: "₦0",
    status: "active",
  },
  {
    id: 3,
    name: "Mike Williams",
    company: "BuildCo Ltd",
    balance: "₦125,000",
    status: "overdue",
  },
];

export default function CustomersSection() {
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

      {customers.map((customer) => (
        <TouchableOpacity key={customer.id} style={styles.customerCard}>
          <View style={styles.customerLeft}>
            <View style={[styles.customerIcon, { backgroundColor: "#dbeafe" }]}>
              <Text style={styles.customerEmoji}>👤</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerCompany}>{customer.company}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      customer.status === "active" ? "#d1fae5" : "#fee2e2",
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        customer.status === "active" ? "#059669" : "#dc2626",
                    },
                  ]}>
                  {customer.status === "active" ? "Active" : "Overdue"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.customerRight}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: customer.balance === "₦0" ? "#10b981" : "#f59e0b" },
              ]}>
              {customer.balance}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
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
