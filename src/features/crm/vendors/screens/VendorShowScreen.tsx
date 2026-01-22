import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { vendorService } from "../services/vendorService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type { VendorDetails } from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "VendorShow"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function VendorShowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const vendorId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const response = await vendorService.show(vendorId);
      setVendor(response.vendor);
      setOutstandingBalance(Number(response.outstanding_balance || 0));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load vendor");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadVendor();
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await vendorService.toggleStatus(vendorId);
      await loadVendor();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  };

  if (loading) {
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
          <Text style={styles.title}>Vendor Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading vendor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Vendor not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    vendor.display_name ||
    vendor.company_name ||
    `${vendor.first_name || ""} ${vendor.last_name || ""}`.trim() ||
    "Unnamed Vendor";

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
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{displayName}</Text>
            <View
              style={[
                styles.statusBadge,
                vendor.status === "active"
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}>
              <Text style={styles.statusText}>
                {vendor.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {vendor.vendor_type === "business"
              ? "🏢 Business"
              : "👤 Individual"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Outstanding Payable</Text>
          <Text style={styles.balanceValue}>
            ₦{outstandingBalance.toLocaleString()}
          </Text>
        </View>

        {/* Vendor Information (Business only) */}
        {vendor.vendor_type === "business" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏢</Text>
              <Text style={styles.sectionTitle}>Business Information</Text>
            </View>
            {vendor.tax_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tax ID / TIN</Text>
                <Text style={styles.infoText}>{vendor.tax_id}</Text>
              </View>
            )}
            {vendor.registration_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registration No.</Text>
                <Text style={styles.infoText}>
                  {vendor.registration_number}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📞</Text>
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoText}>{vendor.email || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoText}>{vendor.phone || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoText}>{vendor.mobile || "-"}</Text>
          </View>
          {vendor.website && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoText}>{vendor.website}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📍</Text>
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Street</Text>
            <Text style={styles.infoText}>{vendor.address_line1 || "-"}</Text>
          </View>
          {vendor.address_line2 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}></Text>
              <Text style={styles.infoText}>{vendor.address_line2}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City/State</Text>
            <Text style={styles.infoText}>
              {vendor.city || ""} {vendor.state || "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoText}>{vendor.country || "-"}</Text>
          </View>
        </View>

        {/* Banking Information */}
        {(vendor.bank_name ||
          vendor.bank_account_number ||
          vendor.bank_account_name) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏦</Text>
              <Text style={styles.sectionTitle}>Banking Information</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank Name</Text>
              <Text style={styles.infoText}>{vendor.bank_name || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoText}>
                {vendor.bank_account_number || "-"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Name</Text>
              <Text style={styles.infoText}>
                {vendor.bank_account_name || "-"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💰</Text>
            <Text style={styles.sectionTitle}>Financial Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency</Text>
            <Text style={styles.infoText}>{vendor.currency || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Terms</Text>
            <Text style={styles.infoText}>{vendor.payment_terms || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Credit Limit</Text>
            <Text style={styles.infoText}>
              {vendor.credit_limit
                ? `₦${Number(vendor.credit_limit).toLocaleString()}`
                : "-"}
            </Text>
          </View>
        </View>

        {/* Ledger Account Info */}
        {vendor.ledger_account && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📊</Text>
              <Text style={styles.sectionTitle}>Ledger Account</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Name</Text>
              <Text style={styles.infoText}>{vendor.ledger_account.name}</Text>
            </View>
            {vendor.ledger_account.current_balance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Balance</Text>
                <Text style={styles.infoText}>
                  ₦
                  {Number(
                    vendor.ledger_account.current_balance,
                  ).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("VendorEdit", { id: vendorId })}>
            <Text style={styles.primaryBtnIcon}>✏️</Text>
            <Text style={styles.primaryBtnText}>Edit Vendor</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Purchase orders feature is under development",
                );
              }}>
              <Text style={styles.secondaryBtnIcon}>🛒</Text>
              <Text style={styles.secondaryBtnText}>Purchase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                vendor.status === "inactive"
                  ? styles.activateBtn
                  : styles.deactivateBtn,
              ]}
              onPress={handleToggleStatus}>
              <Text style={styles.secondaryBtnIcon}>
                {vendor.status === "inactive" ? "✅" : "🚫"}
              </Text>
              <Text
                style={[
                  styles.secondaryBtnText,
                  vendor.status === "inactive"
                    ? styles.activateBtnText
                    : styles.deactivateBtnText,
                ]}>
                {vendor.status === "inactive" ? "Activate" : "Deactivate"}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerContent: {
    marginTop: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  balanceCard: {
    backgroundColor: "#ef4444",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryBtnText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  secondaryBtnText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "600",
  },
  activateBtn: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  activateBtnText: {
    color: "#16a34a",
  },
  deactivateBtn: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  deactivateBtnText: {
    color: "#dc2626",
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
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
  },
});
