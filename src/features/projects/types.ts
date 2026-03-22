// ── Project Module Types ─────────────────────────────────────────────────────

export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type ExpenseCategory =
  | "general"
  | "materials"
  | "labor"
  | "travel"
  | "equipment"
  | "software"
  | "subcontractor"
  | "other";

// ── Supporting ───────────────────────────────────────────────────────────────

export interface ProjectCustomer {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string | null;
}

export interface ProjectUser {
  id: number;
  name: string;
  email: string;
}

export interface ProjectVoucher {
  id: number;
  voucher_number: string;
}

// ── Core Models ──────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  tenant_id: number;
  customer_id: number | null;
  name: string;
  slug: string;
  project_number: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  actual_cost: number;
  currency: string;
  assigned_to: number | null;
  created_by: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: ProjectCustomer | null;
  assigned_user?: ProjectUser | null;
  creator?: ProjectUser | null;
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
  notes?: ProjectNote[];
  attachments?: ProjectAttachment[];
  expenses?: ProjectExpense[];
  progress?: number;
  completed_tasks?: number;
  tasks_count?: number;
  milestones_count?: number;
  expenses_count?: number;
  notes_count?: number;
  attachments_count?: number;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigned_to: number | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: string;
  updated_at: string;
  assigned_user?: ProjectUser | null;
  is_overdue?: boolean;
  status_color?: string;
  status_label?: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  amount: number | null;
  is_billable: boolean;
  invoice_id: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  invoice?: ProjectVoucher | null;
  is_completed?: boolean;
  is_billed?: boolean;
  status_label?: string;
  status_color?: string;
}

export interface ProjectExpense {
  id: number;
  project_id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  amount: number;
  expense_date: string;
  category: string | null;
  voucher_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: ProjectUser | null;
  voucher?: ProjectVoucher | null;
}

export interface ProjectNote {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: ProjectUser;
}

export interface ProjectAttachment {
  id: number;
  project_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  user?: ProjectUser;
}

// ── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  customer_id?: number | null;
  assigned_to?: number | null;
  status: ProjectStatus;
  priority: Priority;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
}

export interface UpdateProjectPayload extends CreateProjectPayload {}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  priority: Priority;
  assigned_to?: number | null;
  due_date?: string | null;
  estimated_hours?: number | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  assigned_to?: number | null;
  due_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  sort_order?: number | null;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  amount?: number | null;
  is_billable?: boolean;
}

export interface UpdateMilestonePayload {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  amount?: number | null;
  is_billable?: boolean;
  mark_complete?: boolean;
  mark_incomplete?: boolean;
}

export interface CreateExpensePayload {
  title: string;
  description?: string | null;
  amount: number;
  expense_date: string;
  category?: ExpenseCategory | null;
}

export interface CreateNotePayload {
  content: string;
  is_internal?: boolean;
}

// ── API Responses ────────────────────────────────────────────────────────────

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
}

export interface MilestoneStats {
  total: number;
  completed: number;
  billable_total: number;
  billed_total: number;
  unbilled_total: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  stats?: ProjectStats;
  meta: PaginationMeta;
}

export interface ProjectDetailResponse {
  success: boolean;
  data: {
    project: Project;
    task_stats: TaskStats;
    milestone_stats: MilestoneStats;
    progress: number;
  };
}

export interface ProjectFormData {
  customers: ProjectCustomer[];
  team_members: ProjectUser[];
  statuses: ProjectStatus[];
  priorities: Priority[];
}

export interface ReportProject {
  id: number;
  name: string;
  project_number: string;
  status: ProjectStatus;
  priority: Priority;
  customer: string | null;
  assigned_to: string | null;
  budget: number;
  actual_cost: number;
  tasks_count: number;
  milestones_count: number;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  is_overdue: boolean;
  days_remaining: number | null;
}

export interface ReportsData {
  summary: {
    total: number;
    active: number;
    completed: number;
    on_hold: number;
    total_budget: number;
    total_cost: number;
    overdue: number;
  };
  status_distribution: Record<ProjectStatus, number>;
  projects: ReportProject[];
}

export interface ProjectListFilters {
  search?: string;
  status?: ProjectStatus | "all";
  priority?: Priority | "all";
  customer_id?: number;
  assigned_to?: number;
  per_page?: number;
  page?: number;
}
