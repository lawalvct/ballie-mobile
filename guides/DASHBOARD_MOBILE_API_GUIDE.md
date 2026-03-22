# Dashboard Mobile API Guide

> **Base URL:** `/api/v1/tenant/{tenant}/dashboard`
> **Auth:** Bearer token (`Authorization: Bearer {token}`)
> **Total Endpoints:** 14

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Endpoints](#endpoints)
   - [GET / — Full Dashboard](#1-get--full-dashboard)
   - [GET /summary — Quick Metrics](#2-get-summary--quick-metrics)
   - [GET /revenue-chart — 6-Month Chart](#3-get-revenue-chart--6-month-chart)
   - [GET /daily-revenue — Daily Sparkline](#4-get-daily-revenue--daily-sparkline)
   - [GET /revenue-breakdown — Doughnut Chart](#5-get-revenue-breakdown--doughnut-chart)
   - [GET /balances — Account Balances](#6-get-balances--account-balances)
   - [GET /top-products — Top Selling Products](#7-get-top-products--top-selling-products)
   - [GET /top-customers — Top Customers](#8-get-top-customers--top-customers)
   - [GET /recent-transactions — Recent Activity](#9-get-recent-transactions--recent-activity)
   - [GET /outstanding-invoices — Unpaid Invoices](#10-get-outstanding-invoices--unpaid-invoices)
   - [GET /alerts — System Alerts](#11-get-alerts--system-alerts)
   - [GET /pos-today — POS Today Sales](#12-get-pos-today--pos-today-sales)
   - [GET /inventory-stats — Inventory Summary](#13-get-inventory-stats--inventory-summary)
   - [POST /dismiss-tour — Dismiss Tour](#14-post-dismiss-tour--dismiss-tour)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [Chart Implementation Guide](#chart-implementation-guide)
5. [Screen Layout Recommendations](#screen-layout-recommendations)
6. [Loading Strategy](#loading-strategy)

---

## Architecture Overview

The Dashboard API provides two loading strategies:

| Strategy | Endpoint | Use Case |
|----------|----------|----------|
| **Single Call** | `GET /` | Load all dashboard data in one request (ideal for initial load) |
| **Granular** | Individual endpoints | Refresh specific sections, pull-to-refresh, or lazy-load sections |

**Key Features:**
- All data is cached for 5 minutes on the server
- Module-aware: sections for disabled modules return empty/zero values
- Terminology-aware: `GET /` includes `terminology` map for category-appropriate labels
- Business category included in response so mobile can adapt UI

---

## Endpoints

### 1. GET / — Full Dashboard

Returns ALL dashboard data in a single request. **Recommended for initial screen load.**

```
GET /api/v1/tenant/{tenant}/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_revenue": 5400000.00,
      "monthly_revenue": 1250000.00,
      "revenue_growth": 12.5,
      "monthly_expenses": 320000.00,
      "monthly_purchase": 450000.00,
      "net_profit": 480000.00,
      "total_sales_count": 145,
      "monthly_receipts": 980000.00
    },
    "counts": {
      "total_customers": 234,
      "active_customers": 189,
      "new_customers_this_month": 12,
      "total_products": 87
    },
    "balances": {
      "cash_balance": 1450000.00,
      "receivables": 780000.00,
      "payables": 320000.00
    },
    "charts": {
      "revenue_vs_expenses": {
        "labels": ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025"],
        "revenue": [980000, 1050000, 1100000, 1200000, 1150000, 1250000],
        "expenses": [650000, 720000, 690000, 780000, 750000, 770000]
      },
      "revenue_breakdown": [
        { "name": "Sales", "code": "SV", "total": 850000.00 },
        { "name": "Receipts", "code": "RV", "total": 320000.00 },
        { "name": "Misc Income", "code": "MI", "total": 80000.00 }
      ],
      "daily_revenue": [
        { "date": "Jun 01", "date_iso": "2025-06-01T00:00:00+01:00", "amount": 45000.00 },
        { "date": "Jun 02", "date_iso": "2025-06-02T00:00:00+01:00", "amount": 62000.00 }
      ]
    },
    "inventory": {
      "low_stock_count": 5,
      "out_of_stock_count": 2
    },
    "pos": {
      "today_sales": 125000.00,
      "today_sales_count": 23
    },
    "alerts": [
      {
        "type": "low_stock",
        "severity": "warning",
        "title": "Low Stock Alert",
        "message": "5 product(s) are running low on inventory",
        "count": 5
      },
      {
        "type": "out_of_stock",
        "severity": "critical",
        "title": "Out of Stock",
        "message": "2 product(s) are completely out of stock",
        "count": 2
      },
      {
        "type": "receivables",
        "severity": "info",
        "title": "Outstanding Receivables",
        "message": "You have outstanding receivables to collect",
        "amount": 780000.00
      }
    ],
    "top_products": [
      { "product_id": 1, "name": "iPhone 15 Pro", "quantity_sold": 45, "revenue": 675000.00 },
      { "product_id": 2, "name": "Samsung Galaxy S24", "quantity_sold": 38, "revenue": 570000.00 }
    ],
    "top_customers": [
      { "id": 1, "name": "John Doe", "spent": 450000.00, "outstanding": 50000.00 }
    ],
    "outstanding_invoices": {
      "count": 5,
      "total": 780000.00,
      "items": [
        { "id": 1, "number": "INV-0045", "amount": 250000.00, "date": "2025-06-10T00:00:00+01:00" }
      ]
    },
    "recent_transactions": [
      {
        "id": 1,
        "number": "SV-0089",
        "type": "Sales Voucher",
        "type_code": "SV",
        "amount": 75000.00,
        "date": "2025-06-15T00:00:00+01:00",
        "narration": "Sale to John Doe"
      }
    ],
    "business_category": "trading",
    "terminology": {
      "crm": "Customers",
      "sales": "Sales",
      "products": "Products",
      "quotation": "Quotation",
      "customers": "Customers",
      "purchase": "Purchase",
      "low_stock": "Low Stock",
      "stock": "Inventory"
    },
    "enabled_modules": {
      "inventory": true,
      "crm": true,
      "pos": true,
      "payroll": true,
      "banking": true,
      "ecommerce": false,
      "projects": false,
      "procurement": true
    },
    "show_tour": false
  },
  "message": "Success"
}
```

---

### 2. GET /summary — Quick Metrics

Lightweight endpoint for metric cards only. Good for widget/notification refresh.

```
GET /api/v1/tenant/{tenant}/dashboard/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_revenue": 1250000.00,
    "revenue_growth": 12.5,
    "monthly_expenses": 320000.00,
    "monthly_purchase": 450000.00,
    "net_profit": 480000.00,
    "total_sales_count": 145,
    "total_customers": 234,
    "total_products": 87
  }
}
```

---

### 3. GET /revenue-chart — 6-Month Chart

Returns 6 months of revenue vs expenses data for a **bar chart or line chart**.

```
GET /api/v1/tenant/{tenant}/dashboard/revenue-chart
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chart": {
      "labels": ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025"],
      "revenue": [980000, 1050000, 1100000, 1200000, 1150000, 1250000],
      "expenses": [650000, 720000, 690000, 780000, 750000, 770000]
    }
  }
}
```

---

### 4. GET /daily-revenue — Daily Sparkline

Returns daily revenue data. Default 14 days, configurable via `days` param.

```
GET /api/v1/tenant/{tenant}/dashboard/daily-revenue?days=14
```

| Param | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `days` | int | 14 | 7–90 | Number of days of data |

**Response:**
```json
{
  "success": true,
  "data": {
    "daily_revenue": [
      { "date": "Jun 01", "date_iso": "2025-06-01T00:00:00+01:00", "amount": 45000.00 },
      { "date": "Jun 02", "date_iso": "2025-06-02T00:00:00+01:00", "amount": 62000.00 },
      { "date": "Jun 03", "date_iso": "2025-06-03T00:00:00+01:00", "amount": 38000.00 }
    ]
  }
}
```

---

### 5. GET /revenue-breakdown — Doughnut Chart

Returns revenue breakdown by voucher type for the current month. Use for **pie chart / doughnut chart**.

```
GET /api/v1/tenant/{tenant}/dashboard/revenue-breakdown
```

**Response:**
```json
{
  "success": true,
  "data": {
    "breakdown": [
      { "name": "Sales Voucher", "code": "SV", "total": 850000.00 },
      { "name": "Receipt Voucher", "code": "RV", "total": 320000.00 },
      { "name": "Misc Income", "code": "MI", "total": 80000.00 }
    ]
  }
}
```

---

### 6. GET /balances — Account Balances

```
GET /api/v1/tenant/{tenant}/dashboard/balances
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cash_balance": 1450000.00,
    "receivables": 780000.00,
    "payables": 320000.00
  }
}
```

---

### 7. GET /top-products — Top Selling Products

Returns empty array if inventory module is disabled.

```
GET /api/v1/tenant/{tenant}/dashboard/top-products?limit=5
```

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | int | 5 | 20 | Number of products |

**Response:**
```json
{
  "success": true,
  "data": {
    "top_products": [
      { "product_id": 1, "name": "iPhone 15 Pro", "quantity_sold": 45, "revenue": 675000.00 },
      { "product_id": 2, "name": "Samsung Galaxy S24", "quantity_sold": 38, "revenue": 570000.00 }
    ]
  }
}
```

---

### 8. GET /top-customers — Top Customers

```
GET /api/v1/tenant/{tenant}/dashboard/top-customers?limit=5
```

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | int | 5 | 20 | Number of customers |

**Response:**
```json
{
  "success": true,
  "data": {
    "top_customers": [
      { "id": 1, "name": "John Doe", "spent": 450000.00, "outstanding": 50000.00 },
      { "id": 5, "name": "Acme Corp", "spent": 380000.00, "outstanding": 0 }
    ]
  }
}
```

---

### 9. GET /recent-transactions — Recent Activity

```
GET /api/v1/tenant/{tenant}/dashboard/recent-transactions?limit=8
```

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | int | 8 | 30 | Number of transactions |

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "number": "SV-0089",
        "type": "Sales Voucher",
        "type_code": "SV",
        "amount": 75000.00,
        "date": "2025-06-15T00:00:00+01:00",
        "narration": "Sale to John Doe"
      }
    ]
  }
}
```

**Type codes for styling:**
| Code | Meaning | Suggested Color |
|------|---------|-----------------|
| `SV` / `SALES` | Sales | Green |
| `PUR` | Purchase | Orange |
| `EXP` / `PV` | Expense/Payment | Red |
| `RV` | Receipt | Blue |
| `JV` | Journal | Gray |

---

### 10. GET /outstanding-invoices — Unpaid Invoices

```
GET /api/v1/tenant/{tenant}/dashboard/outstanding-invoices
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "total": 780000.00,
    "items": [
      { "id": 1, "number": "INV-0045", "amount": 250000.00, "date": "2025-06-10T00:00:00+01:00" },
      { "id": 2, "number": "INV-0044", "amount": 180000.00, "date": "2025-06-08T00:00:00+01:00" }
    ]
  }
}
```

---

### 11. GET /alerts — System Alerts

```
GET /api/v1/tenant/{tenant}/dashboard/alerts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "low_stock",
        "severity": "warning",
        "title": "Low Stock Alert",
        "message": "5 product(s) are running low on inventory",
        "count": 5
      },
      {
        "type": "out_of_stock",
        "severity": "critical",
        "title": "Out of Stock",
        "message": "2 product(s) are completely out of stock",
        "count": 2
      },
      {
        "type": "receivables",
        "severity": "info",
        "title": "Outstanding Receivables",
        "message": "You have outstanding receivables to collect",
        "amount": 780000.00
      }
    ]
  }
}
```

**Alert severity mapping:**
| Severity | Color | Icon |
|----------|-------|------|
| `critical` | Red | `alert-circle` |
| `warning` | Yellow/Orange | `alert-triangle` |
| `info` | Blue | `information-circle` |

---

### 12. GET /pos-today — POS Today Sales

Returns zeros if POS module is disabled.

```
GET /api/v1/tenant/{tenant}/dashboard/pos-today
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today_sales": 125000.00,
    "today_sales_count": 23
  }
}
```

---

### 13. GET /inventory-stats — Inventory Summary

Returns zeros if inventory module is disabled.

```
GET /api/v1/tenant/{tenant}/dashboard/inventory-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "low_stock_count": 5,
    "out_of_stock_count": 2
  }
}
```

---

### 14. POST /dismiss-tour — Dismiss Tour

Marks the user's onboarding tour as completed. Call this when user dismisses the welcome banner.

```
POST /api/v1/tenant/{tenant}/dashboard/dismiss-tour
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Tour dismissed."
}
```

---

## TypeScript Interfaces

```typescript
// === Main Dashboard Response ===
interface DashboardResponse {
  metrics: DashboardMetrics;
  counts: DashboardCounts;
  balances: AccountBalances;
  charts: DashboardCharts;
  inventory: InventoryStats;
  pos: POSStats;
  alerts: Alert[];
  top_products: TopProduct[];
  top_customers: TopCustomer[];
  outstanding_invoices: OutstandingInvoices;
  recent_transactions: Transaction[];
  business_category: 'trading' | 'manufacturing' | 'service' | 'hybrid';
  terminology: Record<string, string | null>;
  enabled_modules: EnabledModules;
  show_tour: boolean;
}

interface DashboardMetrics {
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;        // percentage, can be negative
  monthly_expenses: number;
  monthly_purchase: number;
  net_profit: number;            // can be negative
  total_sales_count: number;
  monthly_receipts: number;
}

interface DashboardCounts {
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  total_products: number;
}

interface AccountBalances {
  cash_balance: number;
  receivables: number;
  payables: number;
}

// === Charts ===
interface DashboardCharts {
  revenue_vs_expenses: RevenueVsExpensesChart;
  revenue_breakdown: RevenueBreakdownItem[];
  daily_revenue: DailyRevenuePoint[];
}

interface RevenueVsExpensesChart {
  labels: string[];              // e.g., ["Jan 2025", "Feb 2025", ...]
  revenue: number[];
  expenses: number[];
}

interface RevenueBreakdownItem {
  name: string;                  // e.g., "Sales Voucher"
  code: string;                  // e.g., "SV"
  total: number;
}

interface DailyRevenuePoint {
  date: string;                  // e.g., "Jun 15"
  date_iso: string;              // ISO 8601 timestamp
  amount: number;
}

// === Lists ===
interface TopProduct {
  product_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
}

interface TopCustomer {
  id: number;
  name: string;
  spent: number;
  outstanding: number;
}

interface Transaction {
  id: number;
  number: string;
  type: string;
  type_code: string;
  amount: number;
  date: string;                  // ISO 8601
  narration: string | null;
}

interface OutstandingInvoices {
  count: number;
  total: number;
  items: OutstandingInvoiceItem[];
}

interface OutstandingInvoiceItem {
  id: number;
  number: string;
  amount: number;
  date: string;                  // ISO 8601
}

// === Alerts ===
interface Alert {
  type: 'low_stock' | 'out_of_stock' | 'receivables';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;                // for stock alerts
  amount?: number;               // for receivables alert
}

// === Module/Stats ===
interface InventoryStats {
  low_stock_count: number;
  out_of_stock_count: number;
}

interface POSStats {
  today_sales: number;
  today_sales_count: number;
}

interface EnabledModules {
  inventory: boolean;
  crm: boolean;
  pos: boolean;
  payroll: boolean;
  banking: boolean;
  ecommerce: boolean;
  projects: boolean;
  procurement: boolean;
}
```

---

## Chart Implementation Guide

The dashboard features **3 chart types**. Here are implementation recommendations for React Native:

### Recommended Libraries

| Library | Best For | Install |
|---------|----------|---------|
| **react-native-chart-kit** | Quick, lightweight charts | `npm i react-native-chart-kit react-native-svg` |
| **victory-native** | Beautiful, customizable charts | `npm i victory-native react-native-svg` |
| **react-native-gifted-charts** | Animated, modern charts | `npm i react-native-gifted-charts react-native-linear-gradient react-native-svg` |

### Chart 1: Revenue vs Expenses (Bar / Line Chart)

**Data source:** `charts.revenue_vs_expenses`

```tsx
// react-native-chart-kit example
import { BarChart } from 'react-native-chart-kit';

const RevenueChart = ({ chartData }: { chartData: RevenueVsExpensesChart }) => (
  <BarChart
    data={{
      labels: chartData.labels.map(l => l.substring(0, 3)), // "Jan", "Feb"
      datasets: [
        { data: chartData.revenue, color: () => '#10B981' },   // green
        { data: chartData.expenses, color: () => '#EF4444' },  // red
      ],
    }}
    width={screenWidth - 32}
    height={220}
    chartConfig={{
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      formatYLabel: (value) => formatCurrency(Number(value)),
    }}
    fromZero
    showBarTops={false}
  />
);
```

### Chart 2: Revenue Breakdown (Doughnut / Pie Chart)

**Data source:** `charts.revenue_breakdown`

```tsx
// react-native-chart-kit example
import { PieChart } from 'react-native-chart-kit';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const RevenueBreakdownChart = ({ breakdown }: { breakdown: RevenueBreakdownItem[] }) => (
  <PieChart
    data={breakdown.map((item, i) => ({
      name: item.name,
      amount: item.total,
      color: COLORS[i % COLORS.length],
      legendFontColor: '#333',
    }))}
    width={screenWidth - 32}
    height={200}
    chartConfig={{ color: () => '#000' }}
    accessor="amount"
    backgroundColor="transparent"
    paddingLeft="15"
    hasLegend={true}
  />
);
```

### Chart 3: Daily Revenue Sparkline (Line Chart)

**Data source:** `charts.daily_revenue`

```tsx
import { LineChart } from 'react-native-chart-kit';

const DailyRevenueSparkline = ({ dailyData }: { dailyData: DailyRevenuePoint[] }) => (
  <LineChart
    data={{
      labels: dailyData.filter((_, i) => i % 3 === 0).map(d => d.date), // every 3rd label
      datasets: [{ data: dailyData.map(d => d.amount || 0) }],
    }}
    width={screenWidth - 32}
    height={120}
    chartConfig={{
      backgroundGradientFrom: '#667eea',
      backgroundGradientTo: '#764ba2',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    }}
    bezier
    withDots={false}
    withInnerLines={false}
    withOuterLines={false}
  />
);
```

---

## Screen Layout Recommendations

### Mobile Dashboard Screen Structure

```
┌─────────────────────────────────┐
│  Welcome Banner (if show_tour)  │  ← Dismissible with POST /dismiss-tour
├─────────────────────────────────┤
│  [Alert Banner - if alerts]     │  ← Show top alert, tap to see all
├─────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐     │
│  │ Revenue  │ │ Expenses │     │  ← Metric cards (2×2 grid)
│  │ ₦1.25M   │ │ ₦320K    │     │
│  │ ↑ 12.5%  │ │          │     │
│  └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐     │
│  │Net Profit│ │ Sales    │     │
│  │ ₦480K    │ │ 145      │     │
│  └──────────┘ └──────────┘     │
├─────────────────────────────────┤
│  Revenue vs Expenses Chart      │  ← Bar/Line chart (6 months)
│  [Bar Chart - 6 bars]          │
├─────────────────────────────────┤
│  Daily Revenue Sparkline        │  ← Mini line chart (14 days)
│  [Bezier Line]                 │
├─────────────────────────────────┤
│  Revenue Breakdown              │  ← Doughnut/Pie chart
│  [Pie Chart]                   │
├─────────────────────────────────┤
│  Account Balances               │
│  Cash: ₦1.45M                 │
│  Receivables: ₦780K            │
│  Payables: ₦320K               │
├─────────────────────────────────┤
│  Today's POS Sales (if POS on) │  ← Conditional section
│  ₦125,000 (23 sales)          │
├─────────────────────────────────┤
│  Inventory (if inventory on)   │  ← Conditional section
│  ⚠ 5 Low Stock | 🔴 2 Out     │
├─────────────────────────────────┤
│  Top Products                   │  ← Horizontal list or ranked list
│  1. iPhone 15 Pro - ₦675K      │
│  2. Galaxy S24 - ₦570K         │
├─────────────────────────────────┤
│  Top Customers                  │
│  1. John Doe - ₦450K           │
├─────────────────────────────────┤
│  Outstanding Invoices (5)       │
│  Total: ₦780K                  │
│  INV-0045 - ₦250K              │
├─────────────────────────────────┤
│  Recent Transactions            │
│  SV-0089  ₦75K   Jun 15       │
│  PUR-0034 ₦45K   Jun 14       │
└─────────────────────────────────┘
```

### Conditional Section Visibility

Use `enabled_modules` to show/hide entire dashboard sections:

```typescript
// Show/hide sections based on modules
const showInventorySection = data.enabled_modules.inventory;
const showPOSSection = data.enabled_modules.pos;
const showTopProducts = data.enabled_modules.inventory && data.top_products.length > 0;

// Use terminology for labels
const customerLabel = data.terminology?.customers ?? 'Customers';
const productLabel = data.terminology?.products ?? 'Products';
const salesLabel = data.terminology?.sales ?? 'Sales';
```

### Metric Card Color Guide

| Metric | Color When Positive | Color When Negative |
|--------|-------------------|-------------------|
| Revenue Growth | Green | Red |
| Net Profit | Green | Red |
| Revenue | Green | — |
| Expenses | Orange | — |
| Receivables | Blue | — |
| Payables | Red | — |

---

## Loading Strategy

### Recommended Approach: Hybrid Loading

```typescript
// 1. Initial load: fetch everything in one call
const loadDashboard = async () => {
  setLoading(true);
  try {
    const res = await api.get(`/dashboard`);
    setDashboardData(res.data.data);
  } finally {
    setLoading(false);
  }
};

// 2. Pull-to-refresh: reload full dashboard
const onRefresh = async () => {
  setRefreshing(true);
  await loadDashboard();
  setRefreshing(false);
};

// 3. Section refresh: use granular endpoints
const refreshMetrics = async () => {
  const res = await api.get(`/dashboard/summary`);
  setDashboardData(prev => ({ ...prev, metrics: res.data.data }));
};

// 4. Background polling (optional): refresh metrics every 60s
useEffect(() => {
  const interval = setInterval(refreshMetrics, 60000);
  return () => clearInterval(interval);
}, []);
```

### Error Handling

```typescript
// All endpoints return consistent error format
interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Handle 401 → redirect to login
// Handle 403 → show permission error
// Handle 500 → show retry option
```

---

## Quick Reference

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/dashboard` | Full dashboard (all data) |
| 2 | GET | `/dashboard/summary` | Metric cards only |
| 3 | GET | `/dashboard/revenue-chart` | 6-month bar chart data |
| 4 | GET | `/dashboard/daily-revenue` | 14-day sparkline data |
| 5 | GET | `/dashboard/revenue-breakdown` | Pie/doughnut chart data |
| 6 | GET | `/dashboard/balances` | Cash, receivables, payables |
| 7 | GET | `/dashboard/top-products` | Top selling products |
| 8 | GET | `/dashboard/top-customers` | Highest spending customers |
| 9 | GET | `/dashboard/recent-transactions` | Latest posted vouchers |
| 10 | GET | `/dashboard/outstanding-invoices` | Unpaid invoices |
| 11 | GET | `/dashboard/alerts` | Stock & receivable alerts |
| 12 | GET | `/dashboard/pos-today` | Today's POS sales |
| 13 | GET | `/dashboard/inventory-stats` | Low/out of stock counts |
| 14 | POST | `/dashboard/dismiss-tour` | Dismiss onboarding tour |
