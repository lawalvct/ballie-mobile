# Unit Management API Guide (Mobile/Frontend)

**Update marker:** 24-jan.-2026 3:28pm

## Base URL

`/api/v1/tenant/{tenant}`

## Authentication

All endpoints require `Authorization: Bearer {token}` (Sanctum token).

---

## Screen → Endpoint Mapping

### 1) UnitHomeScreen (Web: inventory/units/index.blade.php)

**Purpose:** List units, show stats, filters, and actions.

**Endpoint:** `GET /inventory/units`

**Query Parameters (optional):**

- `search` (string)
- `type` (string) — `base|derived`
- `status` (string) — `active|inactive`
- `sort` (string) — `name|symbol|is_base_unit|is_active|created_at`
- `direction` (string) — `asc|desc`
- `per_page` (int) — default 15
- `page` (int)

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Units retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 5,
                "name": "Kilogram",
                "symbol": "kg",
                "display_name": "Kilogram (kg)",
                "is_base_unit": true,
                "conversion_factor": 1,
                "is_active": true,
                "status": "Active",
                "type": "Base Unit",
                "products_count": 12,
                "derived_units_count": 2,
                "can_delete": false
            }
        ],
        "last_page": 1,
        "per_page": 15,
        "total": 1
    },
    "statistics": {
        "total_units": 12,
        "active_units": 10,
        "base_units": 4,
        "derived_units": 8
    }
}
```

**What to render on UnitHomeScreen:**

- Stats cards: `statistics.total_units`, `statistics.active_units`, `statistics.base_units`, `statistics.derived_units`.
- Filters: `search`, `type`, `status`, `sort`, `direction`.
- List row: `name`, `symbol`, `type`, `status`, `base_unit`, `conversion_factor`, `products_count`.

**Actions:**

- **View** → `GET /inventory/units/{id}`
- **Edit** → `PUT /inventory/units/{id}` (open edit screen first)
- **Deactivate/Activate** → `PATCH /inventory/units/{id}/toggle-status`
- **Delete** → `DELETE /inventory/units/{id}` (only when `can_delete` = true)

---

### 2) UnitCreateScreen (Web: inventory/units/create.blade.php)

**Purpose:** Create new unit and pick base unit for derived units.

#### (A) Form Options

**Endpoint:** `GET /inventory/units/create`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Unit form data retrieved successfully",
    "data": {
        "base_units": [
            {
                "id": 1,
                "name": "Kilogram",
                "symbol": "kg",
                "display_name": "Kilogram (kg)"
            }
        ]
    }
}
```

#### (B) Create Unit

**Endpoint:** `POST /inventory/units`

**Required Fields:**

- `name`
- `symbol`
- `is_base_unit` (boolean)

**Conditional (Derived Unit Only):**

- `base_unit_id`
- `conversion_factor`

**Optional Fields:**
`description`, `is_active`.

**Sample Request (Base Unit):**

```json
{
    "name": "Kilogram",
    "symbol": "kg",
    "description": "Weight unit",
    "is_base_unit": true,
    "is_active": true
}
```

**Sample Request (Derived Unit):**

```json
{
    "name": "Gram",
    "symbol": "g",
    "is_base_unit": false,
    "base_unit_id": 1,
    "conversion_factor": 0.001,
    "is_active": true
}
```

**Sample Response (201):**

```json
{
    "success": true,
    "message": "Unit created successfully",
    "data": {
        "unit": {
            "id": 6,
            "name": "Gram",
            "symbol": "g",
            "is_base_unit": false,
            "base_unit_id": 1,
            "conversion_factor": 0.001,
            "is_active": true
        }
    }
}
```

---

### 3) UnitDetailScreen (Web: inventory/units/show.blade.php)

**Purpose:** Show unit details, derived units, and products using it.

**Endpoint:** `GET /inventory/units/{id}`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Unit retrieved successfully",
    "data": {
        "unit": {
            "id": 5,
            "name": "Kilogram",
            "symbol": "kg",
            "is_base_unit": true,
            "status": "Active",
            "type": "Base Unit",
            "products_count": 12,
            "derived_units_count": 2
        },
        "derived_units": [
            {
                "id": 6,
                "name": "Gram",
                "symbol": "g",
                "conversion_factor": 0.001
            }
        ],
        "products": [
            { "id": 101, "name": "Flour", "sku": "FLR-001", "sales_rate": 2500 }
        ],
        "products_count": 12
    }
}
```

**What to render on UnitDetailScreen:**

- Basic info: `name`, `symbol`, `type`, `status`, `description`.
- Conversion info (derived units): `base_unit`, `conversion_factor`.
- Derived units list (if base unit).
- Products list (show up to 10, with total count).

---

### 4) UnitEditScreen (Web: inventory/units/edit.blade.php)

**Purpose:** Update unit info and (if allowed) base/derived fields.

**Endpoint (prefill):** `GET /inventory/units/{id}`
**Endpoint (update):** `PUT /inventory/units/{id}`

**Sample Update Request:**

```json
{
    "name": "Kilogram",
    "symbol": "kg",
    "description": "Weight unit",
    "is_base_unit": true,
    "is_active": true
}
```

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Unit updated successfully",
    "data": {
        "unit": {
            "id": 5,
            "name": "Kilogram",
            "symbol": "kg",
            "is_active": true
        }
    }
}
```

---

### 5) Toggle Unit Status (Deactivate/Activate)

**Endpoint:** `PATCH /inventory/units/{id}/toggle-status`

**Sample Response (200):**

```json
{
    "success": true,
    "message": "Unit deactivated successfully",
    "data": { "unit": { "id": 5, "is_active": false, "status": "Inactive" } }
}
```

---

### 6) Delete Unit

**Endpoint:** `DELETE /inventory/units/{id}`

**Sample Response (200):**

```json
{ "success": true, "message": "Unit deleted successfully" }
```

**Error (422):**

```json
{ "success": false, "message": "Cannot delete unit with derived units." }
```

---

## Error Format

```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "name": ["Unit name is required."]
    }
}
```

---

## Notes for Frontend

- `can_delete` tells you if delete is allowed (no products and no derived units).
- For derived units, `base_unit_id` and `conversion_factor` are mandatory.
- Use `GET /inventory/units/create` to populate the base unit dropdown.
