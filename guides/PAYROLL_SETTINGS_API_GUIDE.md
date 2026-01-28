# Payroll Settings API Guide

Base URL (tenant): `/api/v1/tenant/{tenant}/payroll/settings`

All endpoints require `auth:sanctum`.

---

## Screen & Data Requirements (from Blade view)

### Payroll Settings

- Field: Employee Number Format
- Placeholder examples:
    - `{YYYY}` full year
    - `{YY}` short year
    - `{MM}` month
    - `{####}` sequential number (4 digits)
    - `{###}` sequential number (3 digits)
- Save/Cancel actions

---

## Endpoints

### 1) Get Payroll Settings

**GET** `/api/v1/tenant/{tenant}/payroll/settings`

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll settings retrieved successfully",
    "data": {
        "employee_number_format": "EMP-{YYYY}-{####}"
    }
}
```

---

### 2) Update Payroll Settings

**PUT** `/api/v1/tenant/{tenant}/payroll/settings`

**Payload:**

```json
{
    "employee_number_format": "EMP-{YY}-{MM}-{####}"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Payroll settings updated successfully",
    "data": {
        "employee_number_format": "EMP-{YY}-{MM}-{####}"
    }
}
```

---

## Notes

- The format is stored on the tenant and used when generating `employee_number` for new employees.
- Frontend should show the placeholder helper list as in the settings screen.
