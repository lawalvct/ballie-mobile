# Project Module — Mobile API Guide

> **For:** React Native mobile developers  
> **Base URL:** `https://your-domain.com/api/v1/tenant/{tenant_slug}`  
> **Auth:** Bearer token via `Authorization: Bearer {token}`  
> **Content-Type:** `application/json` (unless uploading files → `multipart/form-data`)

---

## Table of Contents

1. [Screens Overview](#screens-overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Endpoints](#endpoints)
   - [Projects CRUD](#1-projects)
   - [Tasks](#2-tasks)
   - [Milestones](#3-milestones)
   - [Expenses](#4-expenses)
   - [Notes](#5-notes)
   - [Attachments](#6-attachments)
   - [Reports](#7-reports)
4. [Error Handling](#error-handling)
5. [Status & Priority Reference](#status--priority-reference)

---

## Screens Overview

| # | Screen | Description | Key Endpoint(s) |
|---|--------|-------------|-----------------|
| 1 | **Project List** | Filterable & searchable list with stats cards (Total, Active, Completed, Overdue). Each card shows name, number, status/priority badges, client, manager, progress bar, task count, budget. | `GET /projects` |
| 2 | **Create Project** | Multi-step form: Step 1 — name, description, client, manager, status, priority. Step 2 — start date, end date, budget. Includes quick-add client/manager modals. | `POST /projects`, `GET /projects/form-data` |
| 3 | **Edit Project** | Same form as Create, pre-filled. Includes delete action with confirmation. | `PUT /projects/{id}`, `DELETE /projects/{id}` |
| 4 | **Project Detail** | Tabbed view with header (status badge, progress %, timeline, budget utilization). 6 tabs: Overview, Tasks, Milestones, Notes, Files, Expenses. Status update dropdown. | `GET /projects/{id}` |
| 5 | **Overview Tab** | Description (expandable), task breakdown (To Do/In Progress/Review/Done/Overdue), milestone summary (Total/Completed/Billable/Unbilled), sidebar with project number, client, manager, created by. | Part of `GET /projects/{id}` response |
| 6 | **Tasks Tab** | Inline add form (title, priority, assignee, due date). Task list with status dropdown, priority badge, assignee, due date, delete. Status color-coded left border. | `POST /projects/{id}/tasks`, `PUT .../tasks/{id}`, `DELETE .../tasks/{id}` |
| 7 | **Milestones Tab** | Inline add form (title, amount, due date, billable checkbox). List with completion toggle, amount, billable indicator, invoice badge, invoice button (conditional), delete. | `POST .../milestones`, `PUT .../milestones/{id}`, `DELETE .../milestones/{id}`, `POST .../milestones/{id}/invoice` |
| 8 | **Expenses Tab** | Inline add form (title, amount, date, category, description). Expense cards with amount (red), category badge, date, creator, voucher ref, delete. | `POST .../expenses`, `DELETE .../expenses/{id}` |
| 9 | **Notes Tab** | Textarea + internal checkbox. Notes feed with user avatar (initials), name, timestamp, internal badge, content, delete. | `POST .../notes`, `DELETE .../notes/{id}` |
| 10 | **Files Tab** | File picker (max 10 MB). File list with icon (image vs document), name, size, uploader, time, download, delete. | `POST .../attachments`, `DELETE .../attachments/{id}`, `GET .../attachments/{id}/download` |
| 11 | **Reports Dashboard** | Summary cards (Total, Active, Completed, Overdue). Budget overview (total budget, actual cost, utilization %, remaining). Status distribution. All-projects table with progress. | `GET /projects/reports` |

---

## TypeScript Interfaces

```typescript
// ─── Core Models ──────────────────────────────────

interface Project {
  id: number;
  tenant_id: number;
  customer_id: number | null;
  name: string;
  slug: string;
  project_number: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  start_date: string | null;   // "YYYY-MM-DD"
  end_date: string | null;
  budget: number | null;
  actual_cost: number;
  currency: string;
  assigned_to: number | null;
  created_by: number;
  completed_at: string | null;  // ISO datetime
  created_at: string;
  updated_at: string;

  // Relationships (loaded)
  customer?: Customer | null;
  assigned_user?: User | null;
  creator?: User | null;
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
  notes?: ProjectNote[];
  attachments?: ProjectAttachment[];
  expenses?: ProjectExpense[];

  // Computed (added by API)
  progress?: number;          // 0–100
  completed_tasks?: number;
  tasks_count?: number;
  milestones_count?: number;
  expenses_count?: number;
  notes_count?: number;
  attachments_count?: number;
}

type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

interface ProjectTask {
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
  assigned_user?: User | null;
  is_overdue?: boolean;
  status_color?: string;
  status_label?: string;
}

interface ProjectMilestone {
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
  invoice?: Voucher | null;
  is_completed?: boolean;
  is_billed?: boolean;
  status_label?: string;
  status_color?: string;
}

interface ProjectExpense {
  id: number;
  project_id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  amount: number;
  expense_date: string;       // "YYYY-MM-DD"
  category: string | null;
  voucher_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User | null;
  voucher?: Voucher | null;
}

interface ProjectNote {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

interface ProjectAttachment {
  id: number;
  project_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_size: number;           // bytes
  mime_type: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ─── Supporting ───────────────────────────────────

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Voucher {
  id: number;
  voucher_number: string;
}

// ─── API Responses ────────────────────────────────

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  stats?: ProjectStats;
  meta: PaginationMeta;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

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
  billed_total: number;
  unbilled_total: number;
}

interface FormData {
  customers: Customer[];
  team_members: User[];
  statuses: ProjectStatus[];
  priorities: Priority[];
}

interface ReportsData {
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

interface ReportProject {
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
```

---

## Endpoints

### 1. Projects

#### `GET /projects` — List Projects

Paginated list with optional filters and aggregate stats.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name, number, or description |
| `status` | string | `draft`, `active`, `on_hold`, `completed`, `archived`, or `all` |
| `priority` | string | `low`, `medium`, `high`, `urgent`, or `all` |
| `customer_id` | int | Filter by client ID |
| `assigned_to` | int | Filter by team member ID |
| `per_page` | int | Items per page (default: 15) |
| `page` | int | Page number |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Website Redesign",
      "project_number": "PRJ-0001",
      "slug": "website-redesign-a5x2k",
      "description": "Full redesign of the company website",
      "status": "active",
      "priority": "high",
      "start_date": "2025-01-15",
      "end_date": "2025-06-30",
      "budget": 500000.00,
      "actual_cost": 125000.00,
      "currency": "NGN",
      "customer_id": 3,
      "assigned_to": 7,
      "completed_at": null,
      "created_at": "2025-01-10T09:00:00.000000Z",
      "updated_at": "2025-05-20T14:30:00.000000Z",
      "customer": {
        "id": 3,
        "first_name": "Adewale",
        "last_name": "Okonkwo",
        "company_name": "TechVista Ltd"
      },
      "assigned_user": {
        "id": 7,
        "name": "Fatima Ibrahim",
        "email": "fatima@example.com"
      },
      "tasks_count": 12,
      "milestones_count": 4,
      "expenses_count": 6,
      "notes_count": 3,
      "attachments_count": 2,
      "progress": 58,
      "completed_tasks": 7
    }
  ],
  "stats": {
    "total": 15,
    "active": 8,
    "completed": 5,
    "overdue": 2
  },
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 15
  }
}
```

---

#### `GET /projects/form-data` — Form Data (Dropdowns)

Returns customers, team members, statuses, and priorities for create/edit forms.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "customers": [
      { "id": 1, "first_name": "Adewale", "last_name": "Okonkwo", "company_name": "TechVista Ltd" },
      { "id": 2, "first_name": "Chioma", "last_name": "Eze", "company_name": null }
    ],
    "team_members": [
      { "id": 5, "name": "Fatima Ibrahim", "email": "fatima@example.com" },
      { "id": 6, "name": "Tunde Bakare", "email": "tunde@example.com" }
    ],
    "statuses": ["draft", "active", "on_hold", "completed", "archived"],
    "priorities": ["low", "medium", "high", "urgent"]
  }
}
```

---

#### `POST /projects` — Create Project

**Payload:**

```json
{
  "name": "Mobile App Development",
  "description": "Build the Ballie mobile app for iOS and Android",
  "customer_id": 3,
  "assigned_to": 7,
  "status": "active",
  "priority": "high",
  "start_date": "2025-02-01",
  "end_date": "2025-08-31",
  "budget": 2500000
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `name` | required, string, max 255 |
| `description` | nullable, string, max 65000 |
| `customer_id` | nullable, must exist in customers table + belong to tenant |
| `status` | required, one of: `draft`, `active`, `on_hold`, `completed`, `archived` |
| `priority` | required, one of: `low`, `medium`, `high`, `urgent` |
| `start_date` | nullable, valid date |
| `end_date` | nullable, valid date, must be ≥ start_date |
| `budget` | nullable, numeric, min 0 |
| `assigned_to` | nullable, must exist in users table + belong to tenant |

**Response `201`:**

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": 16,
    "name": "Mobile App Development",
    "project_number": "PRJ-0016",
    "slug": "mobile-app-development-k8m3z",
    "status": "active",
    "priority": "high",
    "start_date": "2025-02-01",
    "end_date": "2025-08-31",
    "budget": 2500000.00,
    "actual_cost": 0.00,
    "customer": { "id": 3, "first_name": "Adewale", "last_name": "Okonkwo", "company_name": "TechVista Ltd" },
    "assigned_user": { "id": 7, "name": "Fatima Ibrahim", "email": "fatima@example.com" },
    "creator": { "id": 1, "name": "Admin User", "email": "admin@example.com" },
    "created_at": "2025-06-01T10:00:00.000000Z",
    "updated_at": "2025-06-01T10:00:00.000000Z"
  }
}
```

---

#### `GET /projects/{id}` — Project Detail

Returns full project with all relations, task stats, milestone stats, and progress.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "name": "Website Redesign",
      "project_number": "PRJ-0001",
      "description": "<p>Full redesign of the company website...</p>",
      "status": "active",
      "priority": "high",
      "start_date": "2025-01-15",
      "end_date": "2025-06-30",
      "budget": 500000.00,
      "actual_cost": 125000.00,
      "customer": { "id": 3, "first_name": "Adewale", "last_name": "Okonkwo", "company_name": "TechVista Ltd" },
      "assigned_user": { "id": 7, "name": "Fatima Ibrahim" },
      "creator": { "id": 1, "name": "Admin User" },
      "tasks": [
        {
          "id": 1,
          "title": "Setup project repository",
          "status": "done",
          "priority": "high",
          "due_date": "2025-01-20",
          "completed_at": "2025-01-19T16:00:00.000000Z",
          "sort_order": 0,
          "estimated_hours": 2.00,
          "actual_hours": 1.50,
          "assigned_user": { "id": 7, "name": "Fatima Ibrahim" }
        }
      ],
      "milestones": [
        {
          "id": 1,
          "title": "Design Approval",
          "due_date": "2025-02-28",
          "completed_at": "2025-02-25T10:00:00.000000Z",
          "amount": 100000.00,
          "is_billable": true,
          "invoice_id": 42,
          "invoice": { "id": 42, "voucher_number": "INV-0042" },
          "sort_order": 0
        }
      ],
      "expenses": [
        {
          "id": 1,
          "title": "Domain purchase",
          "amount": 15000.00,
          "expense_date": "2025-01-16",
          "category": "software",
          "description": "Annual domain renewal",
          "creator": { "id": 1, "name": "Admin User" },
          "voucher": { "id": 50, "voucher_number": "EXP-0050" }
        }
      ],
      "notes": [
        {
          "id": 1,
          "content": "Client approved the wireframes in today's meeting.",
          "is_internal": false,
          "created_at": "2025-02-10T11:30:00.000000Z",
          "user": { "id": 1, "name": "Admin User" }
        }
      ],
      "attachments": [
        {
          "id": 1,
          "file_name": "wireframe-v2.pdf",
          "file_path": "tenants/1/projects/1/wireframe-v2.pdf",
          "file_size": 2048576,
          "mime_type": "application/pdf",
          "created_at": "2025-02-08T09:00:00.000000Z",
          "user": { "id": 7, "name": "Fatima Ibrahim" }
        }
      ]
    },
    "task_stats": {
      "total": 12,
      "todo": 2,
      "in_progress": 3,
      "review": 0,
      "done": 7,
      "overdue": 1
    },
    "milestone_stats": {
      "total": 4,
      "completed": 2,
      "billable_total": 350000.00,
      "billed_total": 100000.00,
      "unbilled_total": 50000.00
    },
    "progress": 58
  }
}
```

---

#### `PUT /projects/{id}` — Update Project

**Payload:** Same fields as Create (all required fields must be sent).

```json
{
  "name": "Website Redesign v2",
  "description": "Updated scope including mobile-responsive design",
  "customer_id": 3,
  "assigned_to": 7,
  "status": "active",
  "priority": "urgent",
  "start_date": "2025-01-15",
  "end_date": "2025-07-31",
  "budget": 650000
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": { "...project object..." }
}
```

---

#### `PATCH /projects/{id}/status` — Update Status

Quick status change. Cannot mark as `completed` if unfinished tasks exist.

**Payload:**

```json
{
  "status": "completed"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Project status updated to Completed.",
  "data": { "status": "completed" }
}
```

**Response `422` (tasks incomplete):**

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "status": ["Cannot mark project as completed — 7 of 12 tasks are done. All tasks must be completed first."]
  }
}
```

---

#### `DELETE /projects/{id}` — Delete Project

Soft deletes the project.

**Response `200`:**

```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

---

### 2. Tasks

#### `POST /projects/{id}/tasks` — Add Task

**Payload:**

```json
{
  "title": "Design landing page mockup",
  "description": "Create the first iteration of the landing page",
  "priority": "high",
  "assigned_to": 7,
  "due_date": "2025-03-15",
  "estimated_hours": 8
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `title` | required, string, max 255 |
| `description` | nullable, string, max 2000 |
| `priority` | required, in: `low`, `medium`, `high`, `urgent` |
| `assigned_to` | nullable, must exist in users |
| `due_date` | nullable, date |
| `estimated_hours` | nullable, numeric, min 0 |

**Response `201`:**

```json
{
  "success": true,
  "message": "Task added successfully.",
  "data": {
    "id": 25,
    "project_id": 1,
    "title": "Design landing page mockup",
    "description": "Create the first iteration of the landing page",
    "status": "todo",
    "priority": "high",
    "assigned_to": 7,
    "due_date": "2025-03-15",
    "completed_at": null,
    "sort_order": 12,
    "estimated_hours": 8.00,
    "actual_hours": null,
    "assigned_user": { "id": 7, "name": "Fatima Ibrahim" },
    "created_at": "2025-06-01T10:30:00.000000Z"
  }
}
```

---

#### `PUT /projects/{projectId}/tasks/{taskId}` — Update Task

Partial updates supported via `sometimes` rules.

**Payload (status change):**

```json
{
  "status": "in_progress"
}
```

**Payload (full update):**

```json
{
  "title": "Design landing page mockup v2",
  "status": "review",
  "priority": "urgent",
  "assigned_to": 6,
  "due_date": "2025-03-20",
  "actual_hours": 6.5
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `title` | sometimes required, string, max 255 |
| `description` | nullable, string, max 2000 |
| `status` | sometimes, in: `todo`, `in_progress`, `review`, `done` |
| `priority` | sometimes, in: `low`, `medium`, `high`, `urgent` |
| `assigned_to` | nullable, integer |
| `due_date` | nullable, date |
| `estimated_hours` | nullable, numeric, min 0 |
| `actual_hours` | nullable, numeric, min 0 |
| `sort_order` | nullable, integer |

> **Note:** When status changes to `done`, `completed_at` is auto-set by the model. When status changes away from `done`, `completed_at` is cleared.

**Response `200`:**

```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": { "...updated task..." }
}
```

---

#### `DELETE /projects/{projectId}/tasks/{taskId}` — Delete Task

**Response `200`:**

```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

### 3. Milestones

#### `POST /projects/{id}/milestones` — Add Milestone

**Payload:**

```json
{
  "title": "Phase 1 Delivery",
  "description": "Complete design and frontend implementation",
  "due_date": "2025-04-15",
  "amount": 150000,
  "is_billable": true
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `title` | required, string, max 255 |
| `description` | nullable, string, max 2000 |
| `due_date` | nullable, date |
| `amount` | nullable, numeric, min 0 |
| `is_billable` | boolean (defaults to `true`) |

**Response `201`:**

```json
{
  "success": true,
  "message": "Milestone added successfully.",
  "data": {
    "id": 10,
    "project_id": 1,
    "title": "Phase 1 Delivery",
    "description": "Complete design and frontend implementation",
    "due_date": "2025-04-15",
    "completed_at": null,
    "amount": 150000.00,
    "is_billable": true,
    "invoice_id": null,
    "sort_order": 4,
    "created_at": "2025-06-01T11:00:00.000000Z"
  }
}
```

---

#### `PUT /projects/{projectId}/milestones/{milestoneId}` — Update Milestone

Supports partial updates. Use `mark_complete: true` or `mark_incomplete: true` to toggle completion.

**Payload (mark complete):**

```json
{
  "mark_complete": true
}
```

**Payload (mark incomplete):**

```json
{
  "mark_incomplete": true
}
```

**Payload (edit fields):**

```json
{
  "title": "Phase 1 Delivery — Updated",
  "amount": 175000,
  "due_date": "2025-04-30"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Milestone updated successfully.",
  "data": {
    "id": 10,
    "title": "Phase 1 Delivery — Updated",
    "completed_at": "2025-04-10T14:00:00.000000Z",
    "amount": 175000.00,
    "is_billable": true,
    "invoice_id": null
  }
}
```

---

#### `DELETE /projects/{projectId}/milestones/{milestoneId}` — Delete Milestone

**Response `200`:**

```json
{
  "success": true,
  "message": "Milestone deleted successfully."
}
```

---

#### `POST /projects/{projectId}/milestones/{milestoneId}/invoice` — Invoice Milestone

Creates an accounting voucher/invoice for a completed billable milestone.

**Prerequisites:** Milestone must be completed (`completed_at` not null), billable, and have an amount.

**Payload:** None (empty POST).

**Response `200`:**

```json
{
  "success": true,
  "message": "Milestone invoiced successfully.",
  "voucher_number": "INV-0055"
}
```

**Response `422` (not eligible):**

```json
{
  "success": false,
  "message": "Milestone is not completed or not billable."
}
```

---

### 4. Expenses

#### `POST /projects/{id}/expenses` — Record Expense

Records an expense and posts a corresponding accounting voucher.

**Payload:**

```json
{
  "title": "Design software license",
  "description": "Annual Figma team license",
  "amount": 45000,
  "expense_date": "2025-03-01",
  "category": "software"
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `title` | required, string, max 255 |
| `description` | nullable, string, max 2000 |
| `amount` | required, numeric, min 0.01 |
| `expense_date` | required, date |
| `category` | nullable, string, max 50 |

**Category Options:** `general`, `materials`, `labor`, `travel`, `equipment`, `software`, `subcontractor`, `other`

**Response `201`:**

```json
{
  "success": true,
  "message": "Expense recorded and posted to accounting.",
  "data": {
    "id": 8,
    "project_id": 1,
    "title": "Design software license",
    "description": "Annual Figma team license",
    "amount": 45000.00,
    "expense_date": "2025-03-01",
    "category": "software",
    "voucher_id": 60,
    "created_by": 1,
    "creator": { "id": 1, "name": "Admin User" },
    "voucher": { "id": 60, "voucher_number": "EXP-0060" }
  },
  "project_actual_cost": 170000.00,
  "budget_used_percent": 34.0
}
```

---

#### `DELETE /projects/{projectId}/expenses/{expenseId}` — Delete Expense

Deletes the expense, reverses accounting entries, and updates project actual cost.

**Response `200`:**

```json
{
  "success": true,
  "message": "Expense deleted and reversed from accounting."
}
```

---

### 5. Notes

#### `POST /projects/{id}/notes` — Add Note

**Payload:**

```json
{
  "content": "Client requested a demo session next Friday.",
  "is_internal": false
}
```

**Validation:**

| Field | Rules |
|-------|-------|
| `content` | required, string, max 5000 |
| `is_internal` | boolean (defaults to `true`) |

> **Tip:** `is_internal: true` means the note is not visible to the client.

**Response `201`:**

```json
{
  "success": true,
  "message": "Note added successfully.",
  "data": {
    "id": 15,
    "project_id": 1,
    "content": "Client requested a demo session next Friday.",
    "is_internal": false,
    "created_at": "2025-06-01T12:00:00.000000Z",
    "user": { "id": 1, "name": "Admin User" }
  }
}
```

---

#### `DELETE /projects/{projectId}/notes/{noteId}` — Delete Note

**Response `200`:**

```json
{
  "success": true,
  "message": "Note deleted successfully."
}
```

---

### 6. Attachments

#### `POST /projects/{id}/attachments` — Upload File

**Content-Type:** `multipart/form-data`

**Payload:**

| Field | Type | Rules |
|-------|------|-------|
| `file` | File | required, max 10 MB |

**Response `201`:**

```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "id": 5,
    "project_id": 1,
    "file_name": "contract-v3.pdf",
    "file_path": "tenants/1/projects/1/contract-v3.pdf",
    "file_size": 1572864,
    "mime_type": "application/pdf",
    "created_at": "2025-06-01T12:30:00.000000Z",
    "user": { "id": 1, "name": "Admin User" }
  }
}
```

**React Native upload example:**

```typescript
const uploadFile = async (projectId: number, fileUri: string, fileName: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: 'application/octet-stream', // or detect mime type
  } as any);

  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/attachments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — fetch sets it with boundary automatically
      },
      body: formData,
    }
  );

  return response.json();
};
```

---

#### `DELETE /projects/{projectId}/attachments/{attachmentId}` — Delete Attachment

**Response `200`:**

```json
{
  "success": true,
  "message": "Attachment deleted successfully."
}
```

---

#### `GET /projects/{projectId}/attachments/{attachmentId}/download` — Download File

Returns the file as a binary download with the original filename.

---

### 7. Reports

#### `GET /projects/reports` — Reports Dashboard Data

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 15,
      "active": 8,
      "completed": 5,
      "on_hold": 1,
      "total_budget": 12500000.00,
      "total_cost": 4750000.00,
      "overdue": 2
    },
    "status_distribution": {
      "draft": 1,
      "active": 8,
      "on_hold": 1,
      "completed": 5,
      "archived": 0
    },
    "projects": [
      {
        "id": 1,
        "name": "Website Redesign",
        "project_number": "PRJ-0001",
        "status": "active",
        "priority": "high",
        "customer": "Adewale Okonkwo",
        "assigned_to": "Fatima Ibrahim",
        "budget": 500000.00,
        "actual_cost": 125000.00,
        "tasks_count": 12,
        "milestones_count": 4,
        "progress": 58,
        "start_date": "2025-01-15",
        "end_date": "2025-06-30",
        "is_overdue": false,
        "days_remaining": 29
      }
    ]
  }
}
```

---

## Error Handling

All errors follow this consistent structure:

### Validation Error `422`

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "status": ["The selected status is invalid."]
  }
}
```

### Business Rule Error `422`

```json
{
  "success": false,
  "message": "Milestone is not completed or not billable."
}
```

### Authorization Error `403`

```json
{
  "message": "Unauthorized access to this project."
}
```

### Not Found `404`

```json
{
  "message": "No query results for model [App\\Models\\Project] 999."
}
```

### Server Error `500`

```json
{
  "success": false,
  "message": "Failed to create project."
}
```

### React Native error handler:

```typescript
const handleApiError = (response: any, status: number) => {
  if (status === 422) {
    // Validation or business rule error
    if (response.errors) {
      const messages = Object.values(response.errors).flat();
      Alert.alert('Validation Error', messages.join('\n'));
    } else {
      Alert.alert('Error', response.message || 'Invalid request.');
    }
  } else if (status === 403) {
    Alert.alert('Access Denied', 'You do not have permission for this action.');
  } else if (status === 404) {
    Alert.alert('Not Found', 'The requested resource was not found.');
  } else {
    Alert.alert('Server Error', response.message || 'Something went wrong.');
  }
};
```

---

## Status & Priority Reference

### Project Status

| Status | Color | Description |
|--------|-------|-------------|
| `draft` | Gray | Not started, planning phase |
| `active` | Blue | Currently in progress |
| `on_hold` | Yellow | Paused temporarily |
| `completed` | Green | All tasks done, project finished |
| `archived` | Slate | No longer active, kept for records |

### Task Status

| Status | Color | Label |
|--------|-------|-------|
| `todo` | Gray | To Do |
| `in_progress` | Blue | In Progress |
| `review` | Yellow | In Review |
| `done` | Green | Done |

### Priority

| Priority | Color Suggestion |
|----------|-----------------|
| `low` | Gray / Light blue |
| `medium` | Blue |
| `high` | Orange |
| `urgent` | Red |

### Expense Categories

| Category | Description |
|----------|-------------|
| `general` | General expenses |
| `materials` | Raw materials, supplies |
| `labor` | Staff / contractor labour costs |
| `travel` | Travel & transportation |
| `equipment` | Tools & equipment |
| `software` | Software licenses, SaaS |
| `subcontractor` | Third-party contractors |
| `other` | Uncategorized |

---

## Endpoint Summary Table

| # | Method | URI | Description |
|---|--------|-----|-------------|
| 1 | `GET` | `/projects` | List projects (with filters, search, pagination, stats) |
| 2 | `GET` | `/projects/form-data` | Get dropdown data for create/edit forms |
| 3 | `GET` | `/projects/reports` | Reports dashboard data |
| 4 | `POST` | `/projects` | Create project |
| 5 | `GET` | `/projects/{id}` | Project detail (full data + stats) |
| 6 | `PUT` | `/projects/{id}` | Update project |
| 7 | `DELETE` | `/projects/{id}` | Delete project (soft delete) |
| 8 | `PATCH` | `/projects/{id}/status` | Update project status |
| 9 | `POST` | `/projects/{id}/tasks` | Add task |
| 10 | `PUT` | `/projects/{id}/tasks/{taskId}` | Update task |
| 11 | `DELETE` | `/projects/{id}/tasks/{taskId}` | Delete task |
| 12 | `POST` | `/projects/{id}/milestones` | Add milestone |
| 13 | `PUT` | `/projects/{id}/milestones/{milestoneId}` | Update milestone |
| 14 | `DELETE` | `/projects/{id}/milestones/{milestoneId}` | Delete milestone |
| 15 | `POST` | `/projects/{id}/milestones/{milestoneId}/invoice` | Invoice milestone |
| 16 | `POST` | `/projects/{id}/expenses` | Record expense |
| 17 | `DELETE` | `/projects/{id}/expenses/{expenseId}` | Delete expense |
| 18 | `POST` | `/projects/{id}/notes` | Add note |
| 19 | `DELETE` | `/projects/{id}/notes/{noteId}` | Delete note |
| 20 | `POST` | `/projects/{id}/attachments` | Upload file attachment |
| 21 | `DELETE` | `/projects/{id}/attachments/{attachmentId}` | Delete attachment |
| 22 | `GET` | `/projects/{id}/attachments/{attachmentId}/download` | Download attachment |
