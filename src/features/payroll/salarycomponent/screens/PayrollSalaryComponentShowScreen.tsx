import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { salaryComponentService } from "../services/salaryComponentService";
import type { PayrollSalaryComponent } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollSalaryComponentShow"
>;

export default function PayrollSalaryComponentShowScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [component, setComponent] = useState<PayrollSalaryComponent | null>(
    null,
  );

  useEffect(() => {
    loadComponent();
  }, [id]);

  const loadComponent = async () => {
    try {
      setLoading(true);
      const response = await salaryComponentService.show(id);
      setComponent(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load component", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Component",
      "Are you sure you want to delete this salary component?",
      async () => {
        try {
          await salaryComponentService.delete(id);
          showToast("Component deleted successfully", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(error.message || "Failed to delete component", "error");
        }
      },
      { destructive: true, confirmText: "Delete" },
    );
  };

  if (loading || !component) {
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
          <Text style={styles.headerTitle}>Component Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading component...</Text>
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
        <Text style={styles.headerTitle}>Component Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{component.name}</Text>
          <Text style={styles.sectionSubtitle}>Code: {component.code}</Text>

          {component.description ? (
            <Text style={styles.sectionDescription}>
              {component.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Type: {component.type}</Text>
            <Text style={styles.metaText}>
              Calc: {component.calculation_type}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Taxable: {component.is_taxable ? "Yes" : "No"}
            </Text>
            <Text style={styles.metaText}>
              Pensionable: {component.is_pensionable ? "Yes" : "No"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusBadge,
                component.is_active
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  component.is_active
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}>
                {component.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("PayrollSalaryComponentEdit", {
                id: component.id,
                onUpdated: loadComponent,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Edit Component</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleDelete}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Delete Component</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextActive: {
    color: "#059669",
  },
  statusTextInactive: {
    color: "#dc2626",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  secondaryBtn: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
});
