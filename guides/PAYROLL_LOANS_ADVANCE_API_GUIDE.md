# Payroll Salary Advance & Loan History API Guide

Base URLs (tenant):

- Salary advance: `/api/v1/tenant/{tenant}/payroll/salary-advance`
- Loan history: `/api/v1/tenant/{tenant}/payroll/loans`

All endpoints require `auth:sanctum`.

---

## Screens & Data Requirements (from Blade views)

### 1) Salary Advance (Issue IOU)

- Employee selector with preview:
    - employee number, department, basic salary
- Advance amount & repayment duration
- Monthly deduction preview
- Purpose/Notes
- Payment details: voucher date, payment method (cash/bank), reference
- Summary sidebar with calculated monthly deduction and reminder of created records

### 2) Loan History (Loans & Advances List)

- Summary cards:
    - Total Loans
    - Active Loans
    - Total Disbursed
    - Outstanding
- Filters:
    - Search by loan number
    - Employee
    - Status (active/completed/cancelled)
- Table:
    - Loan number + purpose
    - Employee + department
    - Amount + duration
    - Paid, Balance, Monthly deduction
    - Progress %
    - Status
    - Date

---

## Endpoints

### 1) Issue Salary Advance (creates loan + voucher)

**POST** `/api/v1/tenant/{tenant}/payroll/salary-advance`

**Payload:**

```json
{
    "employee_id": 12,
    "amount": 50000,
    "duration_months": 5,
    "purpose": "School fees",
    "voucher_date": "2026-01-28",
    "payment_method": "bank",
    "reference": "TRX-8821",
    "cash_bank_account_id": 120
}
```

**Sample Response:**

```json
{
    "success": true,
    "message": "Salary advance issued successfully",
    "data": {
        "loan": {
            "id": 3,
            "loan_number": "LOAN-2026-0003",
            "employee_id": 12,
            "employee_name": "John Lawal",
            "employee_number": "EMP-2026-0001",
            "department_name": "Finance",
            "loan_amount": 50000,
            "total_paid": 0,
            "balance": 50000,
            "monthly_deduction": 10000,
            "duration_months": 5,
            "remaining_months": 5,
            "progress_percentage": 0,
            "status": "active",
            "purpose": "School fees",
            "start_date": "2026-01-28"
        },
        "voucher": {
            "id": 88,
            "voucher_number": "SA-2026-0009",
            "voucher_date": "2026-01-28",
            "total_amount": 50000,
            "reference_number": "TRX-8821"
        }
    }
}
```

**Notes:**

- If `cash_bank_account_id` is not provided, the API uses “Cash in Hand” for cash or the first bank ledger for bank.
- Creates voucher entries: Debit Employee Advances, Credit Cash/Bank.

---

### 2) Loan History (list)

**GET** `/api/v1/tenant/{tenant}/payroll/loans`

**Query Params:**

- `search` (loan number)
- `employee_id`
- `status` (active|completed|cancelled)
- `per_page` (default 20)

**Sample Response:**

```json
{
    "success": true,
    "message": "Loans retrieved successfully",
    "data": {
        "summary": {
            "total_loans": 8,
            "active_loans": 3,
            "total_amount": 250000,
            "total_outstanding": 120000
        },
        "records": {
            "current_page": 1,
            "data": [
                {
                    "id": 3,
                    "loan_number": "LOAN-2026-0003",
                    "employee_id": 12,
                    "employee_name": "John Lawal",
                    "employee_number": "EMP-2026-0001",
                    "department_name": "Finance",
                    "loan_amount": 50000,
                    "total_paid": 10000,
                    "balance": 40000,
                    "monthly_deduction": 10000,
                    "duration_months": 5,
                    "remaining_months": 4,
                    "progress_percentage": 20,
                    "status": "active",
                    "purpose": "School fees",
                    "start_date": "2026-01-28",
                    "created_at": "2026-01-28 12:00:00"
                }
            ],
            "per_page": 20,
            "total": 8
        }
    }
}
```

---

### 3) Loan Details

**GET** `/api/v1/tenant/{tenant}/payroll/loans/{loan}`

**Sample Response:**

```json
{
    "success": true,
    "message": "Loan record retrieved successfully",
    "data": {
        "loan": {
            "id": 3,
            "loan_number": "LOAN-2026-0003",
            "employee_name": "John Lawal",
            "loan_amount": 50000,
            "monthly_deduction": 10000,
            "duration_months": 5,
            "balance": 40000,
            "status": "active"
        }
    }
}
```

---

## Notes

- Use the Employees API to populate the employee dropdown (also provides department and salary data).
- Monthly deduction = `amount / duration_months`.
- Loan repayment is automatically applied during payroll runs.
