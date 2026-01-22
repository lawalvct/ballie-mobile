# Customer Management Mobile Frontend Guide

**Module:** CRM → Customers

This guide mirrors the current web experience found in:

- CRM Dashboard (customers overview)
- Customer List
- Create Customer
- Customer Details
- Edit Customer
- Customer Statements (list)
- Customer Statement (detail)

---

## 1) Screen Map & UX Goals

### A) Customer List Screen

**Purpose:** Browse and search customers with quick stats. Mirrors the web Customers index.

**UI Blocks:**

- Summary cards (Total Customers, Active, Individual, Business)
- Search bar and filters (type, status)
- Customer list rows with name, email/phone, status
- Row actions: View, Edit, Deactivate/Activate

**API:**

- `GET /api/v1/tenant/{tenant}/crm/customers`

---

### B) Create Customer Screen

**Purpose:** Create a new customer with full contact, address and financial details. Mirrors web Create form.

**UI Blocks:**

- Customer Type (individual/business)
- Contact Information (name, email, phone, mobile)
- Address (line1, line2, city, state, postal, country)
- Financial Settings (currency, payment terms, credit limit)
- Opening Balance (amount, type, date)
- Notes

**API:**

- `POST /api/v1/tenant/{tenant}/crm/customers`

---

### C) Customer Details Screen

**Purpose:** View customer profile and financial summary. Mirrors web Show page.

**UI Blocks:**

- Header: name + status
- Contact info card
- Address info card
- Financial info: total spent (optional), outstanding balance
- Quick actions: Create Invoice, Record Payment, View Statement

**API:**

- `GET /api/v1/tenant/{tenant}/crm/customers/{customer}`

---

### D) Edit Customer Screen

**Purpose:** Update customer information. Mirrors web Edit page.

**UI Blocks:**

- Same sections as Create
- Status toggle (active/inactive)

**API:**

- `PUT /api/v1/tenant/{tenant}/crm/customers/{customer}`
- `POST /api/v1/tenant/{tenant}/crm/customers/{customer}/toggle-status` (quick toggle)

---

### E) Customer Statements List Screen

**Purpose:** See balances of customers and totals. Mirrors web Statements list.

**UI Blocks:**

- Filters (search, type, status)
- Summary cards (Total Customers, Total Receivable, Total Payable, Net Balance)
- List of customers with balance + type

**API:**

- `GET /api/v1/tenant/{tenant}/crm/customers/statements`

---

### F) Customer Statement Detail Screen

**Purpose:** View a customer’s statement by date range. Mirrors web Statement detail.

**UI Blocks:**

- Customer info
- Date filter
- Opening balance, total debits/credits, closing balance
- Transactions table with running balance

**API:**

- `GET /api/v1/tenant/{tenant}/crm/customers/{customer}/statement?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

---

## 2) API Endpoints (Mobile)

### 2.1 List Customers

`GET /api/v1/tenant/{tenant}/crm/customers`

**Query Params:**

- `search` (optional)
- `customer_type` = `individual|business` (optional)
- `status` = `active|inactive` (optional)
- `sort` (default: `created_at`)
- `direction` (default: `desc`)
- `per_page` (default: 15)
- `page`

**Response (200):**

```json
{
    "success": true,
    "message": "Customers retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 49,
                "customer_type": "business",
                "company_name": "Sure Packaging Limited",
                "email": "sure@gmail.com",
                "phone": "08132545212",
                "status": "active",
                "display_name": "Sure Packaging Limited",
                "outstanding_balance": 15000,
                "ledger_account": {
                    "id": 2599,
                    "name": "Sure Packaging Limited"
                }
            }
        ]
    },
    "statistics": {
        "total_customers": 120,
        "active_customers": 110,
        "inactive_customers": 10,
        "individual_customers": 50,
        "business_customers": 70
    }
}
```

---

### 2.2 Create Customer

`POST /api/v1/tenant/{tenant}/crm/customers`

**Payload:**

```json
{
    "customer_type": "business",
    "company_name": "Sure Packaging Limited",
    "email": "sure@gmail.com",
    "phone": "08132545212",
    "address_line1": "3 Adeniyi Jones",
    "city": "Ikeja",
    "state": "Lagos",
    "country": "Nigeria",
    "currency": "NGN",
    "payment_terms": "Due on Receipt",
    "opening_balance_amount": 15000,
    "opening_balance_type": "debit",
    "opening_balance_date": "2026-01-22"
}
```

---

### 2.3 Show Customer

`GET /api/v1/tenant/{tenant}/crm/customers/{customer}`

**Response (200):**

```json
{
    "success": true,
    "message": "Customer retrieved successfully",
    "data": {
        "customer": {
            "id": 49,
            "customer_type": "business",
            "company_name": "Sure Packaging Limited",
            "email": "sure@gmail.com",
            "phone": "08132545212",
            "status": "active",
            "ledger_account": {
                "id": 2599,
                "name": "Sure Packaging Limited",
                "current_balance": "15000.00"
            }
        },
        "outstanding_balance": 15000
    }
}
```

---

### 2.4 Update Customer

`PUT /api/v1/tenant/{tenant}/crm/customers/{customer}`

**Payload:** (same fields as create)

---

### 2.5 Toggle Customer Status

`POST /api/v1/tenant/{tenant}/crm/customers/{customer}/toggle-status`

---

### 2.6 Customer Statements List

`GET /api/v1/tenant/{tenant}/crm/customers/statements`

**Query Params:**

- `search` (optional)
- `customer_type` (optional)
- `status` (optional)
- `per_page` (default: 50)
- `page`

**Response (200):**

```json
{
    "success": true,
    "message": "Customer statements retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 49,
                "display_name": "Sure Packaging Limited",
                "running_balance": 15000,
                "balance_type": "receivable"
            }
        ]
    },
    "statistics": {
        "total_customers": 120,
        "total_receivable": 450000,
        "total_payable": 120000,
        "net_balance": 330000
    }
}
```

---

### 2.7 Customer Statement Detail

`GET /api/v1/tenant/{tenant}/crm/customers/{customer}/statement?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

**Response (200):**

```json
{
    "success": true,
    "message": "Customer statement retrieved successfully",
    "data": {
        "customer": { "id": 49, "company_name": "Sure Packaging Limited" },
        "period": { "start_date": "2026-01-01", "end_date": "2026-01-31" },
        "opening_balance": 10000,
        "total_debits": 20000,
        "total_credits": 5000,
        "closing_balance": 25000,
        "transactions": [
            {
                "date": "2026-01-10",
                "particulars": "Sales to Sure Packaging Limited",
                "voucher_type": "Sales Invoice",
                "voucher_number": "SI-0001",
                "debit": 15000,
                "credit": 0,
                "running_balance": 25000
            }
        ]
    }
}
```

---

## 3) Screen-to-API Mapping Summary

- Customer List → `GET /crm/customers`
- Create Customer → `POST /crm/customers`
- Customer Details → `GET /crm/customers/{customer}`
- Edit Customer → `PUT /crm/customers/{customer}`
- Toggle Status → `POST /crm/customers/{customer}/toggle-status`
- Statements List → `GET /crm/customers/statements`
- Statement Detail → `GET /crm/customers/{customer}/statement`

---

## 4) Notes for Mobile

- Always send **tenant slug** in the URL.
- Use ISO date format: `YYYY-MM-DD`.
- `display_name` and `outstanding_balance` are provided on list responses for fast UI rendering.
- All responses follow `{ success, message, data }`.
