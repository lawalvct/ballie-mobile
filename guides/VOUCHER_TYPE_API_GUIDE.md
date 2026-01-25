# Voucher Type API Guide

## Overview

This guide provides comprehensive documentation for the Voucher Type Management API endpoints. All endpoints are protected and require authentication via Sanctum token.

**Base URL:** `/api/v1/tenant/{tenant}/accounting/voucher-types`

**Authentication:** All requests require `Authorization: Bearer {token}` header

---

## Table of Contents

1. [List Voucher Types](#1-list-voucher-types)
2. [Get Create Form Data](#2-get-create-form-data)
3. [Create Voucher Type](#3-create-voucher-type)
4. [Show Voucher Type](#4-show-voucher-type)
5. [Update Voucher Type](#5-update-voucher-type)
6. [Delete Voucher Type](#6-delete-voucher-type)
7. [Toggle Voucher Type Status](#7-toggle-voucher-type-status)
8. [Reset Numbering](#8-reset-numbering)
9. [Bulk Actions](#9-bulk-actions)
10. [Search Voucher Types](#10-search-voucher-types)

---

## 1. List Voucher Types

Retrieve a paginated list of voucher types with filtering, sorting, and statistics.

**Endpoint:** `GET /api/v1/tenant/{tenant}/accounting/voucher-types`

### Query Parameters

| Parameter | Type    | Required | Description                                                                  |
| --------- | ------- | -------- | ---------------------------------------------------------------------------- |
| search    | string  | No       | Search by name, code, or abbreviation                                        |
| status    | string  | No       | Filter by status: `active`, `inactive`                                       |
| type      | string  | No       | Filter by type: `system`, `custom`                                           |
| category  | string  | No       | Filter by category: `accounting`, `inventory`, `POS`, `payroll`, `ecommerce` |
| sort      | string  | No       | Sort field: `name`, `code`, `created_at`, `is_active` (default: `name`)      |
| direction | string  | No       | Sort direction: `asc`, `desc` (default: `asc`)                               |
| per_page  | integer | No       | Items per page (default: 15)                                                 |
| page      | integer | No       | Page number (default: 1)                                                     |

### Sample Request

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?search=sales&category=accounting&status=active&per_page=10&page=1' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher types retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "tenant_id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "category": "accounting",
                "description": "Invoice for sales transactions",
                "numbering_method": "auto",
                "prefix": "SI-",
                "starting_number": 1,
                "current_number": 25,
                "has_reference": true,
                "affects_inventory": true,
                "affects_cashbank": true,
                "is_system_defined": true,
                "is_active": true,
                "created_at": "2026-01-15T10:30:00.000000Z",
                "updated_at": "2026-01-19T14:20:00.000000Z",
                "voucher_count": 25
            },
            {
                "id": 2,
                "tenant_id": 1,
                "name": "Purchase Invoice",
                "code": "PI",
                "abbreviation": "PI",
                "category": "accounting",
                "description": "Invoice for purchase transactions",
                "numbering_method": "auto",
                "prefix": "PI-",
                "starting_number": 1,
                "current_number": 18,
                "has_reference": true,
                "affects_inventory": true,
                "affects_cashbank": true,
                "is_system_defined": true,
                "is_active": true,
                "created_at": "2026-01-15T10:30:00.000000Z",
                "updated_at": "2026-01-19T09:15:00.000000Z",
                "voucher_count": 18
            }
        ],
        "first_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?page=1",
        "from": 1,
        "last_page": 3,
        "last_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?page=3",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?page=2",
                "label": "2",
                "active": false
            }
        ],
        "next_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types?page=2",
        "path": "https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types",
        "per_page": 10,
        "prev_page_url": null,
        "to": 10,
        "total": 24
    },
    "statistics": {
        "total": 24,
        "active": 22,
        "system_defined": 20,
        "custom": 4
    }
}
```

---

## 2. Get Create Form Data

Get necessary data for creating a new voucher type (primary types, categories, numbering methods).

**Endpoint:** `GET /api/v1/tenant/{tenant}/accounting/voucher-types/create`

### Sample Request

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/create' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Create form data retrieved successfully",
    "data": {
        "primary_voucher_types": [
            {
                "id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "category": "accounting",
                "description": "Invoice for sales transactions",
                "numbering_method": "auto",
                "prefix": "SI-",
                "has_reference": true,
                "affects_inventory": true,
                "affects_cashbank": true
            },
            {
                "id": 2,
                "name": "Purchase Invoice",
                "code": "PI",
                "abbreviation": "PI",
                "category": "accounting",
                "description": "Invoice for purchase transactions",
                "numbering_method": "auto",
                "prefix": "PI-",
                "has_reference": true,
                "affects_inventory": true,
                "affects_cashbank": true
            }
        ],
        "categories": {
            "accounting": "Accounting",
            "inventory": "Inventory",
            "POS": "POS",
            "payroll": "Payroll",
            "ecommerce": "Ecommerce"
        },
        "numbering_methods": {
            "auto": "Automatic",
            "manual": "Manual"
        }
    }
}
```

---

## 3. Create Voucher Type

Create a new custom voucher type.

**Endpoint:** `POST /api/v1/tenant/{tenant}/accounting/voucher-types`

### Request Body

| Field             | Type    | Required | Description                                                                  |
| ----------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| name              | string  | Yes      | Voucher type name (max 255 chars)                                            |
| code              | string  | Yes      | Unique code (uppercase letters, numbers, hyphens, underscores, max 30 chars) |
| abbreviation      | string  | Yes      | Short abbreviation (uppercase letters only, max 5 chars)                     |
| description       | string  | No       | Description of the voucher type                                              |
| category          | string  | Yes      | Category: `accounting`, `inventory`, `POS`, `payroll`, `ecommerce`           |
| numbering_method  | string  | Yes      | Numbering method: `auto`, `manual`                                           |
| prefix            | string  | No       | Prefix for voucher numbers (max 10 chars)                                    |
| starting_number   | integer | Yes      | Starting number (min 1)                                                      |
| has_reference     | boolean | No       | Whether voucher has reference field (default: false)                         |
| affects_inventory | boolean | No       | Whether voucher affects inventory (default: false)                           |
| affects_cashbank  | boolean | No       | Whether voucher affects cash/bank (default: false)                           |
| is_active         | boolean | No       | Active status (default: true)                                                |

### Sample Request

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Custom Sales Order",
    "code": "CSO",
    "abbreviation": "CSO",
    "description": "Custom sales order voucher for special transactions",
    "category": "accounting",
    "numbering_method": "auto",
    "prefix": "CSO-",
    "starting_number": 1000,
    "has_reference": true,
    "affects_inventory": true,
    "affects_cashbank": false,
    "is_active": true
  }'
```

### Sample Response (201 Created)

```json
{
    "success": true,
    "message": "Voucher type created successfully",
    "data": {
        "id": 25,
        "tenant_id": 1,
        "name": "Custom Sales Order",
        "code": "CSO",
        "abbreviation": "CSO",
        "category": "accounting",
        "description": "Custom sales order voucher for special transactions",
        "numbering_method": "auto",
        "prefix": "CSO-",
        "starting_number": 1000,
        "current_number": 999,
        "has_reference": true,
        "affects_inventory": true,
        "affects_cashbank": false,
        "is_system_defined": false,
        "is_active": true,
        "created_at": "2026-01-19T15:30:00.000000Z",
        "updated_at": "2026-01-19T15:30:00.000000Z"
    }
}
```

### Sample Error Response (422 Unprocessable Entity)

```json
{
    "message": "The code has already been taken.",
    "errors": {
        "code": ["The code has already been taken."]
    }
}
```

---

## 4. Show Voucher Type

Get detailed information about a specific voucher type.

**Endpoint:** `GET /api/v1/tenant/{tenant}/accounting/voucher-types/{voucherType}`

### Sample Request

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/1' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher type retrieved successfully",
    "data": {
        "id": 1,
        "tenant_id": 1,
        "name": "Sales Invoice",
        "code": "SI",
        "abbreviation": "SI",
        "category": "accounting",
        "description": "Invoice for sales transactions",
        "numbering_method": "auto",
        "prefix": "SI-",
        "starting_number": 1,
        "current_number": 25,
        "has_reference": true,
        "affects_inventory": true,
        "affects_cashbank": true,
        "is_system_defined": true,
        "is_active": true,
        "created_at": "2026-01-15T10:30:00.000000Z",
        "updated_at": "2026-01-19T14:20:00.000000Z",
        "voucher_count": 25,
        "recent_vouchers": [
            {
                "id": 100,
                "voucher_number": "SI-0025",
                "date": "2026-01-19",
                "amount": 1500.0,
                "status": "posted",
                "created_at": "2026-01-19T14:20:00.000000Z"
            },
            {
                "id": 99,
                "voucher_number": "SI-0024",
                "date": "2026-01-18",
                "amount": 2300.0,
                "status": "posted",
                "created_at": "2026-01-18T11:15:00.000000Z"
            }
        ]
    }
}
```

---

## 5. Update Voucher Type

Update an existing voucher type. Note: System-defined voucher types have restricted fields.

**Endpoint:** `PUT /api/v1/tenant/{tenant}/accounting/voucher-types/{voucherType}`

### Request Body

**For Custom Voucher Types (all fields editable):**

| Field             | Type    | Required | Description                |
| ----------------- | ------- | -------- | -------------------------- |
| name              | string  | Yes      | Voucher type name          |
| code              | string  | Yes      | Unique code                |
| abbreviation      | string  | Yes      | Short abbreviation         |
| description       | string  | No       | Description                |
| category          | string  | Yes      | Category                   |
| numbering_method  | string  | Yes      | Numbering method           |
| prefix            | string  | No       | Prefix for voucher numbers |
| starting_number   | integer | Yes      | Starting number            |
| has_reference     | boolean | No       | Has reference field        |
| affects_inventory | boolean | No       | Affects inventory          |
| affects_cashbank  | boolean | No       | Affects cash/bank          |
| is_active         | boolean | No       | Active status              |

**For System-Defined Voucher Types (restricted fields):**
Only `abbreviation`, `description`, `category`, `numbering_method`, `prefix`, `starting_number`, `has_reference`, and `is_active` can be updated.

### Sample Request (Custom Type)

```bash
curl -X PUT \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/25' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "name": "Custom Sales Order Updated",
    "code": "CSO",
    "abbreviation": "CSOU",
    "description": "Updated description for custom sales order",
    "category": "accounting",
    "numbering_method": "auto",
    "prefix": "CSO-2026-",
    "starting_number": 1000,
    "has_reference": true,
    "affects_inventory": true,
    "affects_cashbank": true,
    "is_active": true
  }'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher type updated successfully",
    "data": {
        "id": 25,
        "tenant_id": 1,
        "name": "Custom Sales Order Updated",
        "code": "CSO",
        "abbreviation": "CSOU",
        "category": "accounting",
        "description": "Updated description for custom sales order",
        "numbering_method": "auto",
        "prefix": "CSO-2026-",
        "starting_number": 1000,
        "current_number": 999,
        "has_reference": true,
        "affects_inventory": true,
        "affects_cashbank": true,
        "is_system_defined": false,
        "is_active": true,
        "created_at": "2026-01-19T15:30:00.000000Z",
        "updated_at": "2026-01-19T16:45:00.000000Z"
    }
}
```

---

## 6. Delete Voucher Type

Delete a custom voucher type. System-defined types and types with existing vouchers cannot be deleted.

**Endpoint:** `DELETE /api/v1/tenant/{tenant}/accounting/voucher-types/{voucherType}`

### Sample Request

```bash
curl -X DELETE \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/25' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher type deleted successfully"
}
```

### Sample Error Response - Has Vouchers (422)

```json
{
    "success": false,
    "message": "Cannot delete voucher type that has existing vouchers.",
    "errors": {
        "voucher_type": [
            "This voucher type has existing vouchers and cannot be deleted."
        ]
    }
}
```

### Sample Error Response - System Defined (422)

```json
{
    "success": false,
    "message": "System-defined voucher types cannot be deleted.",
    "errors": {
        "voucher_type": [
            "System-defined voucher types are protected and cannot be deleted."
        ]
    }
}
```

---

## 7. Toggle Voucher Type Status

Toggle the active/inactive status of a voucher type.

**Endpoint:** `POST /api/v1/tenant/{tenant}/accounting/voucher-types/{voucherType}/toggle`

### Sample Request

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/25/toggle' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher type deactivated successfully",
    "data": {
        "id": 25,
        "tenant_id": 1,
        "name": "Custom Sales Order",
        "code": "CSO",
        "abbreviation": "CSO",
        "category": "accounting",
        "description": "Custom sales order voucher",
        "numbering_method": "auto",
        "prefix": "CSO-",
        "starting_number": 1000,
        "current_number": 999,
        "has_reference": true,
        "affects_inventory": true,
        "affects_cashbank": false,
        "is_system_defined": false,
        "is_active": false,
        "created_at": "2026-01-19T15:30:00.000000Z",
        "updated_at": "2026-01-19T17:00:00.000000Z"
    }
}
```

---

## 8. Reset Numbering

Reset the numbering sequence for an auto-numbered voucher type.

**Endpoint:** `POST /api/v1/tenant/{tenant}/accounting/voucher-types/{voucherType}/reset-numbering`

### Request Body

| Field        | Type    | Required | Description                    |
| ------------ | ------- | -------- | ------------------------------ |
| reset_number | integer | Yes      | The number to reset to (min 1) |

### Sample Request

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/25/reset-numbering' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "reset_number": 2000
  }'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Numbering reset successfully",
    "data": {
        "voucher_type": {
            "id": 25,
            "tenant_id": 1,
            "name": "Custom Sales Order",
            "code": "CSO",
            "abbreviation": "CSO",
            "category": "accounting",
            "description": "Custom sales order voucher",
            "numbering_method": "auto",
            "prefix": "CSO-",
            "starting_number": 1000,
            "current_number": 1999,
            "has_reference": true,
            "affects_inventory": true,
            "affects_cashbank": false,
            "is_system_defined": false,
            "is_active": true,
            "created_at": "2026-01-19T15:30:00.000000Z",
            "updated_at": "2026-01-19T17:15:00.000000Z"
        },
        "next_number": "CSO-2000"
    }
}
```

### Sample Error Response - Manual Numbering (422)

```json
{
    "success": false,
    "message": "Can only reset numbering for auto-numbered voucher types.",
    "errors": {
        "numbering_method": ["This voucher type uses manual numbering."]
    }
}
```

### Sample Error Response - Number Conflict (422)

```json
{
    "success": false,
    "message": "Cannot reset to this number as it conflicts with an existing voucher.",
    "errors": {
        "reset_number": ["A voucher with this number already exists."]
    }
}
```

---

## 9. Bulk Actions

Perform bulk actions on multiple voucher types (activate, deactivate, delete).

**Endpoint:** `POST /api/v1/tenant/{tenant}/accounting/voucher-types/bulk-action`

### Request Body

| Field         | Type   | Required | Description                                           |
| ------------- | ------ | -------- | ----------------------------------------------------- |
| action        | string | Yes      | Action to perform: `activate`, `deactivate`, `delete` |
| voucher_types | array  | Yes      | Array of voucher type IDs (minimum 1)                 |

### Sample Request

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/bulk-action' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "action": "deactivate",
    "voucher_types": [25, 26, 27]
  }'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "3 voucher type(s) deactivated successfully.",
    "data": {
        "success_count": 3,
        "errors": []
    }
}
```

### Sample Response with Errors (200 OK)

```json
{
    "success": true,
    "message": "2 voucher type(s) deleted successfully.",
    "data": {
        "success_count": 2,
        "errors": [
            "Cannot delete system-defined voucher type: Sales Invoice",
            "Cannot delete voucher type with existing vouchers: Purchase Invoice"
        ]
    }
}
```

### Sample Error Response (422)

```json
{
    "success": false,
    "message": "No voucher types were deleted.",
    "data": {
        "success_count": 0,
        "errors": [
            "Cannot delete system-defined voucher type: Sales Invoice",
            "Cannot delete system-defined voucher type: Purchase Invoice"
        ]
    }
}
```

---

## 10. Search Voucher Types

Search for active voucher types for selection purposes (simplified response).

**Endpoint:** `GET /api/v1/tenant/{tenant}/accounting/voucher-types/search`

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| search    | string | No       | Search by name, code, or abbreviation |
| category  | string | No       | Filter by category                    |

### Sample Request

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/voucher-types/search?search=invoice&category=accounting' \
  -H 'Authorization: Bearer {your_token}' \
  -H 'Accept: application/json'
```

### Sample Response (200 OK)

```json
{
    "success": true,
    "message": "Voucher types search results",
    "data": [
        {
            "id": 1,
            "name": "Sales Invoice",
            "code": "SI",
            "abbreviation": "SI",
            "category": "accounting",
            "prefix": "SI-",
            "numbering_method": "auto",
            "has_reference": true,
            "affects_inventory": true,
            "affects_cashbank": true,
            "next_number": "SI-0026"
        },
        {
            "id": 2,
            "name": "Purchase Invoice",
            "code": "PI",
            "abbreviation": "PI",
            "category": "accounting",
            "prefix": "PI-",
            "numbering_method": "auto",
            "has_reference": true,
            "affects_inventory": true,
            "affects_cashbank": true,
            "next_number": "PI-0019"
        }
    ]
}
```

---

## Error Handling

All endpoints follow consistent error response format:

### Validation Error (422 Unprocessable Entity)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

### Authentication Error (401 Unauthorized)

```json
{
    "message": "Unauthenticated."
}
```

### Not Found Error (404 Not Found)

```json
{
    "message": "Resource not found."
}
```

### Server Error (500 Internal Server Error)

```json
{
    "message": "Server Error",
    "error": "Detailed error message (only in development mode)"
}
```

---

## Field Descriptions

### Voucher Type Fields

| Field             | Type        | Description                                              |
| ----------------- | ----------- | -------------------------------------------------------- |
| id                | integer     | Unique identifier                                        |
| tenant_id         | integer     | Tenant ID                                                |
| name              | string      | Voucher type name                                        |
| code              | string      | Unique code (uppercase)                                  |
| abbreviation      | string      | Short abbreviation (max 5 chars)                         |
| category          | string      | Category: accounting, inventory, POS, payroll, ecommerce |
| description       | string/null | Optional description                                     |
| numbering_method  | string      | `auto` or `manual`                                       |
| prefix            | string/null | Prefix for voucher numbers                               |
| starting_number   | integer     | Starting number for sequence                             |
| current_number    | integer     | Current number in sequence                               |
| has_reference     | boolean     | Whether voucher has reference field                      |
| affects_inventory | boolean     | Whether affects inventory                                |
| affects_cashbank  | boolean     | Whether affects cash/bank                                |
| is_system_defined | boolean     | Whether system-defined (protected)                       |
| is_active         | boolean     | Active status                                            |
| created_at        | timestamp   | Creation timestamp                                       |
| updated_at        | timestamp   | Last update timestamp                                    |
| voucher_count     | integer     | Number of vouchers (only in list/show)                   |
| recent_vouchers   | array       | Recent vouchers (only in show)                           |

---

## Best Practices

1. **Authentication**: Always include valid Bearer token in Authorization header
2. **Error Handling**: Check `success` field and handle errors appropriately
3. **Validation**: Validate data on client side before sending to reduce API calls
4. **Pagination**: Use pagination for large datasets to improve performance
5. **Filtering**: Use appropriate filters to reduce response size
6. **Caching**: Cache reference data like categories and numbering methods
7. **Naming Convention**: Use uppercase for codes and abbreviations
8. **System Types**: Avoid attempting to delete or modify restricted fields of system-defined types
9. **Numbering**: Only reset numbering for auto-numbered types
10. **Bulk Actions**: Use bulk actions for better performance when updating multiple items

---

## Rate Limiting

API endpoints are rate-limited per user:

- **Standard limit**: 60 requests per minute
- **Burst limit**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1642617600
```

---

## Changelog

### Version 1.0 (2026-01-19)

- Initial release
- All CRUD operations
- Bulk actions support
- Search functionality
- Numbering reset feature
- Category filtering

---

## Support

For issues or questions:

- Email: support@yourapp.com
- Documentation: https://docs.yourapp.com
- API Status: https://status.yourapp.com
