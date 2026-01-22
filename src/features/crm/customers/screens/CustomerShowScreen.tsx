import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { customerService } from "../services/customerService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type { CustomerDetails } from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "CustomerShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function CustomerShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const customerId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerService.show(customerId);
      setCustomer(response.customer);
      setOutstandingBalance(Number(response.outstanding_balance || 0));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load customer");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await customerService.toggleStatus(customerId);
      await loadCustomer();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  const displayName =
    customer.display_name ||
    customer.company_name ||
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
    "Unnamed Customer";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{displayName}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.infoText}>{customer.email || "-"}</Text>
          <Text style={styles.infoText}>
            {customer.phone || customer.mobile || "-"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.infoText}>{customer.address_line1 || "-"}</Text>
          <Text style={styles.infoText}>
            {customer.city || ""} {customer.state || ""}
          </Text>
          <Text style={styles.infoText}>{customer.country || ""}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial</Text>
          <Text style={styles.infoText}>
            Outstanding Balance: ₦{outstandingBalance.toLocaleString()}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("CustomerEdit", { id: customerId })
            }>
            <Text style={styles.primaryBtnText}>Edit Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation.navigate("CustomerStatementDetail", { id: customerId })
            }>
            <Text style={styles.secondaryBtnText}>View Statement</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleToggleStatus}>
          <Text style={styles.toggleButtonText}>
            {customer.status === "inactive" ? "Activate" : "Deactivate"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  content: { flex: 1 },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  infoText: { fontSize: 14, color: "#374151", marginBottom: 6 },
  actionsRow: { paddingHorizontal: 20, marginTop: 20, gap: 12 },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryBtnText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fee2e2",
  },
  toggleButtonText: { color: "#b91c1c", fontSize: 14, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6b7280" },
  errorText: { fontSize: 16, color: "#ef4444" },
});
