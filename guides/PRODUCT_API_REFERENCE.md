# Product Management API - Complete Reference

## Table of Contents

1. [Overview](#overview)
2. [Product Management Flow](#product-management-flow)
3. [Authentication](#authentication)
4. [Base URL](#base-url)
5. [Endpoints](#endpoints)
6. [Data Models](#data-models)
7. [Filters & Sorting](#filters--sorting)
8. [Error Handling](#error-handling)
9. [Examples](#examples)

---

## Overview

The Product Management API provides comprehensive endpoints for managing products and services in your inventory. It supports full CRUD operations, stock tracking, bulk actions, and advanced filtering capabilities.

### Key Features

-   ✅ Create, read, update, and delete products
-   ✅ Support for both physical items and services
-   ✅ Real-time stock tracking with date-based calculations
-   ✅ Advanced search and filtering
-   ✅ Bulk operations (activate, deactivate, delete)
-   ✅ Stock movement history
-   ✅ Product statistics and analytics
-   ✅ Ledger account integration
-   ✅ Multi-unit support
-   ✅ Category management
-   ✅ E-commerce ready fields

---

## Product Management Flow

### 1. **List Products** (Dashboard View)

User opens the product list screen to view all products with filters.

**Flow:**

```
User → Product List Screen → API: GET /products
→ Display products with pagination
→ Apply filters (category, type, status, stock level)
→ Search by name/SKU/barcode
```

### 2. **Create New Product**

User wants to add a new product or service.

**Flow:**

```
User → Click "Add Product" → API: GET /products/create
→ Load categories, units, ledger accounts
→ User fills form
→ API: POST /products
→ Product created → Navigate to product details
```

### 3. **View Product Details**

User clicks on a product to see full details.

**Flow:**

```
User → Click Product → API: GET /products/{id}
→ Display product info, stock, pricing, accounts
→ Show stock movements button
```

### 4. **Edit Product**

User updates product information.

**Flow:**

```
User → Product Details → Click "Edit"
→ API: GET /products/create (for dropdown data)
→ Pre-fill form with current data
→ User makes changes
→ API: PUT /products/{id}
→ Product updated → Refresh details
```

### 5. **Manage Stock**

User views stock movements and history.

**Flow:**

```
User → Product Details → "Stock Movements"
→ API: GET /products/{id}/stock-movements
→ Display transaction history with filters
→ Show running balance
```

### 6. **Toggle Status**

User activates or deactivates a product.

**Flow:**

```
User → Product List/Details → Toggle switch
→ API: POST /products/{id}/toggle-status
→ Status changed → Update UI
```

### 7. **Bulk Actions**

User performs actions on multiple products.

**Flow:**

```
User → Select multiple products → Choose action
→ API: POST /products/bulk-action
→ Action applied → Refresh list
```

### 8. **Search Products**

User searches for products (e.g., in invoice creation).

**Flow:**

```
User → Start typing in search field
→ API: GET /products/search?q={query}
→ Display autocomplete results
→ User selects product
```

---

## Authentication

All endpoints require authentication using Laravel Sanctum Bearer tokens.

**Header:**

```
Authorization: Bearer {your-token-here}
```

**Getting a Token:**

```http
POST /api/v1/tenant/{tenant}/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "token": "1|abcdef123456...",
        "user": { ... }
    }
}
```

---

## Base URL

```
https://yourdomain.com/api/v1/tenant/{tenant}/inventory/products
```

Replace `{tenant}` with your tenant slug (e.g., `demo-company`).

---

## Endpoints

### 1. Get Form Data (Create Product)

**Endpoint:** `GET /products/create`

**Description:** Retrieves all necessary data for the product creation form including categories, units, and ledger accounts.

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products/create
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "categories": [
            {
                "id": 1,
                "name": "Electronics",
                "description": "Electronic products"
            },
            {
                "id": 2,
                "name": "Furniture",
                "description": "Office furniture"
            }
        ],
        "units": [
            {
                "id": 1,
                "name": "Piece",
                "short_name": "pcs"
            },
            {
                "id": 2,
                "name": "Kilogram",
                "short_name": "kg"
            },
            {
                "id": 3,
                "name": "Hour",
                "short_name": "hr"
            }
        ],
        "ledger_accounts": [
            {
                "id": 101,
                "name": "Stock in Hand",
                "account_code": "1500",
                "account_type": "asset"
            },
            {
                "id": 201,
                "name": "Sales",
                "account_code": "4000",
                "account_type": "income"
            },
            {
                "id": 301,
                "name": "Purchase",
                "account_code": "5000",
                "account_type": "expense"
            }
        ],
        "default_accounts": {
            "stock": {
                "id": 101,
                "name": "Stock in Hand"
            },
            "sales": {
                "id": 201,
                "name": "Sales"
            },
            "purchase": {
                "id": 301,
                "name": "Purchase"
            }
        }
    }
}
```

**Usage in React Native:**

```javascript
const loadCreateData = async () => {
    const response = await api.get(`/inventory/products/create`);
    setCategories(response.data.categories);
    setUnits(response.data.units);
    setLedgerAccounts(response.data.ledger_accounts);
    setDefaultAccounts(response.data.default_accounts);
};
```

---

### 2. Create Product

**Endpoint:** `POST /products`

**Description:** Creates a new product or service.

**Request:**

```http
POST /api/v1/tenant/demo-company/inventory/products
Authorization: Bearer {token}
Content-Type: application/json
```

**Payload:**

```json
{
    "type": "item",
    "name": "Laptop Dell Inspiron 15",
    "sku": "LAP-DEL-001",
    "description": "15.6 inch laptop with Intel i5 processor",
    "category_id": 1,
    "brand": "Dell",
    "hsn_code": "84713010",
    "barcode": "1234567890123",
    "purchase_rate": 45000,
    "sales_rate": 55000,
    "mrp": 60000,
    "primary_unit_id": 1,
    "opening_stock": 10,
    "reorder_level": 5,
    "maintain_stock": true,
    "stock_asset_account_id": 101,
    "sales_account_id": 201,
    "purchase_account_id": 301,
    "tax_rate": 18,
    "is_active": true,
    "is_visible_online": true,
    "is_featured": false,
    "slug": "laptop-dell-inspiron-15",
    "meta_title": "Dell Inspiron 15 Laptop",
    "meta_description": "Buy Dell Inspiron 15 laptop online"
}
```

**Minimal Payload (Required Fields Only):**

```json
{
    "type": "item",
    "name": "Basic Product",
    "purchase_rate": 100,
    "sales_rate": 150,
    "primary_unit_id": 1
}
```

**Service Example:**

```json
{
    "type": "service",
    "name": "IT Consultation",
    "description": "Hourly IT consultation service",
    "purchase_rate": 500,
    "sales_rate": 1000,
    "primary_unit_id": 3,
    "sales_account_id": 201,
    "tax_rate": 18,
    "is_active": true,
    "maintain_stock": false
}
```

**Response:** `201 Created`

```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "id": 45,
        "type": "item",
        "name": "Laptop Dell Inspiron 15",
        "sku": "LAP-DEL-001",
        "slug": "laptop-dell-inspiron-15",
        "description": "15.6 inch laptop with Intel i5 processor",
        "brand": "Dell",
        "hsn_code": "84713010",
        "barcode": "1234567890123",
        "purchase_rate": 45000,
        "sales_rate": 55000,
        "mrp": 60000,
        "tax_rate": 18,
        "current_stock": 10,
        "opening_stock": 10,
        "reorder_level": 5,
        "maintain_stock": true,
        "is_active": true,
        "is_visible_online": true,
        "is_featured": false,
        "category": {
            "id": 1,
            "name": "Electronics"
        },
        "primary_unit": {
            "id": 1,
            "name": "Piece",
            "short_name": "pcs"
        },
        "created_at": "2025-12-31T10:30:00.000000Z",
        "updated_at": "2025-12-31T10:30:00.000000Z"
    }
}
```

**Validation Errors:** `422 Unprocessable Entity`

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "name": ["The name field is required."],
        "purchase_rate": ["The purchase rate must be at least 0."],
        "sku": ["The sku has already been taken."]
    }
}
```

---

### 3. List Products

**Endpoint:** `GET /products`

**Description:** Retrieves a paginated list of products with filtering, searching, and sorting capabilities.

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products?page=1&per_page=15
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter          | Type    | Default          | Description                                              |
| ------------------ | ------- | ---------------- | -------------------------------------------------------- |
| `page`             | integer | 1                | Page number                                              |
| `per_page`         | integer | 15               | Items per page (max 100)                                 |
| `search`           | string  | -                | Search in name, SKU, barcode, description                |
| `category_id`      | integer | -                | Filter by category ID                                    |
| `type`             | string  | -                | Filter by type: `item` or `service`                      |
| `status`           | string  | -                | Filter by status: `active` or `inactive`                 |
| `stock_status`     | string  | -                | Filter by stock: `in_stock`, `low_stock`, `out_of_stock` |
| `as_of_date`       | date    | today            | Calculate stock as of this date (YYYY-MM-DD)             |
| `valuation_method` | string  | weighted_average | Stock valuation method                                   |
| `sort_by`          | string  | created_at       | Sort field: `name`, `sku`, `created_at`, `updated_at`    |
| `sort_order`       | string  | desc             | Sort order: `asc` or `desc`                              |

**Example Requests:**

```http
# Search products
GET /products?search=laptop

# Filter by category
GET /products?category_id=1

# Filter active items only
GET /products?type=item&status=active

# Low stock products
GET /products?stock_status=low_stock

# Stock as of specific date
GET /products?as_of_date=2025-12-01

# Sort by name ascending
GET /products?sort_by=name&sort_order=asc

# Combined filters
GET /products?type=item&category_id=1&status=active&search=dell
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "products": [
            {
                "id": 45,
                "type": "item",
                "name": "Laptop Dell Inspiron 15",
                "sku": "LAP-DEL-001",
                "slug": "laptop-dell-inspiron-15",
                "description": "15.6 inch laptop with Intel i5 processor",
                "brand": "Dell",
                "hsn_code": "84713010",
                "barcode": "1234567890123",
                "purchase_rate": 45000,
                "sales_rate": 55000,
                "mrp": 60000,
                "tax_rate": 18,
                "current_stock": 8,
                "opening_stock": 10,
                "reorder_level": 5,
                "maintain_stock": true,
                "is_active": true,
                "is_visible_online": true,
                "is_featured": false,
                "category": {
                    "id": 1,
                    "name": "Electronics"
                },
                "primary_unit": {
                    "id": 1,
                    "name": "Piece",
                    "short_name": "pcs"
                },
                "created_at": "2025-12-31T10:30:00.000000Z",
                "updated_at": "2025-12-31T10:30:00.000000Z"
            },
            {
                "id": 46,
                "type": "service",
                "name": "IT Consultation",
                "sku": "SVC-IT-001",
                "slug": "it-consultation",
                "description": "Hourly IT consultation service",
                "brand": null,
                "hsn_code": "998314",
                "barcode": null,
                "purchase_rate": 500,
                "sales_rate": 1000,
                "mrp": 1000,
                "tax_rate": 18,
                "current_stock": 0,
                "opening_stock": 0,
                "reorder_level": 0,
                "maintain_stock": false,
                "is_active": true,
                "is_visible_online": false,
                "is_featured": false,
                "category": null,
                "primary_unit": {
                    "id": 3,
                    "name": "Hour",
                    "short_name": "hr"
                },
                "created_at": "2025-12-31T11:00:00.000000Z",
                "updated_at": "2025-12-31T11:00:00.000000Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 15,
            "total": 45,
            "last_page": 3,
            "from": 1,
            "to": 15
        }
    }
}
```

---

### 4. Get Product Details

**Endpoint:** `GET /products/{id}`

**Description:** Retrieves complete details of a specific product including relationships and calculated stock.

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products/45
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "id": 45,
        "type": "item",
        "name": "Laptop Dell Inspiron 15",
        "sku": "LAP-DEL-001",
        "slug": "laptop-dell-inspiron-15",
        "description": "15.6 inch laptop with Intel i5 processor",
        "brand": "Dell",
        "hsn_code": "84713010",
        "barcode": "1234567890123",
        "purchase_rate": 45000,
        "sales_rate": 55000,
        "mrp": 60000,
        "tax_rate": 18,
        "current_stock": 8,
        "opening_stock": 10,
        "reorder_level": 5,
        "maintain_stock": true,
        "is_active": true,
        "is_visible_online": true,
        "is_featured": false,
        "meta_title": "Dell Inspiron 15 Laptop",
        "meta_description": "Buy Dell Inspiron 15 laptop online",
        "stock_value": 360000,
        "category": {
            "id": 1,
            "name": "Electronics"
        },
        "primary_unit": {
            "id": 1,
            "name": "Piece",
            "short_name": "pcs"
        },
        "stock_asset_account": {
            "id": 101,
            "name": "Stock in Hand",
            "account_code": "1500"
        },
        "sales_account": {
            "id": 201,
            "name": "Sales",
            "account_code": "4000"
        },
        "purchase_account": {
            "id": 301,
            "name": "Purchase",
            "account_code": "5000"
        },
        "images": [
            {
                "id": 1,
                "url": "https://example.com/storage/products/laptop1.jpg",
                "is_primary": true
            },
            {
                "id": 2,
                "url": "https://example.com/storage/products/laptop2.jpg",
                "is_primary": false
            }
        ],
        "created_at": "2025-12-31T10:30:00.000000Z",
        "updated_at": "2025-12-31T10:30:00.000000Z"
    }
}
```

**Error Response:** `404 Not Found`

```json
{
    "success": false,
    "message": "Product not found"
}
```

---

### 5. Update Product

**Endpoint:** `PUT /products/{id}`

**Description:** Updates an existing product. All fields are optional except required validation rules.

**Request:**

```http
PUT /api/v1/tenant/demo-company/inventory/products/45
Authorization: Bearer {token}
Content-Type: application/json
```

**Payload:**

```json
{
    "name": "Laptop Dell Inspiron 15 (Updated)",
    "sales_rate": 58000,
    "mrp": 62000,
    "is_featured": true,
    "reorder_level": 3
}
```

**Full Update Payload:**

```json
{
    "type": "item",
    "name": "Laptop Dell Inspiron 15 3000 Series",
    "sku": "LAP-DEL-001",
    "description": "15.6 inch laptop with Intel i5 11th gen processor",
    "category_id": 1,
    "brand": "Dell",
    "hsn_code": "84713010",
    "barcode": "1234567890123",
    "purchase_rate": 46000,
    "sales_rate": 58000,
    "mrp": 62000,
    "primary_unit_id": 1,
    "reorder_level": 3,
    "maintain_stock": true,
    "stock_asset_account_id": 101,
    "sales_account_id": 201,
    "purchase_account_id": 301,
    "tax_rate": 18,
    "is_active": true,
    "is_visible_online": true,
    "is_featured": true,
    "slug": "laptop-dell-inspiron-15-3000",
    "meta_title": "Dell Inspiron 15 3000 Series Laptop",
    "meta_description": "Buy Dell Inspiron 15 3000 series laptop online"
}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {
        "id": 45,
        "type": "item",
        "name": "Laptop Dell Inspiron 15 (Updated)",
        "sku": "LAP-DEL-001",
        "sales_rate": 58000,
        "mrp": 62000,
        "is_featured": true,
        "reorder_level": 3,
        "category": { ... },
        "primary_unit": { ... },
        "updated_at": "2025-12-31T14:20:00.000000Z"
    }
}
```

---

### 6. Delete Product

**Endpoint:** `DELETE /products/{id}`

**Description:** Deletes a product. Only products without stock movements can be deleted.

**Request:**

```http
DELETE /api/v1/tenant/demo-company/inventory/products/45
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "message": "Product deleted successfully"
}
```

**Error Response (Has Transactions):** `422 Unprocessable Entity`

```json
{
    "success": false,
    "message": "Cannot delete product with stock movements. Please deactivate instead."
}
```

---

### 7. Toggle Product Status

**Endpoint:** `POST /products/{id}/toggle-status`

**Description:** Activates or deactivates a product (toggles `is_active` field).

**Request:**

```http
POST /api/v1/tenant/demo-company/inventory/products/45/toggle-status
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "message": "Product activated successfully",
    "data": {
        "id": 45,
        "name": "Laptop Dell Inspiron 15",
        "is_active": true,
        ...
    }
}
```

---

### 8. Get Stock Movements

**Endpoint:** `GET /products/{id}/stock-movements`

**Description:** Retrieves the stock movement history for a product with pagination and filters.

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products/45/stock-movements
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter          | Type    | Default     | Description                                                               |
| ------------------ | ------- | ----------- | ------------------------------------------------------------------------- |
| `from_date`        | date    | 1 month ago | Start date (YYYY-MM-DD)                                                   |
| `to_date`          | date    | today       | End date (YYYY-MM-DD)                                                     |
| `transaction_type` | string  | -           | Filter by type: `opening_balance`, `purchase`, `sale`, `adjustment`, etc. |
| `per_page`         | integer | 50          | Items per page                                                            |

**Example Requests:**

```http
# Last 7 days
GET /products/45/stock-movements?from_date=2025-12-24&to_date=2025-12-31

# Specific transaction type
GET /products/45/stock-movements?transaction_type=purchase

# Custom pagination
GET /products/45/stock-movements?per_page=100
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "movements": [
            {
                "id": 150,
                "transaction_type": "sale",
                "transaction_date": "2025-12-30",
                "quantity": -2,
                "rate": 45000,
                "amount": -90000,
                "balance_quantity": 8,
                "description": "Sold via Invoice INV-2025-0045",
                "reference_number": "INV-2025-0045",
                "created_by": "John Doe",
                "created_at": "2025-12-30T15:30:00.000000Z"
            },
            {
                "id": 148,
                "transaction_type": "purchase",
                "transaction_date": "2025-12-28",
                "quantity": 5,
                "rate": 44000,
                "amount": 220000,
                "balance_quantity": 10,
                "description": "Purchased from Supplier ABC",
                "reference_number": "PO-2025-0032",
                "created_by": "Jane Smith",
                "created_at": "2025-12-28T10:15:00.000000Z"
            },
            {
                "id": 120,
                "transaction_type": "opening_balance",
                "transaction_date": "2025-12-01",
                "quantity": 5,
                "rate": 45000,
                "amount": 225000,
                "balance_quantity": 5,
                "description": "Opening stock",
                "reference_number": null,
                "created_by": "System",
                "created_at": "2025-12-01T00:00:00.000000Z"
            }
        ],
        "starting_stock": 5,
        "pagination": {
            "current_page": 1,
            "per_page": 50,
            "total": 8,
            "last_page": 1
        }
    }
}
```

---

### 9. Bulk Actions

**Endpoint:** `POST /products/bulk-action`

**Description:** Performs bulk operations on multiple products (activate, deactivate, or delete).

**Request:**

```http
POST /api/v1/tenant/demo-company/inventory/products/bulk-action
Authorization: Bearer {token}
Content-Type: application/json
```

**Payload:**

```json
{
    "action": "activate",
    "product_ids": [45, 46, 47, 48]
}
```

**Actions:**

-   `activate` - Activates all selected products
-   `deactivate` - Deactivates all selected products
-   `delete` - Deletes all selected products (only if they have no stock movements)

**Response:** `200 OK`

```json
{
    "success": true,
    "message": "Bulk action completed. Success: 4, Failed: 0",
    "data": {
        "success_count": 4,
        "failed_count": 0
    }
}
```

**Partial Success Response:**

```json
{
    "success": true,
    "message": "Bulk action completed. Success: 3, Failed: 1",
    "data": {
        "success_count": 3,
        "failed_count": 1
    }
}
```

---

### 10. Search Products (Autocomplete)

**Endpoint:** `GET /products/search`

**Description:** Fast search for products, typically used in autocomplete fields (e.g., invoice line items).

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products/search?q=laptop
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter     | Type    | Default | Description                         |
| ------------- | ------- | ------- | ----------------------------------- |
| `q`           | string  | -       | Search query (name, SKU, barcode)   |
| `limit`       | integer | 10      | Maximum results to return           |
| `type`        | string  | -       | Filter by type: `item` or `service` |
| `active_only` | boolean | true    | Show only active products           |

**Example Requests:**

```http
# Basic search
GET /products/search?q=laptop

# Search items only
GET /products/search?q=dell&type=item

# Include inactive products
GET /products/search?q=laptop&active_only=false

# Limit results
GET /products/search?q=l&limit=5
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": [
        {
            "id": 45,
            "name": "Laptop Dell Inspiron 15",
            "sku": "LAP-DEL-001",
            "type": "item",
            "purchase_rate": 45000,
            "sales_rate": 55000,
            "mrp": 60000,
            "current_stock": 8,
            "primary_unit": {
                "id": 1,
                "name": "Piece",
                "short_name": "pcs"
            },
            "category": {
                "id": 1,
                "name": "Electronics"
            }
        },
        {
            "id": 48,
            "name": "Laptop HP Pavilion",
            "sku": "LAP-HP-001",
            "type": "item",
            "purchase_rate": 42000,
            "sales_rate": 52000,
            "mrp": 56000,
            "current_stock": 5,
            "primary_unit": {
                "id": 1,
                "name": "Piece",
                "short_name": "pcs"
            },
            "category": {
                "id": 1,
                "name": "Electronics"
            }
        }
    ]
}
```

---

### 11. Get Product Statistics

**Endpoint:** `GET /products/statistics`

**Description:** Retrieves summary statistics about products in the inventory.

**Request:**

```http
GET /api/v1/tenant/demo-company/inventory/products/statistics
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "total_products": 150,
        "active_products": 142,
        "inactive_products": 8,
        "low_stock_products": 12,
        "out_of_stock_products": 5,
        "total_categories": 15
    }
}
```

---

## Data Models

### Product Model

```typescript
interface Product {
    id: number;
    type: "item" | "service";
    name: string;
    sku: string | null;
    slug: string | null;
    description: string | null;
    brand: string | null;
    hsn_code: string | null;
    barcode: string | null;
    purchase_rate: number;
    sales_rate: number;
    mrp: number | null;
    tax_rate: number | null;
    current_stock: number;
    opening_stock: number | null;
    reorder_level: number | null;
    maintain_stock: boolean;
    is_active: boolean;
    is_visible_online: boolean;
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
    stock_value?: number; // Calculated field
    category: Category | null;
    primary_unit: Unit;
    stock_asset_account?: LedgerAccount | null;
    sales_account?: LedgerAccount | null;
    purchase_account?: LedgerAccount | null;
    images?: ProductImage[];
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Unit {
    id: number;
    name: string;
    short_name: string;
}

interface LedgerAccount {
    id: number;
    name: string;
    account_code: string;
    account_type?: string;
}

interface ProductImage {
    id: number;
    url: string;
    is_primary: boolean;
}

interface StockMovement {
    id: number;
    transaction_type: string;
    transaction_date: string;
    quantity: number;
    rate: number;
    amount: number;
    balance_quantity: number;
    description: string | null;
    reference_number: string | null;
    created_by: string | null;
    created_at: string;
}
```

---

## Filters & Sorting

### Available Filters

#### 1. **Search** (`search`)

Searches across multiple fields:

-   Product name
-   SKU
-   Barcode
-   Description

**Example:**

```http
GET /products?search=dell laptop
```

#### 2. **Category** (`category_id`)

Filter by product category.

**Example:**

```http
GET /products?category_id=1
```

#### 3. **Type** (`type`)

Filter by product type:

-   `item` - Physical products
-   `service` - Services

**Example:**

```http
GET /products?type=item
```

#### 4. **Status** (`status`)

Filter by active status:

-   `active` - Active products only
-   `inactive` - Inactive products only

**Example:**

```http
GET /products?status=active
```

#### 5. **Stock Status** (`stock_status`)

Filter by stock level:

-   `in_stock` - Products with stock > 0
-   `low_stock` - Products below reorder level
-   `out_of_stock` - Products with stock = 0

**Example:**

```http
GET /products?stock_status=low_stock
```

#### 6. **Date-Based Stock** (`as_of_date`)

Calculate stock as of a specific date.

**Example:**

```http
GET /products?as_of_date=2025-12-01
```

### Sorting

**Sort By** (`sort_by`):

-   `name` - Product name
-   `sku` - SKU code
-   `created_at` - Creation date
-   `updated_at` - Last update date

**Sort Order** (`sort_order`):

-   `asc` - Ascending
-   `desc` - Descending

**Example:**

```http
GET /products?sort_by=name&sort_order=asc
```

### Combined Filtering Example

```http
GET /products?
    type=item&
    category_id=1&
    status=active&
    stock_status=in_stock&
    search=dell&
    sort_by=name&
    sort_order=asc&
    per_page=20&
    page=1
```

---

## Error Handling

### Standard Error Responses

#### 400 Bad Request

```json
{
    "success": false,
    "message": "Invalid request parameters"
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "message": "Unauthenticated"
}
```

#### 404 Not Found

```json
{
    "success": false,
    "message": "Product not found"
}
```

#### 422 Unprocessable Entity (Validation Error)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "name": ["The name field is required."],
        "purchase_rate": ["The purchase rate must be at least 0."],
        "primary_unit_id": ["The selected primary unit id is invalid."]
    }
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "message": "Failed to create product",
    "error": "Database connection error"
}
```

---

## Examples

### React Native Implementation

#### 1. Product List Screen

```javascript
import React, { useState, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import axios from "axios";

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        type: "",
        category_id: "",
        status: "active",
        stock_status: "",
    });

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "/api/v1/tenant/demo-company/inventory/products",
                {
                    params: {
                        page,
                        per_page: 20,
                        search,
                        ...filters,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (page === 1) {
                setProducts(response.data.data.products);
            } else {
                setProducts([...products, ...response.data.data.products]);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, search, filters]);

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
                navigation.navigate("ProductDetails", { id: item.id })
            }
        >
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productSku}>{item.sku}</Text>
            <Text style={styles.productPrice}>₹{item.sales_rate}</Text>
            <Text style={styles.productStock}>
                Stock: {item.current_stock} {item.primary_unit?.short_name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={search}
                onChangeText={setSearch}
            />
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={() => setPage(page + 1)}
                onEndReachedThreshold={0.5}
                refreshing={loading}
                onRefresh={() => {
                    setPage(1);
                    loadProducts();
                }}
            />
        </View>
    );
};
```

#### 2. Create Product Screen

```javascript
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, ScrollView, Picker } from "react-native";
import axios from "axios";

const CreateProductScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        type: "item",
        name: "",
        sku: "",
        description: "",
        category_id: "",
        purchase_rate: "",
        sales_rate: "",
        mrp: "",
        primary_unit_id: "",
        opening_stock: "",
        maintain_stock: true,
        is_active: true,
    });

    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const response = await axios.get(
                "/api/v1/tenant/demo-company/inventory/products/create",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setCategories(response.data.data.categories);
            setUnits(response.data.data.units);
        } catch (error) {
            console.error("Error loading form data:", error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                "/api/v1/tenant/demo-company/inventory/products",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                navigation.navigate("ProductDetails", {
                    id: response.data.data.id,
                });
            }
        } catch (error) {
            if (error.response?.status === 422) {
                // Handle validation errors
                console.error("Validation errors:", error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput
                placeholder="Product Name *"
                value={formData.name}
                onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                }
            />
            <TextInput
                placeholder="SKU"
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
            />
            <Picker
                selectedValue={formData.category_id}
                onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                }
            >
                <Picker.Item label="Select Category" value="" />
                {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
            </Picker>
            <TextInput
                placeholder="Purchase Rate *"
                keyboardType="numeric"
                value={formData.purchase_rate}
                onChangeText={(text) =>
                    setFormData({ ...formData, purchase_rate: text })
                }
            />
            <TextInput
                placeholder="Sales Rate *"
                keyboardType="numeric"
                value={formData.sales_rate}
                onChangeText={(text) =>
                    setFormData({ ...formData, sales_rate: text })
                }
            />
            <Button
                title={loading ? "Creating..." : "Create Product"}
                onPress={handleSubmit}
                disabled={loading}
            />
        </ScrollView>
    );
};
```

#### 3. Product Search (Autocomplete)

```javascript
import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
} from "react-native";
import axios from "axios";
import { debounce } from "lodash";

const ProductSearch = ({ onSelect }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchProducts = debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                "/api/v1/tenant/demo-company/inventory/products/search",
                {
                    params: {
                        q: searchQuery,
                        limit: 10,
                        type: "item",
                        active_only: true,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setResults(response.data.data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    }, 300);

    useEffect(() => {
        searchProducts(query);
    }, [query]);

    return (
        <View>
            <TextInput
                placeholder="Search products..."
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
            />
            {results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultItem}
                            onPress={() => {
                                onSelect(item);
                                setQuery("");
                                setResults([]);
                            }}
                        >
                            <Text style={styles.resultName}>{item.name}</Text>
                            <Text style={styles.resultSku}>{item.sku}</Text>
                            <Text style={styles.resultPrice}>
                                ₹{item.sales_rate}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};
```

#### 4. Axios Instance Configuration

```javascript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: "https://yourdomain.com/api/v1/tenant/demo-company",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired, logout user
            await AsyncStorage.removeItem("auth_token");
            // Navigate to login
        }
        return Promise.reject(error);
    }
);

export default api;
```

---

## Best Practices

### 1. **Pagination**

-   Always use pagination for list endpoints
-   Default `per_page` is 15, maximum is 100
-   Implement infinite scroll in mobile apps

### 2. **Search Optimization**

-   Use the search endpoint for autocomplete
-   Implement debouncing (300ms recommended)
-   Minimum 2 characters before searching

### 3. **Error Handling**

-   Always check `success` field in response
-   Handle 422 validation errors separately
-   Show user-friendly error messages

### 4. **Stock Management**

-   Use `as_of_date` parameter for historical stock
-   Display stock with unit short name
-   Show low stock warnings using `stock_status` filter

### 5. **Performance**

-   Cache product list data
-   Use pull-to-refresh for updates
-   Load product details only when needed

### 6. **Offline Support**

-   Cache frequently accessed products
-   Queue create/update operations
-   Sync when connection restored

---

## Conclusion

This API provides comprehensive product management capabilities for your mobile application. All endpoints follow RESTful conventions and return consistent JSON responses. Use the provided examples as a starting point for your React Native implementation.

For additional support or questions, refer to the main API documentation or contact your development team.

**Version:** 1.0
**Last Updated:** December 31, 2025
