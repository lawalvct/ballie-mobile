import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { POSStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { usePosTransactions } from "../hooks/usePos";
import type { TransactionListItem, TransactionListFilters } from "../types";

type Props = NativeStackScreenProps<POSStackParamList, "POSTransactions">;

const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function formatCurrency(n: string | number): string {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  completed: { bg: "#DEF7EC", text: "#03543F" },
  voided: { bg: "#FDE8E8", text: "#9B1C1C" },
  refunded: { bg: "#FDF6B2", text: "#723B13" },
  pending: { bg: "#E1EFFE", text: "#1E429F" },
};

const STATUS_OPTIONS = ["", "completed", "voided", "refunded", "pending"];
const STATUS_LABELS = ["All", "Completed", "Voided", "Refunded", "Pending"];

export default function TransactionsScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const [filters, setFilters] = useState<TransactionListFilters>({
    page: 1,
    per_page: 20,
  });

  const { transactions, isLoading, isRefreshing, refresh } = usePosTransactions(filters);
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const handleSearch = useCallback(
    (text: string) => {
      setFilters((f) => ({ ...f, search: text, page: 1 }));
    },
    [],
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      setFilters((f) => ({ ...f, status: status || undefined, page: 1 }));
    },
    [],
  );

  const renderTransaction = useCallback(
    ({ item }: { item: TransactionListItem }) => {
      const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
      return (
        <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => navigation.navigate("POSTransactionDetail", { id: item.id })}
          activeOpacity={0.7}>
          <View style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txNumber}>{item.sale_number}</Text>
              <Text style={styles.txDate}>{formatDateTime(item.sale_date)}</Text>
              <Text style={styles.txCustomer}>
                {item.customer?.full_name || "Walk-in Customer"}
              </Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>{formatCurrency(item.total_amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName} numberOfLines={1}>
              {tenant?.name || "Your Business"}
            </Text>
            <Text style={styles.headerDate}>{todayFormatted()}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title}>Transaction History</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by sale number..."
            placeholderTextColor="#9ca3af"
            value={filters.search || ""}
            onChangeText={handleSearch}
          />
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}>
          {STATUS_OPTIONS.map((status, idx) => (
            <TouchableOpacity
              key={`status-${idx}`}
              style={[
                styles.filterChip,
                (filters.status || "") === status && styles.filterChipActive,
              ]}
              onPress={() => handleStatusFilter(status)}>
              <Text
                style={[
                  styles.filterChipText,
                  (filters.status || "") === status && styles.filterChipTextActive,
                ]}>
                {STATUS_LABELS[idx]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => `tx-${item.id}`}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refresh}
            refreshing={isRefreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerDate: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  bellBtn: { position: "relative", padding: 4 },
  bellIcon: { fontSize: 22 },
  bellDot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND_COLORS.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  body: { flex: 1, backgroundColor: "#f5f5f5", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -12, paddingTop: 20, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 16, paddingHorizontal: 4 },

  // Search
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: BRAND_COLORS.darkPurple },

  // Filters
  filterBar: { maxHeight: 44, marginBottom: 12 },
  filterContent: { gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  filterChipActive: { backgroundColor: BRAND_COLORS.darkPurple, borderColor: BRAND_COLORS.darkPurple },
  filterChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  filterChipTextActive: { color: "#fff" },

  // List
  listContent: { paddingBottom: 20 },
  transactionCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  txRow: { flexDirection: "row", alignItems: "center" },
  txNumber: { fontSize: 15, fontWeight: "bold", color: BRAND_COLORS.blue },
  txDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  txCustomer: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  txRight: { alignItems: "flex-end", marginLeft: 12 },
  txAmount: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },

  // Empty
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
