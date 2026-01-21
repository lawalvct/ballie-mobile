import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { invoiceService } from "../services/invoiceService";
import InvoiceFilters from "../components/InvoiceFilters";
import InvoiceStats from "../components/InvoiceStats";
import InvoiceCard from "../components/InvoiceCard";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type { ListParams, Invoice, Statistics } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "InvoiceHome"
>;

type RouteProp = {
  key: string;
  name: string;
  params: {
    type: "sales" | "purchase";
  };
};

export default function InvoiceHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const invoiceType = route.params.type;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const [filters, setFilters] = useState<ListParams>({
    type: invoiceType,
    status: undefined,
    from_date: undefined,
    to_date: undefined,
    search: undefined,
    sort: "voucher_date",
    direction: "desc",
    page: 1,
  });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async (loadMore = false) => {
    try {
      if (loadMore) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await invoiceService.list(filters);

      if (loadMore) {
        setInvoices([...invoices, ...response.data]);
      } else {
        setInvoices(response.data);
      }

      setPagination(response.pagination);
      setStatistics(response.statistics);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load invoices",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (
      pagination?.current_page &&
      pagination?.last_page &&
      pagination.current_page < pagination.last_page
    ) {
      setFilters({ ...filters, page: (filters.page || 1) + 1 });
    }
  };

  const handleFilterChange = (newFilters: ListParams) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadInvoices();
    } finally {
      setRefreshing(false);
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    navigation.navigate("InvoiceShow", { id: invoice.id });
  };

  const handleCreatePress = () => {
    navigation.navigate("InvoiceCreate", { type: invoiceType });
  };

  const handleSearch = () => {
    loadInvoices();
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading && !refreshing) {
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
          <Text style={styles.headerTitle}>
            {invoiceType === "sales" ? "Sales" : "Purchase"} Invoices
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading invoices...</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {invoiceType === "sales" ? "Sales" : "Purchase"} Invoices
        </Text>
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
            onPress={handleCreatePress}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnIcon}>+</Text>
            <Text style={styles.primaryBtnText}>
              Create New {invoiceType === "sales" ? "Sales" : "Purchase"}{" "}
              Invoice
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <InvoiceStats statistics={statistics} type={invoiceType} />

        {/* Filters Section */}
        <InvoiceFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Invoice List */}
        <View style={styles.listSection}>
          {invoices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyTitle}>No Invoices Found</Text>
              <Text style={styles.emptyText}>
                Create your first invoice to get started
              </Text>
            </View>
          ) : (
            invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPress={() => handleInvoicePress(invoice)}
              />
            ))
          )}
        </View>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <View style={styles.paginationContainer}>
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
                Previous
              </Text>
            </TouchableOpacity>

            <Text style={styles.paginationInfo}>
              Page {pagination.current_page} of {pagination.last_page}
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
        )}

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
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
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
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
});
