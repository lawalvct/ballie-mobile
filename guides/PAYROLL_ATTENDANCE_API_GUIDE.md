# Payroll Attendance API Guide

This document describes the attendance API endpoints, payloads, and sample responses for frontend integration. It also explains what each attendance screen expects based on the current views.

## Base Path

All endpoints are under:

- `/api/v1/tenant/{tenant}/payroll/attendance`

Routes are defined in [routes/api/v1/tenant.php](routes/api/v1/tenant.php).

## Related Endpoints

These endpoints are used to populate filters and actions:

- Employees: `/api/v1/tenant/{tenant}/payroll/employees`
- Departments: `/api/v1/tenant/{tenant}/payroll/departments`
- Shifts: `/api/v1/tenant/{tenant}/payroll/shifts`

## Screen Expectations (from current views)

### Daily Attendance (attendance/index)

- Date picker (query `date`).
- Filters: department, shift, status, employee.
- Stats cards: total, present, late, absent, on_leave, half_day.
- Table: employee, department, shift, clock in/out, late/early/overtime, approval.
- Actions: clock in/out, mark absent, mark leave, manual entry, bulk approve.

### QR Codes (attendance/qr-codes)

- Two QR codes: clock in and clock out.
- Fetch each via API with `type=clock_in|clock_out`.

### Monthly Report (attendance/monthly-report)

- Summary per employee: present/late/absent/leave/half day, total hours, overtime.
- Month/year filters.

### Employee Attendance (attendance/employee)

- Calendar + detailed records for a single employee, month/year filters.

## Endpoints

### 1) Daily Attendance List + Stats

**GET** `/api/v1/tenant/{tenant}/payroll/attendance`

**Query Params (optional):**

- `date` (YYYY-MM-DD) – defaults to today
- `department_id`
- `employee_id`
- `shift_id`
- `status` (present | late | absent | half_day | on_leave | weekend | holiday)

**Sample Response:**

```json
{
    "success": true,
    "message": "Attendance records retrieved successfully",
    "data": {
        "date": "2026-01-27",
        "stats": {
            "total": 40,
            "present": 30,
            "late": 3,
            "absent": 5,
            "on_leave": 1,
            "half_day": 1
        },
        "records": [
            {
                "id": 501,
                "employee_id": 12,
                "employee_name": "John Lawal",
                "employee_number": "EMP-2026-0001",
                "department_name": "Finance",
                "shift_id": 5,
                "shift_name": "Morning Shift",
                "attendance_date": "2026-01-27",
                "clock_in": "2026-01-27 08:05:00",
                "clock_out": "2026-01-27 17:02:00",
                "scheduled_in": "2026-01-27 08:00:00",
                "scheduled_out": "2026-01-27 17:00:00",
                "late_minutes": 5,
                "early_out_minutes": 0,
                "work_hours_minutes": 480,
                "break_minutes": 60,
                "overtime_minutes": 2,
                "status": "late",
                "is_approved": false
            }
        ]
    }
}
```

### 2) Clock In

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/clock-in`

**Payload:**

```json
{
    "employee_id": 12,
    "notes": "Traffic delay"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Clocked in successfully",
    "clock_in_time": "08:05 AM",
    "status": "late",
    "late_minutes": 5
}
```

### 3) Clock Out

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/clock-out`

**Payload:**

```json
{
    "employee_id": 12,
    "notes": "End of day"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Clocked out successfully",
    "clock_out_time": "05:02 PM",
    "work_hours": 7.5,
    "overtime_hours": 0.1
}
```

### 4) Mark Absent

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/mark-absent`

**Payload:**

```json
{
    "employee_id": 12,
    "date": "2026-01-27",
    "reason": "No show"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee marked as absent",
    "data": {
        "attendance": {
            "id": 501,
            "status": "absent",
            "absence_reason": "No show"
        }
    }
}
```

### 5) Mark Leave

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/mark-leave`

**Payload:**

```json
{
    "employee_id": 12,
    "date": "2026-01-27",
    "leave_type": "annual_leave",
    "reason": "Family trip"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee marked as on leave",
    "data": {
        "attendance": {
            "id": 501,
            "status": "on_leave"
        }
    }
}
```

### 6) Manual Attendance Entry

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/manual-entry`

**Payload:**

```json
{
    "employee_id": 12,
    "date": "2026-01-27",
    "clock_in_time": "08:00",
    "clock_out_time": "17:00",
    "break_minutes": 60,
    "notes": "Manual correction"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Attendance recorded successfully",
    "data": {
        "attendance": {
            "id": 501,
            "status": "present",
            "work_hours_minutes": 480
        }
    }
}
```

### 7) Update Attendance Record

**PUT** `/api/v1/tenant/{tenant}/payroll/attendance/{attendance}`

**Payload:**

```json
{
    "clock_in": "2026-01-27 08:00",
    "clock_out": "2026-01-27 17:00",
    "status": "present",
    "absence_reason": null,
    "admin_notes": "Updated by HR"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Attendance updated successfully",
    "data": {
        "attendance": {
            "id": 501,
            "status": "present"
        }
    }
}
```

### 8) Mark Half Day

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/{attendance}/half-day`

**Sample Response:**

```json
{
    "success": true,
    "message": "Marked as half day",
    "data": {
        "attendance": {
            "id": 501,
            "status": "half_day"
        }
    }
}
```

### 9) Approve Attendance

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/{attendance}/approve`

**Sample Response:**

```json
{
    "success": true,
    "message": "Attendance approved",
    "data": {
        "attendance": {
            "id": 501,
            "is_approved": true
        }
    }
}
```

### 10) Bulk Approve Attendance

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/bulk-approve`

**Payload:**

```json
{
    "attendance_ids": [501, 502, 503]
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "3 attendance records approved"
}
```

### 11) Monthly Attendance Report

**GET** `/api/v1/tenant/{tenant}/payroll/attendance/monthly-report?year=2026&month=1`

**Sample Response:**

```json
{
    "success": true,
    "message": "Monthly attendance report retrieved successfully",
    "data": {
        "year": 2026,
        "month": 1,
        "start_date": "2026-01-01",
        "end_date": "2026-01-31",
        "employees": [
            {
                "employee_id": 12,
                "employee_name": "John Lawal",
                "employee_number": "EMP-2026-0001",
                "department_name": "Finance",
                "summary": {
                    "total_days": 22,
                    "present": 18,
                    "late": 2,
                    "absent": 1,
                    "on_leave": 1,
                    "half_day": 0,
                    "total_hours": 168,
                    "total_overtime": 3.5
                }
            }
        ]
    }
}
```

### 12) Employee Attendance (Monthly)

**GET** `/api/v1/tenant/{tenant}/payroll/attendance/employee/{employee}?year=2026&month=1`

**Sample Response:**

```json
{
    "success": true,
    "message": "Employee attendance retrieved successfully",
    "data": {
        "employee": {
            "id": 12,
            "name": "John Lawal",
            "employee_number": "EMP-2026-0001",
            "department_name": "Finance"
        },
        "year": 2026,
        "month": 1,
        "summary": {
            "total_days": 22,
            "present": 18,
            "late": 2,
            "absent": 1,
            "on_leave": 1,
            "half_day": 0,
            "total_hours": 168,
            "total_overtime": 3.5
        },
        "records": [
            {
                "attendance_date": "2026-01-27",
                "status": "present",
                "clock_in": "2026-01-27 08:00:00",
                "clock_out": "2026-01-27 17:00:00"
            }
        ]
    }
}
```

### 13) Attendance QR Code

**GET** `/api/v1/tenant/{tenant}/payroll/attendance/qr-code?type=clock_in&date=2026-01-27`

**Sample Response:**

```json
{
    "success": true,
    "qr_code": "<svg>...</svg>",
    "type": "clock_in",
    "date": "2026-01-27",
    "expires_at": "2026-01-27 23:59:59"
}
```

### 14) Scan Attendance QR (Clock In/Out)

**POST** `/api/v1/tenant/{tenant}/payroll/attendance/scan-qr`

**Payload:**

```json
{
    "employee_id": 12,
    "qr_payload": "<encrypted payload from QR>",
    "notes": "Arrived via QR scan"
}
```

**Sample Response (Clock In):**

```json
{
    "success": true,
    "message": "Clocked in successfully",
    "clock_in_time": "08:00 AM",
    "status": "present",
    "late_minutes": 0
}
```

**Sample Response (Clock Out):**

```json
{
    "success": true,
    "message": "Clocked out successfully",
    "clock_out_time": "05:00 PM",
    "work_hours": 8,
    "overtime_hours": 0
}
```

## Notes

- All endpoints require `auth:sanctum`.
- Daily list auto-creates absent records for active employees when no filters are applied (matches web view).
- For dropdowns use employees/departments/shifts APIs.
- Clock in/out uses current shift assignment to calculate lateness/overtime.
