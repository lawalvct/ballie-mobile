# Quotation Guide (Web Screens + Endpoints)

This document summarizes the quotation screens and the web endpoints powering them, based on the current Laravel views and controller logic.

## Routing Context

Quotation routes live in the tenant web routes group at [routes/tenant.php](routes/tenant.php#L189). All paths below are relative to that group.

Base group (from routes):

- /accounting/quotations
- Alias: /accounting/quotes (short list/create only)

## Endpoints (Web + AJAX)

### Listing + Filters

- **GET /accounting/quotations** → list view
    - Query params: `search`, `status`, `date_from`, `date_to`, `customer_id`
    - View: [resources/views/tenant/accounting/quotations/index.blade.php](resources/views/tenant/accounting/quotations/index.blade.php)

### Create

- **GET /accounting/quotations/create** → create form
    - View: [resources/views/tenant/accounting/quotations/create.blade.php](resources/views/tenant/accounting/quotations/create.blade.php)
- **POST /accounting/quotations** → store quotation
    - Validates fields (see “Validation Rules” below)
    - Redirects to show with success

### Show

- **GET /accounting/quotations/{quotation}** → detail view
    - View: [resources/views/tenant/accounting/quotations/show.blade.php](resources/views/tenant/accounting/quotations/show.blade.php)

### Edit

- **GET /accounting/quotations/{quotation}/edit** → edit form (draft only)
    - View: [resources/views/tenant/accounting/quotations/edit.blade.php](resources/views/tenant/accounting/quotations/edit.blade.php)
- **PUT /accounting/quotations/{quotation}** → update (draft only)
    - Validates fields (see “Validation Rules” below)

### Delete

- **DELETE /accounting/quotations/{quotation}** → delete (draft only)

### Status/Actions

- **POST /accounting/quotations/{quotation}/send** → mark as sent
- **POST /accounting/quotations/{quotation}/accept** → mark as accepted (only when status is `sent`)
- **POST /accounting/quotations/{quotation}/reject** → mark as rejected (only when status is `sent`)
- **POST /accounting/quotations/{quotation}/convert** → convert to invoice (requires `canBeConverted()`)
- **POST /accounting/quotations/{quotation}/duplicate** → duplicate to new draft

### Email, Print, PDF

- **POST /accounting/quotations/{quotation}/email** → send email (JSON response)
- **GET /accounting/quotations/{quotation}/print** → print HTML
- **GET /accounting/quotations/{quotation}/pdf** → PDF download

### AJAX Search Helpers (Used in Items UI)

- **GET /accounting/quotations/search/customers?q=** → JSON list of customers with `ledger_account_id`
- **GET /accounting/quotations/search/products?q=** → JSON list of products (sales rate, stock, unit)

### Short Alias (List/Create)

- **GET /accounting/quotes** → list
- **GET /accounting/quotes/create** → create

## Screen Expectations (Frontend)

### 1) Quotations List Screen

View: [resources/views/tenant/accounting/quotations/index.blade.php](resources/views/tenant/accounting/quotations/index.blade.php)

**UI blocks:**

- Create button (links to create screen).
- Filters: search, status, customer, date range.
- Summary cards: total count, pending (sent), accepted, total value.
- Table with rows for each quotation.

**Data required:**

- `quotations` paginated collection with `customer`, `vendor`, `customerLedger`, `createdBy`, `items` eager-loaded in controller.
- `customers` for filter dropdown.

**Statuses shown:** `draft`, `sent`, `accepted`, `rejected`, `expired`, `converted`.

### 2) Create Quotation Screen

View: [resources/views/tenant/accounting/quotations/create.blade.php](resources/views/tenant/accounting/quotations/create.blade.php)

**Required fields:**

- `quotation_date` (date)
- `customer_ledger_id` (must exist in ledger_accounts)
- At least 1 item in `items[]`

**Optional fields:**

- `expiry_date`, `subject`, `reference_number`, `terms_and_conditions`, `notes`

**Items UI (shared partial):**
View: [resources/views/tenant/accounting/quotations/partials/quotation-items.blade.php](resources/views/tenant/accounting/quotations/partials/quotation-items.blade.php)

Each item includes:

- `product_id` (required)
- `description`
- `quantity` (required, min 0.01)
- `rate` (required, min 0)
- `discount` (min 0)
- `tax` (min 0, percent)

**Frontend behavior:**

- Product search uses `/accounting/quotations/search/products?q=` and expects fields: `id`, `name`, `sales_rate`, `description`.
- On select, fill `product_id`, `product_name`, `rate`, `description`.
- Auto-calc: `amount = (qty * rate) - discount + tax%` per row.
- Totals: subtotal, total discount, total tax, grand total.

**Actions:**

- Save as Draft (POST store with `action=save`)
- Save & Mark as Sent (POST store with `action=save_and_send`)

### 3) Edit Quotation Screen

View: [resources/views/tenant/accounting/quotations/edit.blade.php](resources/views/tenant/accounting/quotations/edit.blade.php)

**Rules:**

- Only draft quotations can be edited.
- Error banner + validation errors appear at top when update fails.

**Items behavior:**

- Preloaded items are injected into Alpine component from the backend.
- Same validation and calculations as Create.

### 4) Quotation Detail Screen

View: [resources/views/tenant/accounting/quotations/show.blade.php](resources/views/tenant/accounting/quotations/show.blade.php)

**Displays:**

- Status badge (`draft`, `sent`, `accepted`, `rejected`, `expired`, `converted`)
- Item table and totals
- Terms & Notes (if any)

**Actions:**

- Edit (if `canBeEdited()`)
- Mark as Sent (if `canBeSent()`)
- Convert to Invoice (if `canBeConverted()`)
- Download PDF / Print
- Duplicate
- Delete (if `canBeDeleted()`)

### 5) Email Modal

View: [resources/views/tenant/accounting/quotations/show.blade.php](resources/views/tenant/accounting/quotations/show.blade.php)

**Request payload (JSON):**

- `to` (email)
- `subject` (string)
- `message` (string)

**Response:**

- 200: `{ "message": "Quotation sent successfully" }`
- 422: `{ "message": "Validation failed", "errors": { ... } }`
- 500: `{ "message": "Failed to send email" }`

**Side-effect:**

- If status is `draft`, email send marks the quotation as `sent`.

### 6) Print & PDF Views

- Print: [resources/views/tenant/accounting/quotations/print.blade.php](resources/views/tenant/accounting/quotations/print.blade.php)
- PDF: [resources/views/tenant/accounting/quotations/pdf.blade.php](resources/views/tenant/accounting/quotations/pdf.blade.php)

Both show the same item/totals data with a printable layout.

## Validation Rules (Store/Update)

From [app/Http/Controllers/Tenant/Accounting/QuotationController.php](app/Http/Controllers/Tenant/Accounting/QuotationController.php#L318):

- `quotation_date`: required, date
- `expiry_date`: nullable, date, after quotation_date
- `customer_ledger_id`: required, exists in ledger_accounts
- `subject`: nullable, string, max 255
- `reference_number`: nullable, string, max 255
- `terms_and_conditions`: nullable, string
- `notes`: nullable, string
- `items`: required array, min 1
- `items.*.product_id`: required, exists in products
- `items.*.quantity`: required, numeric, min 0.01
- `items.*.rate`: required, numeric, min 0
- `items.*.discount`: nullable, numeric, min 0
- `items.*.tax`: nullable, numeric, min 0
- `items.*.description`: nullable, string

## Status Rules

- Edit/Delete: draft only (`canBeEdited()`, `canBeDeleted()`)
- Accept/Reject: only when status is `sent`
- Convert: must pass `canBeConverted()`
- Email: marks draft as `sent`

## Notes for Frontend

- Item totals are calculated client-side (Alpine), but server recalculates on save.
- Ensure `customer_ledger_id` is used (not customer_id). Customers without ledger accounts are excluded by the search endpoint.
- Use search endpoints for product/customer selection when implementing a dynamic UI.
