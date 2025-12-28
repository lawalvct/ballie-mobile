import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

export default function StoreSettings() {
  const settings = [
    {
      icon: "🏪",
      title: "Store Information",
      description: "Manage store name, logo, and contact details",
    },
    {
      icon: "📦",
      title: "Product Categories",
      description: "Configure product categories and attributes",
    },
    {
      icon: "💳",
      title: "Payment Methods",
      description: "Setup payment gateways and options",
    },
    {
      icon: "🚚",
      title: "Shipping & Delivery",
      description: "Configure shipping zones and rates",
    },
    {
      icon: "📧",
      title: "Email Templates",
      description: "Customize order confirmation emails",
    },
    {
      icon: "⚙️",
      title: "General Settings",
      description: "Currency, timezone, and other preferences",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Store Settings</Text>
      <Text style={styles.sectionSubtitle}>
        Configure your online store preferences
      </Text>

      <View style={styles.settingsGrid}>
        {settings.map((setting, index) => (
          <TouchableOpacity key={index} style={styles.settingCard}>
            <Text style={styles.settingIcon}>{setting.icon}</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>
                {setting.description}
              </Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  settingsGrid: {
    gap: 12,
  },
  settingCard: {
    flexDirection: "row",
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
  settingIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 24,
    color: "#d1d5db",
    fontWeight: "300",
  },
});
