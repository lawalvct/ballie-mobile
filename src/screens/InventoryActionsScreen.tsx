import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { InventoryStackParamList } from "../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

type Props = NativeStackScreenProps<
  InventoryStackParamList,
  "InventoryActions"
>;

type ActionCard = {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
};

type ActionSection = {
  title: string;
  icon: string;
  color: string;
  cards: ActionCard[];
};

const SECTIONS: ActionSection[] = [
  {
    title: "Product Management",
    icon: "📦",
    color: "#3b82f6",
    cards: [
      {
        title: "Add Product",
        subtitle: "Create new product",
        description: "Add new products to your inventory catalog.",
        color: "#3b82f6",
        accent: "#2563eb",
        icon: "➕",
      },
      {
        title: "View Products",
        subtitle: "Browse all products",
        description: "View and manage all your inventory products.",
        color: "#10b981",
        accent: "#059669",
        icon: "📋",
      },
      {
        title: "Bulk Import",
        subtitle: "Import products",
        description: "Import multiple products from CSV or Excel files.",
        color: "#8b5cf6",
        accent: "#7c3aed",
        icon: "📥",
      },
      {
        title: "Export Products",
        subtitle: "Download data",
        description: "Export product data to CSV or Excel format.",
        color: "#f59e0b",
        accent: "#d97706",
        icon: "📤",
      },
    ],
  },
  {
    title: "Stock Management",
    icon: "📊",
    color: "#10b981",
    cards: [
      {
        title: "Stock Adjustment",
        subtitle: "Physical Stock",
        description: "Adjust quantities to match physical stock.",
        color: "#10b981",
        accent: "#FFFFFF",
        icon: "⚖️",
      },
      {
        title: "Stock Movement",
        subtitle: "Track movements",
        description: "View all stock movements and transactions.",
        color: "#6366f1",
        accent: "#4f46e5",
        icon: "🔁",
      },
      {
        title: "Low Stock Alert",
        subtitle: "Monitor alerts",
        description: "View products with low stock levels.",
        color: "#f97316",
        accent: "#ea580c",
        icon: "🚨",
      },
      {
        title: "Stock Valuation",
        subtitle: "Calculate value",
        description: "Calculate total inventory valuation.",
        color: "#ef4444",
        accent: "#dc2626",
        icon: "💰",
      },
    ],
  },
  {
    title: "Categories & Units",
    icon: "🏷️",
    color: "#f97316",
    cards: [
      {
        title: "Categories",
        subtitle: "Manage categories",
        description: "Organize products into categories.",
        color: "#f97316",
        accent: "#ea580c",
        icon: "🗂️",
      },
      {
        title: "Units",
        subtitle: "Manage units",
        description: "Define measurement units for products.",
        color: "#14b8a6",
        accent: "#0d9488",
        icon: "📏",
      },
      {
        title: "Add Category",
        subtitle: "Create new category",
        description: "Create new product categories.",
        color: "#6366f1",
        accent: "#4f46e5",
        icon: "➕",
      },
      {
        title: "Add Unit",
        subtitle: "Create new unit",
        description: "Create new measurement units.",
        color: "#06b6d4",
        accent: "#0891b2",
        icon: "➕",
      },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: "📈",
    color: "#eab308",
    cards: [
      {
        title: "Inventory Report",
        subtitle: "Stock reports",
        description: "Generate comprehensive inventory reports.",
        color: "#eab308",
        accent: "#ca8a04",
        icon: "📊",
      },
      {
        title: "Movement Report",
        subtitle: "Track movements",
        description: "Analyze stock movement patterns.",
        color: "#8b5cf6",
        accent: "#7c3aed",
        icon: "🧭",
      },
    ],
  },
];

export default function InventoryActionsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Inventory Actions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View style={styles.section} key={section.title}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: section.color },
                ]}>
                <Text style={styles.sectionIconText}>{section.icon}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.cardsGrid}>
              {section.cards.map((card) => (
                <TouchableOpacity
                  key={card.title}
                  style={[styles.actionCard, { backgroundColor: card.color }]}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: card.accent },
                    ]}>
                    <Text style={styles.cardIcon}>{card.icon}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  actionCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardDescription: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
  },
});
