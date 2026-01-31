# Payroll Reports API Guide

This guide documents the payroll report endpoints used by the frontend dashboards. All endpoints are tenant-scoped and require `auth:sanctum`.

Base URL:

```
/api/v1/tenant/{tenant}
```

## Authentication

Include the bearer token in the `Authorization` header.

## Common Query Parameters

- `year` (YYYY)
- `month` (1-12, optional)
- `status` (draft|processing|approved|paid)
- `department_id` (optional)

---

## 1) Payroll Summary

**GET** `/reports/payroll/summary`

Query:

- `year`
- `month` (optional)
- `status` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Payroll summary retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "month": null,
            "status": null
        },
        "summary": {
            "total_periods": 8,
            "total_employees": 120,
            "total_gross": 9200000,
            "total_deductions": 1400000,
            "total_net": 7800000,
            "total_tax": 520000,
            "average_per_employee": 65000
        },
        "monthly_breakdown": [
            {
                "month": "2026-01",
                "periods": 1,
                "employees": 120,
                "gross": 9200000,
                "deductions": 1400000,
                "net": 7800000,
                "tax": 520000
            }
        ],
        "department_breakdown": {
            "Operations": {
                "employees": 32,
                "gross": 2400000,
                "deductions": 350000,
                "net": 2050000
            }
        },
        "periods": [
            {
                "id": 15,
                "name": "January 2026",
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
                "pay_date": "2026-02-02",
                "status": "paid",
                "employees": 120,
                "gross": 9200000,
                "net": 7800000
            }
        ]
    }
}
```

UI guidance:

- Summary cards: total periods, employees, gross, net, deductions, tax, avg per employee.
- Tables: monthly breakdown + department breakdown + payroll period list.

---

## 2) Tax Report

**GET** `/reports/payroll/tax-report`

Query:

- `year`
- `month` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Tax report retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "month": 1
        },
        "summary": {
            "total_employees": 120,
            "total_gross": 9200000,
            "total_tax": 520000,
            "average_tax_rate": 5.65
        },
        "records": [
            {
                "employee": {
                    "id": 3,
                    "name": "Jane Doe",
                    "employee_number": "EMP-0003",
                    "department": "Operations",
                    "email": "jane@company.com"
                },
                "total_gross": 960000,
                "total_tax": 54000,
                "tax_rate": 5.63,
                "run_count": 1
            }
        ]
    }
}
```

UI guidance:

- Summary cards: total employees, total gross, total tax, average tax rate.
- Table: employee, department, total gross, total tax, tax rate, runs.

---

## 3) Tax Summary

**GET** `/reports/payroll/tax-summary`

Query:

- `year`
- `month` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Tax summary retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "month": null
        },
        "summary": {
            "total_tax": 520000,
            "total_gross": 9200000,
            "total_employees": 120,
            "average_tax_rate": 5.65
        },
        "monthly_breakdown": [
            {
                "month": "2026-01",
                "employees": 120,
                "gross": 9200000,
                "tax": 520000,
                "net": 7800000
            }
        ],
        "department_breakdown": {
            "Operations": {
                "employees": 32,
                "gross": 2400000,
                "tax": 120000
            }
        }
    }
}
```

UI guidance:

- Summary cards and charts for monthly tax trends.
- Department breakdown for tax allocation.

---

## 4) Employee Summary

**GET** `/reports/payroll/employee-summary`

Query:

- `year`
- `department_id` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Employee summary retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "department_id": null
        },
        "summary": {
            "total_employees": 120,
            "total_gross": 9200000,
            "total_deductions": 1400000,
            "total_tax": 520000,
            "total_net": 7800000
        },
        "departments": [{ "id": 1, "name": "Operations" }],
        "records": [
            {
                "employee": {
                    "id": 3,
                    "name": "Jane Doe",
                    "employee_number": "EMP-0003",
                    "department": "Operations"
                },
                "payroll_count": 1,
                "total_gross": 960000,
                "total_deductions": 140000,
                "total_tax": 54000,
                "total_net": 766000,
                "average_gross": 960000,
                "average_net": 766000
            }
        ]
    }
}
```

UI guidance:

- Summary cards: totals per year.
- Table: per-employee payroll stats with averages.

---

## 5) Bank Schedule

**GET** `/reports/payroll/bank-schedule`

Query:

- `year`
- `month` (optional)
- `status` (approved|paid)

Sample response:

```json
{
    "success": true,
    "message": "Bank schedule retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "month": null,
            "status": "approved"
        },
        "summary": {
            "total_periods": 2,
            "total_employees": 120,
            "total_gross": 9200000,
            "total_deductions": 1400000,
            "total_net": 7800000
        },
        "periods": [
            {
                "id": 15,
                "name": "January 2026",
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
                "pay_date": "2026-02-02",
                "employees": 120,
                "gross": 9200000,
                "deductions": 1400000,
                "net": 7800000,
                "status": "approved"
            }
        ]
    }
}
```

UI guidance:

- Summary cards (periods, employees, gross, deductions, net).
- List of payroll periods with status and actions (view, download bank file, mark paid).

---

## 6) Detailed Payroll Report

**GET** `/reports/payroll/detailed`

Query:

- `year`
- `month` (optional)
- `department_id` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Detailed payroll report retrieved successfully",
    "data": {
        "filters": {
            "year": 2026,
            "month": 1,
            "department_id": null
        },
        "totals": {
            "gross": 9200000,
            "deductions": 1400000,
            "tax": 520000,
            "net": 7800000
        },
        "departments": [{ "id": 1, "name": "Operations" }],
        "records": [
            {
                "id": 3001,
                "period": {
                    "id": 15,
                    "name": "January 2026",
                    "pay_date": "2026-02-02"
                },
                "employee": {
                    "id": 3,
                    "name": "Jane Doe",
                    "employee_number": "EMP-0003",
                    "department": "Operations"
                },
                "gross": 960000,
                "deductions": 140000,
                "tax": 54000,
                "net": 766000
            }
        ]
    }
}
```

UI guidance:

- Table with per-run breakdown; filter by month and department.
