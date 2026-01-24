import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { InventoryStackParamList } from "../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import { categoryService } from "../../features/inventory/category/services/categoryService";
import type { Category } from "../../features/inventory/category/types";

export default function CategorySection() {
  const navigation =
    useNavigation<NativeStackNavigationProp<InventoryStackParamList>>();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.list({
        per_page: 4,
        sort: "products_count",
        direction: "desc",
      });
      setCategories(response.categories || []);
    } catch {
      setCategories([]);
    }
  };

  const colors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CategoryHome")}>
          <Text style={styles.viewAll}>Manage →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No categories available</Text>
          </View>
        ) : (
          categories.map((category, index) => {
            const color = colors[index % colors.length];
            const count =
              typeof category.products_count === "number"
                ? category.products_count
                : 0;

            return (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: color + "20" },
                  ]}>
                  <Text style={styles.categoryEmoji}>📦</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{count} items</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
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
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyState: {
    width: "100%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
