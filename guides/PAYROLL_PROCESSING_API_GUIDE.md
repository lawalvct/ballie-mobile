# Payroll Processing API Guide (CRUD + Actions)

This document describes the payroll processing API endpoints, payloads, and sample responses for frontend integration. It also explains what each screen expects based on the current views.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/processing`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Screen Expectations (from current views)

### Payroll Processing List (processing/index)

- Filters: `search`, `type`, `status`, `date_range`.
- Columns: period name, date range, type, status, employee count, totals.
- Actions: view details, generate (draft), approve (completed), export bank file (approved), delete.

### Create Payroll Period (processing/create)

- Required fields: `name`, `type`, `start_date`, `end_date`, `pay_date`.
- Summary widgets are computed on frontend; only save form values.
- Buttons: Save as Draft / Create Period (both use same payload; status set to draft).

### Payroll Period Details (processing/show)

- Shows period summary + payroll runs table.
- Actions: generate, reset & regenerate, approve, export bank file, delete.
- Generate modal needs `apply_paye_tax`, `apply_nsitf`, optional rates and `tax_exemption_reason`.

## Endpoints

### 1) List Payroll Periods

**GET** `/api/v1/tenant/{tenant}/payroll/processing`

**Query Params (optional):**

- `search` (string) – matches period `name`
- `type` (monthly | weekly | bi_weekly | contract)
- `status` (draft | processing | completed | approved | cancelled)
- `date_range` (current_month | last_month | current_quarter | current_year)
- `per_page` (int) – default 20

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll periods retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 15,
                "name": "January 2026 Payroll",
                "type": "monthly",
                "status": "draft",
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
                "pay_date": "2026-02-02",
                "total_gross": "0.00",
                "total_deductions": "0.00",
                "total_net": "0.00",
                "total_tax": "0.00",
                "total_nsitf": "0.00",
                "payroll_runs_count": 0,
                "created_at": "2026-01-27 10:00:00",
                "updated_at": "2026-01-27 10:00:00"
            }
        ],
        "per_page": 20,
        "total": 1
    }
}
```

### 2) Create Payroll Period

**POST** `/api/v1/tenant/{tenant}/payroll/processing`

**Payload:**

```json
{
    "name": "January 2026 Payroll",
    "type": "monthly",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "pay_date": "2026-02-02"
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Payroll period created successfully",
    "data": {
        "period": {
            "id": 15,
            "name": "January 2026 Payroll",
            "type": "monthly",
            "status": "draft",
            "start_date": "2026-01-01",
            "end_date": "2026-01-31",
            "pay_date": "2026-02-02",
            "payroll_runs_count": 0
        }
    }
}
```

### 3) Show Payroll Period (with Runs)

**GET** `/api/v1/tenant/{tenant}/payroll/processing/{period}`

**Query Params (optional):**

- `per_page` – payroll runs per page (default 50)

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll period retrieved successfully",
    "data": {
        "period": {
            "id": 15,
            "name": "January 2026 Payroll",
            "type": "monthly",
            "status": "processing",
            "start_date": "2026-01-01",
            "end_date": "2026-01-31",
            "pay_date": "2026-02-02",
            "total_gross": "6500000.00",
            "total_deductions": "520000.00",
            "total_net": "5980000.00",
            "apply_paye_tax": true,
            "apply_nsitf": true,
            "tax_exemption_reason": null,
            "payroll_runs_count": 40
        },
        "runs": {
            "current_page": 1,
            "data": [
                {
                    "id": 120,
                    "employee_id": 12,
                    "employee_name": "John Lawal",
                    "employee_number": "EMP-2026-0001",
                    "department_name": "Finance",
                    "basic_salary": "250000.00",
                    "total_allowances": "50000.00",
                    "total_deductions": "10000.00",
                    "monthly_tax": "25000.00",
                    "net_salary": "265000.00",
                    "payment_status": null
                }
            ],
            "per_page": 50,
            "total": 1
        }
    }
}
```

### 4) Update Payroll Period

**PUT** `/api/v1/tenant/{tenant}/payroll/processing/{period}`

> Only `draft` periods can be updated.

**Payload:**

```json
{
    "name": "January 2026 Payroll",
    "type": "monthly",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "pay_date": "2026-02-02"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll period updated successfully",
    "data": {
        "period": {
            "id": 15,
            "name": "January 2026 Payroll",
            "status": "draft"
        }
    }
}
```

### 5) Delete Payroll Period

**DELETE** `/api/v1/tenant/{tenant}/payroll/processing/{period}`

> Allowed only when status is `draft` or `processing`.

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll period deleted successfully"
}
```

### 6) Generate Payroll

**POST** `/api/v1/tenant/{tenant}/payroll/processing/{period}/generate`

**Payload:**

```json
{
    "apply_paye_tax": true,
    "apply_nsitf": true,
    "paye_tax_rate": null,
    "nsitf_rate": null,
    "tax_exemption_reason": null
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll generated successfully",
    "data": {
        "period": {
            "id": 15,
            "status": "processing",
            "total_gross": "6500000.00",
            "total_net": "5980000.00"
        }
    }
}
```

### 7) Approve Payroll

**POST** `/api/v1/tenant/{tenant}/payroll/processing/{period}/approve`

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll approved successfully",
    "data": {
        "period": {
            "id": 15,
            "status": "approved",
            "approved_at": "2026-02-03 10:10:00"
        }
    }
}
```

### 8) Reset Payroll Generation

**DELETE** `/api/v1/tenant/{tenant}/payroll/processing/{period}/reset`

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll reset successfully",
    "data": {
        "period": {
            "id": 15,
            "status": "draft",
            "total_gross": "0.00"
        }
    }
}
```

### 9) Export Bank File (CSV)

**GET** `/api/v1/tenant/{tenant}/payroll/processing/{period}/export-bank-file`

**Response:** CSV file with columns `Employee Name`, `Account Number`, `Bank Name`, `Amount`.

## Notes

- All endpoints require `auth:sanctum`.
- Status flow: `draft` → `processing` → `approved`.
- Only `draft` periods can be updated.
- Payroll generation options match the modal in [resources/views/tenant/payroll/processing/show.blade.php](resources/views/tenant/payroll/processing/show.blade.php).
