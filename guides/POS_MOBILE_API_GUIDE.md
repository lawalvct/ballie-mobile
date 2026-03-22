# POS Mobile API Guide — React Native Integration

> **Base URL:** `https://yourdomain.com/api/v1/tenant/{tenant}/pos`
>
> **Auth:** All endpoints require `Authorization: Bearer {token}` via Sanctum.
>
> **Content-Type:** `application/json`
>
> **Note:** The POS API endpoints are proposed below. They follow the existing web route patterns in the POS controller. You will need to register these routes in `routes/api/v1/tenant.php` and create a corresponding `App\Http\Controllers\Api\Tenant\Pos\PosApiController` (or adapt the existing `PosController` to return JSON for API requests).

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Session Management](#2-session-management)
   - [Check Active Session](#21-check-active-session)
   - [List Cash Registers](#22-list-cash-registers)
   - [Open Session](#23-open-session)
   - [Close Session](#24-close-session)
3. [POS Data (Products, Categories, Customers, Payment Methods)](#3-pos-data)
   - [Get POS Init Data](#31-get-pos-init-data)
   - [Get Products](#32-get-products)
   - [Get Categories](#33-get-categories)
   - [Get Customers](#34-get-customers)
   - [Get Payment Methods](#35-get-payment-methods)
4. [Sales](#4-sales)
   - [Create Sale (Checkout)](#41-create-sale-checkout)
   - [List Transactions](#42-list-transactions)
   - [Get Transaction Detail](#43-get-transaction-detail)
   - [Void Sale](#44-void-sale)
   - [Refund Sale](#45-refund-sale)
5. [Receipts](#5-receipts)
   - [Get Receipt](#51-get-receipt)
   - [Email Receipt](#52-email-receipt)
6. [Reports](#6-reports)
   - [Daily Sales Summary](#61-daily-sales-summary)
   - [Top Products](#62-top-products)
7. [React Native Screen Guide](#7-react-native-screen-guide)
8. [Data Models Reference](#8-data-models-reference)
9. [Error Handling](#9-error-handling)

---

## 1. Authentication

Use the existing tenant auth endpoints. POS users authenticate the same way.

### Login

```
POST /api/v1/tenant/{tenant}/auth/login
```

**Payload:**
```json
{
  "email": "cashier@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 5,
      "name": "John Cashier",
      "email": "cashier@example.com",
      "role": "cashier"
    },
    "token": "1|abcdef1234567890...",
    "token_type": "Bearer"
  }
}
```

> Store the token securely (e.g., `react-native-keychain`) and send it as `Authorization: Bearer {token}` on all subsequent requests.

---

## 2. Session Management

A cash register session must be opened before any sales can be made.

### 2.1 Check Active Session

```
GET /api/v1/tenant/{tenant}/pos/session
```

**Response (200) — Active session exists:**
```json
{
  "success": true,
  "has_active_session": true,
  "session": {
    "id": 12,
    "cash_register_id": 1,
    "cash_register": {
      "id": 1,
      "name": "Main Register",
      "location": "Front Counter"
    },
    "user_id": 5,
    "opening_balance": "10000.00",
    "opened_at": "2026-03-21T08:30:00.000000Z",
    "opening_notes": "Morning shift",
    "total_sales": "45250.00",
    "total_cash_sales": "32000.00"
  }
}
```

**Response (200) — No active session:**
```json
{
  "success": true,
  "has_active_session": false,
  "session": null
}
```

### 2.2 List Cash Registers

```
GET /api/v1/tenant/{tenant}/pos/cash-registers
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Register",
      "location": "Front Counter",
      "current_balance": "10000.00",
      "is_active": true,
      "active_session": null
    },
    {
      "id": 2,
      "name": "Register 2",
      "location": "Back Counter",
      "current_balance": "5000.00",
      "is_active": true,
      "active_session": {
        "id": 11,
        "user": { "id": 3, "name": "Jane Doe" },
        "opened_at": "2026-03-21T07:00:00.000000Z"
      }
    }
  ]
}
```

### 2.3 Open Session

```
POST /api/v1/tenant/{tenant}/pos/session/open
```

**Payload:**
```json
{
  "cash_register_id": 1,
  "opening_balance": 10000.00,
  "opening_notes": "Morning shift"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `cash_register_id` | required, must exist and belong to tenant |
| `opening_balance` | required, numeric, min:0 |
| `opening_notes` | optional, string, max:1000 |

**Response (201):**
```json
{
  "success": true,
  "message": "Cash register session opened successfully.",
  "session": {
    "id": 12,
    "cash_register_id": 1,
    "cash_register": {
      "id": 1,
      "name": "Main Register",
      "location": "Front Counter"
    },
    "user_id": 5,
    "opening_balance": "10000.00",
    "opened_at": "2026-03-21T08:30:00.000000Z",
    "opening_notes": "Morning shift"
  }
}
```

**Error (422) — Already has active session:**
```json
{
  "success": false,
  "message": "You already have an active cash register session."
}
```

### 2.4 Close Session

```
POST /api/v1/tenant/{tenant}/pos/session/close
```

**Payload:**
```json
{
  "closing_balance": 55250.00,
  "closing_notes": "End of morning shift. All accounted for."
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `closing_balance` | required, numeric, min:0 |
| `closing_notes` | optional, string, max:1000 |

**Response (200):**
```json
{
  "success": true,
  "message": "Cash register session closed successfully.",
  "summary": {
    "session_id": 12,
    "opening_balance": "10000.00",
    "closing_balance": "55250.00",
    "expected_balance": "42000.00",
    "difference": "13250.00",
    "total_sales": "45250.00",
    "total_cash_sales": "32000.00",
    "opened_at": "2026-03-21T08:30:00.000000Z",
    "closed_at": "2026-03-21T16:30:00.000000Z"
  }
}
```

---

## 3. POS Data

### 3.1 Get POS Init Data

A convenience endpoint to load all data needed to render the POS screen in one request.

```
GET /api/v1/tenant/{tenant}/pos/init
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 12,
      "cash_register": { "id": 1, "name": "Main Register", "location": "Front Counter" },
      "opening_balance": "10000.00",
      "opened_at": "2026-03-21T08:30:00.000000Z"
    },
    "products": [
      {
        "id": 1,
        "name": "Coca-Cola 35cl",
        "sku": "BEV-001",
        "selling_price": "350.00",
        "tax_rate": "7.50",
        "current_stock": 48,
        "image_url": "https://yourdomain.com/storage/products/coca-cola.jpg",
        "category_id": 3,
        "unit": { "id": 1, "name": "Piece", "abbreviation": "pcs" },
        "maintain_stock": true
      }
    ],
    "categories": [
      { "id": 3, "name": "Beverages", "slug": "beverages", "product_count": 12 }
    ],
    "customers": [
      {
        "id": 10,
        "full_name": "Adekunle Johnson",
        "customer_type": "individual",
        "email": "ade@example.com",
        "phone": "+2348012345678"
      }
    ],
    "payment_methods": [
      { "id": 1, "name": "Cash", "code": "cash", "requires_reference": false },
      { "id": 2, "name": "Bank Transfer", "code": "transfer", "requires_reference": true },
      { "id": 3, "name": "POS Card", "code": "card", "requires_reference": true }
    ],
    "recent_sales": [
      {
        "id": 501,
        "sale_number": "SALE-2026-000045",
        "total_amount": "5200.00",
        "status": "completed",
        "sale_date": "2026-03-21T14:22:00.000000Z",
        "customer": { "id": 10, "full_name": "Adekunle Johnson" },
        "items_count": 3
      }
    ]
  }
}
```

### 3.2 Get Products

```
GET /api/v1/tenant/{tenant}/pos/products
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, SKU, or barcode |
| `category_id` | integer | Filter by category |
| `in_stock` | boolean | Only products with stock > 0 (default: true) |
| `page` | integer | Page number |
| `per_page` | integer | Items per page (default: 50) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Coca-Cola 35cl",
      "sku": "BEV-001",
      "selling_price": "350.00",
      "tax_rate": "7.50",
      "tax_inclusive": false,
      "current_stock": 48,
      "image_url": "https://yourdomain.com/storage/products/coca-cola.jpg",
      "category_id": 3,
      "category": { "id": 3, "name": "Beverages" },
      "unit": { "id": 1, "name": "Piece", "abbreviation": "pcs" },
      "maintain_stock": true,
      "is_active": true
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 50,
    "total": 124
  }
}
```

### 3.3 Get Categories

```
GET /api/v1/tenant/{tenant}/pos/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Electronics", "slug": "electronics", "product_count": 25 },
    { "id": 2, "name": "Groceries", "slug": "groceries", "product_count": 58 },
    { "id": 3, "name": "Beverages", "slug": "beverages", "product_count": 12 }
  ]
}
```

### 3.4 Get Customers

```
GET /api/v1/tenant/{tenant}/pos/customers
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, email, phone |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "customer_type": "individual",
      "first_name": "Adekunle",
      "last_name": "Johnson",
      "full_name": "Adekunle Johnson",
      "company_name": null,
      "email": "ade@example.com",
      "phone": "+2348012345678"
    },
    {
      "id": 15,
      "customer_type": "business",
      "first_name": null,
      "last_name": null,
      "full_name": "Apex Distributors Ltd",
      "company_name": "Apex Distributors Ltd",
      "email": "info@apex.com",
      "phone": "+2349087654321"
    }
  ]
}
```

### 3.5 Get Payment Methods

```
GET /api/v1/tenant/{tenant}/pos/payment-methods
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cash",
      "code": "cash",
      "requires_reference": false,
      "charge_percentage": "0.00",
      "charge_amount": "0.00"
    },
    {
      "id": 2,
      "name": "Bank Transfer",
      "code": "transfer",
      "requires_reference": true,
      "charge_percentage": "0.00",
      "charge_amount": "0.00"
    },
    {
      "id": 3,
      "name": "POS Card",
      "code": "card",
      "requires_reference": true,
      "charge_percentage": "1.50",
      "charge_amount": "0.00"
    }
  ]
}
```

---

## 4. Sales

### 4.1 Create Sale (Checkout)

This is the main checkout endpoint. It creates the sale, deducts stock, records payments, generates a receipt, and creates accounting entries — all in a single DB transaction.

```
POST /api/v1/tenant/{tenant}/pos/sales
```

**Payload:**
```json
{
  "customer_id": 10,
  "items": [
    {
      "product_id": 1,
      "quantity": 3,
      "unit_price": 350.00,
      "discount_amount": 0
    },
    {
      "product_id": 7,
      "quantity": 1,
      "unit_price": 15000.00,
      "discount_amount": 500.00
    }
  ],
  "payments": [
    {
      "method_id": 1,
      "amount": 10000.00,
      "reference": null
    },
    {
      "method_id": 2,
      "amount": 5550.00,
      "reference": "TRF-20260321-001"
    }
  ],
  "notes": "Customer requested gift wrapping"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `customer_id` | optional, must exist in tenant's customers |
| `items` | required, array, min 1 item |
| `items.*.product_id` | required, must exist in tenant's products |
| `items.*.quantity` | required, numeric, min:0.01 |
| `items.*.unit_price` | required, numeric, min:0 |
| `items.*.discount_amount` | optional, numeric, min:0 |
| `payments` | required, array, min 1 payment |
| `payments.*.method_id` | required, must exist in tenant's payment methods |
| `payments.*.amount` | required, numeric, min:0.01 |
| `payments.*.reference` | optional, string, max:255 |
| `notes` | optional, string, max:1000 |

**Response (200) — Success:**
```json
{
  "success": true,
  "sale_id": 502,
  "receipt_url": "https://yourdomain.com/demo-company/pos/receipt/502",
  "change_amount": 0,
  "message": "Sale completed successfully!"
}
```

**Error (400) — No active session:**
```json
{
  "success": false,
  "message": "No active cash register session found."
}
```

**Error (500) — Insufficient stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for Coca-Cola 35cl. Available: 2.00"
}
```

**Error (422) — Validation:**
```json
{
  "message": "The items field is required.",
  "errors": {
    "items": ["The items field is required."],
    "payments.0.method_id": ["The selected payments.0.method_id is invalid."]
  }
}
```

### 4.2 List Transactions

```
GET /api/v1/tenant/{tenant}/pos/transactions
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter: `completed`, `voided`, `refunded`, `pending` |
| `date_from` | date | Start date (YYYY-MM-DD) |
| `date_to` | date | End date (YYYY-MM-DD) |
| `customer_id` | integer | Filter by customer |
| `search` | string | Search by sale number |
| `page` | integer | Page number |
| `per_page` | integer | Items per page (default: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 502,
      "sale_number": "SALE-2026-000046",
      "customer": {
        "id": 10,
        "full_name": "Adekunle Johnson"
      },
      "user": {
        "id": 5,
        "name": "John Cashier"
      },
      "cash_register": {
        "id": 1,
        "name": "Main Register"
      },
      "subtotal": "16050.00",
      "tax_amount": "1166.25",
      "discount_amount": "500.00",
      "total_amount": "16716.25",
      "paid_amount": "15550.00",
      "change_amount": "0.00",
      "status": "completed",
      "sale_date": "2026-03-21T15:10:00.000000Z",
      "items_count": 2,
      "notes": null
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 96
  }
}
```

### 4.3 Get Transaction Detail

```
GET /api/v1/tenant/{tenant}/pos/transactions/{sale_id}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 502,
    "sale_number": "SALE-2026-000046",
    "status": "completed",
    "sale_date": "2026-03-21T15:10:00.000000Z",
    "notes": null,
    "customer": {
      "id": 10,
      "full_name": "Adekunle Johnson",
      "email": "ade@example.com",
      "phone": "+2348012345678"
    },
    "user": {
      "id": 5,
      "name": "John Cashier"
    },
    "cash_register": {
      "id": 1,
      "name": "Main Register",
      "location": "Front Counter"
    },
    "items": [
      {
        "id": 1201,
        "product_id": 1,
        "product_name": "Coca-Cola 35cl",
        "product_sku": "BEV-001",
        "quantity": "3.00",
        "unit_price": "350.00",
        "discount_amount": "0.00",
        "tax_amount": "78.75",
        "line_total": "1128.75"
      },
      {
        "id": 1202,
        "product_id": 7,
        "product_name": "Bluetooth Speaker",
        "product_sku": "ELEC-007",
        "quantity": "1.00",
        "unit_price": "15000.00",
        "discount_amount": "500.00",
        "tax_amount": "1087.50",
        "line_total": "15587.50"
      }
    ],
    "payments": [
      {
        "id": 601,
        "payment_method": { "id": 1, "name": "Cash" },
        "amount": "10000.00",
        "reference_number": null
      },
      {
        "id": 602,
        "payment_method": { "id": 2, "name": "Bank Transfer" },
        "amount": "5550.00",
        "reference_number": "TRF-20260321-001"
      }
    ],
    "totals": {
      "subtotal": "16050.00",
      "discount": "500.00",
      "tax": "1166.25",
      "total": "16716.25",
      "paid": "15550.00",
      "change": "0.00"
    }
  }
}
```

### 4.4 Void Sale

```
POST /api/v1/tenant/{tenant}/pos/transactions/{sale_id}/void
```

**Payload:** None required.

**Response (200):**
```json
{
  "success": true,
  "message": "Sale voided successfully. Stock has been restored."
}
```

**Error (422) — Already voided:**
```json
{
  "success": false,
  "message": "This sale is already voided."
}
```

### 4.5 Refund Sale

```
POST /api/v1/tenant/{tenant}/pos/transactions/{sale_id}/refund
```

**Payload:** None required.

**Response (200):**
```json
{
  "success": true,
  "message": "Sale refunded successfully. Stock has been restored."
}
```

**Error (422) — Not completed:**
```json
{
  "success": false,
  "message": "Only completed sales can be refunded."
}
```

---

## 5. Receipts

### 5.1 Get Receipt

```
GET /api/v1/tenant/{tenant}/pos/transactions/{sale_id}/receipt
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "receipt_number": "REC-2026-000046",
    "type": "original",
    "receipt_data": {
      "company": {
        "name": "Demo Company Ltd",
        "email": "info@demo.com",
        "phone": "+2341234567890",
        "address": "123 Business Ave, Lagos"
      },
      "sale": {
        "number": "SALE-2026-000046",
        "date": "2026-03-21 15:10:00",
        "cashier": "John Cashier",
        "customer": {
          "name": "Adekunle Johnson",
          "email": "ade@example.com",
          "phone": "+2348012345678"
        }
      },
      "items": [
        {
          "name": "Coca-Cola 35cl",
          "sku": "BEV-001",
          "quantity": "3.00",
          "unit_price": "350.00",
          "discount": "0.00",
          "tax": "78.75",
          "total": "1128.75"
        },
        {
          "name": "Bluetooth Speaker",
          "sku": "ELEC-007",
          "quantity": "1.00",
          "unit_price": "15000.00",
          "discount": "500.00",
          "tax": "1087.50",
          "total": "15587.50"
        }
      ],
      "payments": [
        { "method": "Cash", "amount": "10000.00", "reference": null },
        { "method": "Bank Transfer", "amount": "5550.00", "reference": "TRF-20260321-001" }
      ],
      "totals": {
        "subtotal": "16050.00",
        "discount": "500.00",
        "tax": "1166.25",
        "total": "16716.25",
        "paid": "15550.00",
        "change": "0.00"
      }
    }
  }
}
```

### 5.2 Email Receipt

```
POST /api/v1/tenant/{tenant}/pos/transactions/{sale_id}/email
```

**Payload:** None required (sends to the customer's email on file).

**Response (200):**
```json
{
  "success": true,
  "message": "Receipt emailed to ade@example.com"
}
```

**Error (422) — No email:**
```json
{
  "success": false,
  "message": "Customer has no email address."
}
```

> **Note:** Email sending is currently a placeholder (returns 501). Implementation pending.

---

## 6. Reports

### 6.1 Daily Sales Summary

```
GET /api/v1/tenant/{tenant}/pos/reports/daily-sales
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `date` | date | Specific date (default: today) |
| `date_from` | date | Range start |
| `date_to` | date | Range end |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-21",
    "total_sales": "125400.00",
    "total_transactions": 28,
    "total_items_sold": 97,
    "total_discount": "3500.00",
    "total_tax": "9150.00",
    "payment_breakdown": [
      { "method": "Cash", "total": "78200.00", "count": 18 },
      { "method": "Bank Transfer", "total": "32200.00", "count": 7 },
      { "method": "POS Card", "total": "15000.00", "count": 3 }
    ],
    "hourly_sales": [
      { "hour": "08:00", "total": "12500.00", "count": 3 },
      { "hour": "09:00", "total": "18200.00", "count": 5 }
    ]
  }
}
```

### 6.2 Top Products

```
GET /api/v1/tenant/{tenant}/pos/reports/top-products
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `date_from` | date | Range start |
| `date_to` | date | Range end |
| `limit` | integer | Number of products (default: 10) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "Coca-Cola 35cl",
      "product_sku": "BEV-001",
      "total_quantity": "245.00",
      "total_revenue": "85750.00",
      "transaction_count": 42
    },
    {
      "product_id": 7,
      "product_name": "Bluetooth Speaker",
      "product_sku": "ELEC-007",
      "total_quantity": "12.00",
      "total_revenue": "180000.00",
      "transaction_count": 12
    }
  ]
}
```

---

## 7. React Native Screen Guide

### Screen Architecture

```
App
├── LoginScreen
├── POS (Tab Navigator)
│   ├── SessionScreen          ← Open/close cash register session
│   ├── SaleScreen             ← Main POS: products + cart + checkout
│   │   ├── ProductGrid        ← Scrollable product cards with search
│   │   ├── CartSheet          ← Bottom sheet with cart items & totals
│   │   └── PaymentModal       ← Payment method selection & completion
│   ├── TransactionsScreen     ← Sale history list
│   │   └── TransactionDetail  ← Full sale detail + receipt + actions
│   └── ReportsScreen          ← Daily summary & top products
```

---

### Screen 1: **SessionScreen** (Register Session)

**Purpose:** Open or close a cash register session before selling.

**API calls on mount:**
```
GET /pos/session          → Check if active session exists
GET /pos/cash-registers   → List available registers (if no session)
```

**UI Elements:**
- If **no active session**: Show list of available cash registers, opening balance input (with quick amount buttons like ₦5,000, ₦10,000, ₦20,000), notes textarea, "Open Session" button
- If **active session**: Show session summary card (register name, opening balance, total sales so far, duration), "Close Session" button which shows closing balance input

**Actions:**
```
POST /pos/session/open   → Open session
POST /pos/session/close  → Close session
```

**React Native snippet:**
```tsx
// SessionScreen.tsx
const SessionScreen = () => {
  const [session, setSession] = useState(null);
  const [registers, setRegisters] = useState([]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const res = await api.get('/pos/session');
    if (res.data.has_active_session) {
      setSession(res.data.session);
    } else {
      const regs = await api.get('/pos/cash-registers');
      setRegisters(regs.data.data);
    }
  };

  const openSession = async (registerId, balance, notes) => {
    const res = await api.post('/pos/session/open', {
      cash_register_id: registerId,
      opening_balance: balance,
      opening_notes: notes,
    });
    setSession(res.data.session);
  };

  const closeSession = async (closingBalance, notes) => {
    await api.post('/pos/session/close', {
      closing_balance: closingBalance,
      closing_notes: notes,
    });
    setSession(null);
  };
};
```

---

### Screen 2: **SaleScreen** (Main POS)

**Purpose:** Browse products, build cart, checkout.

**API call on mount:**
```
GET /pos/init    → Fetch products, categories, customers, payment methods, recent sales
```

> Alternatively call individual endpoints if you need pagination:
> ```
> GET /pos/products?in_stock=true&per_page=50
> GET /pos/categories
> GET /pos/customers
> GET /pos/payment-methods
> ```

**UI Components:**

#### A. **ProductGrid** (top section)
- **Search bar** with debounced text input (filters by name/SKU)
- **Category chips** — horizontal scrollable filter pills
- **Product cards** in a 2-column FlatList grid:
  - Product image (or placeholder icon)
  - Product name (2-line max)
  - Price in bold: `₦350`
  - Stock badge: green "48 in stock" / yellow "3 left" / red "Out of stock"
  - Tap card → adds 1 to cart (or opens quantity input)

#### B. **CartSheet** (bottom sheet / slide-up panel)
- Collapsed: Shows item count pill + total: `3 items — ₦16,716.25`
- Expanded: Full cart list with:
  - Item name, SKU, unit price
  - Quantity stepper (−/+) with tap-for-manual-input
  - Line total
  - Swipe to remove
- **Totals section:**
  - Subtotal: ₦16,050.00
  - Discount: −₦500.00
  - Tax: ₦1,166.25
  - **Total: ₦16,716.25** (bold, accent color)
- Customer selector dropdown (optional)
- **"Proceed to Payment"** button (disabled when cart empty)

#### C. **PaymentModal** (full-screen modal)
- Order summary at top (items count + total)
- Payment method rows:
  - Method selector (dropdown/chips)
  - Amount input
  - Reference input (shown conditionally when `requires_reference === true`)
- **"Add Another Payment"** link (for split payments)
- Balance indicator: `Remaining: ₦6,716.25` or `Change: ₦283.75`
- Quick amount buttons: Exact, ₦500, ₦1,000, ₦2,000, ₦5,000
- **"Complete Sale"** button (disabled when balance < 0 or processing)
- Loading spinner during API call

**Checkout action:**
```
POST /pos/sales    → Create sale with items + payments
```

**React Native snippet:**
```tsx
// Cart state management (useContext or Zustand)
interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  tax_rate: number;
  image_url: string | null;
  available_stock: number;
}

interface Payment {
  method_id: number;
  amount: number;
  reference: string | null;
}

const completeSale = async (
  cartItems: CartItem[],
  payments: Payment[],
  customerId: number | null,
  notes: string | null
) => {
  const payload = {
    customer_id: customerId,
    items: cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
    })),
    payments: payments.map(p => ({
      method_id: p.method_id,
      amount: p.amount,
      reference: p.reference,
    })),
    notes,
  };

  const res = await api.post('/pos/sales', payload);

  if (res.data.success) {
    // Show success animation
    // Navigate to receipt or clear cart
    Alert.alert('Sale Complete', `Change: ₦${res.data.change_amount}`);
    clearCart();
  }
};
```

---

### Screen 3: **TransactionsScreen** (History)

**Purpose:** View, search, void, and refund past sales.

**API call on mount:**
```
GET /pos/transactions?page=1&per_page=20
```

**UI Elements:**
- **Search bar** — filter by sale number
- **Status filter chips:** All, Completed, Voided, Refunded
- **Date range picker** (optional)
- **Transaction list** (FlatList with infinite scroll):
  - Sale number (accent color, tappable)
  - Date + time
  - Customer name or "Walk-in"
  - Status badge (green/red/yellow pill)
  - Total amount (bold, right-aligned)
- Tap row → navigate to **TransactionDetail**

**React Native snippet:**
```tsx
const TransactionsScreen = () => {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', search: '' });

  const loadSales = async () => {
    const res = await api.get('/pos/transactions', {
      params: { ...filters, page, per_page: 20 },
    });
    setSales(prev => page === 1 ? res.data.data : [...prev, ...res.data.data]);
  };

  // Status badge color mapping
  const statusColors = {
    completed: { bg: '#DEF7EC', text: '#03543F' },
    voided:    { bg: '#FDE8E8', text: '#9B1C1C' },
    refunded:  { bg: '#FDF6B2', text: '#723B13' },
    pending:   { bg: '#E1EFFE', text: '#1E429F' },
  };
};
```

---

### Screen 4: **TransactionDetailScreen**

**Purpose:** View full sale detail, receipt data, and perform actions (void/refund).

**API call:**
```
GET /pos/transactions/{sale_id}
GET /pos/transactions/{sale_id}/receipt
```

**UI Elements:**
- **Sale header:** Sale number, date, status badge, cashier name
- **Customer card:** Name, email, phone (or "Walk-in Customer")
- **Items list:** Product name, SKU, qty × price, discount, tax, line total
- **Totals card:** Subtotal, discount, tax, total, paid, change
- **Payments list:** Method icon + name, amount, reference
- **Action buttons:**
  - 🖨️ "Share Receipt" — generate & share receipt image
  - 📧 "Email Receipt" — `POST .../email`
  - 🚫 "Void Sale" — `POST .../void` (only if `status === 'completed'`)
  - ↩️ "Refund" — `POST .../refund` (only if `status === 'completed'`)
- Confirmation alert before void/refund

**React Native snippet:**
```tsx
const voidSale = async (saleId: number) => {
  Alert.alert(
    'Void Sale',
    'Are you sure? This will restore stock and cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Void',
        style: 'destructive',
        onPress: async () => {
          const res = await api.post(`/pos/transactions/${saleId}/void`);
          if (res.data.success) {
            showToast('Sale voided successfully');
            refreshTransaction();
          }
        },
      },
    ]
  );
};
```

---

### Screen 5: **ReportsScreen**

**Purpose:** View daily sales summary and top-selling products.

**API calls:**
```
GET /pos/reports/daily-sales?date=2026-03-21
GET /pos/reports/top-products?date_from=2026-03-01&date_to=2026-03-21&limit=10
```

**UI Elements:**
- **Date picker** at top (swipeable between dates)
- **Summary cards** (grid of 2x2):
  - Total Sales: ₦125,400
  - Transactions: 28
  - Items Sold: 97
  - Avg Sale: ₦4,478.57
- **Payment breakdown** — horizontal bar chart or pie chart
- **Top products** — ranked list with position number, product name, quantity, revenue

---

## 8. Data Models Reference

### Product (for cart)

```typescript
interface PosProduct {
  id: number;
  name: string;
  sku: string;
  selling_price: string;        // "350.00"
  tax_rate: string;             // "7.50" (percentage)
  tax_inclusive: boolean;
  current_stock: number;
  image_url: string | null;
  category_id: number | null;
  category: { id: number; name: string } | null;
  unit: { id: number; name: string; abbreviation: string } | null;
  maintain_stock: boolean;
}
```

### Cart Item (local state)

```typescript
interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  tax_rate: number;
  available_stock: number;
  // Computed locally:
  line_subtotal: number;    // quantity * unit_price
  line_discount: number;    // discount_amount
  line_tax: number;         // (line_subtotal - line_discount) * tax_rate / 100
  line_total: number;       // line_subtotal - line_discount + line_tax
}
```

### Sale

```typescript
interface Sale {
  id: number;
  sale_number: string;          // "SALE-2026-000046"
  customer_id: number | null;
  user_id: number;
  cash_register_id: number;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  change_amount: string;
  status: 'completed' | 'voided' | 'refunded' | 'pending';
  sale_date: string;            // ISO 8601
  notes: string | null;
}
```

### Payment Method

```typescript
interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  requires_reference: boolean;
  charge_percentage: string;
  charge_amount: string;
}
```

### Cash Register Session

```typescript
interface CashRegisterSession {
  id: number;
  cash_register_id: number;
  cash_register: { id: number; name: string; location: string };
  user_id: number;
  opening_balance: string;
  closing_balance: string | null;
  expected_balance: string | null;
  difference: string | null;
  opened_at: string;
  closed_at: string | null;
  opening_notes: string | null;
  closing_notes: string | null;
  total_sales: string;
  total_cash_sales: string;
}
```

---

## 9. Error Handling

### Standard Error Responses

**401 Unauthorized** — Token expired or missing:
```json
{
  "message": "Unauthenticated."
}
```

**403 Forbidden** — Accessing another tenant's data:
```json
{
  "message": "This action is unauthorized."
}
```

**404 Not Found:**
```json
{
  "message": "No query results for model [App\\Models\\Sale]."
}
```

**422 Validation Error:**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "items": ["The items field is required."],
    "payments.0.amount": ["The payments.0.amount field is required."]
  }
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Insufficient stock for Coca-Cola 35cl. Available: 2.00"
}
```

### Recommended Error Handling Pattern (React Native)

```typescript
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'https://yourdomain.com/api/v1/tenant/demo-company',
  headers: { Accept: 'application/json' },
});

// Attach token
api.interceptors.request.use(config => {
  const token = getStoredToken(); // From secure storage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      // Token expired — redirect to login
      navigateToLogin();
    } else if (error.response?.status === 422) {
      // Validation error — show field-level errors
      const errors = error.response.data.errors;
      const firstError = Object.values(errors || {})[0]?.[0];
      showToast(firstError || 'Please check your input.');
    } else {
      showToast(error.response?.data?.message || 'Something went wrong.');
    }
    return Promise.reject(error);
  }
);
```

---

## Quick Reference: All POS Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pos/session` | Check active session |
| `GET` | `/pos/cash-registers` | List cash registers |
| `POST` | `/pos/session/open` | Open session |
| `POST` | `/pos/session/close` | Close session |
| `GET` | `/pos/init` | Get all POS data (products, categories, etc.) |
| `GET` | `/pos/products` | List products (paginated, searchable) |
| `GET` | `/pos/categories` | List product categories |
| `GET` | `/pos/customers` | List customers |
| `GET` | `/pos/payment-methods` | List payment methods |
| `POST` | `/pos/sales` | Create sale (checkout) |
| `GET` | `/pos/transactions` | List transactions (paginated) |
| `GET` | `/pos/transactions/{id}` | Get transaction detail |
| `POST` | `/pos/transactions/{id}/void` | Void a sale |
| `POST` | `/pos/transactions/{id}/refund` | Refund a sale |
| `GET` | `/pos/transactions/{id}/receipt` | Get receipt data |
| `POST` | `/pos/transactions/{id}/email` | Email receipt |
| `GET` | `/pos/reports/daily-sales` | Daily sales report |
| `GET` | `/pos/reports/top-products` | Top selling products |

> **All endpoints are prefixed with:** `/api/v1/tenant/{tenant}`
> **All require:** `Authorization: Bearer {token}`
