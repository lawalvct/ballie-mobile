# Invoice Management - Mobile Frontend Guide

## Overview

This comprehensive guide provides all the information needed to build the mobile app invoice management features, including field descriptions, business logic, API endpoints, and screen architecture.

---

## Table of Contents

1. [Mobile App Screen Architecture](#mobile-app-screen-architecture)
2. [Create Invoice Page - Fields & Logic](#create-invoice-page---fields--logic)
3. [API Endpoints with Sample Payloads](#api-endpoints-with-sample-payloads)
4. [Business Rules & Validations](#business-rules--validations)
5. [Stock Management Logic](#stock-management-logic)
6. [Accounting Entry Logic](#accounting-entry-logic)
7. [VAT Calculation Logic](#vat-calculation-logic)
8. [Error Handling](#error-handling)

---

## Mobile App Screen Architecture

### Recommended Screen Flow

```
└── Accounting Module
    ├── Dashboard Screen
    │   └── Quick Stats Cards (Total Sales, Purchases, Draft Invoices)
    │
    ├── Invoice List Screen
    │   ├── Filter Options (Status, Type, Date Range)
    │   ├── Search Bar
    │   ├── Invoice Cards/List Items
    │   └── FAB (Create New Invoice)
    │
    ├── Create Invoice Screen ⭐
    │   ├── Header (Back, Save Actions)
    │   ├── Type Selection (Sales/Purchase)
    │   ├── Voucher Type Dropdown
    │   ├── Basic Info Section
    │   │   ├── Invoice Date
    │   │   ├── Reference Number
    │   │   └── Customer/Vendor Selection
    │   ├── Invoice Items Section
    │   │   ├── Add Item Button
    │   │   ├── Item List (Product, Qty, Rate, Amount)
    │   │   └── Subtotal Display
    │   ├── Additional Charges Section (Optional)
    │   │   ├── Add Charge Button
    │   │   └── Charge List (Account, Amount, Narration)
    │   ├── VAT Section (Toggle)
    │   │   ├── Enable VAT Switch
    │   │   ├── VAT Rate Input
    │   │   ├── VAT Applies To Selection
    │   │   └── VAT Amount Display
    │   ├── Grand Total Display
    │   ├── Narration/Notes Field
    │   └── Action Buttons
    │       ├── Save as Draft
    │       ├── Save & Post
    │       └── Save & Post + New
    │
    ├── Product Search Screen (Modal/Bottom Sheet)
    │   ├── Search Bar
    │   ├── Product List
    │   │   ├── Product Name & Code
    │   │   ├── Current Stock
    │   │   ├── Price
    │   │   └── Unit
    │   └── Quick Add Product Button
    │
    ├── Customer/Vendor Search Screen (Modal/Bottom Sheet)
    │   ├── Search Bar
    │   ├── Party List
    │   │   ├── Name
    │   │   ├── Phone
    │   │   ├── Email
    │   │   └── Outstanding Balance
    │   └── Quick Add Button
    │
    ├── Invoice Detail Screen
    │   ├── Header (Invoice Number, Status Badge)
    │   ├── Customer/Vendor Info Card
    │   ├── Invoice Items Table
    │   ├── Payment Summary Card
    │   │   ├── Subtotal
    │   │   ├── Additional Charges
    │   │   ├── VAT
    │   │   └── Grand Total
    │   ├── Accounting Entries (Expandable)
    │   ├── Payment History
    │   └── Action Buttons
    │       ├── Edit (if draft)
    │       ├── Post/Unpost
    │       ├── Delete (if draft)
    │       ├── Share PDF
    │       ├── Send Email
    │       └── Record Payment
    │
    ├── Edit Invoice Screen
    │   └── (Same as Create, pre-filled with data)
    │
    └── Quick Add Screens
        ├── Quick Add Product (Modal/Bottom Sheet)
        └── Quick Add Customer/Vendor (Modal/Bottom Sheet)
```

---

## Create Invoice Page - Fields & Logic

### 1. Invoice Type Selection

**Field:** `type` (dropdown/segmented control)

- **Options:**
    - `sales` - For sales invoices
    - `purchase` - For purchase invoices
- **Logic:**
    - Determines which voucher types to show (based on `inventory_effect`)
    - Sales: `inventory_effect = 'decrease'`
    - Purchase: `inventory_effect = 'increase'`
    - Changes party label (Customer/Vendor)
    - Changes default price field (sales_price/purchase_price)
    - Changes accounting entry direction (Debit/Credit)

---

### 2. Voucher Type Selection

**Field:** `voucher_type_id` (dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/create?type={sales|purchase}`
- **Display:** Show `name` field from voucher types
- **Filter:** Only show active voucher types with `affects_inventory = true`
- **Logic:**
    - Determines invoice numbering prefix
    - Controls inventory effect (increase/decrease)
    - Defines default accounts for entries

---

### 3. Basic Information Section

#### 3.1 Invoice Date

**Field:** `voucher_date` (date picker)

- **Required:** Yes
- **Format:** YYYY-MM-DD
- **Default:** Today's date
- **Validation:** Cannot be future date (optional business rule)
- **Logic:** Used for accounting period allocation

#### 3.2 Reference Number

**Field:** `reference_number` (text input)

- **Required:** No
- **Max Length:** 255 characters
- **Purpose:** External reference (PO number, customer order number)
- **Example:** "PO-2024-001", "ORDER-123"

#### 3.3 Customer/Vendor Selection

**Field:** `customer_id` (searchable dropdown)

- **Required:** Yes
- **Label:** Changes based on type (Customer for sales, Vendor for purchase)
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-customers?search={query}&type={customer|vendor}`
- **Display:** Name, Phone, Email, Outstanding Balance
- **Logic:**
    - Links to ledger account for accounting entries
    - For sales: Debits customer account
    - For purchase: Credits vendor account
- **Features:**
    - Real-time search
    - Shows outstanding balance
    - Quick add new customer/vendor button

---

### 4. Invoice Items Section ⭐

This is the most complex section with dynamic calculations.

#### 4.1 Add Item Button

- Opens product search modal/bottom sheet
- Allows multiple item addition

#### 4.2 Invoice Item Fields

Each item contains:

##### Product Selection

**Field:** `inventory_items[*].product_id` (searchable dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-products?search={query}&type={sales|purchase}`
- **Display:**
    - Product Name
    - Product Code
    - Current Stock
    - Unit
    - Default Price
- **On Selection:**
    - Auto-fills description with product name
    - Sets unit_id
    - Sets rate based on type (sales_price or purchase_price)
    - Shows current stock for sales
    - Validates stock availability (for sales)

##### Description

**Field:** `inventory_items[*].description` (text input)

- **Required:** No
- **Max Length:** 500 characters
- **Default:** Product name
- **Editable:** Yes
- **Purpose:** Custom description for this invoice line

##### Quantity

**Field:** `inventory_items[*].quantity` (number input)

- **Required:** Yes
- **Min:** 0.01
- **Step:** 0.01
- **Validation:**
    - For sales: Must not exceed current stock (if stock tracking enabled)
    - Shows warning if quantity > current_stock
- **Logic:**
    - Triggers amount calculation on change
    - Updates grand total

##### Unit Display

**Field:** `inventory_items[*].unit_id` (hidden, display only)

- **Display:** Unit name (e.g., "Pcs", "Kg", "Box")
- **Source:** From product data
- **Non-editable:** Yes

##### Rate/Price

**Field:** `inventory_items[*].rate` (number input)

- **Required:** Yes
- **Min:** 0
- **Step:** 0.01
- **Default:**
    - Sales: product.sales_price
    - Purchase: product.purchase_price
- **Editable:** Yes
- **Logic:**
    - Triggers amount calculation on change
    - Updates grand total

##### Amount (Calculated)

**Field:** `inventory_items[*].amount` (calculated, read-only)

- **Formula:** `quantity × rate`
- **Display:** Currency formatted (₦ 1,234.56)
- **Updates:** Real-time on quantity or rate change
- **Stored:** Yes (in database)

##### Remove Button

- Deletes the item row
- Updates calculations
- Minimum 1 item required (cannot remove last item)

#### 4.3 Items Subtotal

**Calculation:** Sum of all item amounts

```javascript
subtotal = items.reduce((sum, item) => sum + item.amount, 0);
```

**Display:** Currency formatted at bottom of items section

---

### 5. Additional Charges Section (Optional)

Allows adding extra charges like VAT, Transport, Handling fees, etc.

#### 5.1 Add Charge Button

- Opens ledger account search
- Allows multiple charges

#### 5.2 Additional Charge Fields

##### Ledger Account

**Field:** `additional_ledger_accounts[*].ledger_account_id` (searchable dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-ledger-accounts?search={query}`
- **Display:** Account Name, Account Code, Account Group
- **Common Accounts:**
    - VAT Payable
    - Transport/Freight
    - Handling Charges
    - Insurance
    - Discount

##### Amount

**Field:** `additional_ledger_accounts[*].amount` (number input)

- **Required:** Yes
- **Min:** 0
- **Step:** 0.01
- **Logic:** Adds to grand total

##### Narration

**Field:** `additional_ledger_accounts[*].narration` (text input)

- **Required:** No
- **Max Length:** 255
- **Purpose:** Description of the charge
- **Example:** "Transport to customer location", "VAT @ 7.5%"

##### Remove Button

- Deletes the charge
- Updates grand total

#### 5.3 Additional Charges Total

**Calculation:** Sum of all additional charge amounts

```javascript
additionalTotal = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0,
);
```

---

### 6. VAT Section (Toggle-able)

#### 6.1 Enable VAT Toggle

**Field:** `vat_enabled` (boolean switch)

- **Default:** false
- **Logic:** Shows/hides VAT configuration fields

#### 6.2 VAT Rate

**Field:** `vat_rate` (number input, percentage)

- **Default:** 7.5 (for 7.5%)
- **Min:** 0
- **Max:** 100
- **Step:** 0.01
- **Visible:** Only when vat_enabled = true

#### 6.3 VAT Applies To

**Field:** `vat_applies_to` (radio buttons/segmented control)

- **Options:**
    - `items_only` - VAT on items subtotal only
    - `items_and_charges` - VAT on items + additional charges
- **Default:** `items_only`
- **Visible:** Only when vat_enabled = true

#### 6.4 VAT Amount (Calculated)

**Field:** `vat_amount` (calculated, read-only)

- **Formula:**

    ```javascript
    if (!vat_enabled) return 0;

    if (vat_applies_to === "items_only") {
        return itemsSubtotal * (vat_rate / 100);
    } else {
        return (itemsSubtotal + additionalChargesTotal) * (vat_rate / 100);
    }
    ```

- **Display:** Currency formatted
- **Updates:** Real-time when rate or applies_to changes

---

### 7. Grand Total Display

**Calculation:**

```javascript
grandTotal = itemsSubtotal + additionalChargesTotal + vatAmount;
```

**Display:**

- Large, prominent font
- Currency formatted
- Updates in real-time
- Shows breakdown on tap/click:
    - Items Subtotal: ₦ X,XXX.XX
    - Additional Charges: ₦ X,XXX.XX
    - VAT (7.5%): ₦ X,XXX.XX
    - **Grand Total: ₦ X,XXX.XX**

---

### 8. Narration/Notes

**Field:** `narration` (multi-line text input)

- **Required:** No
- **Max Length:** 1000 characters
- **Purpose:** General notes about the invoice
- **Example:** "Monthly supply as per agreement", "Rush order - deliver by Friday"

---

### 9. Action Buttons

#### 9.1 Save as Draft

**Action:** `action = 'save'`

- Creates invoice with `status = 'draft'`
- Does NOT post to accounts
- Does NOT update stock
- Allows editing later
- **Use Case:** Invoice not ready to be finalized

#### 9.2 Save & Post

**Action:** `action = 'save_and_post'`

- Creates invoice with `status = 'posted'`
- Posts to accounting ledgers
- Updates product stock
- Creates stock movements
- Cannot be edited (must unpost first)
- **Use Case:** Invoice is final and ready

#### 9.3 Save & Post + New Sales

**Action:** `action = 'save_and_post_new_sales'`

- Same as Save & Post
- After success, opens new sales invoice form
- **Use Case:** Rapid entry of multiple sales invoices

---

## API Endpoints with Sample Payloads

### Base URL

```
https://yourapp.com/api/v1/tenant/{tenant}/accounting/invoices
```

### Authentication

All requests require Bearer token:

```
Authorization: Bearer {your_access_token}
```

---

### 1. Get Create Form Data

**Endpoint:** `GET /create?type={sales|purchase}`

**Query Parameters:**

- `type` (optional): `sales` or `purchase` (default: `sales`)

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/create?type=sales' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Create form data retrieved successfully",
    "data": {
        "voucher_types": [
            {
                "id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "prefix": "SI-",
                "inventory_effect": "decrease",
                "is_active": true
            },
            {
                "id": 3,
                "name": "Sales Return",
                "code": "SR",
                "abbreviation": "SR",
                "prefix": "SR-",
                "inventory_effect": "increase",
                "is_active": true
            }
        ],
        "parties": [
            {
                "id": 1,
                "name": "John Doe Enterprises",
                "email": "john@example.com",
                "phone": "08012345678",
                "ledger_account_id": 45,
                "outstanding_balance": 15000.0,
                "is_active": true
            },
            {
                "id": 2,
                "name": "ABC Trading Ltd",
                "email": "abc@example.com",
                "phone": "08098765432",
                "ledger_account_id": 46,
                "outstanding_balance": 0.0,
                "is_active": true
            }
        ],
        "products": [
            {
                "id": 1,
                "name": "HP Laptop 15-DW3000",
                "code": "PROD-001",
                "type": "goods",
                "unit": "Pcs",
                "unit_id": 1,
                "sales_price": 450000.0,
                "purchase_price": 380000.0,
                "current_stock": 25,
                "sales_account_id": 78,
                "purchase_account_id": 79,
                "account_id": 78
            },
            {
                "id": 2,
                "name": "Wireless Mouse",
                "code": "PROD-002",
                "type": "goods",
                "unit": "Pcs",
                "unit_id": 1,
                "sales_price": 3500.0,
                "purchase_price": 2800.0,
                "current_stock": 150,
                "sales_account_id": 78,
                "purchase_account_id": 79,
                "account_id": 78
            }
        ],
        "ledger_accounts": [
            {
                "id": 100,
                "name": "VAT Payable",
                "code": "2150",
                "account_group": {
                    "id": 15,
                    "name": "Current Liabilities"
                }
            },
            {
                "id": 101,
                "name": "Transport & Freight",
                "code": "5020",
                "account_group": {
                    "id": 20,
                    "name": "Direct Expenses"
                }
            }
        ],
        "type": "sales"
    }
}
```

---

### 2. Create Invoice

**Endpoint:** `POST /`

**Sample Request (Sales Invoice):**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "voucher_type_id": 1,
    "voucher_date": "2026-01-19",
    "customer_id": 45,
    "reference_number": "PO-2024-001",
    "narration": "Monthly supply of laptops and accessories",
    "inventory_items": [
      {
        "product_id": 1,
        "description": "HP Laptop 15-DW3000",
        "quantity": 5,
        "unit_id": 1,
        "rate": 450000.00,
        "amount": 2250000.00,
        "discount_percentage": 0,
        "discount_amount": 0,
        "tax_percentage": 0,
        "tax_amount": 0,
        "total": 2250000.00
      },
      {
        "product_id": 2,
        "description": "Wireless Mouse - Bulk order",
        "quantity": 50,
        "unit_id": 1,
        "rate": 3500.00,
        "amount": 175000.00,
        "discount_percentage": 0,
        "discount_amount": 0,
        "tax_percentage": 0,
        "tax_amount": 0,
        "total": 175000.00
      }
    ],
    "additional_ledger_accounts": [
      {
        "ledger_account_id": 101,
        "amount": 25000.00,
        "narration": "Transport to customer location"
      }
    ],
    "vat_enabled": true,
    "vat_amount": 181875.00,
    "vat_applies_to": "items_only",
    "action": "save_and_post"
  }'
```

**Sample Response (201 Created):**

```json
{
    "success": true,
    "message": "Invoice created and posted successfully",
    "data": {
        "id": 125,
        "tenant_id": 1,
        "voucher_type_id": 1,
        "voucher_number": "SI-0125",
        "voucher_date": "2026-01-19",
        "reference_number": "PO-2024-001",
        "narration": "Monthly supply of laptops and accessories",
        "total_amount": 2631875.0,
        "status": "posted",
        "created_by": 1,
        "posted_at": "2026-01-19T10:30:00.000000Z",
        "posted_by": 1,
        "created_at": "2026-01-19T10:30:00.000000Z",
        "updated_at": "2026-01-19T10:30:00.000000Z",
        "voucher_type": {
            "id": 1,
            "name": "Sales Invoice",
            "code": "SI",
            "abbreviation": "SI",
            "prefix": "SI-"
        },
        "items": [
            {
                "id": 250,
                "voucher_id": 125,
                "product_id": 1,
                "description": "HP Laptop 15-DW3000",
                "quantity": 5.0,
                "unit_id": 1,
                "rate": 450000.0,
                "amount": 2250000.0,
                "total": 2250000.0,
                "product": {
                    "id": 1,
                    "name": "HP Laptop 15-DW3000",
                    "code": "PROD-001",
                    "current_stock": 20
                }
            },
            {
                "id": 251,
                "voucher_id": 125,
                "product_id": 2,
                "description": "Wireless Mouse - Bulk order",
                "quantity": 50.0,
                "unit_id": 1,
                "rate": 3500.0,
                "amount": 175000.0,
                "total": 175000.0,
                "product": {
                    "id": 2,
                    "name": "Wireless Mouse",
                    "code": "PROD-002",
                    "current_stock": 100
                }
            }
        ],
        "entries": [
            {
                "id": 500,
                "voucher_id": 125,
                "ledger_account_id": 45,
                "debit_amount": 2631875.0,
                "credit_amount": 0.0,
                "particulars": "Sales to John Doe Enterprises",
                "ledger_account": {
                    "id": 45,
                    "name": "John Doe Enterprises",
                    "code": "1020-001"
                }
            },
            {
                "id": 501,
                "voucher_id": 125,
                "ledger_account_id": 78,
                "debit_amount": 0.0,
                "credit_amount": 2425000.0,
                "particulars": "Sales",
                "ledger_account": {
                    "id": 78,
                    "name": "Sales - Computers",
                    "code": "4010"
                }
            },
            {
                "id": 502,
                "voucher_id": 125,
                "ledger_account_id": 101,
                "debit_amount": 0.0,
                "credit_amount": 25000.0,
                "particulars": "Transport to customer location",
                "ledger_account": {
                    "id": 101,
                    "name": "Transport & Freight",
                    "code": "5020"
                }
            },
            {
                "id": 503,
                "voucher_id": 125,
                "ledger_account_id": 100,
                "debit_amount": 0.0,
                "credit_amount": 181875.0,
                "particulars": "VAT @ 7.5%",
                "ledger_account": {
                    "id": 100,
                    "name": "VAT Payable",
                    "code": "2150"
                }
            }
        ]
    }
}
```

**Validation Error Response (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "voucher_type_id": ["The voucher type id field is required."],
        "customer_id": ["The customer id field is required."],
        "inventory_items": ["The inventory items field is required."],
        "inventory_items.0.quantity": ["The quantity must be at least 0.01."]
    }
}
```

---

### 3. List Invoices

**Endpoint:** `GET /?type={sales|purchase}&status={draft|posted}&from_date={date}&to_date={date}&search={query}&sort={field}&direction={asc|desc}&per_page={number}&page={number}`

**Query Parameters:**

- `type`: `sales` or `purchase`
- `status`: `draft` or `posted`
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD
- `search`: Search term
- `sort`: Field to sort by (default: `voucher_date`)
- `direction`: `asc` or `desc` (default: `desc`)
- `per_page`: Items per page (default: 15)
- `page`: Page number

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?type=sales&status=posted&from_date=2026-01-01&to_date=2026-01-31&per_page=10&page=1' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoices retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 125,
                "voucher_type_id": 1,
                "voucher_number": "SI-0125",
                "voucher_date": "2026-01-19",
                "reference_number": "PO-2024-001",
                "narration": "Monthly supply",
                "total_amount": 2631875.0,
                "status": "posted",
                "posted_at": "2026-01-19T10:30:00.000000Z",
                "created_at": "2026-01-19T10:30:00.000000Z",
                "voucher_type": {
                    "name": "Sales Invoice",
                    "abbreviation": "SI"
                },
                "entries": [
                    {
                        "ledger_account": {
                            "name": "John Doe Enterprises"
                        }
                    }
                ]
            }
        ],
        "first_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=1",
        "from": 1,
        "last_page": 5,
        "last_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=5",
        "next_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=2",
        "path": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices",
        "per_page": 10,
        "prev_page_url": null,
        "to": 10,
        "total": 48
    },
    "statistics": {
        "total_invoices": 48,
        "draft_invoices": 5,
        "posted_invoices": 43,
        "total_sales_amount": 12500000.0,
        "total_purchase_amount": 8750000.0
    }
}
```

---

### 4. Show Invoice Details

**Endpoint:** `GET /{invoice}`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice retrieved successfully",
    "data": {
        "invoice": {
            "id": 125,
            "voucher_type_id": 1,
            "voucher_number": "SI-0125",
            "voucher_date": "2026-01-19",
            "reference_number": "PO-2024-001",
            "narration": "Monthly supply of laptops and accessories",
            "total_amount": 2631875.0,
            "status": "posted",
            "posted_at": "2026-01-19T10:30:00.000000Z",
            "posted_by": 1,
            "created_at": "2026-01-19T10:30:00.000000Z",
            "updated_at": "2026-01-19T10:30:00.000000Z",
            "voucher_type": {
                "id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "prefix": "SI-"
            },
            "items": [
                {
                    "id": 250,
                    "product_id": 1,
                    "description": "HP Laptop 15-DW3000",
                    "quantity": 5.0,
                    "rate": 450000.0,
                    "amount": 2250000.0,
                    "total": 2250000.0,
                    "product": {
                        "id": 1,
                        "name": "HP Laptop 15-DW3000",
                        "code": "PROD-001",
                        "unit": {
                            "name": "Pcs"
                        }
                    }
                },
                {
                    "id": 251,
                    "product_id": 2,
                    "description": "Wireless Mouse - Bulk order",
                    "quantity": 50.0,
                    "rate": 3500.0,
                    "amount": 175000.0,
                    "total": 175000.0,
                    "product": {
                        "id": 2,
                        "name": "Wireless Mouse",
                        "code": "PROD-002",
                        "unit": {
                            "name": "Pcs"
                        }
                    }
                }
            ],
            "entries": [
                {
                    "ledger_account_id": 45,
                    "debit_amount": 2631875.0,
                    "credit_amount": 0.0,
                    "particulars": "Sales to John Doe Enterprises",
                    "ledger_account": {
                        "id": 45,
                        "name": "John Doe Enterprises",
                        "code": "1020-001",
                        "account_group": {
                            "name": "Sundry Debtors"
                        }
                    }
                }
            ],
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "posted_by": {
                "id": 1,
                "name": "Admin User"
            }
        },
        "party": {
            "id": 1,
            "name": "John Doe Enterprises",
            "email": "john@example.com",
            "phone": "08012345678",
            "address": "123 Business Street, Lagos",
            "outstanding_balance": 2631875.0
        },
        "balance_due": 2631875.0,
        "total_paid": 0.0
    }
}
```

---

### 5. Update Invoice

**Endpoint:** `PUT /{invoice}`

**Note:** Only draft invoices can be updated. Posted invoices must be unposted first.

**Sample Request:**

```bash
curl -X PUT \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "voucher_date": "2026-01-20",
    "customer_id": 45,
    "reference_number": "PO-2024-001-REV",
    "narration": "Updated order",
    "inventory_items": [
      {
        "product_id": 1,
        "description": "HP Laptop 15-DW3000",
        "quantity": 10,
        "unit_id": 1,
        "rate": 450000.00,
        "amount": 4500000.00,
        "total": 4500000.00
      }
    ],
    "additional_ledger_accounts": [],
    "vat_enabled": false,
    "vat_amount": 0
  }'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice updated successfully",
    "data": {
        "id": 125,
        "voucher_number": "SI-0125",
        "total_amount": 4500000.0,
        "status": "draft",
        "updated_at": "2026-01-19T11:00:00.000000Z"
    }
}
```

**Error Response - Cannot Edit Posted (422):**

```json
{
    "success": false,
    "message": "Posted invoices cannot be edited. Unpost first to make changes.",
    "errors": {
        "status": ["Posted invoices are locked"]
    }
}
```

---

### 6. Delete Invoice

**Endpoint:** `DELETE /{invoice}`

**Note:** Only draft invoices can be deleted.

**Sample Request:**

```bash
curl -X DELETE \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice deleted successfully"
}
```

---

### 7. Post Invoice

**Endpoint:** `POST /{invoice}/post`

**Purpose:**

- Changes status from draft to posted
- Creates accounting entries in ledgers
- Updates product stock
- Creates stock movements

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/post' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice posted successfully",
    "data": {
        "id": 125,
        "status": "posted",
        "posted_at": "2026-01-19T11:30:00.000000Z",
        "posted_by": 1
    }
}
```

---

### 8. Unpost Invoice

**Endpoint:** `POST /{invoice}/unpost`

**Purpose:**

- Changes status from posted to draft
- Reverses stock movements
- Allows editing

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/unpost' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice unposted successfully",
    "data": {
        "id": 125,
        "status": "draft",
        "posted_at": null,
        "posted_by": null
    }
}
```

---

### 9. Search Customers/Vendors

**Endpoint:** `GET /search-customers?search={query}&type={customer|vendor}`

**Query Parameters:**

- `search`: Search term (name, email, phone)
- `type`: `customer` or `vendor`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-customers?search=john&type=customer' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe Enterprises",
            "email": "john@example.com",
            "phone": "08012345678",
            "address": "123 Business Street, Lagos",
            "city": "Lagos",
            "state": "Lagos State",
            "country": "Nigeria",
            "outstanding_balance": 2631875.0,
            "is_active": true,
            "ledger_account_id": 45,
            "ledger_account": {
                "id": 45,
                "name": "John Doe Enterprises",
                "code": "1020-001"
            }
        },
        {
            "id": 5,
            "name": "Johnson Trading Co",
            "email": "johnson@example.com",
            "phone": "08055667788",
            "outstanding_balance": 150000.0,
            "ledger_account_id": 49
        }
    ]
}
```

---

### 10. Search Products

**Endpoint:** `GET /search-products?search={query}&type={sales|purchase}`

**Query Parameters:**

- `search`: Search term (name, code)
- `type`: `sales` or `purchase`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-products?search=laptop&type=sales' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "HP Laptop 15-DW3000",
            "code": "PROD-001",
            "type": "goods",
            "unit": "Pcs",
            "unit_id": 1,
            "sales_price": 450000.0,
            "purchase_price": 380000.0,
            "current_stock": 20,
            "sales_account_id": 78,
            "purchase_account_id": 79,
            "default_price": 450000.0,
            "account_id": 78
        },
        {
            "id": 5,
            "name": "Dell Laptop Inspiron 15",
            "code": "PROD-005",
            "type": "goods",
            "unit": "Pcs",
            "unit_id": 1,
            "sales_price": 420000.0,
            "purchase_price": 350000.0,
            "current_stock": 15,
            "sales_account_id": 78,
            "purchase_account_id": 79,
            "default_price": 420000.0,
            "account_id": 78
        }
    ]
}
```

---

### 11. Search Ledger Accounts

**Endpoint:** `GET /search-ledger-accounts?search={query}`

**Query Parameters:**

- `search`: Search term (account name, code)

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-ledger-accounts?search=vat' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 100,
            "name": "VAT Payable",
            "code": "2150",
            "current_balance": 500000.0,
            "is_active": true,
            "account_group": {
                "id": 15,
                "name": "Current Liabilities",
                "code": "L02"
            }
        },
        {
            "id": 102,
            "name": "VAT Input",
            "code": "1320",
            "current_balance": 250000.0,
            "is_active": true,
            "account_group": {
                "id": 8,
                "name": "Current Assets",
                "code": "A02"
            }
        }
    ]
}
```

---

## Business Rules & Validations

### Invoice Creation Rules

1. **Draft Invoice:**
    - Can be created without posting
    - Does NOT affect stock
    - Does NOT create accounting entries
    - Can be edited freely
    - Can be deleted

2. **Posted Invoice:**
    - Automatically assigned invoice number
    - AFFECTS stock (sales decrease, purchase increase)
    - CREATES accounting entries in ledgers
    - CANNOT be edited directly
    - CANNOT be deleted
    - Must be unposted first to edit

3. **Stock Validation (Sales):**
    - Quantity cannot exceed current stock (optional warning)
    - Shows stock availability in product selector
    - Updates stock in real-time when posted

4. **Customer/Vendor Balance:**
    - For sales: Increases customer outstanding balance
    - For purchase: Increases vendor payable balance
    - Updated on post

---

## Stock Management Logic

### Sales Invoice (inventory_effect = 'decrease')

**When Posted:**

```
1. For each item:
   - product.current_stock -= item.quantity
   - Create StockMovement:
     * movement_type = 'out'
     * quantity = item.quantity
     * reference = voucher_number
```

**When Unposted:**

```
1. For each stock movement:
   - product.current_stock += movement.quantity
   - Delete StockMovement
```

### Purchase Invoice (inventory_effect = 'increase')

**When Posted:**

```
1. For each item:
   - product.current_stock += item.quantity
   - Create StockMovement:
     * movement_type = 'in'
     * quantity = item.quantity
     * reference = voucher_number
```

**When Unposted:**

```
1. For each stock movement:
   - product.current_stock -= movement.quantity
   - Delete StockMovement
```

---

## Accounting Entry Logic

### Sales Invoice Entries

```
Debit:  Customer Account ........... ₦ 2,631,875
Credit:   Sales Account ............ ₦ 2,425,000
Credit:   Transport Account ........ ₦    25,000
Credit:   VAT Payable .............. ₦   181,875
                                    _______________
        Total ...................... ₦ 2,631,875
```

**Entry Creation Logic:**

```javascript
// Customer debit
voucher_entries.create({
  ledger_account_id: customer.ledger_account_id,
  debit_amount: grand_total,
  credit_amount: 0,
  particulars: "Sales to {customer_name}"
});

// Sales credit (grouped by product's sales_account_id)
for each unique sales_account in items:
  voucher_entries.create({
    ledger_account_id: sales_account_id,
    debit_amount: 0,
    credit_amount: sum_of_items_for_this_account,
    particulars: "Sales"
  });

// Additional charges credit
for each additional_charge:
  voucher_entries.create({
    ledger_account_id: charge.ledger_account_id,
    debit_amount: 0,
    credit_amount: charge.amount,
    particulars: charge.narration
  });
```

### Purchase Invoice Entries

```
Debit:  Purchase Account ........... ₦ 3,000,000
Debit:  Transport Account .......... ₦    50,000
Debit:  VAT Input .................. ₦   225,000
Credit:   Vendor Account ........... ₦ 3,275,000
                                    _______________
        Total ...................... ₦ 3,275,000
```

---

## VAT Calculation Logic

### VAT on Items Only

```javascript
vat_amount = items_subtotal * (vat_rate / 100)

Example:
items_subtotal = ₦ 2,425,000
vat_rate = 7.5%
vat_amount = 2,425,000 * 0.075 = ₦ 181,875
```

### VAT on Items + Additional Charges

```javascript
vat_amount = (items_subtotal + additional_charges_total) * (vat_rate / 100)

Example:
items_subtotal = ₦ 2,425,000
additional_charges = ₦ 25,000
vat_rate = 7.5%
vat_amount = (2,425,000 + 25,000) * 0.075 = ₦ 183,750
```

---

## Error Handling

### Common Error Responses

#### 1. Validation Errors (422)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

#### 2. Authentication Error (401)

```json
{
    "message": "Unauthenticated."
}
```

#### 3. Not Found (404)

```json
{
    "message": "Resource not found."
}
```

#### 4. Server Error (500)

```json
{
    "success": false,
    "message": "Failed to create invoice: {error_message}"
}
```

### Error Handling Best Practices

1. **Display user-friendly messages**
2. **Show validation errors next to fields**
3. **Log detailed errors for debugging**
4. **Implement retry logic for network failures**
5. **Handle offline scenarios gracefully**

---

## Mobile UI/UX Best Practices

### 1. Form Validation

- Validate fields on blur
- Show real-time validation errors
- Disable submit until form is valid
- Show total calculations in real-time

### 2. Product Selection

- Show product image (if available)
- Display current stock prominently
- Highlight low stock in red
- Auto-focus quantity field after selection

### 3. Calculations

- Update all totals immediately on change
- Show breakdown on tap
- Format currency consistently
- Handle decimal precision (2 places)

### 4. Save States

- Show loading spinner during save
- Disable form during submission
- Show success/error messages
- Auto-navigate on success

### 5. Offline Support (Optional)

- Cache form data locally
- Queue submissions when offline
- Sync when connection restored
- Show offline indicator

---

## Testing Checklist

### Functional Testing

- [ ] Create draft invoice
- [ ] Create and post invoice
- [ ] Edit draft invoice
- [ ] Delete draft invoice
- [ ] Post draft invoice
- [ ] Unpost posted invoice
- [ ] Stock updates correctly
- [ ] Customer balance updates
- [ ] VAT calculations accurate
- [ ] Additional charges work
- [ ] Search functions work
- [ ] Validation prevents errors

### UI Testing

- [ ] All fields display correctly
- [ ] Calculations update in real-time
- [ ] Error messages appear
- [ ] Loading states show
- [ ] Success messages display
- [ ] Navigation works
- [ ] Responsive on all screens

### Performance Testing

- [ ] Form loads quickly
- [ ] Calculations are instant
- [ ] Search is responsive
- [ ] Large invoices handle well
- [ ] API responses are fast

---

## Support & Documentation

For additional help:

- Backend API Docs: `/api/documentation`
- Support Email: dev-support@yourapp.com
- Slack Channel: #mobile-dev

---

**Version:** 1.0
**Last Updated:** January 19, 2026
**Maintained By:** Backend Development Team
