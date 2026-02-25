import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import AccountGroupStats from "../components/AccountGroupStats";
import AccountGroupFilters from "../components/AccountGroupFilters";
import AccountGroupList from "../components/AccountGroupList";
import { useAccountGroups } from "../hooks/useAccountGroups";
import { accountGroupService } from "../services/accountGroupService";
import type { ListParams } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "AccountGroupHome"
>;

export default function AccountGroupHomeScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<ListParams>({
    sort: "name",
    direction: "asc",
    page: 1,
    per_page: 20,
  });

  const { groups, pagination, statistics, isLoading, isRefreshing, refresh } =
    useAccountGroups(filters);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSearch = () => setFilters((prev) => ({ ...prev, page: 1 }));

  const handleItemUpdated = () => refresh();
  const handleItemCreated = () => refresh();

  const handleToggleStatus = async (id: number) => {
    try {
      await accountGroupService.toggleStatus(id);
      showToast("âœ… Status updated successfully", "success");
      refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  // â”€â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <AccountingModuleHeader
          title="Account Groups"
          onBack={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d1b05e" />
          <Text style={styles.loadingLabel}>Loading account groupsâ€¦</Text>
        </View>
      </SafeAreaView>
    );
  }

  // â”€â”€â”€ Main render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title="Account Groups"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={["#d1b05e"]}
            tintColor="#d1b05e"
          />
        }>
        {/* Create button */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() =>
              navigation.navigate("AccountGroupCreate", {
                onCreated: handleItemCreated,
              } as any)
            }
            activeOpacity={0.8}>
            <Text style={styles.createBtnIcon}>+</Text>
            <Text style={styles.createBtnLabel}>Create New Account Group</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <AccountGroupStats statistics={statistics} />

        {/* Filters */}
        <AccountGroupFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />

        {/* List */}
        <AccountGroupList
          accountGroups={groups}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
          onItemUpdated={handleItemUpdated}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },

  /* â”€â”€ Loading â”€â”€ */
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 14,
    color: "#6b7280",
  },

  /* â”€â”€ Body â”€â”€ */
  body: {
    flex: 1,
    backgroundColor: "#f3f4f8",
  },

  /* â”€â”€ Actions section â”€â”€ */
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1b05e",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#d1b05e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a0f33",
    lineHeight: 24,
  },
  createBtnLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a0f33",
    letterSpacing: 0.3,
  },
});
