import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

type NavigationProp = NativeStackNavigationProp<MainTabParamList, "Inventory">;

export default function QuickActions() {
  const navigation = useNavigation<NavigationProp>();

  const handleAddProduct = () => {
    navigation.navigate("Inventory", {
      screen: "ProductCreate",
      params: {},
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleAddProduct}>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#10b981" }]}>
            <Text style={styles.quickActionEmoji}>➕</Text>
          </View>
          <Text style={styles.quickActionLabel}>Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#3b82f6" }]}>
            <Text style={styles.quickActionEmoji}>📤</Text>
          </View>
          <Text style={styles.quickActionLabel}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#8b5cf6" }]}>
            <Text style={styles.quickActionEmoji}>📊</Text>
          </View>
          <Text style={styles.quickActionLabel}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#f59e0b" }]}>
            <Text style={styles.quickActionEmoji}>🔔</Text>
          </View>
          <Text style={styles.quickActionLabel}>Stock Alert</Text>
        </TouchableOpacity>
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
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
  },
});
