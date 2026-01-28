# Sales & Purchase Reports API Guide

This guide documents the sales and purchase report endpoints used by the frontend dashboards. All endpoints are tenant-scoped and require `auth:sanctum`.

Base URL:

```
/api/v1/tenant/{tenant}
```

## Authentication

Include the bearer token in the `Authorization` header.

## Common Query Parameters

- `from_date` (YYYY-MM-DD)
- `to_date` (YYYY-MM-DD)
- `group_by` (summary trend only): `day`, `week`, `month`
- `period_type` (period report): `daily`, `weekly`, `monthly`, `quarterly`, `yearly`
- `compare_with` (period report): `previous_period`, `previous_year`

## Sales Reports

### 1) Sales Summary

**GET** `/reports/sales/summary`

Query:

- `from_date`, `to_date`, `group_by`

Response fields:

- `summary.total_sales`, `summary.sales_count`, `summary.average_sale_value`
- `top_products` (top 10 by revenue)
- `top_customers` (top 10 by revenue)
- `trend` (time series)
- `payment_status` (received/outstanding)
- `previous_period` (comparison snapshot)

Sample response:

```json
{
    "success": true,
    "message": "Sales summary retrieved successfully",
    "data": {
        "filters": {
            "from_date": "2024-01-01",
            "to_date": "2024-12-31",
            "group_by": "month"
        },
        "summary": {
            "total_sales": 250000,
            "sales_count": 120,
            "average_sale_value": 2083.33
        },
        "top_products": [
            {
                "product_id": 5,
                "product_name": "Item A",
                "total_quantity": 130,
                "total_amount": 54000
            }
        ],
        "top_customers": [
            {
                "id": 12,
                "name": "Acme Ltd",
                "total_sales": 65000,
                "invoice_count": 14
            }
        ],
        "trend": [
            {
                "period": "2024-01",
                "label": "Jan",
                "total_sales": 19000,
                "invoice_count": 8
            }
        ],
        "payment_status": {
            "total_sales": 250000,
            "received": 0,
            "outstanding": 250000
        },
        "previous_period": {
            "previous_from": "2023-01-01",
            "previous_to": "2023-12-31",
            "previous_sales": 220000,
            "current_sales": 250000,
            "growth_rate": 13.64
        }
    }
}
```

### 2) Customer Sales

**GET** `/reports/sales/customers`

Query:

- `from_date`, `to_date`
- `customer_id` (optional)
- `sort_by` (default: `total_sales`)
- `sort_order` (`asc`/`desc`)

Response:

- `records` is paginated and includes totals per customer.

### 3) Product Sales

**GET** `/reports/sales/products`

Query:

- `from_date`, `to_date`
- `product_id`, `category_id` (optional)
- `sort_by` (default: `total_revenue`)
- `sort_order` (`asc`/`desc`)

Response:

- `records` is paginated and includes quantity, revenue, cost, profit.

### 4) Sales By Period

**GET** `/reports/sales/by-period`

Query:

- `from_date`, `to_date`
- `period_type`
- `compare_with` (optional)

Response:

- `records` array with totals per period.
- `summary.best_period` and `summary.worst_period` for UI highlights.

---

## Purchase Reports

### 1) Purchase Summary

**GET** `/reports/purchases/summary`

Query:

- `from_date`, `to_date`, `group_by`

Response fields:

- `summary.total_purchases`, `summary.purchase_count`, `summary.average_purchase_value`
- `top_products` (top 10 by cost)
- `top_vendors` (top 10 by purchases)
- `trend` (time series)
- `payment_status` (paid/outstanding)
- `previous_period` (comparison snapshot)

### 2) Vendor Purchases

**GET** `/reports/purchases/vendors`

Query:

- `from_date`, `to_date`
- `vendor_id` (optional)
- `sort_by` (default: `total_purchases`)
- `sort_order` (`asc`/`desc`)

Response:

- `records` is paginated and includes totals per vendor.

### 3) Product Purchases

**GET** `/reports/purchases/products`

Query:

- `from_date`, `to_date`
- `product_id`, `category_id` (optional)
- `sort_by` (default: `total_cost`)
- `sort_order` (`asc`/`desc`)

Response:

- `records` is paginated and includes quantity and cost per product.

### 4) Purchases By Period

**GET** `/reports/purchases/by-period`

Query:

- `from_date`, `to_date`
- `period_type`
- `compare_with` (optional)

Response:

- `records` array with totals per period.
- `summary.best_period` and `summary.worst_period` for UI highlights.

---

## Frontend Implementation Notes

### Sales Summary Dashboard

- Use `summary.total_sales`, `summary.sales_count`, and `summary.average_sale_value` for top cards.
- Use `trend` for line/bar charts (grouped by `group_by`).
- Use `top_products` and `top_customers` for table widgets.
- Use `previous_period` for growth indicators.

### Purchase Summary Dashboard

- Use `summary.total_purchases`, `summary.purchase_count`, and `summary.average_purchase_value` for top cards.
- Use `trend` for line/bar charts (grouped by `group_by`).
- Use `top_products` and `top_vendors` for table widgets.
- Use `previous_period` for growth indicators.

### Period Reports

- Use `records` for charts. If `compare_with` is provided, show `growth_rate` per period.
- Highlight `summary.best_period` and `summary.worst_period` in UI badges.

### Detail Tables

- Customer/Vendor tables should use `records.data` (pagination) and the `summary` totals for footer metrics.
- Product tables should use `records.data` and render cost/profit columns where available.
