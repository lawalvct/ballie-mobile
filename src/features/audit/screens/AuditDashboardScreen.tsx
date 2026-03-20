import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuditStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { useAuditDashboard } from "../hooks/useAudit";
import type { AuditDashboardFilters, AuditActivity } from "../types";

import AuditStats from "../../../components/audit/AuditStats";
import AuditFilters from "../../../components/audit/AuditFilters";
import AuditTimeline from "../../../components/audit/AuditTimeline";
import ExportSection from "../../../components/audit/ExportSection";

type Props = NativeStackScreenProps<AuditStackParamList, "AuditDashboard">;

const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AuditDashboardScreen({ navigation }: Props) {
  const { user, tenant, logout } = useAuth();
  const [filters, setFilters] = useState<AuditDashboardFilters>({});
  const [showDropdown, setShowDropdown] = useState(false);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const {
    stats,
    users,
    activities,
    pagination,
    isLoading,
    isRefreshing,
    refresh,
  } = useAuditDashboard(filters);

  const handleApplyFilters = useCallback(
    (newFilters: AuditDashboardFilters) => {
      setFilters(newFilters);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleViewRecord = useCallback(
    (activity: AuditActivity) => {
      navigation.navigate("AuditTrail", {
        model: activity.model_key,
        id: activity.id,
        name: activity.model_name,
      });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
            progressBackgroundColor="#2d1f5e"
          />
        }>
        {/* Hero Header */}
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
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.auditBanner}>
            <View style={styles.auditBannerLeft}>
              <Text style={styles.auditBannerTitle}>Audit Trail</Text>
              <Text style={styles.auditBannerSubtitle}>
                Review activity history, user actions, and record changes
              </Text>
            </View>
            <View style={styles.auditMetaBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.auditMetaText}>90 days</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>
          <AuditStats stats={stats} isLoading={isLoading} />
          <AuditFilters
            users={users}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
          <AuditTimeline
            activities={activities}
            isLoading={isLoading}
            onViewRecord={handleViewRecord}
          />

          {/* Pagination Info */}
          {pagination && pagination.total > 0 && (
            <View style={styles.paginationRow}>
              <Text style={styles.paginationText}>
                Showing {activities.length} of {pagination.total} records
                {pagination.last_page > 1 &&
                  ` • Page ${pagination.current_page} of ${pagination.last_page}`}
              </Text>
            </View>
          )}

          <ExportSection />
        </View>
      </ScrollView>

      {showDropdown && (
        <Modal
          transparent
          visible={showDropdown}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdown}>
              <View style={styles.ddHeader}>
                <View style={styles.ddAvatar}>
                  <Text style={styles.ddAvatarText}>{avatarLetter}</Text>
                </View>
                <View style={styles.ddInfo}>
                  <Text style={styles.ddName}>{user?.name || "User"}</Text>
                  <Text style={styles.ddRole}>{user?.role || "Admin"}</Text>
                </View>
              </View>
              <View style={styles.ddDivider} />
              <TouchableOpacity style={styles.ddItem}>
                <Text style={styles.ddItemText}>Profile Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ddItem}
                onPress={() => {
                  setShowDropdown(false);
                  logout();
                }}>
                <Text style={styles.ddItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#2d1f5e",
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerDate: {
    fontSize: 12,
    color: "rgba(209,176,94,0.85)",
    fontWeight: "500",
    marginTop: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#2d1f5e",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a0f33",
  },
  auditBanner: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  auditBannerLeft: {
    flex: 1,
  },
  auditBannerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  auditBannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  body: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
    paddingTop: 4,
    paddingBottom: 30,
  },
  auditMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  auditMetaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  paginationRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  paginationText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    minWidth: 230,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  ddHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ddAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  ddAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  ddInfo: {
    flex: 1,
  },
  ddName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  ddRole: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  ddDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  ddItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  ddItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: BRAND_COLORS.darkPurple,
  },
});
