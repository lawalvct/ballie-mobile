import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { vendorService } from "../services/vendorService";
import VendorStats from "../components/VendorStats";
import VendorFilters from "../components/VendorFilters";
import VendorList from "../components/VendorList";
import type { CRMStackParamList } from "../../../../navigation/types";
import type {
  VendorListItem,
  VendorListParams,
  VendorStatistics,
  VendorListResponse,
} from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<CRMStackParamList, "VendorHome">;

export default function VendorHomeScreen({ navigation }: Props) {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<VendorStatistics | null>(null);
  const [pagination, setPagination] = useState<VendorListResponse | null>(null);

  const [filters, setFilters] = useState<VendorListParams>({
    sort: "created_at",
    direction: "desc",
    page: 1,
    per_page: 15,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await vendorService.list(filters);
      setVendors(response.data || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load vendors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadData();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await vendorService.toggleStatus(id);
      showToast("✅ Status updated", "success");
      loadData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  };

  const handleVendorPress = (id: number) => {
    navigation.navigate("VendorShow", { id });
  };

  // Loading State
  if (loading && !refreshing) {
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
          <Text style={styles.headerTitle}>Vendors</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading vendors...</Text>
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
        <Text style={styles.headerTitle}>Vendors</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("VendorCreate")}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Add Vendor</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("VendorStatements")}
              activeOpacity={0.8}>
              <Text style={styles.secondaryBtnIcon}>📄</Text>
              <Text style={styles.secondaryBtnText}>Statements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Exports feature is under development",
                );
              }}
              activeOpacity={0.8}>
              <Text style={styles.secondaryBtnIcon}>📤</Text>
              <Text style={styles.secondaryBtnText}>Exports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <VendorStats statistics={statistics} />

        {/* Filters */}
        <VendorFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* List */}
        <VendorList
          vendors={vendors}
          pagination={pagination}
          onVendorPress={handleVendorPress}
          onToggleStatus={handleToggleStatus}
          onPageChange={handlePageChange}
        />
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
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
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
