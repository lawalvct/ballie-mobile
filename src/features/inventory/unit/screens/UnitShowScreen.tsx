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
import { unitService } from "../services/unitService";
import type { Unit } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<InventoryStackParamList, "UnitShow">;

interface DerivedUnit {
  id: number;
  name: string;
  symbol: string;
  conversion_factor?: number;
}

interface UnitProduct {
  id: number;
  name: string;
  sku?: string;
  sales_rate?: number;
}

interface UnitShowResponse {
  unit: Unit;
  derived_units?: DerivedUnit[];
  products?: UnitProduct[];
  products_count?: number;
}

export default function UnitShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [derivedUnits, setDerivedUnits] = useState<DerivedUnit[]>([]);
  const [products, setProducts] = useState<UnitProduct[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);

  useEffect(() => {
    loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const response = (await unitService.show(id)) as UnitShowResponse;
      setUnit(response.unit || null);
      setDerivedUnits(response.derived_units || []);
      setProducts(response.products || []);
      setProductsCount(
        response.products_count || response.products?.length || 0,
      );
    } catch (error: any) {
      showToast(error.message || "Failed to load unit", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!unit) return;
    try {
      await unitService.toggleStatus(unit.id);
      showToast("Unit status updated", "success");
      loadUnit();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  const handleDelete = () => {
    if (unit?.can_delete === false) {
      showToast("Unit cannot be deleted", "error");
      return;
    }

    Alert.alert("Delete Unit", "Are you sure you want to delete this unit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await unitService.delete(id);
            showToast("Unit deleted successfully", "success");
            navigation.goBack();
          } catch (error: any) {
            showToast(error.message || "Failed to delete unit", "error");
          }
        },
      },
    ]);
  };

  if (loading || !unit) {
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
          <Text style={styles.headerTitle}>Unit Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading unit...</Text>
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
        <Text style={styles.headerTitle}>Unit Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{unit.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Symbol</Text>
            <Text style={styles.value}>{unit.symbol || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>
              {unit.type || (unit.is_base_unit ? "Base Unit" : "Derived Unit")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {unit.status || (unit.is_active ? "Active" : "Inactive")}
            </Text>
          </View>
          {unit.description ? (
            <View style={styles.row}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{unit.description}</Text>
            </View>
          ) : null}
        </View>

        {!unit.is_base_unit ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Conversion</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Base Unit ID</Text>
              <Text style={styles.value}>
                {unit.base_unit_id ? String(unit.base_unit_id) : "-"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Conversion Factor</Text>
              <Text style={styles.value}>{unit.conversion_factor ?? "-"}</Text>
            </View>
          </View>
        ) : null}

        {unit.is_base_unit && derivedUnits.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Derived Units ({derivedUnits.length})
            </Text>
            {derivedUnits.map((item) => (
              <View key={item.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listTitle}>{item.name}</Text>
                  <Text style={styles.listSubtitle}>{item.symbol}</Text>
                </View>
                <Text style={styles.listMeta}>
                  {item.conversion_factor ?? "-"}
                </Text>
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
              navigation.navigate("UnitEdit", {
                id: unit.id,
                onUpdated: () => loadUnit(),
              })
            }>
            <Text style={styles.actionButtonText}>✏️ Edit Unit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={handleToggleStatus}>
            <Text style={styles.actionButtonText}>
              {unit.is_active ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              unit.can_delete === false && styles.disabledButton,
            ]}
            onPress={handleDelete}
            disabled={unit.can_delete === false}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Unit</Text>
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
