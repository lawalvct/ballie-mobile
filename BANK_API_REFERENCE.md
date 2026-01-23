# Bank Accounts API Guide (Mobile/Frontend)

**Update marker:** 23-jan.-2026 2:35am

## Base URL

`/api/v1/tenant/{tenant}`

## Authentication

All endpoints require `Authorization: Bearer {token}` (Sanctum token).

---

## Screen → Endpoint Mapping

### 1) BankHomeScreen (Web: index.blade.php)

**Purpose:** List banks, show stats, filters, and quick actions.

**Endpoint:** `GET /banking/banks`

**Query Parameters (optional):**

- `search` (string) — bank name, account number, account name, branch
- `status` (string) — `active|inactive|closed|suspended`
- `bank_name` (string) — exact bank name filter
- `sort_by` (string) — `bank_name|account_name|account_number|status|created_at|current_balance`
- `sort_order` (string) — `asc|desc`
- `per_page` (int) — default 20
- `page` (int)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank accounts retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 12,
                "bank_name": "Access Bank",
                "account_name": "Ballie Nigeria Ltd",
                "account_number": "3012345678",
                "masked_account_number": "******5678",
                "display_name": "Access Bank - 3012345678",
                "account_type": "current",
                "account_type_display": "Current",
                "branch_name": "Lagos Island",
                "currency": "NGN",
                "opening_balance": 0,
                "current_balance": 250000,
                "available_balance": 350000,
                "overdraft_limit": 100000,
                "status": "active",
                "status_color": "green",
                "is_primary": true,
                "is_payroll_account": false,
                "enable_reconciliation": true,
                "reconciliation_status": "due",
                "last_reconciliation_date": "2026-01-01",
                "ledger_account_id": 57,
                "created_at": "2026-01-10 09:20:11",
                "updated_at": "2026-01-20 10:30:01"
            }
        ],
        "first_page_url": "...",
        "from": 1,
        "last_page": 3,
        "last_page_url": "...",
        "links": [],
        "next_page_url": null,
        "path": "...",
        "per_page": 20,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    },
    "bank_names": ["Access Bank", "First Bank", "GTBank"],
    "statistics": {
        "total_banks": 3,
        "active_banks": 2,
        "total_balance": 800000,
        "needs_reconciliation": 1
    }
}
```

**What to render on BankHomeScreen:**

- Stats cards: `statistics.total_banks`, `statistics.active_banks`, `statistics.total_balance`, `statistics.needs_reconciliation`.
- Filters: `bank_names` list + `status` dropdown.
- Bank rows: `bank_name`, `masked_account_number`, `account_name`, `account_type_display`, `current_balance`, `available_balance`, `status`, `is_primary`, `is_payroll_account`, `reconciliation_status`.

---

### 2) BankCreateScreen (Web: create.blade.php)

**Purpose:** Show create form with dropdowns and submit new bank.

#### (A) Form Options

**Endpoint:** `GET /banking/banks/create`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank form data retrieved successfully",
    "data": {
        "account_types": [
            { "value": "savings", "label": "Savings" },
            { "value": "current", "label": "Current/Checking" },
            { "value": "fixed_deposit", "label": "Fixed Deposit" },
            { "value": "credit_card", "label": "Credit Card" },
            { "value": "loan", "label": "Loan Account" },
            { "value": "investment", "label": "Investment" },
            { "value": "other", "label": "Other" }
        ],
        "currencies": [
            { "value": "NGN", "label": "NGN - Nigerian Naira" },
            { "value": "USD", "label": "USD - US Dollar" },
            { "value": "EUR", "label": "EUR - Euro" },
            { "value": "GBP", "label": "GBP - British Pound" }
        ],
        "statuses": [
            { "value": "active", "label": "Active" },
            { "value": "inactive", "label": "Inactive" },
            { "value": "closed", "label": "Closed" },
            { "value": "suspended", "label": "Suspended" }
        ]
    }
}
```

#### (B) Create Bank

**Endpoint:** `POST /banking/banks`

**Required Fields:**

- `bank_name`
- `account_name`
- `account_number` (must be unique per tenant)
- `currency`
- `status`

**Optional Fields (subset):**
`account_type`, `opening_balance`, `branch_name`, `branch_code`, `branch_address`, `branch_city`, `branch_state`, `branch_phone`, `branch_email`, `swift_code`, `iban`, `routing_number`, `sort_code`, `relationship_manager`, `manager_phone`, `manager_email`, `minimum_balance`, `overdraft_limit`, `account_opening_date`, `online_banking_url`, `online_banking_username`, `online_banking_notes`, `monthly_maintenance_fee`, `transaction_limit_daily`, `transaction_limit_monthly`, `free_transactions_per_month`, `excess_transaction_fee`, `description`, `notes`, `is_primary`, `is_payroll_account`, `enable_reconciliation`, `enable_auto_import`.

**Sample Request:**

```json
{
    "bank_name": "Access Bank",
    "account_name": "Ballie Nigeria Ltd",
    "account_number": "3012345678",
    "account_type": "current",
    "currency": "NGN",
    "opening_balance": 250000,
    "status": "active",
    "is_primary": true,
    "enable_reconciliation": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Bank account created successfully",
    "data": {
        "bank": {
            "id": 12,
            "bank_name": "Access Bank",
            "account_name": "Ballie Nigeria Ltd",
            "account_number": "3012345678",
            "masked_account_number": "******5678",
            "account_type": "current",
            "currency": "NGN",
            "opening_balance": 250000,
            "current_balance": 250000,
            "available_balance": 250000,
            "status": "active",
            "is_primary": true,
            "enable_reconciliation": true
        }
    }
}
```

---

### 3) BankDetailScreen (Web: show.blade.php)

**Purpose:** Show full bank profile, balances, recent transactions, and stats.

**Endpoint:** `GET /banking/banks/{bankId}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank account retrieved successfully",
    "data": {
        "bank": {
            "id": 12,
            "bank_name": "Access Bank",
            "account_name": "Ballie Nigeria Ltd",
            "account_number": "3012345678",
            "masked_account_number": "******5678",
            "account_type": "current",
            "currency": "NGN",
            "opening_balance": 250000,
            "current_balance": 235000,
            "available_balance": 335000,
            "overdraft_limit": 100000,
            "status": "active",
            "status_color": "green",
            "is_primary": true,
            "enable_reconciliation": true,
            "reconciliation_status": "due",
            "last_reconciliation_date": "2026-01-01"
        },
        "recent_transactions": [
            {
                "id": 501,
                "voucher_id": 98,
                "voucher_number": "RV-0012",
                "voucher_date": "2026-01-18",
                "voucher_type": "Receipt Voucher",
                "particulars": "Customer payment",
                "debit": 50000,
                "credit": 0
            }
        ],
        "monthly_stats": {
            "transactions_count": 6,
            "reconciliation_status": "due",
            "account_age_days": 90
        }
    }
}
```

**What to render on BankDetailScreen:**

- Balance cards: `opening_balance`, `current_balance`, `available_balance`.
- Account info: `bank_name`, `account_name`, `account_number`, `account_type_display`, `currency`, `status`.
- Branch & international codes: `branch_*`, `swift_code`, `iban`, `routing_number`, `sort_code`.
- Recent transactions table: `recent_transactions`.
- Quick actions: Edit, Statement, Delete (if allowed).

---

### 4) BankEditScreen (Web: edit.blade.php)

**Purpose:** Prefill the form and update bank data.

**Endpoint (prefill):** `GET /banking/banks/{bankId}`

**Endpoint (update):** `PUT /banking/banks/{bankId}`

**Notes:**

- `opening_balance` is read-only on the web. Do not edit it in mobile (unless product decides otherwise).

**Sample Update Request:**

```json
{
    "bank_name": "Access Bank",
    "account_name": "Ballie Nigeria Ltd",
    "account_number": "3012345678",
    "account_type": "current",
    "currency": "NGN",
    "status": "active",
    "branch_name": "Lagos Island",
    "enable_reconciliation": true
}
```

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank account updated successfully",
    "data": {
        "bank": {
            "id": 12,
            "bank_name": "Access Bank",
            "account_number": "3012345678",
            "status": "active"
        }
    }
}
```

---

### 5) BankStatementScreen (Web: statement.blade.php)

**Purpose:** Show running statement with filters and totals.

**Endpoint:** `GET /banking/banks/{bankId}/statement`

**Query Parameters:**

- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank statement retrieved successfully",
    "data": {
        "bank": {
            "id": 12,
            "bank_name": "Access Bank",
            "account_number": "3012345678",
            "currency": "NGN"
        },
        "date_range": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
        },
        "opening_balance": 200000,
        "transactions": [
            {
                "date": "2026-01-03",
                "particulars": "Receipt Voucher",
                "voucher_type": "Receipt Voucher",
                "voucher_number": "RV-0010",
                "debit": 50000,
                "credit": 0,
                "running_balance": 250000
            }
        ],
        "totals": {
            "total_debits": 150000,
            "total_credits": 50000,
            "closing_balance": 300000
        }
    }
}
```

---

### 6) Delete Bank Account (from BankDetailScreen)

**Endpoint:** `DELETE /banking/banks/{bankId}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Bank account deleted successfully"
}
```

**Error (422):**

```json
{
    "success": false,
    "message": "Cannot delete bank account with transactions or non-zero balance."
}
```

---

## Error Format

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "bank_name": ["The bank name field is required."]
    }
}
```

---

## Notes for Frontend

- `current_balance` and `available_balance` are derived from the linked ledger account.
- `reconciliation_status` is one of `disabled`, `never`, `current`, `due`, `overdue`.
- Export to CSV/PDF in the web UI is client-side (print/CSV). No dedicated API download endpoint yet.
