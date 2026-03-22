import { Alert } from "react-native";
import type { Priority, ProjectStatus, TaskStatus, ExpenseCategory } from "../types";

export const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  draft: { bg: "#e5e7eb", text: "#374151" },
  active: { bg: "#dbeafe", text: "#1d4ed8" },
  on_hold: { bg: "#fef3c7", text: "#92400e" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  archived: { bg: "#f1f5f9", text: "#475569" },
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#6b7280",
  medium: "#2563eb",
  high: "#c2410c",
  urgent: "#dc2626",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; border: string }> = {
  todo: { bg: "#f3f4f6", border: "#9ca3af" },
  in_progress: { bg: "#dbeafe", border: "#3b82f6" },
  review: { bg: "#fef3c7", border: "#f59e0b" },
  done: { bg: "#d1fae5", border: "#10b981" },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "general", "materials", "labor", "travel", "equipment", "software", "subcontractor", "other",
];

export function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function confirmDelete(label: string, onConfirm: () => void): void {
  Alert.alert(`Delete ${label}?`, "This action cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}
