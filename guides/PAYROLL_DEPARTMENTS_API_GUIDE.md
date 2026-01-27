# Payroll Departments API Guide (CRUD)

This document describes the payroll departments API endpoints, payloads, and sample responses for frontend integration.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/departments`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Endpoints

### 1) List Departments

**GET** `/api/v1/tenant/{tenant}/payroll/departments`

**Query Params (optional):**

- `search` (string) – matches `name`, `code`, `description`
- `is_active` (boolean) – filter active/inactive
- `per_page` (int) – default 50

**Sample Response:**

```json
{
    "success": true,
    "message": "Departments retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Finance",
                "code": "FIN",
                "description": "Handles accounting and finance",
                "is_active": true,
                "employees_count": 5,
                "created_at": "2026-01-27 10:05:00",
                "updated_at": "2026-01-27 10:05:00"
            }
        ],
        "per_page": 50,
        "total": 1
    }
}
```

### 2) Create Department

**POST** `/api/v1/tenant/{tenant}/payroll/departments`

**Payload:**

```json
{
    "name": "Human Resources",
    "code": "HR",
    "description": "People operations",
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Department created successfully",
    "data": {
        "department": {
            "id": 2,
            "name": "Human Resources",
            "code": "HR",
            "description": "People operations",
            "is_active": true,
            "employees_count": 0,
            "created_at": "2026-01-27 10:10:00",
            "updated_at": "2026-01-27 10:10:00"
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

### 3) Show Department

**GET** `/api/v1/tenant/{tenant}/payroll/departments/{department}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Department retrieved successfully",
    "data": {
        "department": {
            "id": 1,
            "name": "Finance",
            "code": "FIN",
            "description": "Handles accounting and finance",
            "is_active": true,
            "employees_count": 5,
            "created_at": "2026-01-27 10:05:00",
            "updated_at": "2026-01-27 10:05:00"
        }
    }
}
```

### 4) Update Department

**PUT** `/api/v1/tenant/{tenant}/payroll/departments/{department}`

**Payload:**

```json
{
    "name": "Finance & Accounts",
    "code": "FIN",
    "description": "Accounting, finance, and treasury",
    "is_active": true
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Department updated successfully",
    "data": {
        "department": {
            "id": 1,
            "name": "Finance & Accounts",
            "code": "FIN",
            "description": "Accounting, finance, and treasury",
            "is_active": true,
            "employees_count": 5,
            "created_at": "2026-01-27 10:05:00",
            "updated_at": "2026-01-27 10:12:00"
        }
    }
}
```

### 5) Delete Department

**DELETE** `/api/v1/tenant/{tenant}/payroll/departments/{department}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Department deleted successfully"
}
```

**Conflict (409):**

```json
{
    "success": false,
    "message": "Department has employees and cannot be deleted."
}
```

## Notes

- All endpoints require `auth:sanctum`.
- `code` must be unique per tenant.
- `employees_count` is included to power the departments grid.
