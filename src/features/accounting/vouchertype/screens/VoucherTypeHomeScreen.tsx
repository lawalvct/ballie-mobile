import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS } from "../../../../theme/colors";
import VoucherTypeStats from "../components/VoucherTypeStats";
import VoucherTypeFilters from "../components/VoucherTypeFilters";
import VoucherTypeList from "../components/VoucherTypeList";
import { voucherTypeService } from "../services/voucherTypeService";
import { VoucherType, ListParams, PaginationInfo, Statistics } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "VoucherTypeHome"
>;

export default function VoucherTypeHomeScreen({ navigation }: Props) {
  // State
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ListParams>({
    sort: "name",
    direction: "asc",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await voucherTypeService.list(filters);

      setVoucherTypes(response.data || []);
      setPagination({
        current_page: response.current_page || 1,
        per_page: response.per_page || 15,
        total: response.total || 0,
        last_page: response.last_page || 1,
        from: response.from || 0,
        to: response.to || 0,
      });
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load voucher types", "error");
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
    loadData();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await voucherTypeService.toggle(id);
      showToast("✅ Status updated successfully", "success");
      loadData();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  // Targeted update for edit (no full reload)
  const handleItemUpdated = async (id: number) => {
    try {
      const updated = await voucherTypeService.show(id);
      setVoucherTypes((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      showToast("✅ Updated successfully", "success");
    } catch (_error) {
      // Fallback to full reload if fetch fails
      loadData();
    }
  };

  // Full reload for create
  const handleItemCreated = () => {
    loadData();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voucher Types</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading voucher types...</Text>
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

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher Types</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          {/* Primary Action - Create */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("VoucherTypeCreate", {
                onCreated: handleItemCreated,
              } as any)
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Create New Voucher Type</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <VoucherTypeStats statistics={statistics} />

        {/* Filters Section */}
        <VoucherTypeFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* Voucher Type List */}
        <VoucherTypeList
          voucherTypes={voucherTypes}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
          onItemUpdated={handleItemUpdated}
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: BRAND_COLORS.gold,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    letterSpacing: 0.5,
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
});
