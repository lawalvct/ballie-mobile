import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function CustomTabBar({ activeTab, onTabPress }: TabBarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "accounting", label: "Accounting", icon: "💰" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "crm", label: "CRM", icon: "👥" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}>
          <Text
            style={[styles.icon, activeTab === tab.id && styles.activeIcon]}>
            {tab.icon}
          </Text>
          <Text
            style={[styles.label, activeTab === tab.id && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#3c2c64",
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
    marginBottom: 4,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: "#a48cb4",
    fontWeight: "600",
  },
  activeLabel: {
    color: "#d1b05e",
    fontWeight: "bold",
  },
});
