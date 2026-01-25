# Stock Journal API Guide (Mobile/Frontend)

**Update marker:** 24-jan.-2026 4:18pm

## Base URL

`/api/v1/tenant/{tenant}`

## Authentication

All endpoints require `Authorization: Bearer {token}` (Sanctum token).

---

## Entry Type Behavior (Effects)

- **consumption** → stock moves **out** (materials consumed)
- **production** → stock moves **in** (finished goods received)
- **adjustment** → can be **in** or **out** per line
- **transfer** → **out + in** pairs (from location to location)

**Frontend rule:** For transfer, collect two sides (OUT + IN) and ensure the totals balance. For adjustment, allow both `movement_type` values.

---

## Screen → Endpoint Mapping

### 1) StockJournalHomeScreen (Web: inventory/stock-journal/index.blade.php)

**Purpose:** List entries, stats, filters, and actions.

**Endpoint:** `GET /inventory/stock-journal`

**Query Parameters (optional):**

- `search` (string)
- `entry_type` (string) — `consumption|production|adjustment|transfer`
- `status` (string) — `draft|posted|cancelled`
- `date_from` (date)
- `date_to` (date)
- `per_page` (int) — default 15
- `page` (int)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Stock journal entries retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "journal_number": "SJ202601240001",
                "journal_date": "2026-01-24",
                "reference_number": "REF-001",
                "entry_type": "consumption",
                "entry_type_display": "Material Consumption",
                "status": "draft",
                "status_display": "Draft",
                "status_color": "yellow",
                "total_items": 2,
                "total_amount": 3500,
                "can_edit": true,
                "can_post": true,
                "can_cancel": true
            }
        ],
        "last_page": 1,
        "per_page": 15,
        "total": 1
    },
    "statistics": {
        "total_entries": 4,
        "draft_entries": 2,
        "posted_entries": 1,
        "this_month_entries": 3
    }
}
```

**Actions:**

- **View** → `GET /inventory/stock-journal/{id}`
- **Edit** → `PUT /inventory/stock-journal/{id}` (draft only)
- **Post** → `POST /inventory/stock-journal/{id}/post`
- **Cancel** → `POST /inventory/stock-journal/{id}/cancel`
- **Delete** → `DELETE /inventory/stock-journal/{id}` (draft only)
- **Duplicate** → `GET /inventory/stock-journal/{id}/duplicate`

---

### 2) StockJournalCreateScreen (Web: inventory/stock-journal/create.blade.php)

**Purpose:** Create entry with entry type (consumption/production/adjustment/transfer).

#### (A) Form Options

**Endpoint:** `GET /inventory/stock-journal/create`

**Query Parameters (optional):**

- `type` (string) — `consumption|production|adjustment|transfer`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Stock journal form data retrieved successfully",
    "data": {
        "entry_type": "consumption",
        "entry_types": [
            {
                "key": "consumption",
                "label": "Material Consumption",
                "movement": "out"
            },
            {
                "key": "production",
                "label": "Production Receipt",
                "movement": "in"
            },
            {
                "key": "adjustment",
                "label": "Stock Adjustment",
                "movement": "in|out"
            },
            {
                "key": "transfer",
                "label": "Stock Transfer",
                "movement": "out + in"
            }
        ],
        "products": [
            {
                "id": 10,
                "name": "Flour",
                "sku": "FLR-001",
                "current_stock": 120,
                "purchase_rate": 2500,
                "unit": { "id": 3, "name": "kg" },
                "category": { "id": 2, "name": "Raw Materials" }
            }
        ]
    }
}
```

#### (B) Create Entry

**Endpoint:** `POST /inventory/stock-journal`

**Required Fields:**

- `journal_date`
- `entry_type`
- `items` (array, min 1)
- `items.*.product_id`
- `items.*.movement_type` (`in|out`)
- `items.*.quantity`
- `items.*.rate`

**Optional Fields:**

- `reference_number`
- `narration`
- `items.*.batch_number`
- `items.*.expiry_date` (must be after today)
- `items.*.remarks`
- `action` (`save` or `save_and_post`)

**Sample Request:**

```json
{
    "journal_date": "2026-01-24",
    "entry_type": "consumption",
    "reference_number": "REF-001",
    "narration": "Material usage",
    "items": [
        {
            "product_id": 10,
            "movement_type": "out",
            "quantity": 2,
            "rate": 2500
        }
    ],
    "action": "save_and_post"
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Stock journal entry created and posted successfully",
    "data": {
        "entry": {
            "id": 1,
            "journal_number": "SJ202601240001",
            "status": "posted"
        }
    }
}
```

---

### 3) StockJournalDetailScreen (Web: inventory/stock-journal/show.blade.php)

**Purpose:** View entry details, items, and generated stock movements.

**Endpoint:** `GET /inventory/stock-journal/{id}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Stock journal entry retrieved successfully",
    "data": {
        "entry": {
            "id": 1,
            "journal_number": "SJ202601240001",
            "entry_type": "consumption",
            "status": "posted",
            "items": [
                {
                    "id": 1,
                    "product": { "id": 10, "name": "Flour", "sku": "FLR-001" },
                    "movement_type": "out",
                    "quantity": 2,
                    "rate": 2500,
                    "amount": 5000,
                    "stock_before": 120,
                    "stock_after": 118
                }
            ],
            "stock_movements": [
                {
                    "id": 99,
                    "product": {
                        "id": 10,
                        "name": "Flour",
                        "sku": "FLR-001",
                        "unit": "kg"
                    },
                    "quantity": -2,
                    "reference": "SJ202601240001"
                }
            ]
        }
    }
}
```

---

### 4) StockJournalEditScreen (Web: inventory/stock-journal/edit.blade.php)

**Purpose:** Update a draft entry.

**Endpoint (prefill):** `GET /inventory/stock-journal/{id}`
**Endpoint (update):** `PUT /inventory/stock-journal/{id}`

**Rules:** Only `draft` entries can be updated.

---

### 5) Post / Cancel Entry

**Post:** `POST /inventory/stock-journal/{id}/post`
**Cancel:** `POST /inventory/stock-journal/{id}/cancel`

**Rules:**

- `post` allowed only when `status = draft` and has items.
- `cancel` allowed when `status = draft|posted`.

---

### 6) Delete Entry

**Endpoint:** `DELETE /inventory/stock-journal/{id}`

**Rule:** Only `draft` entries can be deleted.

---

### 7) Duplicate Entry

**Endpoint:** `GET /inventory/stock-journal/{id}/duplicate`

**Purpose:** Prefill create screen with items from an existing entry.

---

### 8) Product Stock Helpers (For Item Rows)

**Product Stock:** `GET /inventory/stock-journal/product-stock/{product}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Product stock retrieved successfully",
    "data": {
        "current_stock": 120,
        "unit": "kg",
        "rate": 2500
    }
}
```

**Stock Calculator:** `POST /inventory/stock-journal/calculate-stock`

**Sample Request:**

```json
{ "product_id": 10, "movement_type": "out", "quantity": 2 }
```

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Stock calculated successfully",
    "data": { "current_stock": 120, "new_stock": 118, "unit": "kg" }
}
```

---

## Error Format

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "items.0.product_id": ["The selected product is invalid."]
    }
}
```

---

## Frontend Notes

- **Entry type drives movement logic** (consumption = out, production = in, adjustment = in/out, transfer = out + in).
- Transfer should be **balanced** (total OUT ≈ total IN). Validate on client.
- Use product stock helpers to display live stock and rate defaults.
- `can_edit`, `can_post`, `can_cancel` control UI buttons.
