import apiClient from "../../../api/client";
import type {
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectFormData,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateMilestonePayload,
  UpdateMilestonePayload,
  CreateExpensePayload,
  CreateNotePayload,
  ReportsData,
  ProjectListFilters,
  Project,
  ProjectTask,
  ProjectMilestone,
  ProjectExpense,
  ProjectNote,
  ProjectAttachment,
} from "../types";

const BASE = "/projects";

export const projectService = {
  // ── Projects CRUD ────────────────────────────────────────────────────────
  list: (params?: ProjectListFilters) =>
    apiClient.get(BASE, { params }) as Promise<ProjectListResponse>,

  detail: (id: number) =>
    apiClient.get(`${BASE}/${id}`) as Promise<ProjectDetailResponse>,

  formData: () =>
    apiClient.get(`${BASE}/form-data`) as Promise<{ success: boolean; data: ProjectFormData }>,

  create: (data: CreateProjectPayload) =>
    apiClient.post(BASE, data) as Promise<{ success: boolean; message: string; data: Project }>,

  update: (id: number, data: UpdateProjectPayload) =>
    apiClient.put(`${BASE}/${id}`, data) as Promise<{ success: boolean; message: string; data: Project }>,

  updateStatus: (id: number, status: string) =>
    apiClient.patch(`${BASE}/${id}/status`, { status }) as Promise<{ success: boolean; message: string }>,

  delete: (id: number) =>
    apiClient.delete(`${BASE}/${id}`) as Promise<{ success: boolean; message: string }>,

  // ── Tasks ────────────────────────────────────────────────────────────────
  addTask: (projectId: number, data: CreateTaskPayload) =>
    apiClient.post(`${BASE}/${projectId}/tasks`, data) as Promise<{ success: boolean; message: string; data: ProjectTask }>,

  updateTask: (projectId: number, taskId: number, data: UpdateTaskPayload) =>
    apiClient.put(`${BASE}/${projectId}/tasks/${taskId}`, data) as Promise<{ success: boolean; message: string; data: ProjectTask }>,

  deleteTask: (projectId: number, taskId: number) =>
    apiClient.delete(`${BASE}/${projectId}/tasks/${taskId}`) as Promise<{ success: boolean; message: string }>,

  // ── Milestones ───────────────────────────────────────────────────────────
  addMilestone: (projectId: number, data: CreateMilestonePayload) =>
    apiClient.post(`${BASE}/${projectId}/milestones`, data) as Promise<{ success: boolean; message: string; data: ProjectMilestone }>,

  updateMilestone: (projectId: number, milestoneId: number, data: UpdateMilestonePayload) =>
    apiClient.put(`${BASE}/${projectId}/milestones/${milestoneId}`, data) as Promise<{ success: boolean; message: string; data: ProjectMilestone }>,

  deleteMilestone: (projectId: number, milestoneId: number) =>
    apiClient.delete(`${BASE}/${projectId}/milestones/${milestoneId}`) as Promise<{ success: boolean; message: string }>,

  invoiceMilestone: (projectId: number, milestoneId: number) =>
    apiClient.post(`${BASE}/${projectId}/milestones/${milestoneId}/invoice`) as Promise<{ success: boolean; message: string; voucher_number: string }>,

  // ── Expenses ─────────────────────────────────────────────────────────────
  addExpense: (projectId: number, data: CreateExpensePayload) =>
    apiClient.post(`${BASE}/${projectId}/expenses`, data) as Promise<{ success: boolean; message: string; data: ProjectExpense }>,

  deleteExpense: (projectId: number, expenseId: number) =>
    apiClient.delete(`${BASE}/${projectId}/expenses/${expenseId}`) as Promise<{ success: boolean; message: string }>,

  // ── Notes ────────────────────────────────────────────────────────────────
  addNote: (projectId: number, data: CreateNotePayload) =>
    apiClient.post(`${BASE}/${projectId}/notes`, data) as Promise<{ success: boolean; message: string; data: ProjectNote }>,

  deleteNote: (projectId: number, noteId: number) =>
    apiClient.delete(`${BASE}/${projectId}/notes/${noteId}`) as Promise<{ success: boolean; message: string }>,

  // ── Attachments ──────────────────────────────────────────────────────────
  uploadAttachment: (projectId: number, formData: FormData) =>
    apiClient.post(`${BASE}/${projectId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as Promise<{ success: boolean; message: string; data: ProjectAttachment }>,

  deleteAttachment: (projectId: number, attachmentId: number) =>
    apiClient.delete(`${BASE}/${projectId}/attachments/${attachmentId}`) as Promise<{ success: boolean; message: string }>,

  // ── Reports ──────────────────────────────────────────────────────────────
  reports: () =>
    apiClient.get(`${BASE}/reports`) as Promise<{ success: boolean; data: ReportsData }>,
};
