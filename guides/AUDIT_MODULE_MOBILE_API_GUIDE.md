# Audit Module - Mobile API Guide (React Native)

## Overview

The Audit Module provides a comprehensive activity tracking system across 11 business models. It enables mobile users to view who created, updated, posted, approved, or deleted records across the entire system.

### Tracked Models (11)

| Model Key | Label | Category |
|-----------|-------|----------|
| `customer` | Customer | CRM |
| `vendor` | Vendor | CRM |
| `product` | Product | Inventory |
| `voucher` | Voucher | Accounting |
| `sale` | Sale | POS |
| `project` | Project | Projects |
| `purchase_order` | Purchase Order | Procurement |
| `quotation` | Quotation | Accounting |
| `ledger_account` | Ledger Account | Accounting |
| `order` | Order | E-commerce |
| `physical_stock_voucher` | Physical Stock Voucher | Inventory |

### Action Types

| Action | Description | Color Suggestion |
|--------|-------------|-----------------|
| `created` | Record was created | Green `#10B981` |
| `updated` | Record was modified | Blue `#3B82F6` |
| `posted` | Record was posted/finalized | Purple `#8B5CF6` |
| `approved` | Record was approved | Emerald `#059669` |
| `deleted` | Record was deleted | Red `#EF4444` |

---

## Authentication

All endpoints require a Bearer token via Laravel Sanctum.

```
Authorization: Bearer {token}
```

---

## Base URL

```
{APP_URL}/api/v1/tenant/{tenant_slug}
```

All audit endpoints are under the `reports/audit` prefix:

```
{BASE_URL}/reports/audit
```

---

## Endpoints

### 1. GET `/reports/audit` — Audit Dashboard (Activity List)

Main endpoint returning paginated activities, statistics, users, and model options.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | integer | No | Filter by user who performed the action |
| `action` | string | No | Filter by action: `created`, `updated`, `posted`, `deleted` |
| `model` | string | No | Filter by model key: `customer`, `vendor`, `product`, `voucher`, `sale`, `project`, `purchase_order`, `quotation`, `ledger_account`, `order`, `physical_stock_voucher` |
| `date_from` | string (Y-m-d) | No | Start date for filtering |
| `date_to` | string (Y-m-d) | No | End date for filtering |
| `search` | string | No | Search in activity details and model names |
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 50, max: 100) |

#### Sample Request

```bash
GET /api/v1/tenant/my-company/reports/audit?model=voucher&action=posted&date_from=2025-01-01&per_page=20&page=1
Authorization: Bearer {token}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Audit dashboard retrieved successfully",
  "data": {
    "filters": {
      "user_id": null,
      "action": "posted",
      "model": "voucher",
      "date_from": "2025-01-01",
      "date_to": null,
      "search": null
    },
    "stats": {
      "total_records": 1245,
      "created_today": 18,
      "updated_today": 7,
      "posted_today": 3,
      "active_users": 5
    },
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "model_options": {
      "CRM": [
        { "key": "customer", "label": "Customer", "category": "CRM" },
        { "key": "vendor", "label": "Vendor", "category": "CRM" }
      ],
      "Inventory": [
        { "key": "product", "label": "Product", "category": "Inventory" },
        { "key": "physical_stock_voucher", "label": "Physical Stock Voucher", "category": "Inventory" }
      ],
      "Accounting": [
        { "key": "voucher", "label": "Voucher", "category": "Accounting" },
        { "key": "quotation", "label": "Quotation", "category": "Accounting" },
        { "key": "ledger_account", "label": "Ledger Account", "category": "Accounting" }
      ],
      "POS": [
        { "key": "sale", "label": "Sale", "category": "POS" }
      ],
      "Projects": [
        { "key": "project", "label": "Project", "category": "Projects" }
      ],
      "Procurement": [
        { "key": "purchase_order", "label": "Purchase Order", "category": "Procurement" }
      ],
      "E-commerce": [
        { "key": "order", "label": "Order", "category": "E-commerce" }
      ]
    },
    "activities": {
      "current_page": 1,
      "data": [
        {
          "id": 45,
          "model": "Voucher",
          "model_key": "voucher",
          "category": "Accounting",
          "model_name": "Payment Voucher #PV-0023",
          "action": "posted",
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
          },
          "timestamp": "2025-06-15T14:30:00.000000Z",
          "details": "Posted Voucher: Payment Voucher #PV-0023"
        },
        {
          "id": 12,
          "model": "Voucher",
          "model_key": "voucher",
          "category": "Accounting",
          "model_name": "Receipt Voucher #RV-0010",
          "action": "posted",
          "user": {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com"
          },
          "timestamp": "2025-06-15T10:15:00.000000Z",
          "details": "Posted Voucher: Receipt Voucher #RV-0010"
        }
      ],
      "first_page_url": "https://app.example.com/api/v1/tenant/my-company/reports/audit?page=1",
      "from": 1,
      "last_page": 3,
      "last_page_url": "https://app.example.com/api/v1/tenant/my-company/reports/audit?page=3",
      "next_page_url": "https://app.example.com/api/v1/tenant/my-company/reports/audit?page=2",
      "path": "https://app.example.com/api/v1/tenant/my-company/reports/audit",
      "per_page": 20,
      "prev_page_url": null,
      "to": 20,
      "total": 55
    }
  }
}
```

---

### 2. GET `/reports/audit/{model}/{id}` — Record Audit Trail

Shows the full audit history for a specific record.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model key (e.g., `customer`, `voucher`, `quotation`) |
| `id` | integer | Yes | Record ID |

#### Sample Request

```bash
GET /api/v1/tenant/my-company/reports/audit/quotation/7
Authorization: Bearer {token}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Audit trail retrieved successfully",
  "data": {
    "model": "quotation",
    "model_label": "Quotation",
    "category": "Accounting",
    "record": {
      "id": 7,
      "name": "Quotation #QTN-0007",
      "created_at": "2025-06-10T08:00:00.000000Z",
      "updated_at": "2025-06-14T16:45:00.000000Z"
    },
    "activities": [
      {
        "action": "posted",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "timestamp": "2025-06-14T16:45:00.000000Z",
        "details": "Quotation converted to invoice"
      },
      {
        "action": "posted",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "timestamp": "2025-06-13T11:00:00.000000Z",
        "details": "Quotation accepted"
      },
      {
        "action": "updated",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "timestamp": "2025-06-12T09:30:00.000000Z",
        "details": "Quotation sent to customer"
      },
      {
        "action": "updated",
        "user": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "timestamp": "2025-06-11T14:20:00.000000Z",
        "details": "Quotation information updated"
      },
      {
        "action": "created",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "timestamp": "2025-06-10T08:00:00.000000Z",
        "details": "Quotation created"
      }
    ]
  }
}
```

#### Error Response — Invalid Model (422)

```json
{
  "success": false,
  "message": "Invalid audit model. Valid models: customer, vendor, product, voucher, sale, project, purchase_order, quotation, ledger_account, order, physical_stock_voucher",
  "data": null
}
```

#### Error Response — Record Not Found (404)

```json
{
  "message": "No query results for model [App\\Models\\Quotation]."
}
```

---

### 3. GET `/reports/audit/statistics` — Audit Statistics

Returns audit statistics summary. Useful for dashboard cards.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string (Y-m-d) | No | Filter total_records from this date |
| `date_to` | string (Y-m-d) | No | Filter total_records up to this date |

#### Sample Request

```bash
GET /api/v1/tenant/my-company/reports/audit/statistics
Authorization: Bearer {token}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Audit statistics retrieved successfully",
  "data": {
    "total_records": 1245,
    "created_today": 18,
    "updated_today": 7,
    "posted_today": 3,
    "active_users": 5
  }
}
```

---

### 4. GET `/reports/audit/models` — List Auditable Models

Returns available model types and action types for building filter UIs.

#### Sample Request

```bash
GET /api/v1/tenant/my-company/reports/audit/models
Authorization: Bearer {token}
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "message": "Auditable models retrieved successfully",
  "data": {
    "models": {
      "CRM": [
        { "key": "customer", "label": "Customer", "category": "CRM" },
        { "key": "vendor", "label": "Vendor", "category": "CRM" }
      ],
      "Inventory": [
        { "key": "product", "label": "Product", "category": "Inventory" },
        { "key": "physical_stock_voucher", "label": "Physical Stock Voucher", "category": "Inventory" }
      ],
      "Accounting": [
        { "key": "voucher", "label": "Voucher", "category": "Accounting" },
        { "key": "quotation", "label": "Quotation", "category": "Accounting" },
        { "key": "ledger_account", "label": "Ledger Account", "category": "Accounting" }
      ],
      "POS": [
        { "key": "sale", "label": "Sale", "category": "POS" }
      ],
      "Projects": [
        { "key": "project", "label": "Project", "category": "Projects" }
      ],
      "Procurement": [
        { "key": "purchase_order", "label": "Purchase Order", "category": "Procurement" }
      ],
      "E-commerce": [
        { "key": "order", "label": "Order", "category": "E-commerce" }
      ]
    },
    "actions": ["created", "updated", "posted", "deleted"]
  }
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found

```json
{
  "message": "No query results for model [App\\Models\\Customer]."
}
```

### 422 Validation Error

```json
{
  "success": false,
  "message": "Invalid audit model. Valid models: customer, vendor, ...",
  "data": null
}
```

---

## React Native Integration

### API Service Example

```typescript
// src/services/auditApi.ts
import { apiClient } from './apiClient'; // your axios/fetch wrapper

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

export interface AuditActivity {
  id: number;
  model: string;
  model_key: string;
  category: string;
  model_name: string;
  action: 'created' | 'updated' | 'posted' | 'approved' | 'deleted';
  user: AuditUser | null;
  timestamp: string;
  details: string;
}

export interface AuditStats {
  total_records: number;
  created_today: number;
  updated_today: number;
  posted_today: number;
  active_users: number;
}

export interface AuditModelOption {
  key: string;
  label: string;
  category: string;
}

export interface AuditFilters {
  user_id?: number;
  action?: string;
  model?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AuditDashboardResponse {
  success: boolean;
  message: string;
  data: {
    filters: AuditFilters;
    stats: AuditStats;
    users: AuditUser[];
    model_options: Record<string, AuditModelOption[]>;
    activities: {
      current_page: number;
      data: AuditActivity[];
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AuditTrailActivity {
  action: string;
  user: AuditUser | null;
  timestamp: string;
  details: string;
}

export interface AuditTrailResponse {
  success: boolean;
  message: string;
  data: {
    model: string;
    model_label: string;
    category: string;
    record: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    };
    activities: AuditTrailActivity[];
  };
}

// Fetch audit dashboard with filters
export const getAuditDashboard = (tenantSlug: string, filters?: AuditFilters) =>
  apiClient.get<AuditDashboardResponse>(
    `/api/v1/tenant/${tenantSlug}/reports/audit`,
    { params: filters }
  );

// Fetch audit trail for a specific record
export const getAuditTrail = (tenantSlug: string, modelKey: string, recordId: number) =>
  apiClient.get<AuditTrailResponse>(
    `/api/v1/tenant/${tenantSlug}/reports/audit/${modelKey}/${recordId}`
  );

// Fetch audit statistics only
export const getAuditStatistics = (tenantSlug: string, dateFrom?: string, dateTo?: string) =>
  apiClient.get<{ success: boolean; data: AuditStats }>(
    `/api/v1/tenant/${tenantSlug}/reports/audit/statistics`,
    { params: { date_from: dateFrom, date_to: dateTo } }
  );

// Fetch available models and actions for filter dropdowns
export const getAuditModels = (tenantSlug: string) =>
  apiClient.get<{ success: boolean; data: { models: Record<string, AuditModelOption[]>; actions: string[] } }>(
    `/api/v1/tenant/${tenantSlug}/reports/audit/models`
  );
```

---

## Mobile Screen Designs

### Screen 1: Audit Dashboard

**Route**: Main audit tab/screen

**Layout**:
```
┌─────────────────────────────────┐
│  ← Audit Trail                  │
├─────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌────────┐ │
│ │ 1,245 │ │  18   │ │   5    │ │
│ │Records│ │Created│ │ Active │ │
│ │ Total │ │ Today │ │ Users  │ │
│ └───────┘ └───────┘ └────────┘ │
│ ┌───────┐ ┌───────┐            │
│ │   7   │ │   3   │            │
│ │Updated│ │Posted │            │
│ │ Today │ │ Today │            │
│ └───────┘ └───────┘            │
├─────────────────────────────────┤
│ 🔍 Search activities...        │
├─────────────────────────────────┤
│ [All Models ▼] [All Actions ▼] │
│ [All Users  ▼] [Date Range  ▼] │
├─────────────────────────────────┤
│ Recent Activity                 │
├─────────────────────────────────┤
│ ● Created Customer: John Doe   │
│   by Jane Smith · 2 min ago    │
│   CRM                          │
├─────────────────────────────────┤
│ ● Posted Voucher: PV #0023     │
│   by John Doe · 15 min ago     │
│   Accounting                   │
├─────────────────────────────────┤
│ ● Updated Product: Widget A    │
│   by Admin · 1 hour ago        │
│   Inventory                    │
├─────────────────────────────────┤
│ ● Created Sale: Sale #0045     │
│   by Cashier · 2 hours ago     │
│   POS                          │
├─────────────────────────────────┤
│         Load More               │
└─────────────────────────────────┘
```

**Key Features**:
- **Stats Cards** at the top — call `GET /reports/audit/statistics` or use stats from the main `index` response
- **Filter Bar** — use `model_options` and `users` from the response. Model dropdown should show grouped sections (CRM, Accounting, etc.)
- **Activity List** — FlatList with infinite scroll pagination. Each item shows:
  - Colored dot based on `action` (green=created, blue=updated, purple=posted, red=deleted)
  - Activity `details` text
  - User name + relative time (`timestamp`)
  - Category badge
- **Tap on item** → navigate to Record Audit Trail screen

**Data Loading**:
```typescript
// Initial load
const { data } = await getAuditDashboard(tenantSlug, { per_page: 20 });

// Filter change
const { data } = await getAuditDashboard(tenantSlug, {
  model: 'voucher',
  action: 'posted',
  per_page: 20,
});

// Load more (pagination)
const { data } = await getAuditDashboard(tenantSlug, {
  ...currentFilters,
  page: currentPage + 1,
});
```

---

### Screen 2: Record Audit Trail (Detail)

**Route**: Navigate here when tapping an activity item

**Layout**:
```
┌─────────────────────────────────┐
│  ← Audit Trail                  │
├─────────────────────────────────┤
│  📋 Quotation #QTN-0007        │
│  Category: Accounting           │
│  Created: Jun 10, 2025          │
│  Last Updated: Jun 14, 2025     │
├─────────────────────────────────┤
│  Timeline                       │
├─────────────────────────────────┤
│  ◉ Quotation converted to      │
│  │ invoice                      │
│  │ John Doe · Jun 14, 4:45 PM  │
│  │                              │
│  ◉ Quotation accepted           │
│  │ John Doe · Jun 13, 11:00 AM │
│  │                              │
│  ◉ Quotation sent to customer   │
│  │ John Doe · Jun 12, 9:30 AM  │
│  │                              │
│  ◉ Quotation information        │
│  │ updated                      │
│  │ Jane Smith · Jun 11, 2:20 PM│
│  │                              │
│  ◉ Quotation created            │
│    John Doe · Jun 10, 8:00 AM  │
└─────────────────────────────────┘
```

**Key Features**:
- **Header card** showing record name, category, created/updated dates
- **Vertical timeline** with colored nodes per action type
- Each timeline node shows: `details`, user name, formatted timestamp
- If `user` is `null`, show "System" (for Order model activities)

**Data Loading**:
```typescript
// From activity list, you have model_key and id
const { data } = await getAuditTrail(tenantSlug, 'quotation', 7);

// Access
const record = data.data.record;     // { id, name, created_at, updated_at }
const activities = data.data.activities; // array of trail events
```

---

### Screen 3: Model Filter Picker (Bottom Sheet)

**Layout**:
```
┌─────────────────────────────────┐
│  Select Model                   │
├─────────────────────────────────┤
│  ○ All Models                   │
├─────────────────────────────────┤
│  CRM                            │
│  ○ Customer                     │
│  ○ Vendor                       │
├─────────────────────────────────┤
│  Inventory                      │
│  ○ Product                      │
│  ○ Physical Stock Voucher       │
├─────────────────────────────────┤
│  Accounting                     │
│  ○ Voucher                      │
│  ○ Quotation                    │
│  ○ Ledger Account               │
├─────────────────────────────────┤
│  POS                            │
│  ○ Sale                         │
├─────────────────────────────────┤
│  Projects                       │
│  ○ Project                      │
├─────────────────────────────────┤
│  Procurement                    │
│  ○ Purchase Order               │
├─────────────────────────────────┤
│  E-commerce                     │
│  ○ Order                        │
├─────────────────────────────────┤
│         [ Apply ]               │
└─────────────────────────────────┘
```

**Data Loading**:
```typescript
// Use model_options from the main response, or call dedicated endpoint
const { data } = await getAuditModels(tenantSlug);
const models = data.data.models;   // grouped by category
const actions = data.data.actions; // ['created', 'updated', 'posted', 'deleted']
```

---

## Usage Tips

### Polling / Auto-Refresh
Consider polling the statistics endpoint every 30-60 seconds on the dashboard for live stats updates:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refreshStats();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

### Action Color Mapping
```typescript
const ACTION_COLORS: Record<string, string> = {
  created: '#10B981',   // green
  updated: '#3B82F6',   // blue
  posted:  '#8B5CF6',   // purple
  approved:'#059669',   // emerald
  deleted: '#EF4444',   // red
};

const ACTION_ICONS: Record<string, string> = {
  created: 'plus-circle',
  updated: 'pencil',
  posted:  'check-circle',
  approved:'shield-check',
  deleted: 'trash',
};
```

### Category Badge Colors
```typescript
const CATEGORY_COLORS: Record<string, string> = {
  CRM:         '#3B82F6',
  Inventory:   '#F59E0B',
  Accounting:  '#8B5CF6',
  POS:         '#10B981',
  Projects:    '#6366F1',
  Procurement: '#EC4899',
  'E-commerce':'#F97316',
};
```

### Relative Time Formatting
Use a library like `date-fns` or `moment`:
```typescript
import { formatDistanceToNow } from 'date-fns';

const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
// "2 minutes ago", "3 hours ago", "2 days ago"
```

### Deep Linking from Other Screens
You can link to the audit trail from any record detail screen:
```typescript
// From a customer detail screen
navigation.navigate('AuditTrail', {
  modelKey: 'customer',
  recordId: customer.id,
});

// From a voucher detail screen
navigation.navigate('AuditTrail', {
  modelKey: 'voucher',
  recordId: voucher.id,
});
```
