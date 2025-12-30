# Voucher Management API Reference

## Base URL

```
https://yourdomain.com/api/v1/tenant/{tenant_slug}/accounting/vouchers
```

## Authentication

All requests require Bearer token:

```
Authorization: Bearer {your_token}
Accept: application/json
Content-Type: application/json
```

---

## Endpoints

### 1. Get Create Form Data

**Endpoint:** `GET /create`

**Description:** Get all data needed to create a voucher including voucher types and ledger accounts.

**Query Parameters:**

-   `type` (optional): Pre-select voucher type (jv, pv, rv, cv, cn, dn)

**Request Example:**

```http
GET /api/v1/tenant/demo-company/accounting/vouchers/create?type=jv
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "data": {
        "voucher_types": [
            {
                "id": 1,
                "name": "Journal Voucher",
                "code": "JV",
                "description": "General journal entries",
                "has_numbering": true,
                "number_prefix": "JV-",
                "number_suffix": "",
                "next_number": 1001
            },
            {
                "id": 2,
                "name": "Payment Voucher",
                "code": "PV",
                "description": "Cash or bank payments",
                "has_numbering": true,
                "number_prefix": "PV-",
                "number_suffix": "",
                "next_number": 2001
            },
            {
                "id": 3,
                "name": "Receipt Voucher",
                "code": "RV",
                "description": "Cash or bank receipts",
                "has_numbering": true,
                "number_prefix": "RV-",
                "number_suffix": "",
                "next_number": 3001
            },
            {
                "id": 4,
                "name": "Contra Voucher",
                "code": "CV",
                "description": "Bank to bank transfers",
                "has_numbering": true,
                "number_prefix": "CV-",
                "number_suffix": "",
                "next_number": 4001
            },
            {
                "id": 5,
                "name": "Credit Note",
                "code": "CN",
                "description": "Customer credit notes",
                "has_numbering": true,
                "number_prefix": "CN-",
                "number_suffix": "",
                "next_number": 5001
            },
            {
                "id": 6,
                "name": "Debit Note",
                "code": "DN",
                "description": "Customer debit notes",
                "has_numbering": true,
                "number_prefix": "DN-",
                "number_suffix": "",
                "next_number": 6001
            }
        ],
        "ledger_accounts": [
            {
                "id": 1,
                "name": "Cash in Hand",
                "code": "1001",
                "display_name": "Cash in Hand (1001)",
                "account_type": "asset",
                "account_group_id": 1,
                "account_group_name": "Current Assets",
                "parent_id": null,
                "level": 0,
                "current_balance": 50000.0
            },
            {
                "id": 2,
                "name": "Bank Account - ABC Bank",
                "code": "1002",
                "display_name": "Bank Account - ABC Bank (1002)",
                "account_type": "asset",
                "account_group_id": 1,
                "account_group_name": "Current Assets",
                "parent_id": null,
                "level": 0,
                "current_balance": 150000.0
            },
            {
                "id": 3,
                "name": "Accounts Receivable",
                "code": "1003",
                "display_name": "Accounts Receivable (1003)",
                "account_type": "asset",
                "account_group_id": 1,
                "account_group_name": "Current Assets",
                "parent_id": null,
                "level": 0,
                "current_balance": 75000.0
            },
            {
                "id": 10,
                "name": "Capital Account",
                "code": "3001",
                "display_name": "Capital Account (3001)",
                "account_type": "equity",
                "account_group_id": 5,
                "account_group_name": "Equity",
                "parent_id": null,
                "level": 0,
                "current_balance": 500000.0
            },
            {
                "id": 15,
                "name": "Sales Revenue",
                "code": "4001",
                "display_name": "Sales Revenue (4001)",
                "account_type": "income",
                "account_group_id": 6,
                "account_group_name": "Revenue",
                "parent_id": null,
                "level": 0,
                "current_balance": 250000.0
            },
            {
                "id": 20,
                "name": "Rent Expense",
                "code": "5001",
                "display_name": "Rent Expense (5001)",
                "account_type": "expense",
                "account_group_id": 8,
                "account_group_name": "Operating Expenses",
                "parent_id": null,
                "level": 0,
                "current_balance": 45000.0
            },
            {
                "id": 21,
                "name": "Salary Expense",
                "code": "5002",
                "display_name": "Salary Expense (5002)",
                "account_type": "expense",
                "account_group_id": 8,
                "account_group_name": "Operating Expenses",
                "parent_id": null,
                "level": 0,
                "current_balance": 120000.0
            },
            {
                "id": 25,
                "name": "Accounts Payable",
                "code": "2001",
                "display_name": "Accounts Payable (2001)",
                "account_type": "liability",
                "account_group_id": 3,
                "account_group_name": "Current Liabilities",
                "parent_id": null,
                "level": 0,
                "current_balance": 85000.0
            }
        ],
        "products": [
            {
                "id": 1,
                "name": "Product A",
                "sku": "PRD-001",
                "price": 100.0,
                "cost": 60.0,
                "stock_quantity": 50
            },
            {
                "id": 2,
                "name": "Product B",
                "sku": "PRD-002",
                "price": 250.0,
                "cost": 150.0,
                "stock_quantity": 30
            }
        ],
        "selected_type": {
            "id": 1,
            "name": "Journal Voucher",
            "code": "JV",
            "description": "General journal entries"
        },
        "defaults": {
            "voucher_date": "2025-12-30",
            "status": "draft"
        },
        "validation_rules": {
            "voucher_type_id": "required|exists:voucher_types,id",
            "voucher_date": "required|date",
            "voucher_number": "nullable|string|max:50",
            "narration": "nullable|string|max:1000",
            "entries": "required|array|min:2",
            "entries.*.ledger_account_id": "required|exists:ledger_accounts,id",
            "entries.*.debit_amount": "nullable|numeric|min:0",
            "entries.*.credit_amount": "nullable|numeric|min:0",
            "entries.*.description": "nullable|string|max:500"
        }
    },
    "message": "Form data retrieved successfully"
}
```

---

### 2. Create Voucher

**Endpoint:** `POST /`

**Description:** Create a new voucher with entries.

**Payload Example:**

```json
{
    "voucher_type_id": 1,
    "voucher_date": "2025-12-30",
    "voucher_number": "JV-1001",
    "narration": "Opening balance entry for December 2025",
    "reference_number": "REF-2025-001",
    "entries": [
        {
            "ledger_account_id": 1,
            "debit_amount": 50000,
            "credit_amount": 0,
            "description": "Cash received as capital"
        },
        {
            "ledger_account_id": 10,
            "debit_amount": 0,
            "credit_amount": 50000,
            "description": "Capital introduced by owner"
        }
    ],
    "action": "save"
}
```

**Payload Options:**

-   `action`: "save" (saves as draft) or "save_and_post" (saves and posts immediately)
-   `voucher_number`: Optional - auto-generated if not provided

**Response Example:**

```json
{
    "success": true,
    "message": "Voucher created successfully",
    "data": {
        "id": 1,
        "voucher_type_id": 1,
        "voucher_type_name": "Journal Voucher",
        "voucher_type_code": "JV",
        "voucher_number": "JV-1001",
        "voucher_date": "2025-12-30",
        "narration": "Opening balance entry for December 2025",
        "reference_number": "REF-2025-001",
        "total_amount": 50000.0,
        "status": "draft",
        "created_at": "2025-12-30 10:00:00",
        "updated_at": "2025-12-30 10:00:00",
        "posted_at": null,
        "entries": [
            {
                "id": 1,
                "ledger_account_id": 1,
                "ledger_account_name": "Cash in Hand",
                "ledger_account_code": "1001",
                "ledger_account_display_name": "Cash in Hand (1001)",
                "account_group_name": "Current Assets",
                "debit_amount": 50000.0,
                "credit_amount": 0.0,
                "description": "Cash received as capital"
            },
            {
                "id": 2,
                "ledger_account_id": 10,
                "ledger_account_name": "Capital Account",
                "ledger_account_code": "3001",
                "ledger_account_display_name": "Capital Account (3001)",
                "account_group_name": "Equity",
                "debit_amount": 0.0,
                "credit_amount": 50000.0,
                "description": "Capital introduced by owner"
            }
        ],
        "created_by": {
            "id": 1,
            "name": "John Doe"
        },
        "updated_by": {
            "id": 1,
            "name": "John Doe"
        },
        "posted_by": {
            "id": null,
            "name": "N/A"
        },
        "can_be_edited": true,
        "can_be_deleted": true,
        "can_be_posted": true,
        "can_be_unposted": false
    }
}
```

**Validation Error Response:**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "entries": [
            "Voucher entries must be balanced. Total debits must equal total credits."
        ]
    }
}
```

---

### 3. List Vouchers

**Endpoint:** `GET /`

**Description:** Get paginated list of vouchers with filters.

**Query Parameters:**

-   `per_page` (optional): Items per page (default: 20)
-   `search` (optional): Search in voucher number, narration, reference
-   `voucher_type_id` (optional): Filter by voucher type
-   `status` (optional): Filter by status (draft, posted)
-   `date_from` (optional): Start date (YYYY-MM-DD)
-   `date_to` (optional): End date (YYYY-MM-DD)
-   `sort_by` (optional): Sort field (default: voucher_date)
-   `sort_direction` (optional): Sort direction (asc, desc, default: desc)

**Request Example:**

```http
GET /api/v1/tenant/demo-company/accounting/vouchers?per_page=20&status=draft&date_from=2025-12-01&date_to=2025-12-31
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "data": {
        "vouchers": [
            {
                "id": 1,
                "voucher_type_id": 1,
                "voucher_type_name": "Journal Voucher",
                "voucher_type_code": "JV",
                "voucher_number": "JV-1001",
                "voucher_date": "2025-12-30",
                "narration": "Opening balance entry",
                "reference_number": "REF-2025-001",
                "total_amount": 50000.0,
                "status": "draft",
                "created_at": "2025-12-30 10:00:00",
                "updated_at": "2025-12-30 10:00:00",
                "posted_at": null
            },
            {
                "id": 2,
                "voucher_type_id": 2,
                "voucher_type_name": "Payment Voucher",
                "voucher_type_code": "PV",
                "voucher_number": "PV-2001",
                "voucher_date": "2025-12-29",
                "narration": "Rent payment for December",
                "reference_number": null,
                "total_amount": 15000.0,
                "status": "posted",
                "created_at": "2025-12-29 09:00:00",
                "updated_at": "2025-12-29 09:15:00",
                "posted_at": "2025-12-29 09:15:00"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 5,
            "per_page": 20,
            "total": 100,
            "from": 1,
            "to": 20
        },
        "statistics": {
            "total_vouchers": 100,
            "draft_vouchers": 35,
            "posted_vouchers": 65,
            "total_amount": 1500000.0
        }
    },
    "message": "Vouchers retrieved successfully"
}
```

---

### 4. Get Voucher Details

**Endpoint:** `GET /{id}`

**Description:** Get full details of a specific voucher including all entries.

**Request Example:**

```http
GET /api/v1/tenant/demo-company/accounting/vouchers/1
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "voucher_type_id": 1,
        "voucher_type_name": "Journal Voucher",
        "voucher_type_code": "JV",
        "voucher_number": "JV-1001",
        "voucher_date": "2025-12-30",
        "narration": "Opening balance entry for December 2025",
        "reference_number": "REF-2025-001",
        "total_amount": 50000.0,
        "status": "draft",
        "created_at": "2025-12-30 10:00:00",
        "updated_at": "2025-12-30 10:00:00",
        "posted_at": null,
        "entries": [
            {
                "id": 1,
                "ledger_account_id": 1,
                "ledger_account_name": "Cash in Hand",
                "ledger_account_code": "1001",
                "ledger_account_display_name": "Cash in Hand (1001)",
                "account_group_name": "Current Assets",
                "debit_amount": 50000.0,
                "credit_amount": 0.0,
                "description": "Cash received as capital"
            },
            {
                "id": 2,
                "ledger_account_id": 10,
                "ledger_account_name": "Capital Account",
                "ledger_account_code": "3001",
                "ledger_account_display_name": "Capital Account (3001)",
                "account_group_name": "Equity",
                "debit_amount": 0.0,
                "credit_amount": 50000.0,
                "description": "Capital introduced by owner"
            }
        ],
        "created_by": {
            "id": 1,
            "name": "John Doe"
        },
        "updated_by": {
            "id": 1,
            "name": "John Doe"
        },
        "posted_by": {
            "id": null,
            "name": "N/A"
        },
        "can_be_edited": true,
        "can_be_deleted": true,
        "can_be_posted": true,
        "can_be_unposted": false
    },
    "message": "Voucher retrieved successfully"
}
```

---

### 5. Update Voucher

**Endpoint:** `PUT /{id}`

**Description:** Update an existing voucher (only if status is "draft").

**Payload Example:**

```json
{
    "voucher_type_id": 1,
    "voucher_date": "2025-12-30",
    "voucher_number": "JV-1001",
    "narration": "Updated opening balance entry",
    "reference_number": "REF-2025-001-UPDATED",
    "entries": [
        {
            "ledger_account_id": 1,
            "debit_amount": 55000,
            "credit_amount": 0,
            "description": "Cash received - updated amount"
        },
        {
            "ledger_account_id": 10,
            "debit_amount": 0,
            "credit_amount": 55000,
            "description": "Capital - updated amount"
        }
    ]
}
```

**Response Example:**

```json
{
    "success": true,
    "message": "Voucher updated successfully",
    "data": {
        "id": 1,
        "voucher_type_id": 1,
        "voucher_type_name": "Journal Voucher",
        "voucher_type_code": "JV",
        "voucher_number": "JV-1001",
        "voucher_date": "2025-12-30",
        "narration": "Updated opening balance entry",
        "reference_number": "REF-2025-001-UPDATED",
        "total_amount": 55000.00,
        "status": "draft",
        "created_at": "2025-12-30 10:00:00",
        "updated_at": "2025-12-30 10:30:00",
        "posted_at": null,
        "entries": [...]
    }
}
```

**Error Response (Posted Voucher):**

```json
{
    "success": false,
    "message": "Cannot update a posted voucher. Please unpost it first."
}
```

---

### 6. Delete Voucher

**Endpoint:** `DELETE /{id}`

**Description:** Delete a voucher (only if status is "draft").

**Request Example:**

```http
DELETE /api/v1/tenant/demo-company/accounting/vouchers/1
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "message": "Voucher deleted successfully"
}
```

**Error Response:**

```json
{
    "success": false,
    "message": "Cannot delete a posted voucher. Please unpost it first."
}
```

---

### 7. Post Voucher

**Endpoint:** `POST /{id}/post`

**Description:** Post (finalize) a voucher. Posted vouchers cannot be edited or deleted.

**Request Example:**

```http
POST /api/v1/tenant/demo-company/accounting/vouchers/1/post
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "message": "Voucher posted successfully",
    "data": {
        "id": 1,
        "voucher_type_id": 1,
        "voucher_type_name": "Journal Voucher",
        "voucher_type_code": "JV",
        "voucher_number": "JV-1001",
        "voucher_date": "2025-12-30",
        "narration": "Opening balance entry",
        "reference_number": "REF-2025-001",
        "total_amount": 50000.00,
        "status": "posted",
        "created_at": "2025-12-30 10:00:00",
        "updated_at": "2025-12-30 10:15:00",
        "posted_at": "2025-12-30 10:15:00",
        "entries": [...],
        "created_by": {...},
        "updated_by": {...},
        "posted_by": {
            "id": 1,
            "name": "John Doe"
        },
        "can_be_edited": false,
        "can_be_deleted": false,
        "can_be_posted": false,
        "can_be_unposted": true
    }
}
```

---

### 8. Unpost Voucher

**Endpoint:** `POST /{id}/unpost`

**Description:** Unpost a voucher, reverting it to draft status.

**Request Example:**

```http
POST /api/v1/tenant/demo-company/accounting/vouchers/1/unpost
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "message": "Voucher unposted successfully",
    "data": {
        "id": 1,
        "status": "draft",
        "posted_at": null,
        "posted_by": {
            "id": null,
            "name": "N/A"
        },
        "can_be_edited": true,
        "can_be_deleted": true,
        "can_be_posted": true,
        "can_be_unposted": false
    }
}
```

---

### 9. Get Duplicate Data

**Endpoint:** `GET /{id}/duplicate`

**Description:** Get voucher data for duplication (creates a copy with new date).

**Request Example:**

```http
GET /api/v1/tenant/demo-company/accounting/vouchers/1/duplicate
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "message": "Duplicate data retrieved successfully",
    "data": {
        "voucher_type_id": 1,
        "voucher_date": "2025-12-30",
        "narration": "Opening balance entry",
        "reference_number": null,
        "entries": [
            {
                "ledger_account_id": 1,
                "ledger_account_name": "Cash in Hand (1001)",
                "debit_amount": 50000.0,
                "credit_amount": 0.0,
                "description": "Cash received"
            },
            {
                "ledger_account_id": 10,
                "ledger_account_name": "Capital Account (3001)",
                "debit_amount": 0.0,
                "credit_amount": 50000.0,
                "description": "Capital"
            }
        ]
    }
}
```

---

### 10. Bulk Actions

**Endpoint:** `POST /bulk-action`

**Description:** Perform bulk operations on multiple vouchers.

**Payload Example (Post):**

```json
{
    "action": "post",
    "voucher_ids": [1, 2, 3, 4, 5]
}
```

**Payload Example (Unpost):**

```json
{
    "action": "unpost",
    "voucher_ids": [6, 7, 8]
}
```

**Payload Example (Delete):**

```json
{
    "action": "delete",
    "voucher_ids": [9, 10]
}
```

**Actions:**

-   `post` - Post multiple draft vouchers
-   `unpost` - Unpost multiple posted vouchers
-   `delete` - Delete multiple draft vouchers

**Response Example:**

```json
{
    "success": true,
    "message": "5 vouchers processed successfully",
    "data": {
        "success_count": 4,
        "failed_count": 1,
        "errors": ["Voucher PV-2005 is posted and cannot be deleted"]
    }
}
```

---

### 11. Search Vouchers

**Endpoint:** `GET /search`

**Description:** Quick search for vouchers (for autocomplete/dropdown).

**Query Parameters:**

-   `q` (optional): Search term (voucher number, narration, reference)
-   `status` (optional): Filter by status
-   `voucher_type_id` (optional): Filter by type

**Request Example:**

```http
GET /api/v1/tenant/demo-company/accounting/vouchers/search?q=JV&status=posted
Authorization: Bearer your_token_here
Accept: application/json
```

**Response Example:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "voucher_number": "JV-1001",
            "voucher_type": "Journal Voucher",
            "voucher_date": "2025-12-30",
            "total_amount": 50000.0,
            "status": "draft",
            "display_name": "JV-1001 - Journal Voucher (2025-12-30)"
        },
        {
            "id": 5,
            "voucher_number": "JV-1002",
            "voucher_type": "Journal Voucher",
            "voucher_date": "2025-12-29",
            "total_amount": 25000.0,
            "status": "posted",
            "display_name": "JV-1002 - Journal Voucher (2025-12-29)"
        }
    ]
}
```

---

## Voucher Types Reference

| Code | Name            | Description                                               |
| ---- | --------------- | --------------------------------------------------------- |
| JV   | Journal Voucher | General journal entries for opening balances, adjustments |
| PV   | Payment Voucher | Cash or bank payments (expenses, vendor payments)         |
| RV   | Receipt Voucher | Cash or bank receipts (customer payments, income)         |
| CV   | Contra Voucher  | Bank-to-bank or cash-to-bank internal transfers           |
| CN   | Credit Note     | Customer credit notes (sales returns, discounts)          |
| DN   | Debit Note      | Customer debit notes (purchase returns, adjustments)      |

---

## Validation Rules

### Voucher Creation/Update:

-   `voucher_type_id`: Required, must exist in voucher_types table
-   `voucher_date`: Required, valid date format (YYYY-MM-DD)
-   `voucher_number`: Optional, max 50 characters (auto-generated if empty)
-   `narration`: Optional, max 1000 characters
-   `reference_number`: Optional, max 100 characters
-   `entries`: Required, array with minimum 2 entries

### Entry Rules:

-   `ledger_account_id`: Required, must exist in ledger_accounts table
-   `debit_amount`: Optional, numeric, minimum 0
-   `credit_amount`: Optional, numeric, minimum 0
-   `description`: Optional, max 500 characters
-   **Each entry must have EITHER debit OR credit (not both)**
-   **Total debits MUST equal total credits (balanced)**

---

## Status Workflow

```
Draft (status: "draft")
  ├── Can be edited
  ├── Can be deleted
  ├── Can be posted
  └── Cannot be unposted

Posted (status: "posted")
  ├── Cannot be edited
  ├── Cannot be deleted
  ├── Cannot be posted
  └── Can be unposted
```

---

## Error Codes

| Code | Message                      | Description                             |
| ---- | ---------------------------- | --------------------------------------- |
| 422  | Validation failed            | Request data validation errors          |
| 404  | Voucher not found            | Voucher ID doesn't exist                |
| 403  | Cannot modify posted voucher | Attempted to edit/delete posted voucher |
| 422  | Unbalanced entries           | Total debits ≠ total credits            |
| 401  | Unauthorized                 | Invalid or missing token                |
| 500  | Server error                 | Internal server error                   |

---

## Example Voucher Types

### 1. Journal Voucher (Opening Balance)

```json
{
    "voucher_type_id": 1,
    "voucher_date": "2025-12-30",
    "narration": "Opening balance entry",
    "entries": [
        {
            "ledger_account_id": 1,
            "debit_amount": 50000,
            "credit_amount": 0,
            "description": "Cash in hand"
        },
        {
            "ledger_account_id": 10,
            "debit_amount": 0,
            "credit_amount": 50000,
            "description": "Capital"
        }
    ]
}
```

### 2. Payment Voucher (Rent Payment)

```json
{
    "voucher_type_id": 2,
    "voucher_date": "2025-12-30",
    "narration": "Rent payment for December 2025",
    "reference_number": "CHQ-12345",
    "entries": [
        {
            "ledger_account_id": 20,
            "debit_amount": 15000,
            "credit_amount": 0,
            "description": "Rent expense"
        },
        {
            "ledger_account_id": 2,
            "debit_amount": 0,
            "credit_amount": 15000,
            "description": "Payment from bank"
        }
    ]
}
```

### 3. Receipt Voucher (Customer Payment)

```json
{
    "voucher_type_id": 3,
    "voucher_date": "2025-12-30",
    "narration": "Payment received from customer",
    "reference_number": "INV-2025-001",
    "entries": [
        {
            "ledger_account_id": 2,
            "debit_amount": 25000,
            "credit_amount": 0,
            "description": "Bank deposit"
        },
        {
            "ledger_account_id": 3,
            "debit_amount": 0,
            "credit_amount": 25000,
            "description": "Customer payment"
        }
    ]
}
```

### 4. Contra Voucher (Bank Transfer)

```json
{
    "voucher_type_id": 4,
    "voucher_date": "2025-12-30",
    "narration": "Transfer from ABC Bank to XYZ Bank",
    "entries": [
        {
            "ledger_account_id": 3,
            "debit_amount": 10000,
            "credit_amount": 0,
            "description": "Transferred to XYZ Bank"
        },
        {
            "ledger_account_id": 2,
            "debit_amount": 0,
            "credit_amount": 10000,
            "description": "Transferred from ABC Bank"
        }
    ]
}
```

---

## Testing with cURL

### Get Create Data

```bash
curl -X GET "https://yourdomain.com/api/v1/tenant/demo-company/accounting/vouchers/create?type=jv" \
  -H "Authorization: Bearer your_token_here" \
  -H "Accept: application/json"
```

### Create Voucher

```bash
curl -X POST "https://yourdomain.com/api/v1/tenant/demo-company/accounting/vouchers" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "voucher_type_id": 1,
    "voucher_date": "2025-12-30",
    "narration": "Test voucher",
    "entries": [
      {
        "ledger_account_id": 1,
        "debit_amount": 5000,
        "credit_amount": 0,
        "description": "Debit entry"
      },
      {
        "ledger_account_id": 10,
        "debit_amount": 0,
        "credit_amount": 5000,
        "description": "Credit entry"
      }
    ]
  }'
```

### List Vouchers

```bash
curl -X GET "https://yourdomain.com/api/v1/tenant/demo-company/accounting/vouchers?per_page=20&status=draft" \
  -H "Authorization: Bearer your_token_here" \
  -H "Accept: application/json"
```

### Post Voucher

```bash
curl -X POST "https://yourdomain.com/api/v1/tenant/demo-company/accounting/vouchers/1/post" \
  -H "Authorization: Bearer your_token_here" \
  -H "Accept: application/json"
```
