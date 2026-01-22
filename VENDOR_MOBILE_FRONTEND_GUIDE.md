# Vendor Management Mobile Frontend Guide

**Module:** CRM → Vendors

This guide mirrors the current web experience found in:

- Vendor List
- Create Vendor
- Vendor Details
- Edit Vendor

---

## 1) Screen Map & UX Goals

### A) Vendor List Screen

**Purpose:** Browse and manage vendors with quick stats. Mirrors web Vendors index.

**UI Blocks:**

- Summary cards (Total Vendors, Active Vendors, Total Purchases, Total Outstanding)
- Search bar and filters (type, status)
- Vendor list rows with name, email/phone, status
- Row actions: View, Edit, Deactivate/Activate

**API:**

- `GET /api/v1/tenant/{tenant}/crm/vendors`

---

### B) Create Vendor Screen

**Purpose:** Create a new vendor with ledger integration. Mirrors web Create form.

**UI Blocks:**

- Vendor Type (individual/business)
- Vendor Information (company/individual names)
- Tax/Registration (TIN, Registration No.)
- Contact Information (email, phone, mobile, website)
- Address (line1, line2, city, state, postal, country)
- Banking Information (bank name, account number, account name)
- Financial Settings (currency, payment terms, credit limit)
- Opening Balance (amount, type, date)
- Notes

**API:**

- `POST /api/v1/tenant/{tenant}/crm/vendors`

---

### C) Vendor Details Screen

**Purpose:** View vendor profile, financial summary, and ledger link. Mirrors web Show page.

**UI Blocks:**

- Header: name + status
- Quick stats (Total Purchases, Outstanding, Total Orders, Last Purchase)
- Contact info card
- Address info card
- Banking info card
- Business details (for business vendors)
- Financial summary + ledger account info
- Quick actions: Create Purchase, Record Payment, View Reports

**API:**

- `GET /api/v1/tenant/{tenant}/crm/vendors/{vendor}`

---

### D) Edit Vendor Screen

**Purpose:** Update vendor information. Mirrors web Edit page.

**UI Blocks:**

- Same sections as Create
- Status toggle (active/inactive)

**API:**

- `PUT /api/v1/tenant/{tenant}/crm/vendors/{vendor}`
- `POST /api/v1/tenant/{tenant}/crm/vendors/{vendor}/toggle-status` (quick toggle)

---

## 2) API Endpoints (Mobile)

### 2.1 List Vendors

`GET /api/v1/tenant/{tenant}/crm/vendors`

**Query Params:**

- `search` (optional)
- `vendor_type` = `individual|business` (optional)
- `status` = `active|inactive` (optional)
- `sort` (default: `created_at`)
- `direction` (default: `desc`)
- `per_page` (default: 15)
- `page`

**Response (200):**

```json
{
    "success": true,
    "message": "Vendors retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 88,
                "vendor_type": "business",
                "company_name": "Acme Supplies Ltd",
                "email": "vendor@acme.com",
                "phone": "08030000000",
                "status": "active",
                "display_name": "Acme Supplies Ltd",
                "outstanding_balance": 42000,
                "ledger_account": {
                    "id": 3002,
                    "name": "Acme Supplies Ltd"
                }
            }
        ]
    },
    "statistics": {
        "total_vendors": 80,
        "active_vendors": 70,
        "total_purchases": 2000000,
        "total_outstanding": 350000
    }
}
```

---

### 2.2 Create Vendor

`POST /api/v1/tenant/{tenant}/crm/vendors`

**Payload:**

```json
{
    "vendor_type": "business",
    "company_name": "Acme Supplies Ltd",
    "email": "vendor@acme.com",
    "phone": "08030000000",
    "tax_id": "123456789",
    "registration_number": "REG123456",
    "address_line1": "12 Industrial Rd",
    "city": "Ikeja",
    "state": "Lagos",
    "country": "Nigeria",
    "bank_name": "UBA",
    "bank_account_number": "0123456789",
    "bank_account_name": "Acme Supplies Ltd",
    "currency": "NGN",
    "payment_terms": "Net 30",
    "opening_balance_amount": 50000,
    "opening_balance_type": "credit",
    "opening_balance_date": "2026-01-22"
}
```

---

### 2.3 Show Vendor

`GET /api/v1/tenant/{tenant}/crm/vendors/{vendor}`

**Response (200):**

```json
{
    "success": true,
    "message": "Vendor retrieved successfully",
    "data": {
        "vendor": {
            "id": 88,
            "vendor_type": "business",
            "company_name": "Acme Supplies Ltd",
            "email": "vendor@acme.com",
            "phone": "08030000000",
            "status": "active",
            "ledger_account": {
                "id": 3002,
                "name": "Acme Supplies Ltd",
                "current_balance": "42000.00"
            }
        },
        "outstanding_balance": 42000
    }
}
```

---

### 2.4 Update Vendor

`PUT /api/v1/tenant/{tenant}/crm/vendors/{vendor}`

**Payload:** (same fields as create)

---

### 2.5 Toggle Vendor Status

`POST /api/v1/tenant/{tenant}/crm/vendors/{vendor}/toggle-status`

---

## 3) Screen-to-API Mapping Summary

- Vendor List → `GET /crm/vendors`
- Create Vendor → `POST /crm/vendors`
- Vendor Details → `GET /crm/vendors/{vendor}`
- Edit Vendor → `PUT /crm/vendors/{vendor}`
- Toggle Status → `POST /crm/vendors/{vendor}/toggle-status`

---

## 4) Notes for Mobile

- Always send **tenant slug** in the URL.
- Use ISO date format: `YYYY-MM-DD`.
- `display_name` and `outstanding_balance` should be returned for fast UI rendering.
- All responses follow `{ success, message, data }`.
