# Category Management API Guide (Mobile/Frontend)

**Update marker:** 24-jan.-2026 3:55pm

## Base URL

`/api/v1/tenant/{tenant}`

## Authentication

All endpoints require `Authorization: Bearer {token}` (Sanctum token).

---

## Screen → Endpoint Mapping

### 1) CategoryHomeScreen (Web: inventory/categories/index.blade.php)

**Purpose:** List categories, show stats, filters, and actions.

**Endpoint:** `GET /inventory/categories`

**Query Parameters (optional):**

- `search` (string)
- `status` (string) — `active|inactive`
- `parent` (string|int) — `root` or parent category id
- `sort` (string) — `sort_order|name|products_count|created_at`
- `direction` (string) — `asc|desc`
- `per_page` (int) — default 15
- `page` (int)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Categories retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 10,
                "name": "Beverages",
                "slug": "beverages",
                "description": "Drinks and refreshments",
                "parent_id": null,
                "parent": null,
                "image_url": "https://example.com/storage/categories/abc.png",
                "sort_order": 1,
                "is_active": true,
                "status": "Active",
                "products_count": 12,
                "children_count": 3,
                "full_path": "Beverages",
                "depth": 0,
                "can_delete": false
            }
        ],
        "last_page": 1,
        "per_page": 15,
        "total": 1
    },
    "statistics": {
        "total_categories": 12,
        "active_categories": 10,
        "root_categories": 6,
        "with_products": 7
    }
}
```

**What to render on CategoryHomeScreen:**

- Stats cards: `statistics.total_categories`, `statistics.active_categories`, `statistics.root_categories`, `statistics.with_products`.
- Filters: `search`, `status`, `parent`, `sort`, `direction`.
- List row: `name`, `slug`, `parent`, `products_count`, `children_count`, `status`, `sort_order`.

**Actions:**

- **View** → `GET /inventory/categories/{id}`
- **Edit** → `PUT /inventory/categories/{id}` (open edit screen first)
- **Deactivate/Activate** → `PATCH /inventory/categories/{id}/toggle-status`
- **Delete** → `DELETE /inventory/categories/{id}` (only when `can_delete` = true)

---

### 2) CategoryCreateScreen (Web: inventory/categories/create.blade.php)

**Purpose:** Create new category and select parent category.

#### (A) Form Options

**Endpoint:** `GET /inventory/categories/create`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Category form data retrieved successfully",
    "data": {
        "parent_categories": [
            { "id": 1, "name": "Food", "slug": "food", "level": 0 },
            { "id": 2, "name": "Beverages", "slug": "beverages", "level": 0 },
            {
                "id": 3,
                "name": "Soft Drinks",
                "slug": "soft-drinks",
                "level": 1
            }
        ]
    }
}
```

#### (B) Create Category

**Endpoint:** `POST /inventory/categories`

**Required Fields:**

- `name`

**Optional Fields:**

- `slug`
- `description`
- `parent_id`
- `image` (file, multipart)
- `sort_order`
- `is_active`
- `meta_title`
- `meta_description`

**Sample Request:**

```json
{
    "name": "Beverages",
    "slug": "beverages",
    "description": "Drinks and refreshments",
    "parent_id": null,
    "sort_order": 1,
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Category created successfully",
    "data": {
        "category": {
            "id": 10,
            "name": "Beverages",
            "slug": "beverages",
            "is_active": true
        }
    }
}
```

---

### 3) CategoryDetailScreen (Web: inventory/categories/show.blade.php)

**Purpose:** Show category details, subcategories, and products.

**Endpoint:** `GET /inventory/categories/{id}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Category retrieved successfully",
    "data": {
        "category": {
            "id": 10,
            "name": "Beverages",
            "slug": "beverages",
            "status": "Active",
            "products_count": 12,
            "children_count": 3,
            "full_path": "Beverages"
        },
        "children": [
            { "id": 11, "name": "Soft Drinks", "slug": "soft-drinks" }
        ],
        "products": [
            { "id": 101, "name": "Cola", "sku": "COLA-01", "sales_rate": 1200 }
        ],
        "products_count": 12,
        "children_count": 3,
        "descendants_count": 5
    }
}
```

**What to render on CategoryDetailScreen:**

- Basic info: `name`, `slug`, `status`, `description`.
- Parent info: `parent`.
- Subcategories list from `children`.
- Products list (up to 10) and totals.

---

### 4) CategoryEditScreen (Web: inventory/categories/edit.blade.php)

**Purpose:** Update category info and parent.

**Endpoint (prefill):** `GET /inventory/categories/{id}`
**Endpoint (update):** `PUT /inventory/categories/{id}`

**Sample Update Request:**

```json
{
    "name": "Beverages",
    "description": "All drinks",
    "is_active": true
}
```

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Category updated successfully",
    "data": {
        "category": {
            "id": 10,
            "name": "Beverages",
            "slug": "beverages",
            "is_active": true
        }
    }
}
```

---

### 5) Toggle Category Status (Deactivate/Activate)

**Endpoint:** `PATCH /inventory/categories/{id}/toggle-status`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Category deactivated successfully",
    "data": {
        "category": { "id": 10, "is_active": false, "status": "Inactive" }
    }
}
```

---

### 6) Delete Category

**Endpoint:** `DELETE /inventory/categories/{id}`

**Sample Response (200):**

```json
{ "success": true, "message": "Category deleted successfully" }
```

**Error (422):**

```json
{
    "success": false,
    "message": "Cannot delete category that has products assigned to it."
}
```

---

### 7) Quick Create Category (Modal/Inline)

**Endpoint:** `POST /inventory/categories/quick-store`

**Sample Request:**

```json
{
    "name": "Snacks",
    "description": "Quick add",
    "parent_id": null,
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Category created successfully",
    "data": {
        "category": { "id": 99, "name": "Snacks", "slug": "snacks" }
    }
}
```

---

### 8) Reorder Categories

**Endpoint:** `POST /inventory/categories/reorder`

**Sample Request:**

```json
{
    "categories": [
        { "id": 10, "sort_order": 1 },
        { "id": 11, "sort_order": 2 }
    ]
}
```

**Sample Response (200):**

```json
{ "success": true, "message": "Categories reordered successfully" }
```

---

## Error Format

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "name": ["Category name is required."]
    }
}
```

---

## Notes for Frontend

- `can_delete` tells you if delete is allowed (no products and no subcategories).
- Use `GET /inventory/categories/create` to populate the parent dropdown with levels.
- Image upload requires `multipart/form-data`.
