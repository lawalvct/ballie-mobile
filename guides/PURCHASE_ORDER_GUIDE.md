# Purchase Order (LPO) Guide (Web Screens + Endpoints)

This document summarizes the Purchase Order (LPO) screens and the web endpoints powering them, based on the current Laravel views and controller logic.

## Routing Context

Purchase Order routes live in the tenant web routes group at [routes/tenant.php](routes/tenant.php#L592). All paths below are relative to that group.

Base group (from routes):

- /procurement/purchase-orders

## Endpoints (Web + AJAX)

### Listing

- **GET /procurement/purchase-orders** → list view
    - View: [resources/views/tenant/procurement/purchase-orders/index.blade.php](resources/views/tenant/procurement/purchase-orders/index.blade.php)

### Create

- **GET /procurement/purchase-orders/create** → create form
    - View: [resources/views/tenant/procurement/purchase-orders/create.blade.php](resources/views/tenant/procurement/purchase-orders/create.blade.php)
- **POST /procurement/purchase-orders** → store purchase order
    - Validates fields (see “Validation Rules” below)
    - Redirects to show with success

### Show

- **GET /procurement/purchase-orders/{purchaseOrder}** → detail view
    - View: [resources/views/tenant/procurement/purchase-orders/show.blade.php](resources/views/tenant/procurement/purchase-orders/show.blade.php)

### PDF + Email

- **GET /procurement/purchase-orders/{purchaseOrder}/pdf** → PDF download
    - View: [resources/views/tenant/procurement/purchase-orders/pdf.blade.php](resources/views/tenant/procurement/purchase-orders/pdf.blade.php)
- **POST /procurement/purchase-orders/{purchaseOrder}/email** → send email (JSON response)

### AJAX Search Helpers (Optional)

- **GET /procurement/purchase-orders/search/vendors?q=** → JSON list of vendors
- **GET /procurement/purchase-orders/search/products?q=** → JSON list of products

## Screen Expectations (Frontend)

### 1) Purchase Orders List Screen

View: [resources/views/tenant/procurement/purchase-orders/index.blade.php](resources/views/tenant/procurement/purchase-orders/index.blade.php)

**UI blocks:**

- Create LPO button.
- Table listing LPO number, vendor, date, total amount, status, and actions.

**Data required:**

- `purchaseOrders` paginated collection with `vendor`, `creator` eager-loaded in controller.

**Statuses shown:** `draft`, `sent`, `confirmed`, `received` (fallback to red badge for other statuses).

### 2) Create Purchase Order Screen

View: [resources/views/tenant/procurement/purchase-orders/create.blade.php](resources/views/tenant/procurement/purchase-orders/create.blade.php)

**Required fields:**

- `vendor_id`
- `lpo_date`
- At least 1 item in `items[]`

**Optional fields:**

- `expected_delivery_date`
- `notes`
- `terms_conditions`

**Items UI:**
Each item includes:

- `product_id` (required)
- `quantity` (required, min 0.01)
- `unit_price` (required, min 0)
- `discount` (min 0)
- `tax_rate` (min 0)

**Frontend behavior:**

- Items are calculated client-side: `total = (qty * unit_price) - discount + tax%`.
- Totals shown: subtotal and total.

**Actions:**

- Save as Draft (POST store with `action=draft`)
- Save & Send (POST store with `action=send`) → sets status to `sent`

### 3) Purchase Order Detail Screen

View: [resources/views/tenant/procurement/purchase-orders/show.blade.php](resources/views/tenant/procurement/purchase-orders/show.blade.php)

**Displays:**

- Vendor details
- Status badge
- Items table and totals

**Actions:**

- Download PDF
- Send Email

### 4) Email Modal

View: [resources/views/tenant/procurement/purchase-orders/show.blade.php](resources/views/tenant/procurement/purchase-orders/show.blade.php)

**Request payload (JSON):**

- `to` (email)
- `subject` (string)
- `message` (string)

**Response:**

- 200: `{ "message": "Purchase Order sent successfully" }`
- 500: `{ "message": "Failed to send email" }`

**Side-effect:**

- If status is `draft`, email send updates status to `sent`.

### 5) PDF View

View: [resources/views/tenant/procurement/purchase-orders/pdf.blade.php](resources/views/tenant/procurement/purchase-orders/pdf.blade.php)

**Purpose:**

- Printable PDF representation of LPO with items and total.

## Validation Rules (Store)

From [app/Http/Controllers/Tenant/Procurement/PurchaseOrderController.php](app/Http/Controllers/Tenant/Procurement/PurchaseOrderController.php#L42):

- `vendor_id`: required, exists in vendors
- `lpo_date`: required, date
- `expected_delivery_date`: nullable, date, after lpo_date
- `items`: required array, min 1
- `items.*.product_id`: required, exists in products
- `items.*.quantity`: required, numeric, min 0.01
- `items.*.unit_price`: required, numeric, min 0
- `items.*.discount`: nullable, numeric, min 0
- `items.*.tax_rate`: nullable, numeric, min 0

## Notes for Frontend

- Totals are calculated client-side for UX, but server recalculates and saves `subtotal`, `discount_amount`, `tax_amount`, and `total_amount`.
- The create form uses server-provided product list; the search endpoints can be used for async search if needed.
