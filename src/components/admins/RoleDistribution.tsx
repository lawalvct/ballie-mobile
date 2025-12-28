import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function RoleDistribution() {
  const roles = [
    {
      role: "Owner",
      users: 5,
      color: "#3c2c64",
      description: "Full system access",
    },
    {
      role: "Admin",
      users: 12,
      color: "#10b981",
      description: "Administrative privileges",
    },
    {
      role: "Manager",
      users: 18,
      color: "#3b82f6",
      description: "Department management",
    },
    {
      role: "Accountant",
      users: 8,
      color: "#f59e0b",
      description: "Financial records access",
    },
    {
      role: "Sales",
      users: 24,
      color: "#8b5cf6",
      description: "Sales operations",
    },
    {
      role: "Cashier",
      users: 20,
      color: "#ec4899",
      description: "POS and transactions",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Role Distribution</Text>
      <Text style={styles.sectionSubtitle}>
        User distribution across system roles
      </Text>

      <View style={styles.roleGrid}>
        {roles.map((item, index) => (
          <View key={index} style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View
                style={[styles.roleIndicator, { backgroundColor: item.color }]}
              />
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{item.role}</Text>
                <Text style={styles.roleDescription}>{item.description}</Text>
              </View>
            </View>
            <View style={styles.userCount}>
              <Text style={styles.userNumber}>{item.users}</Text>
              <Text style={styles.userLabel}>users</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  roleGrid: {
    gap: 12,
  },
  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roleIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 14,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  userCount: {
    alignItems: "center",
    minWidth: 60,
  },
  userNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  userLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
});
