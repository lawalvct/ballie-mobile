import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { projectService } from "../services/projectService";
import type {
  ProjectListFilters,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateMilestonePayload,
  UpdateMilestonePayload,
  CreateExpensePayload,
  CreateNotePayload,
} from "../types";

// ── List ──────────────────────────────────────────────────────────────────────

export function useProjects(filters?: ProjectListFilters) {
  const qc = useQueryClient();
  const query = useApiQuery(
    queryKeys.projects.list(filters),
    () => projectService.list(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    projects: query.data?.data ?? [],
    stats: query.data?.stats ?? null,
    pagination: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => qc.invalidateQueries({ queryKey: queryKeys.projects.lists() }),
  };
}

// ── Detail ────────────────────────────────────────────────────────────────────

export function useProjectDetail(id: number) {
  const qc = useQueryClient();
  const query = useApiQuery(
    queryKeys.projects.detail(id),
    () => projectService.detail(id),
    { staleTime: 60 * 1000, enabled: !!id },
  );

  return {
    project: query.data?.data?.project ?? null,
    taskStats: query.data?.data?.task_stats ?? null,
    milestoneStats: query.data?.data?.milestone_stats ?? null,
    progress: query.data?.data?.progress ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) }),
  };
}

// ── Form Data ─────────────────────────────────────────────────────────────────

export function useProjectFormData() {
  const query = useApiQuery(
    queryKeys.projects.formData(),
    () => projectService.formData(),
    { staleTime: 5 * 60 * 1000 },
  );
  return {
    formData: query.data?.data ?? null,
    isLoading: query.isLoading,
  };
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateProject() {
  return useApiMutation(
    (data: CreateProjectPayload) => projectService.create(data),
    {
      invalidateKeys: [queryKeys.projects.all],
      successMessage: "Project created",
    },
  );
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateProject(id: number) {
  return useApiMutation(
    (data: UpdateProjectPayload) => projectService.update(id, data),
    {
      invalidateKeys: [queryKeys.projects.all],
      successMessage: "Project updated",
    },
  );
}

// ── Update Status ─────────────────────────────────────────────────────────────

export function useUpdateProjectStatus(id: number) {
  return useApiMutation(
    (status: string) => projectService.updateStatus(id, status),
    {
      invalidateKeys: [queryKeys.projects.all, queryKeys.projects.detail(id)],
      successMessage: "Status updated",
    },
  );
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteProject() {
  return useApiMutation(
    (id: number) => projectService.delete(id),
    {
      invalidateKeys: [queryKeys.projects.all],
      successMessage: "Project deleted",
    },
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function useAddTask(projectId: number) {
  return useApiMutation(
    (data: CreateTaskPayload) => projectService.addTask(projectId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Task added",
    },
  );
}

export function useUpdateTask(projectId: number) {
  return useApiMutation(
    ({ taskId, data }: { taskId: number; data: UpdateTaskPayload }) =>
      projectService.updateTask(projectId, taskId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
    },
  );
}

export function useDeleteTask(projectId: number) {
  return useApiMutation(
    (taskId: number) => projectService.deleteTask(projectId, taskId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Task deleted",
    },
  );
}

// ── Milestones ────────────────────────────────────────────────────────────────

export function useAddMilestone(projectId: number) {
  return useApiMutation(
    (data: CreateMilestonePayload) => projectService.addMilestone(projectId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Milestone added",
    },
  );
}

export function useUpdateMilestone(projectId: number) {
  return useApiMutation(
    ({ milestoneId, data }: { milestoneId: number; data: UpdateMilestonePayload }) =>
      projectService.updateMilestone(projectId, milestoneId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
    },
  );
}

export function useDeleteMilestone(projectId: number) {
  return useApiMutation(
    (milestoneId: number) => projectService.deleteMilestone(projectId, milestoneId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Milestone deleted",
    },
  );
}

export function useInvoiceMilestone(projectId: number) {
  return useApiMutation(
    (milestoneId: number) => projectService.invoiceMilestone(projectId, milestoneId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Milestone invoiced",
    },
  );
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export function useAddExpense(projectId: number) {
  return useApiMutation(
    (data: CreateExpensePayload) => projectService.addExpense(projectId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Expense recorded",
    },
  );
}

export function useDeleteExpense(projectId: number) {
  return useApiMutation(
    (expenseId: number) => projectService.deleteExpense(projectId, expenseId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Expense deleted",
    },
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function useAddNote(projectId: number) {
  return useApiMutation(
    (data: CreateNotePayload) => projectService.addNote(projectId, data),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Note added",
    },
  );
}

export function useDeleteNote(projectId: number) {
  return useApiMutation(
    (noteId: number) => projectService.deleteNote(projectId, noteId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "Note deleted",
    },
  );
}

// ── Attachments ───────────────────────────────────────────────────────────────

export function useUploadAttachment(projectId: number) {
  return useApiMutation(
    (formData: FormData) => projectService.uploadAttachment(projectId, formData),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "File uploaded",
    },
  );
}

export function useDeleteAttachment(projectId: number) {
  return useApiMutation(
    (attachmentId: number) => projectService.deleteAttachment(projectId, attachmentId),
    {
      invalidateKeys: [queryKeys.projects.detail(projectId)],
      successMessage: "File deleted",
    },
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function useProjectReports() {
  const qc = useQueryClient();
  const query = useApiQuery(
    queryKeys.projects.reports(),
    () => projectService.reports(),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    reports: query.data?.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => qc.invalidateQueries({ queryKey: queryKeys.projects.reports() }),
  };
}
