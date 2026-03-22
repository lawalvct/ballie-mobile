import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useProjectReports } from "../hooks/useProjects";
import type { ReportProject } from "../types";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectReports">;

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#e5e7eb", text: "#374151" },
  active: { bg: "#dbeafe", text: "#1d4ed8" },
  on_hold: { bg: "#fef3c7", text: "#92400e" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  archived: { bg: "#f1f5f9", text: "#475569" },
};

export default function ProjectReportsScreen({ navigation }: Props) {
  const { reports, isLoading, isRefreshing, refresh } = useProjectReports();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading reports…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = reports?.summary;
  const statusDist = reports?.status_distribution;
  const projects = reports?.projects ?? [];

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
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.hero}>
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.heroBack}>← Back</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle}>Project Reports</Text>
          <Text style={styles.heroSub}>Performance overview</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Summary Cards */}
          {summary && (
            <View style={styles.summaryGrid}>
              {[
                { label: "Total", value: summary.total, colors: ["#3c2c64", "#5a3d9e"] },
                { label: "Active", value: summary.active, colors: ["#2563eb", "#60a5fa"] },
                { label: "Completed", value: summary.completed, colors: ["#059669", "#34d399"] },
                { label: "Overdue", value: summary.overdue, colors: ["#dc2626", "#f87171"] },
              ].map((item) => (
                <LinearGradient key={`sum-${item.label}`} colors={item.colors as [string, string]} style={styles.summaryCard}>
                  <Text style={styles.summaryCardValue}>{item.value ?? 0}</Text>
                  <Text style={styles.summaryCardLabel}>{item.label}</Text>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Budget Overview */}
          {summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Budget Overview</Text>
              <View style={styles.budgetGrid}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetValue}>{formatCurrency(summary.total_budget)}</Text>
                  <Text style={styles.budgetLabel}>Total Budget</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={[styles.budgetValue, { color: "#dc2626" }]}>{formatCurrency(summary.total_cost)}</Text>
                  <Text style={styles.budgetLabel}>Actual Cost</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetValue}>{summary.total_budget ? Math.round((summary.total_cost / summary.total_budget) * 100) : 0}%</Text>
                  <Text style={styles.budgetLabel}>Utilization</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={[styles.budgetValue, { color: "#10b981" }]}>{formatCurrency(Math.max(0, summary.total_budget - summary.total_cost))}</Text>
                  <Text style={styles.budgetLabel}>Remaining</Text>
                </View>
              </View>

              {/* Utilization bar */}
              <View style={styles.utilizationBar}>
                <View style={[styles.utilizationFill, { width: `${Math.min(summary.total_budget ? Math.round((summary.total_cost / summary.total_budget) * 100) : 0, 100)}%`, backgroundColor: summary.total_budget && (summary.total_cost / summary.total_budget) > 0.9 ? "#ef4444" : BRAND_COLORS.gold }]} />
              </View>
            </View>
          )}

          {/* Status Distribution */}
          {statusDist && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status Distribution</Text>
              {(Object.entries(statusDist) as [string, number][]).map(([status, count]) => {
                const sc = STATUS_COLORS[status] || STATUS_COLORS.draft;
                const total = summary?.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <View key={`sd-${status}`} style={styles.distRow}>
                    <View style={[styles.distDot, { backgroundColor: sc.text }]} />
                    <Text style={styles.distLabel}>{status.replace("_", " ")}</Text>
                    <View style={styles.distBarWrap}>
                      <View style={[styles.distBarFill, { width: `${pct}%`, backgroundColor: sc.text }]} />
                    </View>
                    <Text style={styles.distCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Projects Table */}
          {projects.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>All Projects</Text>
              {projects.map((p: ReportProject) => {
                const sc = STATUS_COLORS[p.status] || STATUS_COLORS.draft;
                return (
                  <View key={`proj-${p.id}`} style={styles.projRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.projName} numberOfLines={1}>{p.name}</Text>
                      <View style={styles.projMeta}>
                        <View style={[styles.projStatusBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.projStatusText, { color: sc.text }]}>{p.status.replace("_", " ")}</Text>
                        </View>
                        {p.budget != null && <Text style={styles.projBudget}>{formatCurrency(p.budget)}</Text>}
                      </View>
                    </View>
                    <View style={styles.projProgress}>
                      <Text style={styles.projProgressText}>{p.progress ?? 0}%</Text>
                      <View style={styles.projProgressBar}>
                        <View style={[styles.projProgressFill, { width: `${p.progress ?? 0}%` }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#2d1f5e" },
  loadingWrap: { flex: 1, backgroundColor: "#f3f4f8", justifyContent: "center", alignItems: "center" },
  loadingLabel: { marginTop: 12, fontSize: 14, color: "#6b7280" },

  hero: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  heroBack: { fontSize: 15, color: BRAND_COLORS.gold, fontWeight: "600" },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 4 },

  body: { flex: 1, backgroundColor: "#f3f4f8", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, marginTop: -1 },

  // Summary
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  summaryCard: { width: "48%", borderRadius: 16, padding: 16, alignItems: "center" },
  summaryCardValue: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  summaryCardLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.8)", marginTop: 4 },

  // Card
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: BRAND_COLORS.darkPurple, marginBottom: 14 },

  // Budget
  budgetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  budgetItem: { width: "47%", backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, alignItems: "center" },
  budgetValue: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  budgetLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  utilizationBar: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  utilizationFill: { height: "100%", borderRadius: 4 },

  // Distribution
  distRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  distDot: { width: 10, height: 10, borderRadius: 5 },
  distLabel: { fontSize: 13, color: "#374151", textTransform: "capitalize", width: 80 },
  distBarWrap: { flex: 1, height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  distBarFill: { height: "100%", borderRadius: 4 },
  distCount: { fontSize: 13, fontWeight: "600", color: "#374151", width: 28, textAlign: "right" },

  // Project rows
  projRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 12 },
  projName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  projMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  projStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  projStatusText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  projBudget: { fontSize: 11, color: "#6b7280" },
  projProgress: { alignItems: "flex-end", width: 60 },
  projProgressText: { fontSize: 12, fontWeight: "600", color: BRAND_COLORS.darkPurple, marginBottom: 4 },
  projProgressBar: { width: 60, height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  projProgressFill: { height: "100%", borderRadius: 3, backgroundColor: BRAND_COLORS.gold },
});
