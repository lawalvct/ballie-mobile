import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Text,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import VoucherStats from "../components/VoucherStats";
import VoucherFilters from "../components/VoucherFilters";
import { voucherService } from "../services/voucherService";
import {
  Voucher,
  ListParams,
  PaginationInfo,
  Statistics,
  VoucherType,
} from "../types";

type Props = NativeStackScreenProps<AccountingStackParamList, "VoucherHome">;

function getTypeColor(code: string): string {
  const colors: Record<string, string> = {
    JV: "#8b5cf6", // purple
    PV: "#ef4444", // red
    RV: "#10b981", // green
    CV: "#06b6d4", // cyan
    CN: "#f97316", // orange
    DN: "#ec4899", // pink
  };
  return colors[code] || "#6b7280";
}

export default function VoucherHomeScreen({ navigation }: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);

  const [filters, setFilters] = useState<ListParams>({
    page: 1,
    per_page: 20,
    sort_by: "voucher_date",
    sort_direction: "desc",
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    loadVoucherTypes();
  }, []);

  const loadVoucherTypes = async () => {
    try {
      const formData = await voucherService.getFormData();
      setVoucherTypes(formData.voucher_types || []);
    } catch (error: any) {
      console.error("Error loading voucher types:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Loading vouchers with filters:", filters);
      const response = await voucherService.list(filters);

      console.log("Raw response:", JSON.stringify(response, null, 2));
      console.log("Vouchers count:", response?.vouchers?.length || 0);

      setVouchers(response.vouchers || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      console.error("Error loading vouchers:", error);
      console.error("Error response:", error.response?.data);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load vouchers",
        [{ text: "OK" }]
      );
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

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleVoucherPress = (id: number) => {
    navigation.navigate("VoucherShow", { id });
  };

  const handleCreate = () => {
    navigation.navigate("VoucherCreate", {
      onCreated: () => loadData(),
    });
  };

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
          <Text style={styles.headerTitle}>Vouchers</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading vouchers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      {/* Add New Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>+ Add New Voucher</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <VoucherStats statistics={statistics} />

      {/* Filters Section */}
      <VoucherFilters
        filters={filters}
        setFilters={setFilters}
        voucherTypes={voucherTypes}
      />
    </>
  );

  const renderVoucherItem = ({ item }: { item: Voucher }) => (
    <TouchableOpacity
      style={styles.voucherCard}
      onPress={() => handleVoucherPress(item.id)}>
      <View style={styles.voucherHeader}>
        <View style={styles.voucherTypeContainer}>
          <View
            style={[
              styles.voucherTypeBadge,
              { backgroundColor: getTypeColor(item.voucher_type_code) },
            ]}>
            <Text style={styles.voucherTypeCode}>{item.voucher_type_code}</Text>
          </View>
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherNumber}>{item.voucher_number}</Text>
            <Text style={styles.voucherTypeName}>{item.voucher_type_name}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "posted" ? styles.statusPosted : styles.statusDraft,
          ]}>
          <Text
            style={[
              styles.statusText,
              item.status === "posted"
                ? styles.statusPostedText
                : styles.statusDraftText,
            ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.voucherBody}>
        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Date:</Text>
          <Text style={styles.voucherValue}>
            {new Date(item.voucher_date).toLocaleDateString()}
          </Text>
        </View>
        {item.narration && (
          <View style={styles.voucherRow}>
            <Text style={styles.voucherLabel}>Narration:</Text>
            <Text style={styles.voucherValue} numberOfLines={2}>
              {item.narration}
            </Text>
          </View>
        )}
        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Amount:</Text>
          <Text style={styles.voucherAmount}>
            ₦{item.total_amount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            pagination.current_page === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}>
          <Text
            style={[
              styles.paginationButtonText,
              pagination.current_page === 1 &&
                styles.paginationButtonTextDisabled,
            ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {pagination.current_page} of {pagination.last_page}
          {"\n"}
          Showing {pagination.from} to {pagination.to} of {pagination.total}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            pagination.current_page === pagination.last_page &&
              styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}>
          <Text
            style={[
              styles.paginationButtonText,
              pagination.current_page === pagination.last_page &&
                styles.paginationButtonTextDisabled,
            ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No vouchers found</Text>
      <Text style={styles.emptySubtext}>
        Create your first voucher to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVoucherItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
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
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    flexGrow: 1,
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
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  voucherCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  voucherTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  voucherTypeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  voucherTypeCode: {
    fontSize: 14,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  voucherTypeName: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPosted: {
    backgroundColor: "#d1fae5",
  },
  statusDraft: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPostedText: {
    color: "#065f46",
  },
  statusDraftText: {
    color: "#92400e",
  },
  voucherBody: {
    gap: 8,
  },
  voucherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  voucherLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginRight: 8,
  },
  voucherValue: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    flex: 1,
    textAlign: "right",
  },
  voucherAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: SEMANTIC_COLORS.white,
    marginTop: 8,
    marginBottom: 20,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.gold,
    minWidth: 90,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  paginationInfo: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
