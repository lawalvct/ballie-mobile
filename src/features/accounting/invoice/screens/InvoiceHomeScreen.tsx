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
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
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

  const formatCurrency = (value: number | string | null | undefined) => {
    let amount = 0;
    if (typeof value === "number") {
      amount = value;
    } else if (typeof value === "string") {
      amount = parseFloat(value) || 0;
    }
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
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

        {/* View Toggle & Results Count */}
        <View style={styles.viewToggleContainer}>
          <Text style={styles.resultsCount}>
            {invoices.length > 0
              ? `${pagination.total} invoice${pagination.total !== 1 ? "s" : ""}`
              : "No results"}
          </Text>
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "card" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("card")}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "card" && styles.viewToggleTextActive,
                ]}>
                Cards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "table" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setViewMode("table")}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "table" && styles.viewToggleTextActive,
                ]}>
                Table
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Invoice List */}
        <View style={styles.listSection}>
          {invoices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                {invoiceType === "sales" ? "🧾" : "📦"}
              </Text>
              <Text style={styles.emptyTitle}>
                No {invoiceType === "sales" ? "Sales" : "Purchase"} Invoices
              </Text>
              <Text style={styles.emptyText}>
                {filters.search || filters.status || filters.from_date
                  ? "Try adjusting your filters"
                  : `Create your first ${invoiceType} invoice to get started`}
              </Text>
              {!filters.search && !filters.status && !filters.from_date && (
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={handleCreatePress}
                  activeOpacity={0.8}>
                  <Text style={styles.emptyActionText}>+ Create Invoice</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {viewMode === "card" ? (
                invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onPress={() => handleInvoicePress(invoice)}
                  />
                ))
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tableScrollContent}>
                  <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                      <Text
                        style={[styles.tableHeaderText, styles.tableCellSmall]}>
                        #
                      </Text>
                      <Text
                        style={[styles.tableHeaderText, styles.tableCellLarge]}>
                        Party
                      </Text>
                      <Text
                        style={[styles.tableHeaderText, styles.tableCellRef]}>
                        Ref
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          styles.tableCellMedium,
                        ]}>
                        Date
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          styles.tableCellAmount,
                        ]}>
                        Amount
                      </Text>
                      <Text
                        style={[styles.tableHeaderText, styles.tableCellType]}>
                        Type
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          styles.tableCellStatus,
                        ]}>
                        Status
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          styles.tableCellActions,
                        ]}>
                        Actions
                      </Text>
                    </View>
                    {invoices.map((invoice, index) => (
                      <TouchableOpacity
                        key={invoice.id}
                        style={[
                          styles.tableRow,
                          index % 2 === 1 && styles.tableRowAlt,
                        ]}
                        onPress={() => handleInvoicePress(invoice)}
                        activeOpacity={0.7}>
                        <Text
                          style={[styles.tableCellText, styles.tableCellSmall]}>
                          {invoice.voucher_number || invoice.id}
                        </Text>
                        <Text
                          style={[styles.tableCellText, styles.tableCellLarge]}>
                          {invoice.party_name || "Unknown Party"}
                        </Text>
                        <Text
                          style={[styles.tableCellText, styles.tableCellRef]}>
                          {invoice.reference_number || "-"}
                        </Text>
                        <Text
                          style={[
                            styles.tableCellText,
                            styles.tableCellMedium,
                          ]}>
                          {formatDate(invoice.voucher_date)}
                        </Text>
                        <Text
                          style={[
                            styles.tableCellText,
                            styles.tableCellAmount,
                          ]}>
                          ₦{formatCurrency(invoice.total_amount)}
                        </Text>
                        <Text
                          style={[styles.tableCellText, styles.tableCellType]}>
                          {invoice.type}
                        </Text>
                        <Text
                          style={[
                            styles.tableCellText,
                            styles.tableCellStatus,
                            invoice.status === "posted"
                              ? styles.statusPosted
                              : styles.statusDraft,
                          ]}>
                          {invoice.status}
                        </Text>
                        <View style={styles.tableCellActions}>
                          <TouchableOpacity
                            style={styles.tableActionButton}
                            onPress={() => handleInvoicePress(invoice)}
                            activeOpacity={0.8}>
                            <Text style={styles.tableActionText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
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
  viewToggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  viewToggleGroup: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 4,
  },
  viewToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  viewToggleTextActive: {
    color: BRAND_COLORS.darkPurple,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listContainer: {
    gap: 12,
  },
  tableScrollContent: {
    paddingBottom: 8,
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 860,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCellText: {
    fontSize: 12,
    color: "#111827",
  },
  tableCellSmall: {
    width: 90,
  },
  tableCellMedium: {
    width: 120,
  },
  tableCellLarge: {
    width: 200,
  },
  tableCellRef: {
    width: 130,
  },
  tableCellAmount: {
    width: 130,
    textAlign: "right",
  },
  tableCellType: {
    width: 90,
    textTransform: "capitalize",
  },
  tableCellStatus: {
    width: 100,
    textAlign: "right",
    textTransform: "capitalize",
  },
  tableCellActions: {
    width: 110,
    alignItems: "flex-end",
  },
  tableActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 8,
  },
  tableActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  statusPosted: {
    color: "#16a34a",
    fontWeight: "700",
  },
  statusDraft: {
    color: "#f59e0b",
    fontWeight: "700",
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
  emptyActionButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 10,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
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
