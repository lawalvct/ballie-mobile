# Payroll Salary Components API Guide (CRUD)

This document describes the salary components API endpoints, payloads, and sample responses for frontend integration. It also explains how the create screen supports earnings and deductions.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/salary-components`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Endpoints

### 1) List Salary Components

**GET** `/api/v1/tenant/{tenant}/payroll/salary-components`

**Query Params (optional):**

- `type` (earning | deduction | employer_contribution)
- `search` (string) – matches `name`, `code`, `description`
- `is_active` (boolean)
- `per_page` (int) – default 100

**Sample Response:**

```json
{
    "success": true,
    "message": "Salary components retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 10,
                "name": "Housing Allowance",
                "code": "HOUSE",
                "type": "earning",
                "calculation_type": "percentage",
                "is_taxable": true,
                "is_pensionable": true,
                "description": "20% of basic",
                "is_active": true,
                "sort_order": 3,
                "created_at": "2026-01-27 10:30:00",
                "updated_at": "2026-01-27 10:30:00"
            }
        ],
        "per_page": 100,
        "total": 1
    }
}
```

### 2) Create Salary Component

**POST** `/api/v1/tenant/{tenant}/payroll/salary-components`

**Payload:**

```json
{
    "name": "Transport Allowance",
    "code": "TRANS",
    "type": "earning",
    "calculation_type": "fixed",
    "is_taxable": true,
    "is_pensionable": true,
    "description": "Monthly transport allowance",
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Salary component created successfully",
    "data": {
        "component": {
            "id": 11,
            "name": "Transport Allowance",
            "code": "TRANS",
            "type": "earning",
            "calculation_type": "fixed",
            "is_taxable": true,
            "is_pensionable": true,
            "description": "Monthly transport allowance",
            "is_active": true,
            "sort_order": 4,
            "created_at": "2026-01-27 10:35:00",
            "updated_at": "2026-01-27 10:35:00"
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

### 3) Show Salary Component

**GET** `/api/v1/tenant/{tenant}/payroll/salary-components/{component}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Salary component retrieved successfully",
    "data": {
        "component": {
            "id": 10,
            "name": "Housing Allowance",
            "code": "HOUSE",
            "type": "earning",
            "calculation_type": "percentage",
            "is_taxable": true,
            "is_pensionable": true,
            "description": "20% of basic",
            "is_active": true,
            "sort_order": 3,
            "created_at": "2026-01-27 10:30:00",
            "updated_at": "2026-01-27 10:30:00"
        }
    }
}
```

### 4) Update Salary Component

**PUT** `/api/v1/tenant/{tenant}/payroll/salary-components/{component}`

**Payload:**

```json
{
    "name": "Transport Allowance",
    "code": "TRANS",
    "type": "earning",
    "calculation_type": "fixed",
    "is_taxable": true,
    "is_pensionable": true,
    "description": "Updated description",
    "is_active": true
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Salary component updated successfully",
    "data": {
        "component": {
            "id": 11,
            "name": "Transport Allowance",
            "code": "TRANS",
            "type": "earning",
            "calculation_type": "fixed",
            "is_taxable": true,
            "is_pensionable": true,
            "description": "Updated description",
            "is_active": true,
            "sort_order": 4,
            "created_at": "2026-01-27 10:35:00",
            "updated_at": "2026-01-27 10:40:00"
        }
    }
}
```

### 5) Delete Salary Component

**DELETE** `/api/v1/tenant/{tenant}/payroll/salary-components/{component}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Salary component deleted successfully"
}
```

**Conflict (409):**

```json
{
    "success": false,
    "message": "Salary component is assigned to employees and cannot be deleted."
}
```

## Create Screen Behavior (Earnings vs Deductions)

Based on [resources/views/tenant/payroll/components/index.blade.php](resources/views/tenant/payroll/components/index.blade.php):

- The screen has **tabs** for Earnings and Deductions. Each tab shows components filtered by `type`.
- The **Add Component** button opens a modal. The modal includes a `type` select with:
    - `earning` (used for allowances/earnings)
    - `deduction`
    - `employer_contribution`
- The UI also calls `openCreateModal('earning')` or `openCreateModal('deduction')` to preselect the `type` in the modal.

**Frontend usage tips:**

- If the user clicks the Earnings tab “Add” button, call `openCreateModal('earning')` or set `type = "earning"` in the form payload.
- If the user clicks the Deductions tab “Add” button, call `openCreateModal('deduction')` or set `type = "deduction"` in the form payload.
- For employer-paid items, set `type = "employer_contribution"`.

## Notes

- All endpoints require `auth:sanctum`.
- `code` must be unique (within `salary_components`).
- `calculation_type` must be one of: `fixed`, `percentage`, `variable`, `computed`.
