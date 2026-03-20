import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuditStackParamList } from "../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../theme/colors";
import { useAuditTrail } from "../hooks/useAudit";
import AuditModuleHeader from "../../../components/audit/AuditModuleHeader";

type Props = NativeStackScreenProps<AuditStackParamList, "AuditTrail">;

const getActionColor = (action: string) => {
  switch (action) {
    case "created":
      return "#10b981";
    case "updated":
      return "#f59e0b";
    case "deleted":
      return "#ef4444";
    case "posted":
      return "#3b82f6";
    case "restored":
      return "#6366f1";
    default:
      return "#6b7280";
  }
};

function formatTimestamp(ts: string): { date: string; time: string } {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function AuditTrailScreen({ route, navigation }: Props) {
  const { model, id, name } = route.params;

  const { record, activities, isLoading, isRefreshing, refresh } =
    useAuditTrail(model, id);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <AuditModuleHeader
        title="Audit Trail"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
          />
        }>
        {/* Record Header Card */}
        <View style={styles.recordCard}>
          <View style={styles.recordBadge}>
            <Text style={styles.recordBadgeText}>
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </Text>
          </View>
          <Text style={styles.recordName}>
            {name || record?.name || `#${id}`}
          </Text>
          {record && (
            <View style={styles.recordMeta}>
              <Text style={styles.metaText}>
                Created: {formatTimestamp(record.created_at).date}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                Updated: {formatTimestamp(record.updated_at).date}
              </Text>
            </View>
          )}
          <View style={styles.activityCount}>
            <Text style={styles.activityCountText}>
              {activities.length} change{activities.length !== 1 ? "s" : ""}{" "}
              recorded
            </Text>
          </View>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            <Text style={styles.loadingText}>Loading audit trail...</Text>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !activities.length && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Trail Found</Text>
            <Text style={styles.emptySubtitle}>
              No audit activities recorded for this record.
            </Text>
          </View>
        )}

        {/* Trail Timeline */}
        {!isLoading && activities.length > 0 && (
          <View style={styles.trailContainer}>
            <Text style={styles.sectionTitle}>Change History</Text>

            {activities.map((entry, index) => {
              const ts = formatTimestamp(entry.timestamp);
              return (
                <View key={index} style={styles.trailItem}>
                  {index < activities.length - 1 && (
                    <View style={styles.trailLine} />
                  )}

                  <View
                    style={[
                      styles.trailDot,
                      { backgroundColor: getActionColor(entry.action) },
                    ]}
                  />

                  <View style={styles.trailCard}>
                    <View style={styles.trailHeader}>
                      <View
                        style={[
                          styles.actionBadge,
                          { backgroundColor: getActionColor(entry.action) },
                        ]}>
                        <Text style={styles.actionBadgeText}>
                          {entry.action}
                        </Text>
                      </View>
                      <Text style={styles.trailTime}>
                        {ts.date} • {ts.time}
                      </Text>
                    </View>

                    <Text style={styles.trailDetails}>{entry.details}</Text>

                    <View style={styles.trailFooter}>
                      <Text style={styles.trailUser}>
                        👤 {entry.user?.name ?? "System"}
                      </Text>
                    </View>

                    {/* Changes Diff */}
                    {entry.changes &&
                      Object.keys(entry.changes).length > 0 && (
                        <View style={styles.changesContainer}>
                          <Text style={styles.changesTitle}>
                            Fields Changed
                          </Text>
                          {Object.entries(entry.changes).map(
                            ([field, diff]) => (
                              <View key={field} style={styles.changeRow}>
                                <Text style={styles.changeField}>
                                  {field}
                                </Text>
                                <View style={styles.changeValues}>
                                  <Text style={styles.changeOld}>
                                    {String(diff.old ?? "—")}
                                  </Text>
                                  <Text style={styles.changeArrow}>→</Text>
                                  <Text style={styles.changeNew}>
                                    {String(diff.new ?? "—")}
                                  </Text>
                                </View>
                              </View>
                            ),
                          )}
                        </View>
                      )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: "#f5f5f5",
  },
  recordCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  recordBadge: {
    alignSelf: "flex-start",
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  recordBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  recordName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  recordMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  metaDot: {
    fontSize: 12,
    color: "#d1d5db",
  },
  activityCount: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  activityCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  trailContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  trailItem: {
    position: "relative",
    paddingLeft: 32,
    marginBottom: 16,
  },
  trailLine: {
    position: "absolute",
    left: 7,
    top: 24,
    width: 2,
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  trailDot: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#f5f5f5",
  },
  trailCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  trailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: "capitalize",
  },
  trailTime: {
    fontSize: 11,
    color: "#9ca3af",
  },
  trailDetails: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 10,
  },
  trailFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
  },
  trailUser: {
    fontSize: 12,
    color: "#6b7280",
  },
  changesContainer: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
  },
  changesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  changeRow: {
    marginBottom: 6,
  },
  changeField: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  changeValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeOld: {
    fontSize: 12,
    color: "#ef4444",
    textDecorationLine: "line-through",
  },
  changeArrow: {
    fontSize: 12,
    color: "#9ca3af",
  },
  changeNew: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
});
