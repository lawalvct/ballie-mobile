import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuditStackParamList } from "../../../navigation/types";
import ModuleScreenLayout from "../../../components/ModuleScreenLayout";
import { useAuditDashboard } from "../hooks/useAudit";
import type { AuditDashboardFilters, AuditActivity } from "../types";

import AuditStats from "../../../components/audit/AuditStats";
import AuditFilters from "../../../components/audit/AuditFilters";
import AuditTimeline from "../../../components/audit/AuditTimeline";
import ExportSection from "../../../components/audit/ExportSection";

type Props = NativeStackScreenProps<AuditStackParamList, "AuditDashboard">;

export default function AuditDashboardScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<AuditDashboardFilters>({});

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
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
        {/* Body */}
          {/* Module intro card */}
          <View style={styles.auditBanner}>
            <View style={styles.auditBannerLeft}>
              <Text style={styles.auditBannerTitle}>Audit Trail</Text>
              <Text style={styles.auditBannerSubtitle}>
                Review activity history, user actions &amp; record changes
              </Text>
            </View>
            <View style={styles.auditMetaBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.auditMetaText}>90 days</Text>
            </View>
          </View>

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
    </ModuleScreenLayout>
  );
}

const styles = StyleSheet.create({
  auditBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  auditBannerLeft: {
    flex: 1,
  },
  auditBannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a0f33",
    letterSpacing: 0.2,
  },
  auditBannerSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6b7280",
    marginTop: 3,
  },
  auditMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  auditMetaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
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
});
