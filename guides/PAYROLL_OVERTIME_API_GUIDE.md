# Payroll Overtime API Guide

Base URL (tenant): `/api/v1/tenant/{tenant}/payroll/overtime`

All endpoints require `auth:sanctum`.

---

## Screens & Data Requirements (from Blade views)

### 1) Overtime List

- Summary cards:
    - Pending Approval (count + amount)
    - Approved (Unpaid) (count + amount)
    - Total Records
    - Total Amount (pending + approved unpaid)
- Filters:
    - Date From, Date To
    - Department
    - Employee
    - Overtime Type (weekday/weekend/holiday/emergency)
    - Status (pending/approved/rejected/paid)
- Table:
    - Overtime Number
    - Employee + Department
    - Date
    - Time Range
    - Hours + multiplier
    - Type
    - Amount
    - Status
    - Actions: View, Edit (pending), Approve/Reject (pending), Delete (non-pending)

### 2) Create Overtime

- Calculation method: hourly or fixed
- Hourly fields:
    - Date, Start Time, End Time
    - Type + multiplier
    - Hourly rate
    - Auto preview (hours + amount)
- Fixed fields:
    - Fixed amount
- Reason (required), Work description (optional)

### 3) Edit Overtime

- Same as create (only for pending).

### 4) Overtime Details

- Record info, status, calculation breakdown
- Approve/Reject actions (pending)
- Mark as Paid action (approved & unpaid)
- Download payment slip (approved/paid)

### 5) Monthly Overtime Report

- Filters: Month, Year, Department
- Summary totals (employees, records, hours, total amount, paid/unpaid)
- Employee summary table

---

## Endpoints

### 1) List Overtime Records

**GET** `/api/v1/tenant/{tenant}/payroll/overtime`

**Query Params:**

- `date_from` (Y-m-d)
- `date_to` (Y-m-d)
- `department_id`
- `employee_id`
- `overtime_type` (weekday|weekend|holiday|emergency)
- `status` (pending|approved|rejected|paid)
- `payment_status` (paid|unpaid)
- `per_page` (default 20)

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime records retrieved successfully",
    "data": {
        "summary": {
            "pending_count": 2,
            "pending_amount": 45000,
            "approved_unpaid_count": 1,
            "approved_unpaid_amount": 12000,
            "total_records": 6
        },
        "records": {
            "current_page": 1,
            "data": [
                {
                    "id": 14,
                    "overtime_number": "OT-2026-0004",
                    "employee_id": 12,
                    "employee_name": "John Lawal",
                    "employee_number": "EMP-2026-0001",
                    "department_name": "Finance",
                    "overtime_date": "2026-01-28",
                    "calculation_method": "hourly",
                    "start_time": "18:00",
                    "end_time": "20:00",
                    "total_hours": 2,
                    "hourly_rate": 3000,
                    "multiplier": 1.5,
                    "total_amount": 9000,
                    "overtime_type": "weekday",
                    "reason": "Month end close",
                    "work_description": "Posting late entries",
                    "status": "pending",
                    "is_paid": false,
                    "paid_date": null,
                    "approved_by": null,
                    "approved_at": null,
                    "approval_remarks": null,
                    "rejected_by": null,
                    "rejected_at": null,
                    "rejection_reason": null,
                    "created_at": "2026-01-28 10:00:00",
                    "updated_at": "2026-01-28 10:00:00"
                }
            ],
            "per_page": 20,
            "total": 6
        }
    }
}
```

---

### 2) Create Overtime

**POST** `/api/v1/tenant/{tenant}/payroll/overtime`

**Hourly Payload:**

```json
{
    "employee_id": 12,
    "overtime_date": "2026-01-28",
    "calculation_method": "hourly",
    "start_time": "18:00",
    "end_time": "20:00",
    "overtime_type": "weekday",
    "hourly_rate": 3000,
    "reason": "Month end close",
    "work_description": "Posting late entries"
}
```

**Fixed Payload:**

```json
{
    "employee_id": 12,
    "overtime_date": "2026-01-28",
    "calculation_method": "fixed",
    "fixed_amount": 15000,
    "reason": "Server migration",
    "work_description": "Emergency support"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime record created successfully",
    "data": {
        "overtime": {
            "id": 15,
            "overtime_number": "OT-2026-0005",
            "employee_id": 12,
            "employee_name": "John Lawal",
            "department_name": "Finance",
            "overtime_date": "2026-01-28",
            "calculation_method": "hourly",
            "total_hours": 2,
            "hourly_rate": 3000,
            "multiplier": 1.5,
            "total_amount": 9000,
            "overtime_type": "weekday",
            "status": "pending"
        }
    }
}
```

---

### 3) Show Overtime

**GET** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime record retrieved successfully",
    "data": {
        "overtime": {
            "id": 15,
            "overtime_number": "OT-2026-0005",
            "employee_name": "John Lawal",
            "overtime_date": "2026-01-28",
            "calculation_method": "hourly",
            "start_time": "18:00",
            "end_time": "20:00",
            "total_hours": 2,
            "hourly_rate": 3000,
            "multiplier": 1.5,
            "total_amount": 9000,
            "overtime_type": "weekday",
            "reason": "Month end close",
            "status": "pending"
        }
    }
}
```

---

### 4) Update Overtime (Pending only)

**PUT** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}`

**Payload (hourly):**

```json
{
    "overtime_date": "2026-01-28",
    "calculation_method": "hourly",
    "start_time": "18:30",
    "end_time": "20:30",
    "overtime_type": "weekday",
    "hourly_rate": 3000,
    "reason": "Month end close",
    "work_description": "Posted late entries"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime record updated successfully",
    "data": {
        "overtime": {
            "id": 15,
            "overtime_number": "OT-2026-0005",
            "status": "pending",
            "total_hours": 2,
            "total_amount": 9000
        }
    }
}
```

---

### 5) Approve Overtime

**POST** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}/approve`

**Payload (optional):**

```json
{
    "approved_hours": 1.5,
    "approval_remarks": "Approved 1.5 hours"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime approved successfully",
    "data": {
        "overtime": {
            "id": 15,
            "status": "approved",
            "approved_by": "Admin User",
            "approved_at": "2026-01-28 12:00:00",
            "approval_remarks": "Approved 1.5 hours"
        }
    }
}
```

---

### 6) Reject Overtime

**POST** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}/reject`

**Payload:**

```json
{
    "rejection_reason": "Not pre-approved"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime rejected successfully",
    "data": {
        "overtime": {
            "id": 15,
            "status": "rejected",
            "rejection_reason": "Not pre-approved",
            "rejected_at": "2026-01-28 12:30:00"
        }
    }
}
```

---

### 7) Mark Overtime as Paid

**POST** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}/mark-paid`

**Payload:**

```json
{
    "payment_date": "2026-01-28",
    "payment_method": "bank",
    "reference_number": "TRX-991",
    "create_voucher": true,
    "cash_bank_account_id": 120,
    "payment_notes": "Paid via bank transfer"
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime marked as paid successfully",
    "data": {
        "overtime": {
            "id": 15,
            "status": "paid",
            "is_paid": true,
            "paid_date": "2026-01-28"
        },
        "voucher_number": "PV-2026-0012"
    }
}
```

---

### 8) Bulk Approve

**POST** `/api/v1/tenant/{tenant}/payroll/overtime/bulk-approve`

**Payload:**

```json
{
    "overtime_ids": [14, 15, 16]
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "3 overtime record(s) approved successfully",
    "data": {
        "approved_count": 3,
        "errors": []
    }
}
```

---

### 9) Monthly Overtime Report

**GET** `/api/v1/tenant/{tenant}/payroll/overtime/report/monthly?month=1&year=2026&department_id=3`

**Sample Response:**

```json
{
    "success": true,
    "message": "Overtime report retrieved successfully",
    "data": {
        "year": 2026,
        "month": 1,
        "summary": {
            "total_employees": 2,
            "total_records": 6,
            "total_hours": 12,
            "total_amount": 54000,
            "paid_amount": 30000,
            "unpaid_amount": 24000
        },
        "employees": [
            {
                "employee": {
                    "id": 12,
                    "name": "John Lawal",
                    "employee_number": "EMP-2026-0001",
                    "department_name": "Finance"
                },
                "record_count": 4,
                "total_hours": 8,
                "total_amount": 36000,
                "paid_amount": 12000,
                "unpaid_amount": 24000
            }
        ]
    }
}
```

---

### 10) Download Payment Slip (PDF)

**GET** `/api/v1/tenant/{tenant}/payroll/overtime/{overtime}/payment-slip`

**Response:**

- `Content-Type: application/pdf`
- File download (no JSON body)

**Notes:**

- Available for any overtime record; UI typically shows this for approved/paid.
- Frontend should handle this as a file download/stream.

---

## Notes

- Create/Edit screens should mimic hourly vs fixed toggling (hourly fields required only for hourly).
- `end_time` can be earlier than `start_time` to support overnight overtime; API will roll into next day.
- Approve/Reject only for `pending` status.
- Mark Paid only for `approved` and `unpaid`.
- Use employees/departments APIs to populate filters and dropdowns.
