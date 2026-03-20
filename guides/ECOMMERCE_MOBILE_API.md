# E-commerce Module - Mobile API Guide

> **Base URL:** `{{baseUrl}}/api/v1/tenant/{{tenantId}}`
> **Auth:** `Authorization: Bearer {{token}}` (Sanctum)
> **Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)

---

## Table of Contents

1. [Settings](#1-settings)
2. [Orders](#2-orders)
3. [Shipping Methods](#3-shipping-methods)
4. [Coupons](#4-coupons)
5. [Payouts](#5-payouts)
6. [Reports](#6-reports)
7. [TypeScript Interfaces](#7-typescript-interfaces)
8. [Screens & Components Architecture](#8-screens--components-architecture)
9. [Navigation Flow](#9-navigation-flow)

---

## 1. Settings

### 1.1 Get Store Settings

```
GET /ecommerce/settings
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "store_name": "My Store",
        "store_description": "Welcome to our store",
        "store_email": "store@example.com",
        "store_phone": "08012345678",
        "store_address": "123 Main Street",
        "store_logo_url": "https://example.com/storage/ecommerce/logo.png",
        "store_banner_url": "https://example.com/storage/ecommerce/banner.jpg",
        "store_url": "https://app.ballie.com/store/tenant-slug",
        "currency": "NGN",
        "currency_symbol": "₦",
        "tax_enabled": true,
        "tax_rate": 7.5,
        "tax_name": "VAT",
        "shipping_enabled": true,
        "free_shipping_threshold": 50000,
        "minimum_order_amount": 1000,
        "enable_guest_checkout": true,
        "enable_customer_registration": true,
        "enable_order_notifications": true,
        "auto_confirm_orders": false,
        "payment_methods": {
            "cash_on_delivery": true,
            "bank_transfer": true,
            "paystack": false,
            "flutterwave": false,
            "stripe": false,
            "nomba": false
        },
        "paystack_public_key": null,
        "flutterwave_public_key": null,
        "stripe_publishable_key": null,
        "custom_css": "",
        "custom_js": "",
        "maintenance_mode": false,
        "created_at": "2025-01-15T10:00:00+00:00",
        "updated_at": "2025-01-20T14:30:00+00:00"
    }
}
```

### 1.2 Update Store Settings

```
POST /ecommerce/settings
Content-Type: multipart/form-data
```

**Body (form-data):**

| Field                          | Type    | Required | Description                          |
| ------------------------------ | ------- | -------- | ------------------------------------ |
| `store_name`                   | string  | No       | Store display name                   |
| `store_description`            | string  | No       | Store description                    |
| `store_email`                  | email   | No       | Contact email                        |
| `store_phone`                  | string  | No       | Contact phone                        |
| `store_address`                | string  | No       | Physical address                     |
| `store_logo`                   | file    | No       | Logo image (jpeg/png/gif, max 2MB)   |
| `store_banner`                 | file    | No       | Banner image (jpeg/png/gif, max 5MB) |
| `currency`                     | string  | No       | Currency code (e.g., "NGN")          |
| `currency_symbol`              | string  | No       | Currency symbol (e.g., "₦")          |
| `tax_enabled`                  | boolean | No       | Enable/disable tax                   |
| `tax_rate`                     | numeric | No       | Tax rate percentage (0-100)          |
| `tax_name`                     | string  | No       | Tax label (e.g., "VAT")              |
| `shipping_enabled`             | boolean | No       | Enable/disable shipping              |
| `free_shipping_threshold`      | numeric | No       | Free shipping minimum                |
| `minimum_order_amount`         | numeric | No       | Minimum order value                  |
| `enable_guest_checkout`        | boolean | No       | Allow guest checkout                 |
| `enable_customer_registration` | boolean | No       | Allow registration                   |
| `enable_order_notifications`   | boolean | No       | Email notifications                  |
| `auto_confirm_orders`          | boolean | No       | Auto-confirm new orders              |
| `payment_methods`              | object  | No       | Payment methods config               |
| `paystack_public_key`          | string  | No       | Paystack public key                  |
| `flutterwave_public_key`       | string  | No       | Flutterwave public key               |
| `stripe_publishable_key`       | string  | No       | Stripe publishable key               |
| `custom_css`                   | string  | No       | Custom CSS                           |
| `custom_js`                    | string  | No       | Custom JS                            |
| `maintenance_mode`             | boolean | No       | Enable maintenance mode              |

> **Note:** For JSON fields like `payment_methods`, send as: `payment_methods[cash_on_delivery]=1&payment_methods[paystack]=0`

**Response:**

```json
{
    "success": true,
    "message": "Store settings updated successfully.",
    "data": {
        /* same as GET response */
    }
}
```

### 1.3 Generate QR Code

```
GET /ecommerce/settings/qr-code
```

**Response:**

```json
{
    "success": true,
    "data": {
        "qr_code_svg": "<svg xmlns='http://www.w3.org/2000/svg' ...>...</svg>",
        "store_url": "https://app.ballie.com/store/tenant-slug"
    }
}
```

---

## 2. Orders

### 2.1 List Orders

```
GET /ecommerce/orders
```

**Query Parameters:**

| Param            | Type    | Default | Description                                                                               |
| ---------------- | ------- | ------- | ----------------------------------------------------------------------------------------- |
| `status`         | string  | —       | Filter: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`         |
| `payment_status` | string  | —       | Filter: `unpaid`, `paid`, `partially_paid`, `refunded`                                    |
| `payment_method` | string  | —       | Filter: `cash_on_delivery`, `paystack`, `stripe`, `flutterwave`, `nomba`, `bank_transfer` |
| `search`         | string  | —       | Search by order number or customer name                                                   |
| `date_from`      | date    | —       | Start date (YYYY-MM-DD)                                                                   |
| `date_to`        | date    | —       | End date (YYYY-MM-DD)                                                                     |
| `per_page`       | integer | 15      | Items per page (max 50)                                                                   |
| `page`           | integer | 1       | Page number                                                                               |

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "total": 150,
            "pending": 12,
            "processing": 8,
            "delivered": 120,
            "total_revenue": 5250000.0
        },
        "orders": [
            {
                "id": 42,
                "order_number": "ORD-20250115-001",
                "customer_name": "John Doe",
                "customer_email": "john@example.com",
                "customer_phone": "08012345678",
                "status": "confirmed",
                "payment_status": "paid",
                "payment_method": "paystack",
                "subtotal": 45000.0,
                "tax_amount": 3375.0,
                "shipping_amount": 2000.0,
                "discount_amount": 5000.0,
                "total_amount": 45375.0,
                "items_count": 3,
                "has_invoice": true,
                "created_at": "2025-01-15T10:30:00+00:00"
            }
        ]
    },
    "pagination": {
        "current_page": 1,
        "last_page": 10,
        "per_page": 15,
        "total": 150,
        "from": 1,
        "to": 15
    }
}
```

### 2.2 Show Order Detail

```
GET /ecommerce/orders/{orderId}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 42,
        "order_number": "ORD-20250115-001",
        "status": "confirmed",
        "payment_status": "paid",
        "payment_method": "paystack",
        "payment_reference": "PAY_abc123",
        "subtotal": 45000.0,
        "tax_amount": 3375.0,
        "shipping_amount": 2000.0,
        "discount_amount": 5000.0,
        "total_amount": 45375.0,
        "coupon_code": "SUMMER20",
        "notes": "Please deliver before 5pm",
        "admin_notes": null,
        "confirmed_at": "2025-01-15T11:00:00+00:00",
        "shipped_at": null,
        "delivered_at": null,
        "cancelled_at": null,
        "fulfilled_at": null,
        "created_at": "2025-01-15T10:30:00+00:00",
        "updated_at": "2025-01-15T11:00:00+00:00",
        "customer": {
            "id": 5,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "08012345678"
        },
        "items": [
            {
                "id": 101,
                "product_id": 15,
                "product_name": "Premium Widget",
                "quantity": 2,
                "price": 15000.0,
                "total": 30000.0,
                "product": {
                    "id": 15,
                    "name": "Premium Widget",
                    "price": 15000.0
                }
            }
        ],
        "shipping_address": {
            "id": 10,
            "first_name": "John",
            "last_name": "Doe",
            "address_line_1": "123 Main Street",
            "address_line_2": "Suite 4",
            "city": "Lagos",
            "state": "Lagos",
            "postal_code": "100001",
            "country": "Nigeria",
            "phone": "08012345678"
        },
        "billing_address": {
            "id": 11,
            "first_name": "John",
            "last_name": "Doe",
            "address_line_1": "123 Main Street"
        },
        "voucher": {
            "id": 200,
            "voucher_number": "SV-00042",
            "total_amount": 45375.0
        }
    }
}
```

### 2.3 Update Order Status

```
PUT /ecommerce/orders/{orderId}/status
```

**Body:**

```json
{
    "status": "confirmed"
}
```

| Value        | Description         | Side Effect                              |
| ------------ | ------------------- | ---------------------------------------- |
| `pending`    | Order placed        | —                                        |
| `confirmed`  | Order confirmed     | **Auto-creates invoice (Sales Voucher)** |
| `processing` | Being prepared      | —                                        |
| `shipped`    | Shipped to customer | Sets `shipped_at`                        |
| `delivered`  | Delivered           | Sets `delivered_at` + `fulfilled_at`     |
| `cancelled`  | Cancelled           | Sets `cancelled_at`                      |

**Response (with auto-invoice):**

```json
{
    "success": true,
    "message": "Order status updated to confirmed. Invoice SV-00042 created.",
    "data": {
        "status": "confirmed",
        "invoice": {
            "id": 200,
            "voucher_number": "SV-00042"
        }
    }
}
```

### 2.4 Update Payment Status

```
PUT /ecommerce/orders/{orderId}/payment-status
```

**Body:**

```json
{
    "payment_status": "paid"
}
```

| Value            | Description      | Side Effect                                        |
| ---------------- | ---------------- | -------------------------------------------------- |
| `unpaid`         | Not yet paid     | —                                                  |
| `paid`           | Fully paid       | **Auto-creates receipt voucher** if invoice exists |
| `partially_paid` | Partial payment  | —                                                  |
| `refunded`       | Payment refunded | —                                                  |

**Response (with auto-receipt):**

```json
{
    "success": true,
    "message": "Payment status updated to paid. Receipt RV-00042 created.",
    "data": {
        "payment_status": "paid",
        "receipt": {
            "id": 201,
            "voucher_number": "RV-00042"
        }
    }
}
```

### 2.5 Create Invoice Manually

```
POST /ecommerce/orders/{orderId}/invoice
```

**Response:**

```json
{
    "success": true,
    "message": "Invoice SV-00042 created successfully.",
    "data": {
        "voucher_id": 200,
        "voucher_number": "SV-00042"
    }
}
```

**Error (already has invoice):**

```json
{
    "success": false,
    "message": "This order already has an associated invoice."
}
```

---

## 3. Shipping Methods

### 3.1 List Shipping Methods

```
GET /ecommerce/shipping-methods
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Standard Delivery",
            "description": "3-5 business days delivery",
            "cost": 2000.0,
            "estimated_days": 5,
            "is_active": true,
            "created_at": "2025-01-10T08:00:00+00:00"
        },
        {
            "id": 2,
            "name": "Express Delivery",
            "description": "Next day delivery",
            "cost": 5000.0,
            "estimated_days": 1,
            "is_active": true,
            "created_at": "2025-01-10T08:00:00+00:00"
        }
    ]
}
```

### 3.2 Create Shipping Method

```
POST /ecommerce/shipping-methods
```

**Body:**

```json
{
    "name": "Same Day Delivery",
    "description": "Delivery within hours",
    "cost": 8000,
    "estimated_days": 0,
    "is_active": true
}
```

| Field            | Type    | Required | Rules         |
| ---------------- | ------- | -------- | ------------- |
| `name`           | string  | Yes      | max 255       |
| `description`    | string  | No       | max 1000      |
| `cost`           | numeric | Yes      | min: 0        |
| `estimated_days` | integer | No       | min: 0        |
| `is_active`      | boolean | No       | default: true |

**Response (201):**

```json
{
    "success": true,
    "message": "Shipping method created successfully.",
    "data": {
        "id": 3,
        "name": "Same Day Delivery",
        "description": "Delivery within hours",
        "cost": 8000.0,
        "estimated_days": 0,
        "is_active": true,
        "created_at": "2025-01-20T10:00:00+00:00"
    }
}
```

### 3.3 Show Shipping Method

```
GET /ecommerce/shipping-methods/{shippingMethodId}
```

### 3.4 Update Shipping Method

```
PUT /ecommerce/shipping-methods/{shippingMethodId}
```

Same body as create.

### 3.5 Delete Shipping Method

```
DELETE /ecommerce/shipping-methods/{shippingMethodId}
```

**Response:**

```json
{
    "success": true,
    "message": "Shipping method deleted successfully."
}
```

### 3.6 Toggle Active Status

```
POST /ecommerce/shipping-methods/{shippingMethodId}/toggle
```

**Response:**

```json
{
    "success": true,
    "message": "Shipping method activated.",
    "data": {
        "is_active": true
    }
}
```

---

## 4. Coupons

### 4.1 List Coupons

```
GET /ecommerce/coupons
```

**Query Parameters:**

| Param      | Type    | Default | Description                     |
| ---------- | ------- | ------- | ------------------------------- |
| `status`   | string  | —       | `active`, `inactive`, `expired` |
| `search`   | string  | —       | Search by code or description   |
| `per_page` | integer | 15      | Items per page (max 50)         |

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "code": "SUMMER20",
            "description": "Summer sale 20% off",
            "type": "percentage",
            "value": 20.0,
            "minimum_amount": 10000.0,
            "maximum_discount": 5000.0,
            "usage_limit": 100,
            "usage_count": 42,
            "is_active": true,
            "is_expired": false,
            "valid_from": "2025-06-01",
            "valid_to": "2025-08-31",
            "created_at": "2025-05-28T12:00:00+00:00"
        }
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 15,
        "total": 35,
        "from": 1,
        "to": 15
    }
}
```

### 4.2 Create Coupon

```
POST /ecommerce/coupons
```

**Body:**

```json
{
    "code": "WELCOME10",
    "description": "10% off first order",
    "type": "percentage",
    "value": 10,
    "minimum_amount": 5000,
    "maximum_discount": 3000,
    "usage_limit": 500,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "is_active": true
}
```

| Field              | Type    | Required | Rules                                       |
| ------------------ | ------- | -------- | ------------------------------------------- |
| `code`             | string  | Yes      | max 50, unique per tenant (auto-uppercased) |
| `description`      | string  | No       | max 500                                     |
| `type`             | string  | Yes      | `percentage` or `fixed`                     |
| `value`            | numeric | Yes      | min: 0. If percentage, max: 100             |
| `minimum_amount`   | numeric | No       | min: 0                                      |
| `maximum_discount` | numeric | No       | min: 0 (for percentage type)                |
| `usage_limit`      | integer | No       | min: 0 (null = unlimited)                   |
| `valid_from`       | date    | No       | Start date                                  |
| `valid_to`         | date    | No       | End date (must be after valid_from)         |
| `is_active`        | boolean | No       | default: true                               |

**Response (201):**

```json
{
    "success": true,
    "message": "Coupon created successfully.",
    "data": {
        "id": 2,
        "code": "WELCOME10",
        "type": "percentage",
        "value": 10.0,
        "is_active": true,
        "created_at": "2025-01-20T10:00:00+00:00"
    }
}
```

### 4.3 Show Coupon

```
GET /ecommerce/coupons/{couponId}
```

**Response includes:**

- All coupon fields
- `usage_count` from DB
- `is_expired` computed field
- `usages` array (recent 50 usages with customer + order info)

### 4.4 Update Coupon

```
PUT /ecommerce/coupons/{couponId}
```

Same body as create (all fields optional). Code uniqueness validation excludes current record.

### 4.5 Delete Coupon

```
DELETE /ecommerce/coupons/{couponId}
```

> **Note:** Cannot delete a coupon that has been used (`usage_count > 0`). Returns 422.

### 4.6 Toggle Active Status

```
POST /ecommerce/coupons/{couponId}/toggle
```

**Response:**

```json
{
    "success": true,
    "message": "Coupon activated.",
    "data": {
        "is_active": true
    }
}
```

---

## 5. Payouts

### 5.1 List Payouts (Dashboard)

```
GET /ecommerce/payouts
```

**Query Parameters:**

| Param      | Type    | Default | Description             |
| ---------- | ------- | ------- | ----------------------- |
| `per_page` | integer | 15      | Items per page (max 50) |

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "total_revenue": 5250000.0,
            "available_balance": 1500000.0,
            "total_withdrawn": 3000000.0,
            "pending_withdrawals": 250000.0,
            "this_month_revenue": 800000.0
        },
        "settings": {
            "payouts_enabled": true,
            "minimum_payout": 10000.0,
            "maximum_payout": 1000000.0,
            "deduction_type": "percentage",
            "deduction_value": 5.0,
            "deduction_name": "Service Fee",
            "processing_time": "3-5 business days",
            "payout_terms": "Payouts are processed every Friday."
        },
        "payouts": [
            {
                "id": 1,
                "request_number": "PAY-REQ-001",
                "requested_amount": 100000.0,
                "deduction_amount": 5000.0,
                "net_amount": 95000.0,
                "bank_name": "Guaranty Trust Bank (GTBank)",
                "account_name": "John Doe",
                "account_number": "0123456789",
                "status": "completed",
                "status_color": "green",
                "status_label": "Completed",
                "can_be_cancelled": false,
                "payment_reference": "TRF-12345",
                "requester": {
                    "id": 1,
                    "name": "John Doe"
                },
                "processed_at": "2025-01-18T14:00:00+00:00",
                "created_at": "2025-01-15T10:00:00+00:00"
            }
        ]
    },
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 62,
        "from": 1,
        "to": 15
    }
}
```

### 5.2 Get Create Form Data

```
GET /ecommerce/payouts/create
```

**Response:**

```json
{
    "success": true,
    "data": {
        "available_balance": 1500000.0,
        "payouts_enabled": true,
        "minimum_payout": 10000.0,
        "maximum_payout": 1000000.0,
        "deduction_description": "5% Service Fee",
        "banks": [
            { "code": "044", "name": "Access Bank" },
            { "code": "023", "name": "Citibank Nigeria" },
            { "code": "050", "name": "Ecobank Nigeria" },
            { "code": "070", "name": "Fidelity Bank" },
            { "code": "011", "name": "First Bank of Nigeria" },
            { "code": "214", "name": "First City Monument Bank (FCMB)" },
            { "code": "058", "name": "Guaranty Trust Bank (GTBank)" },
            { "code": "030", "name": "Heritage Bank" },
            { "code": "301", "name": "Jaiz Bank" },
            { "code": "082", "name": "Keystone Bank" },
            { "code": "526", "name": "Parallex Bank" },
            { "code": "101", "name": "Providus Bank" },
            { "code": "076", "name": "Polaris Bank" },
            { "code": "221", "name": "Stanbic IBTC Bank" },
            { "code": "068", "name": "Standard Chartered Bank" },
            { "code": "232", "name": "Sterling Bank" },
            { "code": "100", "name": "Suntrust Bank" },
            { "code": "032", "name": "Union Bank of Nigeria" },
            { "code": "033", "name": "United Bank for Africa (UBA)" },
            { "code": "215", "name": "Unity Bank" },
            { "code": "035", "name": "Wema Bank" },
            { "code": "057", "name": "Zenith Bank" },
            { "code": "999", "name": "Other" }
        ]
    }
}
```

### 5.3 Calculate Deduction (Preview)

```
POST /ecommerce/payouts/calculate-deduction
```

**Body:**

```json
{
    "amount": 100000
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "requested_amount": 100000.0,
        "deduction_amount": 5000.0,
        "net_amount": 95000.0,
        "deduction_description": "5% Service Fee"
    }
}
```

### 5.4 Submit Payout Request

```
POST /ecommerce/payouts
```

**Body:**

```json
{
    "requested_amount": 100000,
    "bank_name": "Guaranty Trust Bank (GTBank)",
    "account_name": "John Doe",
    "account_number": "0123456789",
    "bank_code": "058",
    "notes": "Monthly withdrawal"
}
```

| Field              | Type    | Required | Rules                              |
| ------------------ | ------- | -------- | ---------------------------------- |
| `requested_amount` | numeric | Yes      | min: 1, validated against settings |
| `bank_name`        | string  | Yes      | max 255                            |
| `account_name`     | string  | Yes      | max 255                            |
| `account_number`   | string  | Yes      | max 20                             |
| `bank_code`        | string  | No       | max 10                             |
| `notes`            | string  | No       | max 500                            |

**Validation Errors (422):**

- Amount below minimum payout
- Amount above maximum payout
- Amount exceeds available balance

**Response (201):**

```json
{
    "success": true,
    "message": "Payout request submitted successfully.",
    "data": {
        "id": 15,
        "request_number": "PAY-REQ-015",
        "requested_amount": 100000.0,
        "deduction_amount": 5000.0,
        "net_amount": 95000.0,
        "status": "pending",
        "created_at": "2025-01-20T10:00:00+00:00"
    }
}
```

### 5.5 Show Payout Detail

```
GET /ecommerce/payouts/{payoutId}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 15,
        "request_number": "PAY-REQ-015",
        "requested_amount": 100000.0,
        "deduction_amount": 5000.0,
        "net_amount": 95000.0,
        "deduction_type": "percentage",
        "deduction_rate": 5.0,
        "deduction_description": "5% Service Fee",
        "available_balance": 1500000.0,
        "bank_name": "Guaranty Trust Bank (GTBank)",
        "account_name": "John Doe",
        "account_number": "0123456789",
        "bank_code": "058",
        "status": "pending",
        "status_color": "yellow",
        "status_label": "Pending",
        "progress_percentage": 25,
        "can_be_cancelled": true,
        "notes": "Monthly withdrawal",
        "admin_notes": null,
        "rejection_reason": null,
        "payment_reference": null,
        "requester": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        },
        "processor": null,
        "processed_at": null,
        "created_at": "2025-01-20T10:00:00+00:00",
        "updated_at": "2025-01-20T10:00:00+00:00"
    }
}
```

### 5.6 Cancel Payout Request

```
POST /ecommerce/payouts/{payoutId}/cancel
```

> Only works if status is `pending`. Returns 422 otherwise.

**Response:**

```json
{
    "success": true,
    "message": "Payout request cancelled successfully.",
    "data": {
        "status": "cancelled"
    }
}
```

**Payout Status Reference:**

| Status       | Color  | Cancellable |
| ------------ | ------ | ----------- |
| `pending`    | yellow | Yes         |
| `approved`   | blue   | No          |
| `processing` | indigo | No          |
| `completed`  | green  | No          |
| `rejected`   | red    | No          |
| `cancelled`  | gray   | No          |

---

## 6. Reports

All five report endpoints share the same structure: they accept optional date range query parameters and return a `data` object containing `stats` (summary KPIs) plus several breakdown arrays/objects. Counts and amounts are always cast to `int`/`float` in API responses.

**Common query parameters (all report endpoints)**

| Param       | Type   | Description             |
| ----------- | ------ | ----------------------- |
| `date_from` | string | Start date `YYYY-MM-DD` |
| `date_to`   | string | End date `YYYY-MM-DD`   |

**Common response envelope**

```json
{
    "success": true,
    "data": { ... },
    "filters": {
        "date_from": "2024-12-21",
        "date_to": "2025-01-20"
    }
}
```

---

### 6.1 Order Reports

```
GET /ecommerce/reports/orders
Authorization: Bearer {token}
```

**Default date range:** last 30 days

**Query parameters**

| Param       | Default         | Description             |
| ----------- | --------------- | ----------------------- |
| `date_from` | today − 30 days | Start date (YYYY-MM-DD) |
| `date_to`   | today           | End date (YYYY-MM-DD)   |

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "total_orders": 150,
            "total_revenue": 5250000.0,
            "average_order_value": 35000.0,
            "cancelled_orders": 8
        },
        "orders_by_status": [
            { "status": "pending", "count": 10, "total": 350000.0 },
            { "status": "confirmed", "count": 15, "total": 525000.0 },
            { "status": "processing", "count": 5, "total": 175000.0 },
            { "status": "shipped", "count": 12, "total": 420000.0 },
            { "status": "delivered", "count": 100, "total": 3500000.0 },
            { "status": "cancelled", "count": 8, "total": 280000.0 }
        ],
        "orders_by_payment": [
            { "payment_status": "paid", "count": 127, "total": 4450000.0 },
            { "payment_status": "unpaid", "count": 23, "total": 800000.0 }
        ],
        "daily_trends": [
            { "date": "2025-01-01", "orders": 5, "revenue": 175000.0 },
            { "date": "2025-01-02", "orders": 8, "revenue": 280000.0 }
        ],
        "payment_methods": [
            { "payment_method": "paystack", "count": 80, "total": 2800000.0 },
            {
                "payment_method": "bank_transfer",
                "count": 40,
                "total": 1400000.0
            },
            {
                "payment_method": "cash_on_delivery",
                "count": 30,
                "total": 1050000.0
            }
        ],
        "top_products": [
            {
                "product_id": 15,
                "product_name": "Premium Widget",
                "product_price": 15000.0,
                "total_quantity": 120,
                "total_revenue": 1800000.0
            }
        ]
    },
    "filters": {
        "date_from": "2024-12-21",
        "date_to": "2025-01-20"
    }
}
```

**Field reference**

| Field                                | Type   | Description                                          |
| ------------------------------------ | ------ | ---------------------------------------------------- |
| `stats.total_orders`                 | int    | All orders in period (all statuses)                  |
| `stats.total_revenue`                | float  | Sum of `total_amount` for confirmed/delivered orders |
| `stats.average_order_value`          | float  | Average `total_amount` (confirmed/delivered)         |
| `stats.cancelled_orders`             | int    | Orders with `status = cancelled`                     |
| `orders_by_status[].status`          | string | Order status key                                     |
| `orders_by_status[].count`           | int    | Number of orders                                     |
| `orders_by_status[].total`           | float  | Sum of `total_amount`                                |
| `orders_by_payment[].payment_status` | string | `paid` / `unpaid` / `partially_paid` / `refunded`    |
| `orders_by_payment[].count`          | int    | Number of orders                                     |
| `orders_by_payment[].total`          | float  | Sum of `total_amount`                                |
| `daily_trends[].date`                | string | `YYYY-MM-DD`                                         |
| `daily_trends[].orders`              | int    | Orders created on this date                          |
| `daily_trends[].revenue`             | float  | Revenue on this date                                 |
| `payment_methods[].payment_method`   | string | Payment method key                                   |
| `payment_methods[].count`            | int    | Number of orders                                     |
| `payment_methods[].total`            | float  | Sum of `total_amount`                                |
| `top_products[].product_id`          | int    | Product ID                                           |
| `top_products[].product_name`        | string | Product name                                         |
| `top_products[].product_price`       | float  | Current unit selling price (`sales_rate`)            |
| `top_products[].total_quantity`      | int    | Total units sold                                     |
| `top_products[].total_revenue`       | float  | Revenue from this product                            |

**Screen sections — Order Report**

| Widget                    | Data source         | Notes                                                             |
| ------------------------- | ------------------- | ----------------------------------------------------------------- |
| **4 KPI cards**           | `stats.*`           | Total Orders / Total Revenue / Avg Order Value / Cancelled Orders |
| **Status breakdown list** | `orders_by_status`  | Show each status with count + total amount                        |
| **Payment status list**   | `orders_by_payment` | Paid vs unpaid count and value                                    |
| **Daily trends chart**    | `daily_trends`      | Dual-axis line: orders (left) + revenue (right), x = date         |
| **Payment methods grid**  | `payment_methods`   | Each method with count + total amount                             |
| **Top 10 products table** | `top_products`      | Ranked by revenue, show qty + revenue columns                     |

---

### 6.2 Revenue Reports

```
GET /ecommerce/reports/revenue
Authorization: Bearer {token}
```

**Default date range:** First day of the month 6 months ago → today

**Query parameters**

| Param       | Default                      | Description             |
| ----------- | ---------------------------- | ----------------------- |
| `date_from` | start of month, 6 months ago | Start date (YYYY-MM-DD) |
| `date_to`   | today                        | End date (YYYY-MM-DD)   |

> Stats compare the selected period vs an equal-length period immediately before it. `growth_rate` is always a percentage (positive = growth, negative = decline).

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "current_revenue": 5250000.0,
            "previous_revenue": 4200000.0,
            "growth_rate": 25.0,
            "total_orders": 150,
            "average_order_value": 35000.0
        },
        "monthly_revenue": [
            {
                "month": "2024-08",
                "orders": 20,
                "subtotal": 600000.0,
                "tax": 45000.0,
                "shipping": 40000.0,
                "discount": 30000.0,
                "total": 655000.0
            }
        ],
        "revenue_by_payment": [
            { "payment_status": "paid", "total": 4725000.0 },
            { "payment_status": "unpaid", "total": 525000.0 }
        ],
        "revenue_by_method": [
            { "payment_method": "paystack", "total": 2800000.0, "count": 80 },
            {
                "payment_method": "bank_transfer",
                "total": 1400000.0,
                "count": 40
            },
            {
                "payment_method": "cash_on_delivery",
                "total": 1050000.0,
                "count": 30
            }
        ]
    },
    "filters": {
        "date_from": "2024-07-01",
        "date_to": "2025-01-20"
    }
}
```

**Field reference**

| Field                                 | Type   | Description                                                                         |
| ------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| `stats.current_revenue`               | float  | Total revenue in selected date range                                                |
| `stats.previous_revenue`              | float  | Revenue in the equal-length period before `date_from`                               |
| `stats.growth_rate`                   | float  | `(current - previous) / previous × 100`, rounded to 2 dp. `0` if no previous period |
| `stats.total_orders`                  | int    | Count of confirmed/delivered orders in period                                       |
| `stats.average_order_value`           | float  | Average `total_amount` in period                                                    |
| `monthly_revenue[].month`             | string | `YYYY-MM`                                                                           |
| `monthly_revenue[].orders`            | int    | Order count for that month                                                          |
| `monthly_revenue[].subtotal`          | float  | Sum of `subtotal`                                                                   |
| `monthly_revenue[].tax`               | float  | Sum of `tax_amount`                                                                 |
| `monthly_revenue[].shipping`          | float  | Sum of `shipping_amount`                                                            |
| `monthly_revenue[].discount`          | float  | Sum of `discount_amount`                                                            |
| `monthly_revenue[].total`             | float  | Sum of `total_amount`                                                               |
| `revenue_by_payment[].payment_status` | string | Payment status key                                                                  |
| `revenue_by_payment[].total`          | float  | Sum of `total_amount`                                                               |
| `revenue_by_method[].payment_method`  | string | Payment method key                                                                  |
| `revenue_by_method[].total`           | float  | Sum of `total_amount`                                                               |
| `revenue_by_method[].count`           | int    | Order count                                                                         |

**Screen sections — Revenue Report**

| Widget                        | Data source          | Notes                                                               |
| ----------------------------- | -------------------- | ------------------------------------------------------------------- |
| **4 KPI cards**               | `stats.*`            | Current Revenue / Previous Revenue / Growth Rate / Avg Order Value  |
| **Growth rate indicator**     | `stats.growth_rate`  | Green if positive, red if negative; show `+25.00%` or `-5.50%`      |
| **Monthly stacked bar chart** | `monthly_revenue`    | Bars stacked: subtotal / tax / shipping (discount shown separately) |
| **Monthly details table**     | `monthly_revenue`    | Columns: Month, Orders, Subtotal, Tax, Shipping, Discount, Total    |
| **Revenue by payment status** | `revenue_by_payment` | Pie/donut or bar: paid vs unpaid totals                             |
| **Revenue by payment method** | `revenue_by_method`  | Bar chart or list: method, order count, total                       |

---

### 6.3 Product Reports

```
GET /ecommerce/reports/products
Authorization: Bearer {token}
```

**Default date range:** last 30 days

**Query parameters**

| Param       | Default         | Description             |
| ----------- | --------------- | ----------------------- |
| `date_from` | today − 30 days | Start date (YYYY-MM-DD) |
| `date_to`   | today           | End date (YYYY-MM-DD)   |

> `low_stock_products` is based on current stock levels (not date-filtered). A product is low-stock when its `stock_quantity` ≤ its `reorder_level`.

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "total_products_sold": 45,
            "total_quantity_sold": 380,
            "total_revenue": 5250000.0,
            "low_stock_count": 3
        },
        "top_by_revenue": [
            {
                "product_id": 15,
                "product_name": "Premium Widget",
                "category": "Electronics",
                "total_quantity": 120,
                "total_revenue": 1800000.0,
                "order_count": 95
            }
        ],
        "top_by_quantity": [
            {
                "product_id": 22,
                "product_name": "Basic Gadget",
                "category": "Accessories",
                "total_quantity": 250,
                "total_revenue": 1250000.0
            }
        ],
        "category_performance": [
            {
                "category": "Electronics",
                "total_quantity": 200,
                "total_revenue": 3000000.0,
                "order_count": 120
            }
        ],
        "low_stock_products": [
            {
                "product_id": 8,
                "name": "Wireless Charger",
                "current_stock": 3,
                "reorder_level": 10,
                "sold_quantity": 45
            }
        ]
    },
    "filters": {
        "date_from": "2024-12-21",
        "date_to": "2025-01-20"
    }
}
```

**Field reference**

| Field                                   | Type         | Description                                                            |
| --------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `stats.total_products_sold`             | int          | Distinct product count with at least 1 sale in period                  |
| `stats.total_quantity_sold`             | int          | Sum of all `order_items.quantity` in period                            |
| `stats.total_revenue`                   | float        | Sum of `order_items.total_price` in period                             |
| `stats.low_stock_count`                 | int          | Products currently at or below reorder level                           |
| `top_by_revenue[].product_id`           | int          | Product ID                                                             |
| `top_by_revenue[].product_name`         | string       | Product name                                                           |
| `top_by_revenue[].category`             | string\|null | Category name (null if uncategorised)                                  |
| `top_by_revenue[].total_quantity`       | int          | Units sold                                                             |
| `top_by_revenue[].total_revenue`        | float        | Revenue from this product                                              |
| `top_by_revenue[].order_count`          | int          | Distinct orders containing this product                                |
| `top_by_quantity`                       | array        | Same shape as `top_by_revenue` minus `order_count`; sorted by quantity |
| `category_performance[].category`       | string       | Category name                                                          |
| `category_performance[].total_quantity` | int          | Total units across all products in this category                       |
| `category_performance[].total_revenue`  | float        | Total revenue for this category                                        |
| `category_performance[].order_count`    | int          | Distinct orders containing products in this category                   |
| `low_stock_products[].product_id`       | int          | Product ID                                                             |
| `low_stock_products[].name`             | string       | Product name                                                           |
| `low_stock_products[].current_stock`    | int          | Current stock level                                                    |
| `low_stock_products[].reorder_level`    | int          | Configured reorder threshold                                           |
| `low_stock_products[].sold_quantity`    | int          | Units sold in the date range                                           |

**Screen sections — Product Report**

| Widget                         | Data source            | Notes                                                         |
| ------------------------------ | ---------------------- | ------------------------------------------------------------- |
| **4 KPI cards**                | `stats.*`              | Products Sold / Qty Sold / Total Revenue / Low Stock Count    |
| **Top 20 by revenue table**    | `top_by_revenue`       | Columns: Product, Category, Qty, Revenue, Orders              |
| **Top 20 by quantity table**   | `top_by_quantity`      | Columns: Product, Category, Qty, Revenue                      |
| **Category performance table** | `category_performance` | Columns: Category, Qty, Revenue, Orders                       |
| **Low stock alert list**       | `low_stock_products`   | Show current stock vs reorder level; highlight when stock = 0 |

---

### 6.4 Customer Reports

```
GET /ecommerce/reports/customers
Authorization: Bearer {token}
```

**Default date range:** last 90 days

**Query parameters**

| Param       | Default         | Description             |
| ----------- | --------------- | ----------------------- |
| `date_from` | today − 90 days | Start date (YYYY-MM-DD) |
| `date_to`   | today           | End date (YYYY-MM-DD)   |

> `total_customers` and `average_lifetime_value` are calculated across **all time**, not just the selected date range.
> `new_customers` = registered customers whose first-ever order was in the selected period.
> `returning_customers` = registered customers who have ordered before `date_from` AND placed another order in the period.
> `lifetime_value_segments` covers all-time orders (not date-filtered).

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "total_customers": 250,
            "new_customers": 45,
            "returning_customers": 80,
            "guest_orders": 25,
            "registered_orders": 125,
            "average_lifetime_value": 85000.0
        },
        "top_customers": [
            {
                "customer_id": 5,
                "customer_name": "John Doe",
                "customer_email": "john@example.com",
                "customer_phone": "08012345678",
                "order_count": 12,
                "total_spent": 540000.0,
                "avg_order_value": 45000.0,
                "last_order_date": "2025-01-18 14:30:00"
            }
        ],
        "lifetime_value_segments": {
            "< 10,000": 50,
            "10,000 - 50,000": 100,
            "50,000 - 100,000": 60,
            "100,000 - 500,000": 30,
            "500,000+": 10
        }
    },
    "filters": {
        "date_from": "2024-10-22",
        "date_to": "2025-01-20"
    }
}
```

**Field reference**

| Field                             | Type         | Description                                                                                                                           |
| --------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `stats.total_customers`           | int          | All-time distinct registered customers who have ordered                                                                               |
| `stats.new_customers`             | int          | First-time buyers in the period (date-filtered)                                                                                       |
| `stats.returning_customers`       | int          | Buyers with a prior order before `date_from` who bought again in period                                                               |
| `stats.guest_orders`              | int          | Orders with no customer account (`customer_id` is null)                                                                               |
| `stats.registered_orders`         | int          | Orders placed by registered customers                                                                                                 |
| `stats.average_lifetime_value`    | float        | Average total spent per customer across all time                                                                                      |
| `top_customers[].customer_id`     | int          | Customer ID                                                                                                                           |
| `top_customers[].customer_name`   | string       | Customer full name                                                                                                                    |
| `top_customers[].customer_email`  | string\|null | Customer email                                                                                                                        |
| `top_customers[].customer_phone`  | string\|null | Customer phone                                                                                                                        |
| `top_customers[].order_count`     | int          | Orders in the selected period                                                                                                         |
| `top_customers[].total_spent`     | float        | Revenue from confirmed/delivered orders in the period                                                                                 |
| `top_customers[].avg_order_value` | float        | Average per order in the period                                                                                                       |
| `top_customers[].last_order_date` | string       | Datetime string `YYYY-MM-DD HH:mm:ss`                                                                                                 |
| `lifetime_value_segments`         | object       | Fixed keys: `"< 10,000"`, `"10,000 - 50,000"`, `"50,000 - 100,000"`, `"100,000 - 500,000"`, `"500,000+"` — values are customer counts |

**Screen sections — Customer Report**

| Widget                      | Data source                                      | Notes                                                      |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| **4 KPI cards**             | `stats.*`                                        | Total Customers / New / Returning / Avg Lifetime Value     |
| **Guest vs registered bar** | `stats.guest_orders` + `stats.registered_orders` | Show order count split                                     |
| **Top 20 customers table**  | `top_customers`                                  | Columns: Name, Email, Orders, Total Spent, Last Order      |
| **LTV segment chart**       | `lifetime_value_segments`                        | Horizontal bar or doughnut; fixed 5 buckets, value = count |

---

### 6.5 Abandoned Carts Report

```
GET /ecommerce/reports/abandoned-carts
Authorization: Bearer {token}
```

**Default date range:** last 30 days

**Query parameters**

| Param       | Default         | Description             |
| ----------- | --------------- | ----------------------- |
| `date_from` | today − 30 days | Start date (YYYY-MM-DD) |
| `date_to`   | today           | End date (YYYY-MM-DD)   |

> **Abandoned cart definition:** a cart that was last updated more than 1 hour ago and has at least one item. Carts updated within the last hour are excluded (considered still-active sessions).
> **`recovery_rate`** is always `0.0` — the platform does not currently link a cart to its converted order, so recovery cannot be tracked. Display this as "0%" with a note.
> **`price`** on each abandoned product is the product's `sales_rate` (selling price).

**Response:**

```json
{
    "success": true,
    "data": {
        "stats": {
            "abandoned_carts": 85,
            "potential_revenue": 3400000.0,
            "recovery_rate": 0.0,
            "average_cart_value": 40000.0
        },
        "daily_trends": [
            { "date": "2025-01-01", "abandoned_carts": 3 },
            { "date": "2025-01-02", "abandoned_carts": 5 }
        ],
        "most_abandoned_products": [
            {
                "id": 15,
                "name": "Premium Widget",
                "price": 15000.0,
                "total_quantity": 45,
                "cart_count": 30
            }
        ]
    },
    "filters": {
        "date_from": "2024-12-21",
        "date_to": "2025-01-20"
    }
}
```

**Field reference**

| Field                                      | Type   | Description                                                      |
| ------------------------------------------ | ------ | ---------------------------------------------------------------- |
| `stats.abandoned_carts`                    | int    | Carts updated > 1 hr ago with at least 1 item, within date range |
| `stats.potential_revenue`                  | float  | Sum of `price × quantity` across all abandoned cart items        |
| `stats.recovery_rate`                      | float  | Always `0.0` (not yet tracked)                                   |
| `stats.average_cart_value`                 | float  | `potential_revenue / abandoned_carts`                            |
| `daily_trends[].date`                      | string | `YYYY-MM-DD`                                                     |
| `daily_trends[].abandoned_carts`           | int    | Number of abandoned carts on this date                           |
| `most_abandoned_products[].id`             | int    | Product ID                                                       |
| `most_abandoned_products[].name`           | string | Product name                                                     |
| `most_abandoned_products[].price`          | float  | Current selling price (`sales_rate`)                             |
| `most_abandoned_products[].total_quantity` | int    | Total units left in abandoned carts                              |
| `most_abandoned_products[].cart_count`     | int    | Distinct carts containing this product                           |

**Screen sections — Abandoned Carts Report**

| Widget                            | Data source               | Notes                                                                         |
| --------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| **4 KPI cards**                   | `stats.*`                 | Abandoned Carts / Potential Revenue / Recovery Rate / Avg Cart Value          |
| **Recovery rate card**            | `stats.recovery_rate`     | Always 0% — show "N/A" or greyed-out until platform tracks cart-to-order link |
| **Daily trend chart**             | `daily_trends`            | Line chart, x = date, y = abandoned_carts count                               |
| **Most abandoned products table** | `most_abandoned_products` | Columns: Product, Price, Qty in Carts, Cart Count                             |

---

## 7. TypeScript Interfaces

```typescript
// ==========================================
// COMMON
// ==========================================

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: Pagination;
    filters?: Record<string, string>;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}

// ==========================================
// SETTINGS
// ==========================================

interface EcommerceSettings {
    id: number;
    store_name: string;
    store_description: string | null;
    store_email: string | null;
    store_phone: string | null;
    store_address: string | null;
    store_logo_url: string | null;
    store_banner_url: string | null;
    store_url: string;
    currency: string;
    currency_symbol: string;
    tax_enabled: boolean;
    tax_rate: number;
    tax_name: string;
    shipping_enabled: boolean;
    free_shipping_threshold: number | null;
    minimum_order_amount: number | null;
    enable_guest_checkout: boolean;
    enable_customer_registration: boolean;
    enable_order_notifications: boolean;
    auto_confirm_orders: boolean;
    payment_methods: PaymentMethodsConfig;
    paystack_public_key: string | null;
    flutterwave_public_key: string | null;
    stripe_publishable_key: string | null;
    custom_css: string | null;
    custom_js: string | null;
    maintenance_mode: boolean;
    created_at: string;
    updated_at: string;
}

interface PaymentMethodsConfig {
    cash_on_delivery: boolean;
    bank_transfer: boolean;
    paystack: boolean;
    flutterwave: boolean;
    stripe: boolean;
    nomba: boolean;
}

// ==========================================
// ORDERS
// ==========================================

type OrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "partially_paid" | "refunded";
type PaymentMethod =
    | "cash_on_delivery"
    | "paystack"
    | "stripe"
    | "flutterwave"
    | "nomba"
    | "bank_transfer";

interface OrderListItem {
    id: number;
    order_number: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    items_count: number;
    has_invoice: boolean;
    created_at: string;
}

interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    total_revenue: number;
}

interface OrderDetail {
    id: number;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    payment_reference: string | null;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    coupon_code: string | null;
    notes: string | null;
    admin_notes: string | null;
    confirmed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    fulfilled_at: string | null;
    created_at: string;
    updated_at: string;
    customer: OrderCustomer | null;
    items: OrderItem[];
    shipping_address: ShippingAddress | null;
    billing_address: ShippingAddress | null;
    voucher: OrderVoucher | null;
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    product: {
        id: number;
        name: string;
        price: number;
    } | null;
}

interface OrderCustomer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
}

interface ShippingAddress {
    id: number;
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string | null;
    country: string;
    phone: string | null;
}

interface OrderVoucher {
    id: number;
    voucher_number: string;
    total_amount: number;
}

// ==========================================
// SHIPPING METHODS
// ==========================================

interface ShippingMethod {
    id: number;
    name: string;
    description: string | null;
    cost: number;
    estimated_days: number | null;
    is_active: boolean;
    created_at: string;
}

interface ShippingMethodForm {
    name: string;
    description?: string;
    cost: number;
    estimated_days?: number;
    is_active?: boolean;
}

// ==========================================
// COUPONS
// ==========================================

type CouponType = "percentage" | "fixed";

interface Coupon {
    id: number;
    code: string;
    description: string | null;
    type: CouponType;
    value: number;
    minimum_amount: number | null;
    maximum_discount: number | null;
    usage_limit: number | null;
    usage_count: number;
    is_active: boolean;
    is_expired: boolean;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string;
}

interface CouponDetail extends Coupon {
    updated_at: string;
    usages: CouponUsage[];
}

interface CouponUsage {
    id: number;
    discount_amount: number;
    used_at: string;
    customer: { id: number; name: string } | null;
    order: { id: number; order_number: string } | null;
}

interface CouponForm {
    code: string;
    description?: string;
    type: CouponType;
    value: number;
    minimum_amount?: number;
    maximum_discount?: number;
    usage_limit?: number;
    valid_from?: string;
    valid_to?: string;
    is_active?: boolean;
}

// ==========================================
// PAYOUTS
// ==========================================

type PayoutStatus =
    | "pending"
    | "approved"
    | "processing"
    | "completed"
    | "rejected"
    | "cancelled";

interface PayoutStats {
    total_revenue: number;
    available_balance: number;
    total_withdrawn: number;
    pending_withdrawals: number;
    this_month_revenue: number;
}

interface PayoutSettings {
    payouts_enabled: boolean;
    minimum_payout: number;
    maximum_payout: number;
    deduction_type: string;
    deduction_value: number;
    deduction_name: string;
    processing_time: string;
    payout_terms: string;
}

interface PayoutListItem {
    id: number;
    request_number: string;
    requested_amount: number;
    deduction_amount: number;
    net_amount: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    status: PayoutStatus;
    status_color: string;
    status_label: string;
    can_be_cancelled: boolean;
    payment_reference: string | null;
    requester: { id: number; name: string } | null;
    processed_at: string | null;
    created_at: string;
}

interface PayoutDetail extends PayoutListItem {
    deduction_type: string;
    deduction_rate: number;
    deduction_description: string;
    available_balance: number;
    bank_code: string | null;
    progress_percentage: number;
    notes: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    requester: { id: number; name: string; email: string } | null;
    processor: { id: number; name: string } | null;
    updated_at: string;
}

interface PayoutForm {
    requested_amount: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    bank_code?: string;
    notes?: string;
}

interface Bank {
    code: string;
    name: string;
}

interface DeductionPreview {
    requested_amount: number;
    deduction_amount: number;
    net_amount: number;
    deduction_description: string;
}

// ==========================================
// REPORTS
// ==========================================

interface OrderReportStats {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    cancelled_orders: number;
}

interface RevenueReportStats {
    current_revenue: number;
    previous_revenue: number;
    /** Percentage. Positive = growth, negative = decline. 0 if no previous period. */
    growth_rate: number;
    total_orders: number;
    average_order_value: number;
}

interface ProductReportStats {
    total_products_sold: number;
    total_quantity_sold: number;
    total_revenue: number;
    low_stock_count: number;
}

interface CustomerReportStats {
    /** All-time distinct customers with at least one order */
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    /** Orders placed without a customer account */
    guest_orders: number;
    registered_orders: number;
    /** All-time average total spend per customer */
    average_lifetime_value: number;
}

interface AbandonedCartStats {
    abandoned_carts: number;
    potential_revenue: number;
    /** Always 0.0 — cart-to-order link not yet tracked */
    recovery_rate: number;
    average_cart_value: number;
}

interface OrdersByStatus {
    status: string;
    count: number;
    total: number;
}

interface OrdersByPayment {
    payment_status: string;
    count: number;
    total: number;
}

interface DailyOrderTrend {
    date: string; // YYYY-MM-DD
    orders: number;
    revenue: number;
}

interface DailyAbandonedTrend {
    date: string; // YYYY-MM-DD
    abandoned_carts: number;
}

interface PaymentMethodSummary {
    payment_method: string;
    count: number;
    total: number;
}

interface MonthlyRevenue {
    month: string; // YYYY-MM
    orders: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
}

interface RevenueByPayment {
    payment_status: string;
    total: number;
}

interface RevenueByMethod {
    payment_method: string;
    total: number;
    count: number;
}

interface TopProduct {
    product_id: number;
    product_name: string;
    /** Current selling price (sales_rate) */
    product_price?: number;
    category?: string | null;
    total_quantity: number;
    total_revenue: number;
    order_count?: number;
}

interface CategoryPerformance {
    category: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
}

interface LowStockProduct {
    product_id: number;
    name: string;
    current_stock: number;
    reorder_level: number;
    sold_quantity: number;
}

interface TopCustomer {
    customer_id: number;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    order_count: number;
    total_spent: number;
    avg_order_value: number;
    last_order_date: string;
}

/** Keys: "< 10,000" | "10,000 - 50,000" | "50,000 - 100,000" | "100,000 - 500,000" | "500,000+" */
type LifetimeValueSegments = Record<string, number>;

interface AbandonedProduct {
    id: number;
    name: string;
    /** Selling price (sales_rate column) */
    price: number;
    total_quantity: number;
    cart_count: number;
}

// Full report response shapes
interface OrderReportData {
    stats: OrderReportStats;
    orders_by_status: OrdersByStatus[];
    orders_by_payment: OrdersByPayment[];
    daily_trends: DailyOrderTrend[];
    payment_methods: PaymentMethodSummary[];
    top_products: TopProduct[];
}

interface RevenueReportData {
    stats: RevenueReportStats;
    monthly_revenue: MonthlyRevenue[];
    revenue_by_payment: RevenueByPayment[];
    revenue_by_method: RevenueByMethod[];
}

interface ProductReportData {
    stats: ProductReportStats;
    top_by_revenue: TopProduct[];
    top_by_quantity: TopProduct[];
    category_performance: CategoryPerformance[];
    low_stock_products: LowStockProduct[];
}

interface CustomerReportData {
    stats: CustomerReportStats;
    top_customers: TopCustomer[];
    lifetime_value_segments: LifetimeValueSegments;
}

interface AbandonedCartReportData {
    stats: AbandonedCartStats;
    daily_trends: DailyAbandonedTrend[];
    most_abandoned_products: AbandonedProduct[];
}
```

---

## 8. Screens & Components Architecture

### Suggested Screens

| Screen                      | Route                          | Description                      |
| --------------------------- | ------------------------------ | -------------------------------- |
| `EcommerceSettingsScreen`   | `/ecommerce/settings`          | View/edit store settings         |
| `OrderListScreen`           | `/ecommerce/orders`            | Orders list with filters & stats |
| `OrderDetailScreen`         | `/ecommerce/orders/:id`        | Order detail with status actions |
| `ShippingMethodsScreen`     | `/ecommerce/shipping`          | List shipping methods            |
| `ShippingMethodFormScreen`  | `/ecommerce/shipping/new`      | Create/edit shipping method      |
| `CouponListScreen`          | `/ecommerce/coupons`           | List coupons with filters        |
| `CouponFormScreen`          | `/ecommerce/coupons/new`       | Create/edit coupon               |
| `CouponDetailScreen`        | `/ecommerce/coupons/:id`       | Coupon detail with usage history |
| `PayoutDashboardScreen`     | `/ecommerce/payouts`           | Payout dashboard with stats      |
| `PayoutRequestScreen`       | `/ecommerce/payouts/new`       | Submit payout request form       |
| `PayoutDetailScreen`        | `/ecommerce/payouts/:id`       | Payout detail with progress      |
| `ReportsDashboardScreen`    | `/ecommerce/reports`           | Reports index                    |
| `OrderReportScreen`         | `/ecommerce/reports/orders`    | Order analytics                  |
| `RevenueReportScreen`       | `/ecommerce/reports/revenue`   | Revenue analytics                |
| `ProductReportScreen`       | `/ecommerce/reports/products`  | Product performance              |
| `CustomerReportScreen`      | `/ecommerce/reports/customers` | Customer analytics               |
| `AbandonedCartReportScreen` | `/ecommerce/reports/abandoned` | Cart abandonment                 |

### Suggested Hooks

```typescript
// Settings
useEcommerceSettings(); // GET & cache settings
useUpdateSettings(); // POST settings update
useQrCode(); // GET QR code

// Orders
useOrders(filters); // GET paginated orders + stats
useOrder(orderId); // GET order detail
useUpdateOrderStatus(); // PUT status change
useUpdatePaymentStatus(); // PUT payment status change
useCreateInvoice(); // POST manual invoice

// Shipping
useShippingMethods(); // GET all shipping methods
useCreateShippingMethod(); // POST new shipping method
useUpdateShippingMethod(); // PUT update
useDeleteShippingMethod(); // DELETE
useToggleShippingMethod(); // POST toggle

// Coupons
useCoupons(filters); // GET paginated coupons
useCoupon(couponId); // GET coupon detail
useCreateCoupon(); // POST new coupon
useUpdateCoupon(); // PUT update
useDeleteCoupon(); // DELETE
useToggleCoupon(); // POST toggle

// Payouts
usePayouts(); // GET payouts dashboard + list
usePayoutFormData(); // GET form data (banks, balance)
useDeductionPreview(); // POST calculate deduction
useSubmitPayout(); // POST submit payout request
usePayout(payoutId); // GET payout detail
useCancelPayout(); // POST cancel

// Reports
useOrderReport(dateRange); // GET order report
useRevenueReport(dateRange); // GET revenue report
useProductReport(dateRange); // GET product report
useCustomerReport(dateRange); // GET customer report
useAbandonedCartReport(dateRange); // GET abandoned carts
```

### Reusable Components

```
components/
├── ecommerce/
│   ├── StatsCard.tsx              # Revenue/count stat card
│   ├── OrderStatusBadge.tsx       # Color-coded status badge
│   ├── PaymentStatusBadge.tsx     # Payment status badge
│   ├── PayoutStatusBadge.tsx      # Payout status with progress
│   ├── OrderFilters.tsx           # Status/payment/date filters
│   ├── DateRangeFilter.tsx        # Reusable date range picker
│   ├── BankSelector.tsx           # Nigerian banks dropdown
│   ├── DeductionPreview.tsx       # Shows amount/deduction/net
│   ├── CouponTypeBadge.tsx        # percentage/fixed badge
│   ├── ShippingMethodCard.tsx     # Shipping method display card
│   └── charts/
│       ├── BarChart.tsx           # Daily trends, status breakdown
│       ├── LineChart.tsx          # Monthly revenue trends
│       ├── PieChart.tsx           # Payment methods, categories
│       └── ProgressBar.tsx        # Payout progress indicator
```

---

## 9. Navigation Flow

```
E-commerce (Tab/Drawer)
├── Dashboard → (future)
├── Orders
│   ├── Order List (filters: status, payment, date, search)
│   └── Order Detail
│       ├── Update Status → confirmation dialog
│       ├── Update Payment Status → confirmation dialog
│       └── Create Invoice → confirmation dialog
├── Settings
│   ├── Store Info (name, description, contact)
│   ├── Payment Configuration
│   ├── Tax & Shipping Options
│   └── QR Code (share store link)
├── Shipping Methods
│   ├── List (with toggle switches)
│   └── Add/Edit Form
├── Coupons
│   ├── List (with toggle switches, status filter)
│   ├── Add/Edit Form
│   └── Detail (usage history)
├── Payouts
│   ├── Dashboard (stats + history)
│   ├── Request Payout (bank form + deduction preview)
│   └── Payout Detail (progress tracker)
└── Reports
    ├── Order Analytics (charts + tables)
    ├── Revenue Analysis (growth rate, monthly trends)
    ├── Product Performance (top products, categories, low stock)
    ├── Customer Insights (top customers, LTV segments, new vs returning)
    └── Abandoned Carts (trends, most abandoned products, recovery rate)
```

---

## Error Handling

All endpoints follow the same error response pattern:

**Validation Error (422):**

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

**Not Found (404):**

```json
{
    "success": false,
    "message": "Resource not found."
}
```

**Server Error (500):**

```json
{
    "success": false,
    "message": "Failed to perform action."
}
```

**Authentication Error (401):**

```json
{
    "message": "Unauthenticated."
}
```

---

## Endpoint Summary

| #   | Method | Endpoint                                  | Description                |
| --- | ------ | ----------------------------------------- | -------------------------- |
| 1   | GET    | `/ecommerce/settings`                     | Get store settings         |
| 2   | POST   | `/ecommerce/settings`                     | Update store settings      |
| 3   | GET    | `/ecommerce/settings/qr-code`             | Generate QR code           |
| 4   | GET    | `/ecommerce/orders`                       | List orders with stats     |
| 5   | GET    | `/ecommerce/orders/{id}`                  | Order detail               |
| 6   | PUT    | `/ecommerce/orders/{id}/status`           | Update order status        |
| 7   | PUT    | `/ecommerce/orders/{id}/payment-status`   | Update payment status      |
| 8   | POST   | `/ecommerce/orders/{id}/invoice`          | Create invoice             |
| 9   | GET    | `/ecommerce/shipping-methods`             | List shipping methods      |
| 10  | POST   | `/ecommerce/shipping-methods`             | Create shipping method     |
| 11  | GET    | `/ecommerce/shipping-methods/{id}`        | Show shipping method       |
| 12  | PUT    | `/ecommerce/shipping-methods/{id}`        | Update shipping method     |
| 13  | DELETE | `/ecommerce/shipping-methods/{id}`        | Delete shipping method     |
| 14  | POST   | `/ecommerce/shipping-methods/{id}/toggle` | Toggle active status       |
| 15  | GET    | `/ecommerce/coupons`                      | List coupons               |
| 16  | POST   | `/ecommerce/coupons`                      | Create coupon              |
| 17  | GET    | `/ecommerce/coupons/{id}`                 | Show coupon detail         |
| 18  | PUT    | `/ecommerce/coupons/{id}`                 | Update coupon              |
| 19  | DELETE | `/ecommerce/coupons/{id}`                 | Delete coupon              |
| 20  | POST   | `/ecommerce/coupons/{id}/toggle`          | Toggle coupon status       |
| 21  | GET    | `/ecommerce/payouts`                      | List payouts with stats    |
| 22  | GET    | `/ecommerce/payouts/create`               | Get payout form data       |
| 23  | POST   | `/ecommerce/payouts`                      | Submit payout request      |
| 24  | GET    | `/ecommerce/payouts/{id}`                 | Payout detail              |
| 25  | POST   | `/ecommerce/payouts/{id}/cancel`          | Cancel payout              |
| 26  | POST   | `/ecommerce/payouts/calculate-deduction`  | Preview deduction          |
| 27  | GET    | `/ecommerce/reports/orders`               | Order analytics report     |
| 28  | GET    | `/ecommerce/reports/revenue`              | Revenue analysis report    |
| 29  | GET    | `/ecommerce/reports/products`             | Product performance report |
| 30  | GET    | `/ecommerce/reports/customers`            | Customer analytics report  |
| 31  | GET    | `/ecommerce/reports/abandoned-carts`      | Abandoned carts report     |
