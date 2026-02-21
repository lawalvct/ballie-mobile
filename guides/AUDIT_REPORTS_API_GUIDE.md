# Audit Reports API Guide

Base URL: `/api/v1/tenant/{tenant}`

All endpoints require `auth:sanctum` and return JSON in the shape:

- `success` (bool)
- `message` (string)
- `data` (object)

---

## 1) Audit Dashboard

**Endpoint**

`GET /reports/audit`

**Query Params**

- `user_id` (optional)
- `action` (optional: created, updated, deleted, posted, restored)
- `model` (optional: customer, vendor, product, voucher)
- `date_from` (optional, YYYY-MM-DD)
- `date_to` (optional, YYYY-MM-DD)
- `search` (optional, text search for activity details)
- `page` (optional)
- `per_page` (optional, default 50)

**Response (sample)**

```json
{
    "success": true,
    "message": "Audit dashboard retrieved successfully",
    "data": {
        "filters": {
            "user_id": 9,
            "action": "created",
            "model": "customer",
            "date_from": "2026-01-01",
            "date_to": "2026-01-31",
            "search": "Acme"
        },
        "stats": {
            "total_records": 124,
            "created_today": 6,
            "updated_today": 3,
            "posted_today": 2,
            "active_users": 4
        },
        "users": [{ "id": 9, "name": "Jane Admin", "email": "jane@site.com" }],
        "activities": {
            "data": [
                {
                    "id": 12,
                    "model": "Customer",
                    "model_key": "customer",
                    "model_name": "Acme Ltd",
                    "action": "created",
                    "user": { "id": 9, "name": "Jane Admin" },
                    "timestamp": "2026-01-15T10:12:54.000000Z",
                    "details": "Created customer: Acme Ltd"
                }
            ],
            "current_page": 1,
            "last_page": 1,
            "per_page": 50,
            "total": 1
        }
    }
}
```

---

## 2) Audit Trail by Record

**Endpoint**

`GET /reports/audit/{model}/{id}`

**Path Params**

- `model`: customer, vendor, product, voucher
- `id`: record id

**Response (sample)**

```json
{
    "success": true,
    "message": "Audit trail retrieved successfully",
    "data": {
        "model": "customer",
        "record": {
            "id": 12,
            "name": "Acme Ltd",
            "created_at": "2026-01-10T08:20:00.000000Z",
            "updated_at": "2026-01-12T11:03:00.000000Z"
        },
        "activities": [
            {
                "action": "created",
                "user": { "id": 9, "name": "Jane Admin" },
                "timestamp": "2026-01-10T08:20:00.000000Z",
                "details": "Customer created"
            },
            {
                "action": "updated",
                "user": { "id": 9, "name": "Jane Admin" },
                "timestamp": "2026-01-12T11:03:00.000000Z",
                "details": "Customer information updated"
            }
        ]
    }
}
```

---

## Frontend Screen Content (Audit Trail)

Based on [resources/views/tenant/audit/index.blade.php](resources/views/tenant/audit/index.blade.php):

**Header / Status Bar**

- Status indicator: “Audit logging active”
- Retention: “90 days”
- Actions: Refresh, Print, Export Report

**Summary Cards**

- Total Records
- Created Today
- Updated Today
- Posted Today
- Active Users

**Filters**

- User
- Action
- Model Type
- Date From / Date To
- Search
- Advanced (toggle): IP Address, User Agent, Time Range
- Clear Filters + Apply Filters buttons

**Audit Timeline View**

- Activity cards with:
    - action icon + colored badge
    - details text
    - user name
    - model type
    - timestamp + time + relative time
    - view link to record
    - optional IP and changes block

**Table View**

- Columns: Action, Details, User, Model, Timestamp, Actions (View)
- Pagination at bottom
