# CRM Reports API Guide

Base URL: `/api/v1/tenant/{tenant}`

All endpoints require `auth:sanctum` and return JSON in the shape:

- `success` (bool)
- `message` (string)
- `data` (object)

---

## 1) Customer Activities Report

**Endpoint**

`GET /reports/crm/activities`

**Query Params**

- `customer_id` (optional)
- `activity_type` (optional: call, email, meeting, note, task, follow_up)
- `status` (optional: pending, completed, cancelled)
- `date_from` (optional, YYYY-MM-DD)
- `date_to` (optional, YYYY-MM-DD)
- `search` (optional, subject text)
- `per_page` (optional, default 20)

**Response (sample)**

```json
{
    "success": true,
    "message": "Customer activities retrieved successfully",
    "data": {
        "filters": {
            "customer_id": 12,
            "activity_type": "call",
            "status": "completed",
            "date_from": "2026-01-01",
            "date_to": "2026-01-31",
            "search": "Follow"
        },
        "records": {
            "data": [
                {
                    "id": 451,
                    "customer": { "id": 12, "name": "Acme Ltd" },
                    "activity_type": "call",
                    "subject": "Follow up on invoice",
                    "description": "Discussed payment schedule",
                    "activity_date": "2026-01-15",
                    "status": "completed",
                    "user": { "id": 9, "name": "Jane Admin" },
                    "created_at": "2026-01-15T10:12:54.000000Z",
                    "updated_at": "2026-01-15T10:12:54.000000Z"
                }
            ],
            "current_page": 1,
            "last_page": 1,
            "per_page": 20,
            "total": 1
        },
        "customers": [
            { "id": 12, "name": "Acme Ltd", "customer_type": "business" }
        ]
    }
}
```

**Frontend screen content (Customer Activities)**

- Header: “Customer Activities” + action button (Create New Activity)
- Filters: search, customer, activity type, status, date range
- Grid of activity cards with:
    - type icon + type label
    - status badge
    - subject, customer name, short description
    - activity date and logged-by user
    - actions: Edit / Delete
- Pagination at bottom

---

## 2) Customer Statements Report

**Endpoint**

`GET /reports/crm/customer-statements`

**Query Params**

- `search` (optional: name, email, phone, customer_code)
- `customer_type` (optional: individual, business)
- `status` (optional: active, inactive)
- `sort` (optional: current_balance, total_debits, total_credits, created_at)
- `direction` (optional: asc, desc)
- `page` (optional)
- `per_page` (optional, default 50)

**Response (sample)**

```json
{
    "success": true,
    "message": "Customer statements retrieved successfully",
    "data": {
        "filters": {
            "search": "acme",
            "customer_type": "business",
            "status": "active",
            "sort": "current_balance",
            "direction": "desc"
        },
        "summary": {
            "total_customers": 87,
            "total_receivable": 1523400.25,
            "total_payable": 11200.0,
            "net_balance": 1512200.25
        },
        "records": {
            "data": [
                {
                    "id": 12,
                    "customer_code": "CUST-00012",
                    "name": "Acme Ltd",
                    "email": "finance@acme.com",
                    "phone": "08012345678",
                    "customer_type": "business",
                    "status": "active",
                    "total_debits": 250000.0,
                    "total_credits": 50000.0,
                    "running_balance": 200000.0,
                    "current_balance": 200000.0,
                    "balance_type": "dr",
                    "last_activity_at": "2026-01-20T09:10:11.000000Z",
                    "ledger_account_id": 332
                }
            ],
            "current_page": 1,
            "last_page": 2,
            "per_page": 50,
            "total": 87
        }
    }
}
```

**Frontend screen content (Customer Statements)**

- Header: “Customer Statements” + back to customers + export button
- Filters: search, customer type, status, date range
- Summary cards:
    - total customers
    - total receivable (DR)
    - total payable (CR)
    - net balance (with DR/CR indicator)
- Table columns:
    - customer, contact, total debits, total credits, running balance
    - balance type (DR/CR), status, last activity, customer type
    - actions: view statement + view customer profile
- Pagination footer with counts

---

## 3) Payment Reports

**Endpoint**

`GET /reports/crm/payment-reports`

**Query Params**

- `start_date` (optional, YYYY-MM-DD)
- `end_date` (optional, YYYY-MM-DD)

**Response (sample)**

```json
{
    "success": true,
    "message": "Payment reports retrieved successfully",
    "data": {
        "filters": {
            "start_date": "2026-01-01",
            "end_date": "2026-01-31"
        },
        "summary": {
            "total_payments": 820000.0,
            "payment_count": 24
        },
        "records": [
            {
                "id": 981,
                "voucher_id": 221,
                "voucher_number": "RV-000221",
                "voucher_date": "2026-01-12",
                "ledger_account_id": 332,
                "ledger_account_name": "Acme Ltd",
                "amount": 45000.0
            }
        ]
    }
}
```

**Frontend screen content (Payment Reports)**

- Filters: start date, end date
- Summary cards:
    - total payments
    - payment count
- Table columns: date, voucher no, customer/vendor, amount

---

## 4) Customer Sales Report (Existing Sales Report API)

**Endpoint**

`GET /reports/sales/customers`

**Notes**

This endpoint already exists in the Sales Reports API and powers the “Customer Sales Report” screen.

**Frontend screen content (Customer Sales Report)**

- Header with shortcuts to Sales Summary, Product Sales, Sales by Period
- Summary cards: active customers, total revenue, outstanding balance
- Filters: from/to date, customer, sort by
- Table columns: customer, contact, invoices, total sales, outstanding balance, first sale, last sale
- Pagination footer
