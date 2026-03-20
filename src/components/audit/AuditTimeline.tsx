import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import type { AuditActivity } from "../../features/audit/types";

interface Props {
  activities: AuditActivity[];
  isLoading: boolean;
  onViewRecord?: (activity: AuditActivity) => void;
}

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

const getModelIcon = (model: string) => {
  switch (model?.toLowerCase()) {
    case "customer":
      return "👥";
    case "vendor":
      return "🏢";
    case "product":
      return "📦";
    case "voucher":
      return "📑";
    case "invoice":
      return "🧾";
    default:
      return "📋";
  }
};

function formatTimestamp(ts: string): {
  date: string;
  time: string;
  relative: string;
} {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  let relative: string;
  if (diffMin < 1) relative = "Just now";
  else if (diffMin < 60) relative = `${diffMin}m ago`;
  else if (diffHr < 24) relative = `${diffHr}h ago`;
  else if (diffDay < 7) relative = `${diffDay}d ago`;
  else
    relative = d.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });

  const date = d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date, time, relative };
}

export default function AuditTimeline({
  activities,
  isLoading,
  onViewRecord,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3c2c64" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  if (!activities.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Activities Found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your filters or check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Activity Timeline</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{activities.length}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {activities.map((entry, index) => {
          const ts = formatTimestamp(entry.timestamp);
          return (
            <View key={entry.id} style={styles.timelineItem}>
              {index < activities.length - 1 && (
                <View style={styles.timelineLine} />
              )}

              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: getActionColor(entry.action) },
                ]}
              />

              <TouchableOpacity
                style={styles.entryCard}
                activeOpacity={onViewRecord ? 0.7 : 1}
                onPress={() => onViewRecord?.(entry)}>
                <View style={styles.entryHeader}>
                  <View style={styles.moduleTag}>
                    <Text style={styles.moduleIcon}>
                      {getModelIcon(entry.model_key)}
                    </Text>
                    <Text style={styles.moduleText}>{entry.model}</Text>
                  </View>
                  <View
                    style={[
                      styles.actionTag,
                      { backgroundColor: getActionColor(entry.action) },
                    ]}>
                    <Text style={styles.actionText}>{entry.action}</Text>
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {entry.details}
                </Text>

                {entry.model_name ? (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordName} numberOfLines={1}>
                      {entry.model_name}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.entryFooter}>
                  <Text style={styles.userText}>
                    👤 {entry.user?.name ?? "System"}
                  </Text>
                  <Text style={styles.timeText}>
                    {ts.relative} • {ts.time}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  countBadge: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  timeline: {
    position: "relative",
  },
  timelineItem: {
    position: "relative",
    paddingLeft: 32,
    marginBottom: 18,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 24,
    width: 2,
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  timelineDot: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: SEMANTIC_COLORS.white,
  },
  entryCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moduleIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  moduleText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  actionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
    textTransform: "capitalize",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  recordRow: {
    marginBottom: 8,
  },
  recordName: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.blue,
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
  },
  userText: {
    fontSize: 12,
    color: "#6b7280",
  },
  timeText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
