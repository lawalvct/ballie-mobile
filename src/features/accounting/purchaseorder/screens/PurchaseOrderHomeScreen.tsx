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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { purchaseOrderService } from "../services/purchaseOrderService";
import type {
  PurchaseOrder,
  PurchaseOrderListParams,
  PurchaseOrderStatistics,
  PurchaseOrderPagination,
} from "../types";
import { Picker } from "@react-native-picker/picker";

type NavigationProp = NativeStackNavigationProp<AccountingStackParamList>;

export default function PurchaseOrderHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [statistics, setStatistics] = useState<PurchaseOrderStatistics | null>(
    null,
  );
  const [pagination, setPagination] = useState<PurchaseOrderPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });

  const [filters, setFilters] = useState<PurchaseOrderListParams>({
    search: "",
    status: "",
    page: 1,
    per_page: 20,
    sort: "lpo_date",
    direction: "desc",
  });

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.list(filters);
      setOrders(response.data || []);
      setPagination({
        current_page: response.pagination.current_page,
        last_page: response.pagination.last_page,
        per_page: response.pagination.per_page,
        total: response.pagination.total,
        from: response.pagination.from ?? 0,
        to: response.pagination.to ?? 0,
      });
      setStatistics(response.statistics || null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchText.trim(),
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: keyof PurchaseOrderListParams,
    value: any,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "#dbeafe";
      case "confirmed":
        return "#d1fae5";
      case "received":
        return "#e0e7ff";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "sent":
        return "#2563eb";
      case "confirmed":
        return "#059669";
      case "received":
        return "#4338ca";
      default:
        return "#6b7280";
    }
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "₦0";
    return `₦${value.toLocaleString()}`;
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase Orders</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          <Text style={styles.loadingText}>Loading purchase orders...</Text>
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
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.darkPurple]}
          />
        }>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("PurchaseOrderCreate")}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>Create LPO</Text>
          </TouchableOpacity>
        </View>

        {statistics && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.sent}</Text>
                <Text style={styles.statLabel}>Sent</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>{statistics.confirmed}</Text>
                <Text style={styles.statLabel}>Confirmed</Text>
              </LinearGradient>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}>
                <Text style={styles.statValue}>
                  {formatCurrency(statistics.total_value)}
                </Text>
                <Text style={styles.statLabel}>Total Value</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search purchase orders..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Status</Text>
            <Picker
              selectedValue={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              style={styles.picker}>
              <Picker.Item label="All Status" value="" />
              <Picker.Item label="Draft" value="draft" />
              <Picker.Item label="Sent" value="sent" />
              <Picker.Item label="Confirmed" value="confirmed" />
              <Picker.Item label="Received" value="received" />
            </Picker>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Purchase Orders</Text>
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Purchase Orders</Text>
              <Text style={styles.emptyText}>
                Create your first LPO to get started
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("PurchaseOrderShow", { id: order.id })
                }>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>
                      {order.lpo_number || `#${order.id}`}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {order.vendor_name || order.vendor?.name || "Vendor"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusTextColor(order.status) },
                      ]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Date</Text>
                  <Text style={styles.cardValue}>{order.lpo_date}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Total</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(order.total_amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <Text style={styles.paginationSubtext}>
                Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
                {pagination.total} purchase orders
              </Text>
            </View>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.current_page === 1 &&
                    styles.paginationButtonDisabled,
                ]}
                onPress={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.current_page === 1 &&
                      styles.paginationButtonTextDisabled,
                  ]}>
                  ← Previous
                </Text>
              </TouchableOpacity>
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
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    height: 50,
    color: BRAND_COLORS.darkPurple,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  cardValue: {
    fontSize: 12,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  paginationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  paginationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  paginationButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#e5e7eb",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
});
