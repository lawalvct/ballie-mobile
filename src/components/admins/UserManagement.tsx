import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function UserManagement() {
  const actions = [
    {
      icon: "➕",
      title: "Add User",
      description: "Create new user account",
      color: "#10b981",
    },
    {
      icon: "👥",
      title: "User List",
      description: "View all system users",
      color: "#3b82f6",
    },
    {
      icon: "🎭",
      title: "Manage Roles",
      description: "Configure user roles",
      color: "#8b5cf6",
    },
    {
      icon: "🔒",
      title: "Permissions",
      description: "Set access permissions",
      color: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>User Management</Text>

      <View style={styles.actionGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionCard}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: action.color + "20" },
              ]}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity>
        <LinearGradient
          colors={[BRAND_COLORS.gold, "#c9a854"]}
          style={styles.bulkButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.bulkButtonText}>📤 Bulk Import Users</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  bulkButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bulkButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
});
