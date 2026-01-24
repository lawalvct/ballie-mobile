import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { categoryService } from "../services/categoryService";
import type { Category } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "CategoryShow">;

interface CategoryChild {
  id: number;
  name: string;
  slug?: string;
}

interface CategoryProduct {
  id: number;
  name: string;
  sku?: string;
  sales_rate?: number;
}

interface CategoryShowResponse {
  category: Category;
  children?: CategoryChild[];
  products?: CategoryProduct[];
  products_count?: number;
  children_count?: number;
  descendants_count?: number;
}

export default function CategoryShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [children, setChildren] = useState<CategoryChild[]>([]);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [descendantsCount, setDescendantsCount] = useState(0);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = (await categoryService.show(id)) as CategoryShowResponse;
      setCategory(response.category || null);
      setChildren(response.children || []);
      setProducts(response.products || []);
      setProductsCount(
        response.products_count || response.products?.length || 0,
      );
      setChildrenCount(
        response.children_count || response.children?.length || 0,
      );
      setDescendantsCount(response.descendants_count || 0);
    } catch (error: any) {
      showToast(error.message || "Failed to load category", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!category) return;
    try {
      await categoryService.toggleStatus(category.id);
      showToast("Category status updated", "success");
      loadCategory();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  const handleDelete = () => {
    if (category?.can_delete === false) {
      showToast("Category cannot be deleted", "error");
      return;
    }

    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await categoryService.delete(id);
              showToast("Category deleted successfully", "success");
              navigation.goBack();
            } catch (error: any) {
              showToast(error.message || "Failed to delete category", "error");
            }
          },
        },
      ],
    );
  };

  if (loading || !category) {
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
          <Text style={styles.headerTitle}>Category Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Category Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{category.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Slug</Text>
            <Text style={styles.value}>{category.slug || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {category.status || (category.is_active ? "Active" : "Inactive")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Parent</Text>
            <Text style={styles.value}>
              {category.parent?.name || (category.parent_id ? "—" : "Root")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Full Path</Text>
            <Text style={styles.value}>{category.full_path || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sort Order</Text>
            <Text style={styles.value}>{category.sort_order ?? "-"}</Text>
          </View>
          {category.description ? (
            <View style={styles.row}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{category.description}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Counts</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Products</Text>
            <Text style={styles.value}>{productsCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Children</Text>
            <Text style={styles.value}>{childrenCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Descendants</Text>
            <Text style={styles.value}>{descendantsCount}</Text>
          </View>
        </View>

        {children.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Subcategories ({children.length})
            </Text>
            {children.map((child) => (
              <View key={child.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listTitle}>{child.name}</Text>
                  <Text style={styles.listSubtitle}>{child.slug || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Products ({productsCount})</Text>
          {products.length === 0 ? (
            <Text style={styles.emptyText}>No products linked</Text>
          ) : (
            products.slice(0, 10).map((product) => (
              <View key={product.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listTitle}>{product.name}</Text>
                  <Text style={styles.listSubtitle}>{product.sku || "-"}</Text>
                </View>
                <Text style={styles.listMeta}>{product.sales_rate ?? "-"}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() =>
              navigation.navigate("CategoryEdit", {
                id: category.id,
                onUpdated: () => loadCategory(),
              })
            }>
            <Text style={styles.actionButtonText}>✏️ Edit Category</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={handleToggleStatus}>
            <Text style={styles.actionButtonText}>
              {category.is_active ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              category.can_delete === false && styles.disabledButton,
            ]}
            onPress={handleDelete}
            disabled={category.can_delete === false}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Category</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  sectionCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  listSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  listMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde047",
  },
  toggleButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b91c1c",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
