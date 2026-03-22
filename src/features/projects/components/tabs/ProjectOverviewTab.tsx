import React from "react";
import { View, Text } from "react-native";
import type { Project } from "../../types";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "../../utils/projectUtils";
import { tabStyles as s } from "./tabStyles";

interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
}

interface MilestoneStats {
  total: number;
  completed: number;
  billable_total: number;
  unbilled_total: number;
}

interface Props {
  project: Project;
  taskStats: TaskStats | null;
  milestoneStats: MilestoneStats | null;
}

export default function ProjectOverviewTab({ project, taskStats, milestoneStats }: Props) {
  return (
    <View style={s.tabContent}>
      {/* Description */}
      {project.description && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Description</Text>
          <Text style={s.cardBody}>{project.description}</Text>
        </View>
      )}

      {/* Task Breakdown */}
      {taskStats && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Task Breakdown</Text>
          {(["todo", "in_progress", "review", "done", "overdue"] as const).map((key) => {
            const val = key === "overdue" ? taskStats.overdue : taskStats[key];
            const total = taskStats.total || 1;
            const pct = Math.round((val / total) * 100);
            return (
              <View key={`task-stat-${key}`} style={s.breakdownRow}>
                <Text style={s.breakdownLabel}>
                  {key === "overdue" ? "Overdue" : TASK_STATUS_LABELS[key]}
                </Text>
                <View style={s.breakdownBar}>
                  <View
                    style={[
                      s.breakdownFill,
                      {
                        width: `${pct}%`,
                        backgroundColor:
                          key === "overdue"
                            ? "#ef4444"
                            : TASK_STATUS_COLORS[key]?.border ?? "#9ca3af",
                      },
                    ]}
                  />
                </View>
                <Text style={s.breakdownValue}>{val}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Milestone Summary */}
      {milestoneStats && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Milestone Summary</Text>
          <View style={s.summaryGrid}>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{milestoneStats.total}</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={[s.summaryValue, { color: "#10b981" }]}>{milestoneStats.completed}</Text>
              <Text style={s.summaryLabel}>Completed</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{formatCurrency(milestoneStats.billable_total)}</Text>
              <Text style={s.summaryLabel}>Billable</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={[s.summaryValue, { color: "#f59e0b" }]}>
                {formatCurrency(milestoneStats.unbilled_total)}
              </Text>
              <Text style={s.summaryLabel}>Unbilled</Text>
            </View>
          </View>
        </View>
      )}

      {/* Project Info */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Project Info</Text>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Number</Text>
          <Text style={s.infoValue}>{project.project_number}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Client</Text>
          <Text style={s.infoValue}>
            {project.customer
              ? project.customer.company_name ||
                `${project.customer.first_name} ${project.customer.last_name}`
              : "—"}
          </Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Manager</Text>
          <Text style={s.infoValue}>{project.assigned_user?.name || "—"}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Created by</Text>
          <Text style={s.infoValue}>{project.creator?.name || "—"}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Timeline</Text>
          <Text style={s.infoValue}>
            {formatDate(project.start_date)} → {formatDate(project.end_date)}
          </Text>
        </View>
      </View>
    </View>
  );
}
