import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SEMANTIC_COLORS } from "../../theme/colors";
import type { AuditStats as AuditStatsType } from "../../features/audit/types";

interface Props {
  stats: AuditStatsType | null;
  isLoading: boolean;
}

const STAT_CONFIG = [
  {
    key: "total_records" as const,
    label: "Total Records",
    subtitle: "All time",
    color1: "#3c2c64",
    color2: "#5a4a7e",
  },
  {
    key: "created_today" as const,
    label: "Created Today",
    subtitle: "New entries",
    color1: "#10b981",
    color2: "#059669",
    //icon: "✨",
  },
  {
    key: "updated_today" as const,
    label: "Updated Today",
    subtitle: "Modified",
    color1: "#f59e0b",
    color2: "#d97706",
    //icon: "✏️",
  },
  {
    key: "posted_today" as const,
    label: "Posted Today",
    subtitle: "Published",
    color1: "#3b82f6",
    color2: "#2563eb",
    //icon: "📤",
  },
  {
    key: "active_users" as const,
    label: "Active Users",
    subtitle: "Currently active",
    color1: "#8b5cf6",
    color2: "#7c3aed",
   // icon: "👥",
  },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function AuditStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3c2c64" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STAT_CONFIG.map((cfg) => (
        <LinearGradient
          key={cfg.key}
          colors={[cfg.color1, cfg.color2]}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.statSubtitle}>{cfg.subtitle}</Text>
          <Text style={styles.statValue}>
            {stats ? formatNumber(stats[cfg.key]) : "—"}
          </Text>
          <Text style={styles.statLabel}>{cfg.label}</Text>
        </LinearGradient>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    minHeight: 132,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 18,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginTop: 12,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  statSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.78)",
  },
});
