import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import ModuleScreenLayout from "../../../components/ModuleScreenLayout";
import { useProjects } from "../hooks/useProjects";
import type { ProjectListFilters, Project, ProjectStatus, Priority } from "../types";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectList">;

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  draft: { bg: "#e5e7eb", text: "#374151" },
  active: { bg: "#dbeafe", text: "#1d4ed8" },
  on_hold: { bg: "#fef3c7", text: "#92400e" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  archived: { bg: "#f1f5f9", text: "#475569" },
};

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: "#f3f4f6", text: "#6b7280" },
  medium: { bg: "#dbeafe", text: "#2563eb" },
  high: { bg: "#ffedd5", text: "#c2410c" },
  urgent: { bg: "#fee2e2", text: "#dc2626" },
};

const STATUS_FILTERS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

export default function ProjectListScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<ProjectListFilters>({
    status: "all",
    per_page: 20,
  });
  const [searchText, setSearchText] = useState("");

  const { projects, stats, pagination, isLoading, isRefreshing, refresh } =
    useProjects(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchText || undefined, page: 1 }));
  };

  const handleStatusFilter = (status: ProjectStatus | "all") => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const renderProjectCard = (project: Project) => {
    const statusStyle = STATUS_COLORS[project.status];
    const priorityStyle = PRIORITY_COLORS[project.priority];
    const progress = project.progress ?? 0;

    return (
      <TouchableOpacity
        key={`project-${project.id}`}
        style={styles.projectCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("ProjectDetail", { id: project.id })}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={styles.cardNumber}>{project.project_number}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {project.status.replace("_", " ")}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
              <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
                {project.priority}
              </Text>
            </View>
          </View>
        </View>

        {/* Client & Manager */}
        <View style={styles.cardMeta}>
          {project.customer && (
            <Text style={styles.metaText} numberOfLines={1}>
              👤 {project.customer.company_name || `${project.customer.first_name} ${project.customer.last_name}`}
            </Text>
          )}
          {project.assigned_user && (
            <Text style={styles.metaText} numberOfLines={1}>
              🎯 {project.assigned_user.name}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: progress >= 100 ? "#10b981" : BRAND_COLORS.blue,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Footer stats */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerStat}>
            ✅ {project.completed_tasks ?? 0}/{project.tasks_count ?? 0} tasks
          </Text>
          {project.budget != null && (
            <Text style={styles.footerStat}>
              💰 {formatCurrency(project.budget)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading projects…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ModuleScreenLayout refreshing={isRefreshing} onRefresh={refresh}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>Project Overview</Text>

          {/* Stats Cards */}
          {stats && (
            <View style={styles.statsGrid}>
              {[
                { label: "Total", value: stats.total, colors: ["#8B5CF6", "#6D28D9"] },
                { label: "Active", value: stats.active, colors: ["#3B82F6", "#2563EB"] },
                { label: "Completed", value: stats.completed, colors: ["#10B981", "#059669"] },
                { label: "Overdue", value: stats.overdue, colors: ["#EF4444", "#DC2626"] },
              ].map((s) => (
                <LinearGradient
                  key={`stat-${s.label}`}
                  colors={s.colors as [string, string]}
                  style={styles.statCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Create Button */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.createBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ProjectCreate")}>
              <Text style={styles.createBtnText}>+ Create Project</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportsBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ProjectReports")}>
              <Text style={styles.reportsBtnText}>📊 Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects…"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}>
            {STATUS_FILTERS.map((f) => (
              <TouchableOpacity
                key={`filter-${f.value}`}
                style={[
                  styles.filterChip,
                  filters.status === f.value && styles.filterChipActive,
                ]}
                onPress={() => handleStatusFilter(f.value)}>
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === f.value && styles.filterChipTextActive,
                  ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Project Cards */}
          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyText}>
                Create your first project to get started
              </Text>
            </View>
          ) : (
            projects.map(renderProjectCard)
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <View style={styles.paginationWrap}>
              <Text style={styles.paginationInfo}>
                Page {pagination.current_page} of {pagination.last_page} •{" "}
                {pagination.total} total
              </Text>
              <View style={styles.paginationBtns}>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    pagination.current_page <= 1 && styles.pageBtnDisabled,
                  ]}
                  disabled={pagination.current_page <= 1}
                  onPress={() => handlePageChange(pagination.current_page - 1)}>
                  <Text style={styles.pageBtnText}>← Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    pagination.current_page >= pagination.last_page &&
                      styles.pageBtnDisabled,
                  ]}
                  disabled={pagination.current_page >= pagination.last_page}
                  onPress={() => handlePageChange(pagination.current_page + 1)}>
                  <Text style={styles.pageBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 30 }} />
    </ModuleScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: { flex: 1, backgroundColor: "#f3f4f8", justifyContent: "center", alignItems: "center" },
  loadingLabel: { marginTop: 12, fontSize: 14, color: "#6b7280" },

  sectionTitle: { fontSize: 17, fontWeight: "700", color: BRAND_COLORS.darkPurple, paddingHorizontal: 20, marginBottom: 14 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  statCard: { width: "47%", padding: 20, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 },

  actionsSection: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  createBtn: { flex: 1, backgroundColor: BRAND_COLORS.gold, paddingVertical: 14, borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  createBtnText: { fontSize: 15, fontWeight: "700", color: "#1a0f33" },
  reportsBtn: { backgroundColor: "#fff", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  reportsBtnText: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },

  searchContainer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  searchInput: { flex: 1, height: 44, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 16, fontSize: 14, color: "#1f2937", borderWidth: 1, borderColor: "#e5e7eb" },
  searchBtn: { backgroundColor: BRAND_COLORS.gold, paddingHorizontal: 20, borderRadius: 10, justifyContent: "center" },
  searchBtnText: { fontSize: 14, fontWeight: "600", color: "#1a0f33" },

  filterScroll: { marginBottom: 16 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  filterChipActive: { backgroundColor: BRAND_COLORS.darkPurple, borderColor: BRAND_COLORS.darkPurple },
  filterChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  filterChipTextActive: { color: "#fff" },

  projectCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardName: { fontSize: 16, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  cardNumber: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },

  cardMeta: { flexDirection: "row", gap: 16, marginBottom: 10 },
  metaText: { fontSize: 12, color: "#6b7280" },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: "600", color: "#374151", minWidth: 35, textAlign: "right" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  footerStat: { fontSize: 12, color: "#6b7280" },

  emptyState: { alignItems: "center", paddingVertical: 48, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  emptyText: { fontSize: 13, color: "#6b7280", marginTop: 4 },

  paginationWrap: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 20 },
  paginationInfo: { fontSize: 12, color: "#9ca3af", marginBottom: 10 },
  paginationBtns: { flexDirection: "row", gap: 12 },
  pageBtn: { minWidth: 100, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { fontSize: 13, fontWeight: "600", color: BRAND_COLORS.darkPurple },
});
