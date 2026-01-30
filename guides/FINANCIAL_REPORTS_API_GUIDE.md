# Financial Reports API Guide

This guide documents the financial report endpoints used by the frontend dashboards. All endpoints are tenant-scoped and require `auth:sanctum`.

Base URL:

```
/api/v1/tenant/{tenant}
```

## Authentication

Include the bearer token in the `Authorization` header.

## Common Query Parameters

- `from_date` (YYYY-MM-DD)
- `to_date` (YYYY-MM-DD)
- `as_of_date` (YYYY-MM-DD)
- `compare` (0|1)
- `mode` (`detailed`|`condensed`)

---

## Profit & Loss

### 1) Profit & Loss Summary

**GET** `/reports/financial/profit-loss`

Query:

- `from_date`, `to_date`
- `compare` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Profit & loss report retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2025-01-01",
            "to_date": "2025-01-31",
            "compare": true
        },
        "summary": {
            "total_income": 520000,
            "total_expenses": 310000,
            "net_profit": 210000,
            "profit_margin": 40.38
        },
        "income": [
            {
                "account_id": 10,
                "name": "Sales Revenue",
                "code": "4001",
                "amount": 520000
            }
        ],
        "expenses": [
            {
                "account_id": 22,
                "name": "Utilities",
                "code": "5002",
                "amount": 45000
            }
        ],
        "stock": {
            "opening_stock": 175000,
            "closing_stock": 190000
        },
        "compare": {
            "previous_from": "2024-12-01",
            "previous_to": "2024-12-31",
            "total_income": 470000,
            "total_expenses": 295000,
            "net_profit": 175000,
            "profit_margin": 37.23
        }
    }
}
```

PDF Export:

**GET** `/reports/financial/profit-loss/pdf`

Query:

- `from_date`, `to_date`

Response:

- `Content-Type: application/pdf`
- File download

### 2) Profit & Loss (Table View)

**GET** `/reports/financial/profit-loss/table`

Query:

- `from_date`, `to_date`
- `mode` (`detailed`|`condensed`)

Sample response:

```json
{
    "success": true,
    "message": "Profit & loss table retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2025-01-01",
            "to_date": "2025-01-31",
            "mode": "detailed"
        },
        "summary": {
            "total_income": 520000,
            "total_expenses": 310000,
            "net_profit": 210000
        },
        "income_groups": [
            {
                "group": "Sales",
                "total": 520000,
                "accounts": [
                    {
                        "account_id": 10,
                        "name": "Sales Revenue",
                        "code": "4001",
                        "amount": 520000
                    }
                ]
            }
        ],
        "expense_groups": [
            {
                "group": "Operating Expenses",
                "total": 310000,
                "accounts": [
                    {
                        "account_id": 22,
                        "name": "Utilities",
                        "code": "5002",
                        "amount": 45000
                    }
                ]
            }
        ]
    }
}
```

PDF Export (table view):

**GET** `/reports/financial/profit-loss/pdf`

Query:

- `from_date`, `to_date`

Response:

- `Content-Type: application/pdf`
- File download

---

## Balance Sheet

**GET** `/reports/financial/balance-sheet`

Query:

- `as_of_date`
- `compare` (optional, compares with previous year)

Sample response:

```json
{
    "success": true,
    "message": "Balance sheet retrieved successfully",
    "data": {
        "filters": {
            "as_of_date": "2025-01-31",
            "compare": true
        },
        "assets": [
            {
                "account_id": 1,
                "name": "Cash",
                "code": "1001",
                "balance": 125000
            }
        ],
        "liabilities": [
            {
                "account_id": 45,
                "name": "Accounts Payable",
                "code": "2001",
                "balance": 80000
            }
        ],
        "equity": [
            {
                "account_id": 60,
                "name": "Owner Capital",
                "code": "3001",
                "balance": 95000
            }
        ],
        "summary": {
            "total_assets": 125000,
            "total_liabilities": 80000,
            "total_equity": 115000,
            "total_liabilities_and_equity": 195000,
            "retained_earnings": 20000,
            "balance_check": true
        },
        "compare": {
            "as_of_date": "2024-01-31",
            "total_assets": 110000,
            "total_liabilities": 74000,
            "total_equity": 93000
        }
    }
}
```

PDF Export:

**GET** `/reports/financial/balance-sheet/pdf`

Query:

- `as_of_date`

Response:

- `Content-Type: application/pdf`
- File download

---

## Trial Balance

**GET** `/reports/financial/trial-balance`

Query options:

- `from_date` + `to_date` (period) **or**
- `as_of_date` (point-in-time)

Sample response:

```json
{
    "success": true,
    "message": "Trial balance retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2025-01-01",
            "to_date": "2025-01-31",
            "as_of_date": null
        },
        "summary": {
            "total_debits": 320000,
            "total_credits": 320000,
            "difference": 0,
            "balanced": true
        },
        "records": [
            {
                "account_id": 1,
                "code": "1001",
                "name": "Cash",
                "account_type": "asset",
                "group": "Current Assets",
                "opening_balance": 25000,
                "current_balance": 40000,
                "debit_amount": 40000,
                "credit_amount": 0
            }
        ]
    }
}
```

PDF Export:

**GET** `/reports/financial/trial-balance/pdf`

Query options:

- `from_date` + `to_date` (period) **or**
- `as_of_date` (point-in-time)

Response:

- `Content-Type: application/pdf`
- File download

---

## Cash Flow

**GET** `/reports/financial/cash-flow`

Query:

- `from_date`, `to_date`

Sample response:

```json
{
    "success": true,
    "message": "Cash flow report retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2025-01-01",
            "to_date": "2025-01-31"
        },
        "operating": [
            {
                "description": "Sales Revenue",
                "amount": 520000,
                "type": "income"
            }
        ],
        "investing": [
            {
                "description": "Investment in Equipment",
                "amount": -85000,
                "type": "investing"
            }
        ],
        "financing": [
            {
                "description": "Owner Capital",
                "amount": 50000,
                "type": "equity"
            }
        ],
        "summary": {
            "operating_total": 520000,
            "investing_total": -85000,
            "financing_total": 50000,
            "net_cash_flow": 485000,
            "opening_cash": 100000,
            "closing_cash": 585000,
            "calculated_closing_cash": 585000
        }
    }
}
```

PDF Export:

**GET** `/reports/financial/cash-flow/pdf`

Query:

- `from_date`, `to_date`

Response:

- `Content-Type: application/pdf`
- File download

---

## Frontend Screen Guidance (High-level)

- **Top tabs:** Profit & Loss, Balance Sheet, Trial Balance, Cash Flow.
- **Filters:** date range + quick presets (today, month, quarter, year).
- **Summary cards:** totals and % change when `compare=1`.
- **Actions:** print and export in a compact dropdown (PDF/Excel handled by web views if required).
