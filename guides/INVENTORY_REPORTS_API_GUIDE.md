# Inventory Reports API Guide

This guide documents the inventory report endpoints used by the frontend dashboards. All endpoints are tenant-scoped and require `auth:sanctum`.

Base URL:

```
/api/v1/tenant/{tenant}
```

## Authentication

Include the bearer token in the `Authorization` header.

## Common Query Parameters

- `as_of_date` (YYYY-MM-DD)
- `from_date` (YYYY-MM-DD)
- `to_date` (YYYY-MM-DD)
- `category_id` (optional)
- `product_id` (optional)
- `search` (optional)
- `per_page` (optional)

---

## 1) Stock Summary

**GET** `/reports/inventory/stock-summary`

Query:

- `as_of_date`
- `category_id` (optional)
- `stock_status` (all, in_stock, low_stock, out_of_stock)
- `sort_by` (name, stock_value, current_stock)
- `sort_order` (asc|desc)
- `search` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Stock summary retrieved successfully",
    "data": {
        "filters": {
            "as_of_date": "2026-01-31",
            "category_id": null,
            "stock_status": "all",
            "sort_by": "name",
            "sort_order": "asc",
            "search": null
        },
        "summary": {
            "total_products": 120,
            "total_stock_value": 1850000,
            "total_stock_quantity": 940,
            "out_of_stock_count": 8,
            "low_stock_count": 12
        },
        "categories": [{ "id": 1, "name": "Beverages" }],
        "records": {
            "data": [
                {
                    "id": 1,
                    "name": "Coke",
                    "category": { "id": 1, "name": "Beverages" },
                    "primary_unit": { "abbreviation": "PCS" },
                    "calculated_stock": 40,
                    "calculated_value": 52000,
                    "average_rate": 1300,
                    "status_flag": "in_stock"
                }
            ]
        }
    }
}
```

UI guidance:

- Summary cards: total products, stock value, total quantity, low stock, out of stock.
- Table: product, category, current stock, unit, rates, status.

---

## 2) Low Stock Alert

**GET** `/reports/inventory/low-stock-alert`

Query:

- `as_of_date`
- `category_id` (optional)
- `alert_type` (all, critical, low, out_of_stock)
- `search` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Low stock alert retrieved successfully",
    "data": {
        "filters": {
            "as_of_date": "2026-01-31",
            "category_id": null,
            "alert_type": "all",
            "search": null
        },
        "summary": {
            "total_alerts": 20,
            "critical_alerts": 8,
            "warning_alerts": 12,
            "out_of_stock_count": 5,
            "estimated_reorder_value": 320000
        },
        "categories": [{ "id": 1, "name": "Beverages" }],
        "records": {
            "data": [
                {
                    "id": 12,
                    "name": "Sprite",
                    "calculated_stock": 2,
                    "reorder_level": 10,
                    "shortage_quantity": 8,
                    "shortage_percentage": 80,
                    "alert_level": "critical",
                    "alert_status": "critically_low"
                }
            ]
        }
    }
}
```

UI guidance:

- Summary cards: total alerts, critical, warning, out of stock, reorder value.
- Table: product, current stock, reorder level, shortage, alert level.

---

## 3) Stock Valuation

**GET** `/reports/inventory/stock-valuation`

Query:

- `as_of_date`
- `category_id` (optional)
- `valuation_method` (weighted_average|fifo)
- `group_by` (product|category)
- `search` (optional)

Sample response:

```json
{
    "success": true,
    "message": "Stock valuation retrieved successfully",
    "data": {
        "filters": {
            "as_of_date": "2026-01-31",
            "category_id": null,
            "valuation_method": "weighted_average",
            "group_by": "product",
            "search": null
        },
        "summary": {
            "total_products": 95,
            "total_stock_value": 1850000,
            "total_quantity": 940,
            "average_value": 19473.68
        },
        "top_value_products": [
            {
                "product": {
                    "id": 1,
                    "name": "Coke",
                    "sku": "COKE-01",
                    "unit": "PCS"
                },
                "quantity": 40,
                "value": 52000,
                "average_rate": 1300,
                "category_name": "Beverages"
            }
        ],
        "records": {
            "data": [
                {
                    "product": {
                        "id": 1,
                        "name": "Coke",
                        "sku": "COKE-01",
                        "unit": "PCS"
                    },
                    "quantity": 40,
                    "value": 52000,
                    "average_rate": 1300,
                    "category_name": "Beverages"
                }
            ]
        }
    }
}
```

UI guidance:

- Summary cards: total products, total value, total quantity, average value.
- Table: product/category, qty, average rate, value. Use group view when `group_by=category`.
- Show “Top 10 most valuable items” using `top_value_products`.

---

## 4) Stock Movement

**GET** `/reports/inventory/stock-movement`

Query:

- `from_date`, `to_date`
- `product_id` (optional)
- `category_id` (optional)
- `movement_type` (in|out|all)

Sample response:

```json
{
    "success": true,
    "message": "Stock movement retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2026-01-01",
            "to_date": "2026-01-31",
            "product_id": null,
            "category_id": null,
            "movement_type": "all"
        },
        "summary": {
            "total_in": 250,
            "total_out": 180,
            "net_movement": 70,
            "total_in_value": 420000,
            "total_out_value": 365000,
            "transaction_count": 86
        },
        "products": [{ "id": 1, "name": "Coke" }],
        "categories": [{ "id": 1, "name": "Beverages" }],
        "records": {
            "data": [
                {
                    "id": 101,
                    "transaction_date": "2026-01-20",
                    "quantity": -5,
                    "rate": 1200,
                    "reference": "INV-001"
                }
            ]
        }
    }
}
```

UI guidance:

- Summary cards: total in/out, net movement, values, transaction count.
- Table: date, product, category, qty, rate, value, reference, created by.

---

## 5) Bin Card

**GET** `/reports/inventory/bin-card`

Query:

- `from_date`, `to_date`
- `product_id` (optional; if missing uses first product)

Sample response:

```json
{
    "success": true,
    "message": "Bin card retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2026-01-01",
            "to_date": "2026-01-31",
            "product_id": 1
        },
        "summary": {
            "opening_qty": 20,
            "opening_value": 24000,
            "total_in_qty": 40,
            "total_out_qty": 35,
            "total_in_value": 48000,
            "total_out_value": 42000
        },
        "products": [{ "id": 1, "name": "Coke" }],
        "records": {
            "data": [
                {
                    "date": "2026-01-05",
                    "particulars": "INV-001",
                    "vch_type": "SV",
                    "vch_no": "SV-0001",
                    "in_qty": 0,
                    "in_value": 0,
                    "out_qty": 5,
                    "out_value": 6000,
                    "closing_qty": 15,
                    "closing_value": 18000,
                    "created_by": "Admin"
                }
            ]
        }
    }
}
```

UI guidance:

- Show opening balance row + running closing balance per movement.
- Filter by product + date range.
