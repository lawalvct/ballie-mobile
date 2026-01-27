# Payroll Shifts API Guide (Shifts + Assignments)

This document describes the shift management API endpoints, payloads, and sample responses for frontend integration. It also explains what each shift screen expects based on the current views.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/shifts`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Screen Expectations (from current views)

### Shift Management List (shifts/index)

- Card grid showing: name, code, time range, work hours, grace period, working days, allowance, status.
- Actions: view, edit, delete.
- Required data: `name`, `code`, `start_time`, `end_time`, `work_hours`, `late_grace_minutes`, `working_days`, `shift_allowance`, `is_active`, `employees_count`.

### Shift Create/Edit (shifts/create, shifts/edit)

- Required fields: `name`, `code`, `start_time`, `end_time`, `work_hours`, `working_days`.
- Optional: `late_grace_minutes`, `shift_allowance`, `description`, `is_active` (edit).
- Working days are checkbox list for Monday–Sunday.

### Shift Details (shifts/show)

- Shows shift details + assigned employees table.
- Requires shift record + assignments list (with employee, department, effective dates, status).

### Shift Assignments List (shifts/assignments)

- Filters: department, employee, shift, status (active/ended).
- Table: employee, department, shift, shift hours, effective dates, status.
- Action: end assignment.

### Assign Employees (shifts/assign-employees)

- Single assignment form: `employee_id`, `shift_id`, `effective_from`, `is_permanent`, `effective_to` (if not permanent).
- Bulk assignment form: `employee_ids[]`, `shift_id`, `effective_from`, `is_permanent`, `effective_to` (if not permanent).
- Frontend can fetch employees via `/api/v1/tenant/{tenant}/payroll/employees` and shifts via `/api/v1/tenant/{tenant}/payroll/shifts`.

## Endpoints

### 1) List Shifts

**GET** `/api/v1/tenant/{tenant}/payroll/shifts`

**Query Params (optional):**

- `search` (string) – matches `name`, `code`, `description`
- `status` (active | inactive)
- `per_page` (int) – default 20

**Sample Response:**

```json
{
    "success": true,
    "message": "Shifts retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 5,
                "name": "Morning Shift",
                "code": "MS",
                "description": "Standard day shift",
                "start_time": "08:00",
                "end_time": "17:00",
                "time_range": "8:00 AM - 5:00 PM",
                "working_days": [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday"
                ],
                "late_grace_minutes": 15,
                "work_hours": 8,
                "shift_allowance": "0.00",
                "is_active": true,
                "employees_count": 12,
                "created_at": "2026-01-27 09:00:00",
                "updated_at": "2026-01-27 09:00:00"
            }
        ],
        "per_page": 20,
        "total": 1
    }
}
```

### 2) Create Shift

**POST** `/api/v1/tenant/{tenant}/payroll/shifts`

**Payload:**

```json
{
    "name": "Morning Shift",
    "code": "MS",
    "start_time": "08:00",
    "end_time": "17:00",
    "work_hours": 8,
    "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "late_grace_minutes": 15,
    "shift_allowance": 0,
    "description": "Standard day shift",
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Shift created successfully",
    "data": {
        "shift": {
            "id": 5,
            "name": "Morning Shift",
            "code": "MS",
            "description": "Standard day shift",
            "start_time": "08:00",
            "end_time": "17:00",
            "time_range": "8:00 AM - 5:00 PM",
            "working_days": [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday"
            ],
            "late_grace_minutes": 15,
            "work_hours": 8,
            "shift_allowance": "0.00",
            "is_active": true,
            "employees_count": 0,
            "created_at": "2026-01-27 09:00:00",
            "updated_at": "2026-01-27 09:00:00"
        }
    }
}
```

**Validation Error (422):**

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "code": ["The code has already been taken."]
    }
}
```

### 3) Show Shift (with Assignments)

**GET** `/api/v1/tenant/{tenant}/payroll/shifts/{shift}`

**Query Params (optional):**

- `per_page` – assignments per page (default 20)

**Sample Response:**

```json
{
    "success": true,
    "message": "Shift retrieved successfully",
    "data": {
        "shift": {
            "id": 5,
            "name": "Morning Shift",
            "code": "MS",
            "start_time": "08:00",
            "end_time": "17:00",
            "time_range": "8:00 AM - 5:00 PM",
            "working_days": [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday"
            ],
            "late_grace_minutes": 15,
            "work_hours": 8,
            "shift_allowance": "0.00",
            "is_active": true,
            "employees_count": 12
        },
        "assignments": {
            "current_page": 1,
            "data": [
                {
                    "id": 50,
                    "employee_id": 12,
                    "employee_name": "John Lawal",
                    "employee_number": "EMP-2026-0001",
                    "department_id": 2,
                    "department_name": "Finance",
                    "shift_id": 5,
                    "shift_name": "Morning Shift",
                    "shift_time": "08:00 AM - 05:00 PM",
                    "effective_from": "2026-01-10",
                    "effective_to": null,
                    "is_permanent": true,
                    "is_active": true,
                    "status": "active"
                }
            ],
            "per_page": 20,
            "total": 1
        }
    }
}
```

### 4) Update Shift

**PUT** `/api/v1/tenant/{tenant}/payroll/shifts/{shift}`

**Payload:**

```json
{
    "name": "Morning Shift",
    "code": "MS",
    "start_time": "08:00",
    "end_time": "17:00",
    "work_hours": 8,
    "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "late_grace_minutes": 10,
    "shift_allowance": 5000,
    "description": "Updated",
    "is_active": true
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Shift updated successfully",
    "data": {
        "shift": {
            "id": 5,
            "name": "Morning Shift",
            "code": "MS",
            "start_time": "08:00",
            "end_time": "17:00",
            "late_grace_minutes": 10,
            "work_hours": 8,
            "shift_allowance": "5000.00",
            "is_active": true
        }
    }
}
```

### 5) Delete Shift

**DELETE** `/api/v1/tenant/{tenant}/payroll/shifts/{shift}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Shift deleted successfully"
}
```

**Conflict (409):**

```json
{
    "success": false,
    "message": "Cannot delete shift with active employee assignments."
}
```

### 6) List Shift Assignments

**GET** `/api/v1/tenant/{tenant}/payroll/shifts/assignments`

**Query Params (optional):**

- `department_id` (int)
- `employee_id` (int)
- `shift_id` (int)
- `status` (active | ended)
- `per_page` (int) – default 20

**Sample Response:**

```json
{
    "success": true,
    "message": "Shift assignments retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 50,
                "employee_id": 12,
                "employee_name": "John Lawal",
                "employee_number": "EMP-2026-0001",
                "department_id": 2,
                "department_name": "Finance",
                "shift_id": 5,
                "shift_name": "Morning Shift",
                "shift_time": "08:00 AM - 05:00 PM",
                "effective_from": "2026-01-10",
                "effective_to": null,
                "is_permanent": true,
                "is_active": true,
                "status": "active"
            }
        ],
        "per_page": 20,
        "total": 1
    }
}
```

### 7) Assign Employee (Single)

**POST** `/api/v1/tenant/{tenant}/payroll/shifts/assignments`

**Payload:**

```json
{
    "employee_id": 12,
    "shift_id": 5,
    "effective_from": "2026-01-10",
    "is_permanent": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Employee assigned to shift successfully",
    "data": {
        "assignment": {
            "id": 50,
            "employee_id": 12,
            "employee_name": "John Lawal",
            "shift_id": 5,
            "shift_name": "Morning Shift",
            "effective_from": "2026-01-10",
            "effective_to": null,
            "is_permanent": true,
            "status": "active"
        }
    }
}
```

### 8) Bulk Assign Employees

**POST** `/api/v1/tenant/{tenant}/payroll/shifts/assignments/bulk`

**Payload:**

```json
{
    "employee_ids": [12, 13, 14],
    "shift_id": 5,
    "effective_from": "2026-01-10",
    "is_permanent": true
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Bulk assignment completed",
    "data": {
        "success_count": 3,
        "errors": []
    }
}
```

### 9) End Assignment

**PATCH** `/api/v1/tenant/{tenant}/payroll/shifts/assignments/{assignment}/end`

**Payload:**

```json
{
    "effective_to": "2026-02-01"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Shift assignment ended successfully",
    "data": {
        "assignment": {
            "id": 50,
            "employee_id": 12,
            "employee_name": "John Lawal",
            "shift_id": 5,
            "shift_name": "Morning Shift",
            "effective_from": "2026-01-10",
            "effective_to": "2026-02-01",
            "is_permanent": true,
            "status": "ended"
        }
    }
}
```

## Notes

- All endpoints require `auth:sanctum`.
- `code` must be unique in `shift_schedules`.
- `working_days` is required and must be an array of day strings.
- Deleting a shift is blocked if it has active assignments.
- Assigning an employee ends their current assignment automatically.
