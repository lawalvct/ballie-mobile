# Bank Reconciliation API Guide (Mobile/Frontend)

**Update marker:** 23-jan.-2026 2:52am

## Base URL

`/api/v1/tenant/{tenant}`

## Authentication

All endpoints require `Authorization: Bearer {token}` (Sanctum token).

---

## Screen → Endpoint Mapping

### 1) ReconciliationHomeScreen (Web: reconciliations/index.blade.php)

**Purpose:** List reconciliations, show stats, filters.

**Endpoint:** `GET /banking/reconciliations`

**Query Parameters (optional):**

- `bank_id` (int)
- `status` (string) — `draft|in_progress|completed|cancelled`
- `from_date` (YYYY-MM-DD)
- `to_date` (YYYY-MM-DD)
- `sort_by` (string) — `reconciliation_date|created_at|status`
- `sort_order` (string) — `asc|desc`
- `per_page` (int) — default 20
- `page` (int)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Reconciliations retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 18,
                "bank_id": 12,
                "bank": {
                    "id": 12,
                    "bank_name": "Access Bank",
                    "account_name": "Ballie Nigeria Ltd",
                    "account_number": "3012345678",
                    "masked_account_number": "******5678",
                    "currency": "NGN"
                },
                "reconciliation_date": "2026-01-20",
                "statement_start_date": "2026-01-01",
                "statement_end_date": "2026-01-31",
                "opening_balance": 250000,
                "closing_balance_per_bank": 300000,
                "closing_balance_per_books": 295000,
                "difference": 5000,
                "status": "in_progress",
                "status_color": "bg-blue-100 text-blue-800",
                "total_transactions": 12,
                "reconciled_transactions": 4,
                "unreconciled_transactions": 8,
                "bank_charges": 0,
                "interest_earned": 0,
                "notes": null,
                "created_at": "2026-01-20 11:22:01",
                "updated_at": "2026-01-20 11:30:21"
            }
        ],
        "last_page": 1,
        "per_page": 20,
        "total": 1
    },
    "banks": [
        {
            "id": 12,
            "bank_name": "Access Bank",
            "account_number": "3012345678",
            "masked_account_number": "******5678",
            "current_balance": 250000
        }
    ],
    "statistics": {
        "total": 3,
        "completed": 1,
        "in_progress": 1,
        "draft": 1,
        "cancelled": 0
    }
}
```

**What to render on ReconciliationHomeScreen:**

- Stats cards: `statistics.total`, `statistics.completed`, `statistics.in_progress`, `statistics.draft`.
- Filters: `banks` list, `status`, date range.
- Rows: `bank.bank_name`, `bank.masked_account_number`, `statement_start_date`, `statement_end_date`, balances, `difference`, `status`.

---

### 2) ReconciliationCreateScreen (Web: reconciliations/create.blade.php)

**Purpose:** Start a new reconciliation.

#### (A) Form Options

**Endpoint:** `GET /banking/reconciliations/create`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Reconciliation form data retrieved successfully",
    "data": {
        "banks": [
            {
                "id": 12,
                "bank_name": "Access Bank",
                "account_name": "Ballie Nigeria Ltd",
                "account_number": "3012345678",
                "masked_account_number": "******5678",
                "account_type": "current",
                "current_balance": 250000,
                "last_reconciliation_date": "2026-01-01"
            }
        ]
    }
}
```

#### (B) Create Reconciliation

**Endpoint:** `POST /banking/reconciliations`

**Required Fields:**

- `bank_id`
- `reconciliation_date`
- `statement_start_date`
- `statement_end_date`
- `closing_balance_per_bank`

**Optional Fields:**
`statement_number`, `bank_charges`, `interest_earned`, `other_adjustments`, `notes`.

**Sample Request:**

```json
{
    "bank_id": 12,
    "reconciliation_date": "2026-01-20",
    "statement_start_date": "2026-01-01",
    "statement_end_date": "2026-01-31",
    "closing_balance_per_bank": 300000,
    "bank_charges": 0,
    "interest_earned": 0,
    "notes": "January statement"
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Reconciliation created successfully",
    "data": {
        "reconciliation": {
            "id": 18,
            "status": "in_progress",
            "bank_id": 12,
            "reconciliation_date": "2026-01-20"
        }
    }
}
```

---

### 3) ReconciliationDetailScreen (Web: reconciliations/show.blade.php)

**Purpose:** Show balances, cleared/uncleared items, and actions.

**Endpoint:** `GET /banking/reconciliations/{id}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Reconciliation retrieved successfully",
    "data": {
        "reconciliation": {
            "id": 18,
            "bank_id": 12,
            "reconciliation_date": "2026-01-20",
            "statement_start_date": "2026-01-01",
            "statement_end_date": "2026-01-31",
            "opening_balance": 250000,
            "closing_balance_per_bank": 300000,
            "closing_balance_per_books": 295000,
            "difference": 5000,
            "status": "in_progress",
            "status_color": "bg-blue-100 text-blue-800",
            "total_transactions": 12,
            "reconciled_transactions": 4,
            "unreconciled_transactions": 8,
            "bank_charges": 0,
            "interest_earned": 0,
            "notes": null
        },
        "items": [
            {
                "id": 501,
                "transaction_date": "2026-01-10",
                "description": "Receipt Voucher",
                "reference_number": "RV-0010",
                "debit_amount": 50000,
                "credit_amount": 0,
                "status": "uncleared"
            }
        ],
        "cleared_items": [],
        "uncleared_items": [
            {
                "id": 501,
                "transaction_date": "2026-01-10",
                "description": "Receipt Voucher",
                "reference_number": "RV-0010",
                "debit_amount": 50000,
                "credit_amount": 0,
                "status": "uncleared"
            }
        ],
        "statistics": {
            "total": 12,
            "reconciled": 4,
            "unreconciled": 8,
            "progress": 33.33
        }
    }
}
```

**What to render on ReconciliationDetailScreen:**

- Summary cards: `closing_balance_per_bank`, `closing_balance_per_books`, `difference`, `statistics.progress`.
- Tabs: `uncleared_items` and `cleared_items`.
- Each item: `transaction_date`, `description`, `reference_number`, `debit_amount`, `credit_amount`, `status`.

---

### 4) Update Item Status (Clear/Unclear/Exclude)

**Endpoint:** `POST /banking/reconciliations/{id}/items/status`

**Request:**

```json
{
    "item_id": 501,
    "status": "cleared",
    "cleared_date": "2026-01-21",
    "bank_reference": "BANK-REF-001"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Item updated successfully",
    "data": {
        "item": {
            "id": 501,
            "status": "cleared",
            "cleared_date": "2026-01-21"
        },
        "statistics": {
            "total": 12,
            "reconciled": 5,
            "unreconciled": 7,
            "progress": 41.67
        }
    }
}
```

---

### 5) Complete Reconciliation

**Endpoint:** `POST /banking/reconciliations/{id}/complete`

**Response (200):**

```json
{
    "success": true,
    "message": "Reconciliation completed successfully",
    "data": {
        "reconciliation": {
            "id": 18,
            "status": "completed"
        }
    }
}
```

---

### 6) Cancel Reconciliation

**Endpoint:** `POST /banking/reconciliations/{id}/cancel`

**Response (200):**

```json
{
    "success": true,
    "message": "Reconciliation cancelled successfully"
}
```

---

### 7) Delete Reconciliation

**Endpoint:** `DELETE /banking/reconciliations/{id}`

**Response (200):**

```json
{
    "success": true,
    "message": "Reconciliation deleted successfully"
}
```

---

## Error Format

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "bank_id": ["The bank id field is required."]
    }
}
```

---

## Notes for Frontend

- After creating a reconciliation, the API auto-loads unreconciled transactions for the statement period.
- `difference` should reach 0 (or < 0.01) before calling complete.
- Status values: `draft`, `in_progress`, `completed`, `cancelled`.
