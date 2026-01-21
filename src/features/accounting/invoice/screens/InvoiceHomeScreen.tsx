import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { invoiceService } from "../services/invoiceService";
import InvoiceFilters from "../components/InvoiceFilters";
import InvoiceList from "../components/InvoiceList";
import InvoiceStats from "../components/InvoiceStats";
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
      console.log("[InvoiceHomeScreen] Loading invoices...");
      console.log("[InvoiceHomeScreen] Filters:", filters);
      console.log("[InvoiceHomeScreen] Load more:", loadMore);

      if (loadMore) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await invoiceService.list(filters);

      console.log("[InvoiceHomeScreen] Response received:", response);
      console.log("[InvoiceHomeScreen] Data array:", response.data);
      console.log("[InvoiceHomeScreen] Pagination:", response.pagination);
      console.log("[InvoiceHomeScreen] Statistics:", response.statistics);

      if (loadMore) {
        setInvoices([...invoices, ...response.data]);
      } else {
        setInvoices(response.data);
      }

      setPagination(response.pagination);
      setStatistics(response.statistics);

      console.log("[InvoiceHomeScreen] Invoices loaded successfully!");
    } catch (error: any) {
      console.error("[InvoiceHomeScreen] Error loading invoices:", error);
      console.error("[InvoiceHomeScreen] Error response:", error.response);
      console.error("[InvoiceHomeScreen] Error message:", error.message);

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

  const handleInvoicePress = (invoice: Invoice) => {
    navigation.navigate("InvoiceShow", { id: invoice.id });
  };

  const handleCreatePress = () => {
    navigation.navigate("InvoiceCreate", { type: invoiceType });
  };

  const renderHeader = () => (
    <>
      {/* Statistics */}
      {statistics && (
        <InvoiceStats statistics={statistics} type={invoiceType} />
      )}

      {/* Filters */}
      <InvoiceFilters filters={filters} onFilterChange={handleFilterChange} />
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {invoiceType === "sales" ? "Sales" : "Purchase"} Invoices
          </Text>
          <Text style={styles.subtitle}>
            Manage your {invoiceType} invoices
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}>
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Invoice List with Statistics and Filters as Header */}
      <InvoiceList
        invoices={invoices}
        loading={loading}
        onInvoicePress={handleInvoicePress}
        onLoadMore={handleLoadMore}
        hasMore={
          pagination?.current_page !== undefined &&
          pagination?.last_page !== undefined &&
          pagination.current_page < pagination.last_page
        }
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  createButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "700",
  },
});
