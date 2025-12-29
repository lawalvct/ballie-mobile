import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import AppHeader from "../../../../components/AppHeader";
import AccountGroupStats from "../components/AccountGroupStats";
import AccountGroupFilters from "../components/AccountGroupFilters";
import AccountGroupList from "../components/AccountGroupList";
import { accountGroupService } from "../services/accountGroupService";
import { AccountGroup, ListParams, PaginationInfo, Statistics } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "AccountGroupList"
>;

export default function AccountGroupHomeScreen({ navigation }: Props) {
  // State
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ListParams>({
    sort: "name",
    direction: "asc",
  });

  // Load data on mount and when filters change
  useEffect(() => {
    loadAccountGroups();
  }, [
    filters.status,
    filters.nature,
    filters.level,
    filters.sort,
    filters.direction,
  ]);

  const loadAccountGroups = async () => {
    try {
      setLoading(true);
      const response = await accountGroupService.list(filters);

      setAccountGroups(response.account_groups || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to load account groups", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await accountGroupService.list(filters);

      setAccountGroups(response.account_groups || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || "Failed to refresh data", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadAccountGroups();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await accountGroupService.toggleStatus(id);
      showToast("✅ Status updated successfully", "success");
      loadAccountGroups();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <AppHeader
          businessName="Account Group"
          userName="Admin"
          userRole="Administrator"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading account groups...</Text>
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
      <AppHeader
        businessName="Account Group"
        userName="Admin"
        userRole="Administrator"
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Add New Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AccountGroupCreate")}>
            <Text style={styles.addButtonText}>+ Add New Account Group</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <AccountGroupStats statistics={statistics} />

        {/* Filters Section */}
        <AccountGroupFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* Account Group List */}
        <AccountGroupList
          accountGroups={accountGroups}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
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
});
