import React, { useState } from "react";
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
import { useProjectDetail, useUpdateProjectStatus } from "../hooks/useProjects";
import type { ProjectStatus } from "../types";
import { STATUS_COLORS, formatCurrency } from "../utils/projectUtils";
import ProjectOverviewTab from "../components/tabs/ProjectOverviewTab";
import ProjectTasksTab from "../components/tabs/ProjectTasksTab";
import ProjectMilestonesTab from "../components/tabs/ProjectMilestonesTab";
import ProjectExpensesTab from "../components/tabs/ProjectExpensesTab";
import ProjectNotesTab from "../components/tabs/ProjectNotesTab";
import ProjectFilesTab from "../components/tabs/ProjectFilesTab";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectDetail">;

type TabKey = "overview" | "tasks" | "milestones" | "expenses" | "notes" | "files";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "📋" },
  { key: "tasks", label: "Tasks", icon: "✅" },
  { key: "milestones", label: "Milestones", icon: "🏁" },
  { key: "expenses", label: "Expenses", icon: "💸" },
  { key: "notes", label: "Notes", icon: "📝" },
  { key: "files", label: "Files", icon: "📎" },
];

export default function ProjectDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { project, taskStats, milestoneStats, progress, isLoading, isRefreshing, refresh } =
    useProjectDetail(id);
  const updateStatus = useUpdateProjectStatus(id);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleStatusChange = (status: ProjectStatus) => {
    setShowStatusPicker(false);
    updateStatus.mutate(status);
  };

  if (isLoading || !project) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading project…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_COLORS[project.status];
  const budgetUsed = project.budget ? Math.round((project.actual_cost / project.budget) * 100) : 0;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <ProjectOverviewTab project={project} taskStats={taskStats} milestoneStats={milestoneStats} />;
      case "tasks":
        return <ProjectTasksTab projectId={id} tasks={project.tasks ?? []} />;
      case "milestones":
        return <ProjectMilestonesTab projectId={id} milestones={project.milestones ?? []} />;
      case "expenses":
        return <ProjectExpensesTab projectId={id} expenses={project.expenses ?? []} />;
      case "notes":
        return <ProjectNotesTab projectId={id} notes={project.notes ?? []} />;
      case "files":
        return <ProjectFilesTab projectId={id} attachments={project.attachments ?? []} />;
    }
  };

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
        {/* Header — back + project name only */}
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.hero}>
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBackBtn}>
              <Text style={styles.heroBack}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.heroTitle} numberOfLines={1}>{project.name}</Text>
            <View style={styles.heroBackBtn} />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Project info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardTop}>
              <Text style={styles.infoCardNumber}>{project.project_number}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ProjectEdit", { id })}>
                <Text style={styles.infoCardEdit}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCardMeta}>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
                onPress={() => setShowStatusPicker(!showStatusPicker)}>
                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                  {project.status.replace("_", " ")} ▼
                </Text>
              </TouchableOpacity>

              <View style={styles.progressPill}>
                <Text style={styles.progressPillText}>{progress}% complete</Text>
              </View>
            </View>

            {/* Status picker */}
            {showStatusPicker && (
              <View style={styles.statusPicker}>
                {(["draft", "active", "on_hold", "completed", "archived"] as ProjectStatus[]).map((s) => (
                  <TouchableOpacity key={`sp-${s}`} style={styles.statusPickerItem} onPress={() => handleStatusChange(s)}>
                    <View style={[styles.statusPickerDot, { backgroundColor: STATUS_COLORS[s].text }]} />
                    <Text style={styles.statusPickerText}>{s.replace("_", " ")}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Budget */}
            {project.budget != null && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget: {formatCurrency(project.budget)}</Text>
                <Text style={styles.budgetLabel}>Spent: {formatCurrency(project.actual_cost)} ({budgetUsed}%)</Text>
              </View>
            )}
          </View>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={`tab-${tab.key}`}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active tab content */}
          {renderActiveTab()}

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

  // Hero (slim)
  hero: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  heroTop: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  heroBackBtn: { width: 60 },
  heroBack: { fontSize: 15, color: BRAND_COLORS.gold, fontWeight: "600" },
  heroTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: "#fff", textAlign: "center" },

  // Info card (white)
  infoCard: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, zIndex: 10 },
  infoCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  infoCardNumber: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  infoCardEdit: { fontSize: 14, color: BRAND_COLORS.blue, fontWeight: "600" },
  infoCardMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  progressPill: { backgroundColor: "#f3f4f6", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  progressPillText: { fontSize: 12, fontWeight: "600", color: BRAND_COLORS.darkPurple },

  statusPicker: { backgroundColor: "#fff", borderRadius: 12, marginTop: 8, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  statusPickerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, gap: 10 },
  statusPickerDot: { width: 10, height: 10, borderRadius: 5 },
  statusPickerText: { fontSize: 14, fontWeight: "500", color: "#374151", textTransform: "capitalize" },

  budgetRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  budgetLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },

  // Body
  body: { flex: 1, backgroundColor: "#f3f4f8", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -1 },

  // Tabs
  tabScroll: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  tabContainer: { paddingHorizontal: 12, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: BRAND_COLORS.gold },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  tabLabelActive: { color: BRAND_COLORS.darkPurple, fontWeight: "700" },

});
