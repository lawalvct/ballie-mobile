# Payroll Positions API Guide (CRUD)

This document describes the positions API endpoints, payloads, and sample responses for frontend integration.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/positions`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Endpoints

### 1) List Positions

**GET** `/api/v1/tenant/{tenant}/payroll/positions`

**Query Params (optional):**

- `department_id` (int)
- `level` (int 1–10)
- `status` (active | inactive)
- `search` (string)
- `per_page` (int) – default 20

**Sample Response:**

```json
{
    "success": true,
    "message": "Positions retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 7,
                "name": "Senior Accountant",
                "code": "ACC-SR",
                "description": "Handles month-end close",
                "department_id": 1,
                "department_name": "Finance",
                "level": 4,
                "level_name": "Level 4",
                "reports_to_position_id": 3,
                "reports_to_name": "Finance Manager",
                "min_salary": 250000,
                "max_salary": 450000,
                "salary_range": "₦250,000 - ₦450,000",
                "requirements": null,
                "responsibilities": null,
                "is_active": true,
                "sort_order": 2,
                "employees_count": 5,
                "created_at": "2026-01-27 10:55:00",
                "updated_at": "2026-01-27 10:55:00"
            }
        ],
        "per_page": 20,
        "total": 1
    }
}
```

### 2) Create Position

**POST** `/api/v1/tenant/{tenant}/payroll/positions`

**Payload:**

```json
{
    "name": "Junior Accountant",
    "code": "ACC-JR",
    "description": "Entry-level accounting role",
    "department_id": 1,
    "level": 2,
    "reports_to_position_id": 7,
    "min_salary": 120000,
    "max_salary": 200000,
    "requirements": "BSc Accounting",
    "responsibilities": "Posting journal entries",
    "is_active": true,
    "sort_order": 3
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Position created successfully",
    "data": {
        "position": {
            "id": 8,
            "name": "Junior Accountant",
            "code": "ACC-JR",
            "description": "Entry-level accounting role",
            "department_id": 1,
            "department_name": "Finance",
            "level": 2,
            "level_name": "Level 2",
            "reports_to_position_id": 7,
            "reports_to_name": "Senior Accountant",
            "min_salary": 120000,
            "max_salary": 200000,
            "salary_range": "₦120,000 - ₦200,000",
            "requirements": "BSc Accounting",
            "responsibilities": "Posting journal entries",
            "is_active": true,
            "sort_order": 3,
            "employees_count": 0,
            "created_at": "2026-01-27 11:00:00",
            "updated_at": "2026-01-27 11:00:00"
        }
    }
}
```

**Validation Error (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "code": ["The code has already been taken."]
    }
}
```

### 3) Show Position

**GET** `/api/v1/tenant/{tenant}/payroll/positions/{position}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Position retrieved successfully",
    "data": {
        "position": {
            "id": 7,
            "name": "Senior Accountant",
            "code": "ACC-SR",
            "department_id": 1,
            "department_name": "Finance",
            "level": 4,
            "level_name": "Level 4",
            "reports_to_position_id": 3,
            "reports_to_name": "Finance Manager",
            "min_salary": 250000,
            "max_salary": 450000,
            "salary_range": "₦250,000 - ₦450,000",
            "requirements": null,
            "responsibilities": null,
            "is_active": true,
            "sort_order": 2,
            "employees_count": 5,
            "subordinates": [
                {
                    "id": 8,
                    "name": "Junior Accountant",
                    "code": "ACC-JR",
                    "level": 2
                }
            ],
            "created_at": "2026-01-27 10:55:00",
            "updated_at": "2026-01-27 10:55:00"
        }
    }
}
```

### 4) Update Position

**PUT** `/api/v1/tenant/{tenant}/payroll/positions/{position}`

**Payload:**

```json
{
    "name": "Senior Accountant",
    "code": "ACC-SR",
    "description": "Updated description",
    "department_id": 1,
    "level": 4,
    "reports_to_position_id": 3,
    "min_salary": 280000,
    "max_salary": 500000,
    "requirements": "ICAN required",
    "responsibilities": "Oversee account close",
    "is_active": true,
    "sort_order": 2
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Position updated successfully",
    "data": {
        "position": {
            "id": 7,
            "name": "Senior Accountant",
            "code": "ACC-SR",
            "department_id": 1,
            "department_name": "Finance",
            "level": 4,
            "level_name": "Level 4",
            "reports_to_position_id": 3,
            "reports_to_name": "Finance Manager",
            "min_salary": 280000,
            "max_salary": 500000,
            "salary_range": "₦280,000 - ₦500,000",
            "requirements": "ICAN required",
            "responsibilities": "Oversee account close",
            "is_active": true,
            "sort_order": 2,
            "employees_count": 5,
            "created_at": "2026-01-27 10:55:00",
            "updated_at": "2026-01-27 11:05:00"
        }
    }
}
```

### 5) Delete Position

**DELETE** `/api/v1/tenant/{tenant}/payroll/positions/{position}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Position deleted successfully"
}
```

**Conflict (409):**

```json
{
    "success": false,
    "message": "Cannot delete position with assigned employees. Please reassign employees first."
}
```

### 6) Positions by Department (Helper)

**GET** `/api/v1/tenant/{tenant}/payroll/positions/by-department?department_id=1`

**Sample Response:**

```json
{
    "success": true,
    "message": "Positions retrieved successfully",
    "data": [
        { "id": 7, "name": "Senior Accountant", "code": "ACC-SR", "level": 4 }
    ]
}
```

## Notes

- All endpoints require `auth:sanctum`.
- `code` must be unique in `positions`.
- `reports_to_position_id` cannot be the same as the current position.
- Deleting is blocked if employees or subordinates exist.
