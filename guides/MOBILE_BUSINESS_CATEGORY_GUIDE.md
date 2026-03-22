# Mobile Business Category Guide

> A complete reference for mobile developers on how the **Business Category** system affects the Ballie app's UI, terminology, and module visibility.

---

## Table of Contents

1. [Overview](#overview)
2. [The 4 Business Categories](#the-4-business-categories)
3. [Module Visibility Matrix](#module-visibility-matrix)
4. [Terminology Mapping](#terminology-mapping)
5. [UI Adaptation Rules](#ui-adaptation-rules)
6. [API Integration](#api-integration)
7. [Business Types & Sectors](#business-types--sectors)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

Ballie supports 4 business categories. Each category determines:

1. **Which modules are enabled** — controls which screens/tabs are visible
2. **UI terminology** — labels change to match the business context (e.g., "Products" → "Services")
3. **Hidden features** — some features are completely hidden for certain categories (e.g., stock tracking for service businesses)

The category is set during onboarding and stored on the tenant. It can be changed later in Company Settings.

**Data Flow:**
```
Tenant.business_structure (column) → getBusinessCategory() → category string
↓
ModuleRegistry.getEnabledModules(tenant)  → controls visible screens
TerminologyService($tenant)              → controls UI labels
```

---

## The 4 Business Categories

| Category | Description | Example Businesses |
|----------|-------------|-------------------|
| **trading** | Buys and sells physical goods | Retail shops, wholesalers, distributors, supermarkets |
| **manufacturing** | Produces goods from raw materials | Factories, food processors, furniture makers |
| **service** | Provides intangible services | Consulting firms, law firms, design agencies, salons |
| **hybrid** | Combination of products and services | IT companies, auto repair shops, restaurants |

### How Category is Determined

The `business_structure` column on the Tenant model maps to categories:
- `"sole_proprietorship"`, `"partnership"`, `"llc"`, etc. are the legal structure
- The actual category comes from `getBusinessCategory()` which maps the tenant's selected business type to one of the 4 categories

---

## Module Visibility Matrix

### Default Modules by Category

| Module | Trading | Manufacturing | Service | Hybrid |
|--------|---------|---------------|---------|--------|
| **dashboard** | ✅ Core | ✅ Core | ✅ Core | ✅ Core |
| **accounting** | ✅ Core | ✅ Core | ✅ Core | ✅ Core |
| **inventory** | ✅ | ✅ | ❌ | ✅ |
| **crm** | ✅ | ✅ | ✅ | ✅ |
| **pos** | ✅ | ❌ | ❌ | ✅ |
| **payroll** | ✅ | ✅ | ✅ | ✅ |
| **banking** | ✅ | ✅ | ✅ | ✅ |
| **ecommerce** | ✅ | ❌ | ❌ | ✅ |
| **projects** | ❌ | ❌ | ✅ | ✅ |
| **procurement** | ✅ | ✅ | ❌ | ✅ |
| **admin** | ✅ Core | ✅ Core | ✅ Core | ✅ Core |
| **settings** | ✅ Core | ✅ Core | ✅ Core | ✅ Core |

> **Core modules** are always enabled and cannot be disabled.
> Owners can manually enable/disable non-core modules in Settings.

### How to Use in Mobile

The `GET /dashboard` response includes `enabled_modules`:

```typescript
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

// Example: conditionally render navigation items
const getNavigationItems = (modules: EnabledModules) => {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', always: true },
    { key: 'accounting', label: 'Accounting', icon: 'calculator', always: true },
  ];

  if (modules.inventory) items.push({ key: 'inventory', label: terminology.products, icon: 'cube' });
  if (modules.crm) items.push({ key: 'crm', label: terminology.crm, icon: 'people' });
  if (modules.pos) items.push({ key: 'pos', label: 'POS', icon: 'cart' });
  if (modules.payroll) items.push({ key: 'payroll', label: 'Payroll', icon: 'wallet' });
  if (modules.banking) items.push({ key: 'banking', label: 'Banking', icon: 'business' });
  if (modules.projects) items.push({ key: 'projects', label: terminology.projects ?? 'Projects', icon: 'briefcase' });
  if (modules.procurement) items.push({ key: 'procurement', label: terminology.purchase, icon: 'bag-handle' });

  return items;
};
```

---

## Terminology Mapping

The API returns a `terminology` object with all label overrides. **Always use these instead of hardcoded strings.**

### Full Terminology Table

| Key | Trading | Manufacturing | Service | Hybrid |
|-----|---------|---------------|---------|--------|
| `crm` | Customers | Customers | Clients | Clients & Customers |
| `crm_description` | Manage your customers... | Manage your customers... | Manage clients... | Manage clients & customers... |
| `customers` | Customers | Customers | Clients | Clients & Customers |
| `customer` | Customer | Customer | Client | Client/Customer |
| `products` | Products | Products | Services | Products & Services |
| `product` | Product | Product | Service | Product/Service |
| `product_description` | Physical goods... | Manufactured goods... | Service offerings... | Products & services... |
| `sales` | Sales | Sales | Revenue | Sales & Revenue |
| `sale` | Sale | Sale | Revenue | Sale |
| `purchase` | Purchase | Raw Material Purchase | _(hidden)_ | Purchase |
| `quotation` | Quotation | Quotation | Proposal | Proposal |
| `invoice` | Invoice | Invoice | Invoice | Invoice |
| `stock` | Inventory | Inventory | _(hidden)_ | Inventory |
| `low_stock` | Low Stock | Low Stock | _(hidden)_ | Low Stock |
| `cogs` | Cost of Goods Sold | Cost of Production | Cost of Service | COGS |
| `unit_cost` | Unit Cost | Production Cost | Service Cost | Unit Cost |
| `selling_price` | Selling Price | Selling Price | Service Rate | Price |
| `quantity` | Quantity | Quantity | _(hidden)_ | Quantity |
| `warehouse` | Warehouse | Warehouse | _(hidden)_ | Warehouse |
| `supplier` | Supplier | Supplier | Vendor | Supplier/Vendor |
| `procurement` | Procurement | Procurement | _(hidden)_ | Procurement |
| `manufacturing` | _(hidden)_ | Manufacturing | _(hidden)_ | Manufacturing |
| `pos` | Point of Sale | _(hidden)_ | _(hidden)_ | Point of Sale |
| `ecommerce` | E-Commerce | _(hidden)_ | _(hidden)_ | E-Commerce |
| `projects` | _(hidden)_ | _(hidden)_ | Projects | Projects |
| `project` | _(hidden)_ | _(hidden)_ | Project | Project |

> **_(hidden)_** means the value is `null` — the corresponding UI element should be completely hidden.

### Using Terminology in Code

```typescript
// Store terminology in a context provider
const { terminology } = useDashboard();

// Helper function
const getLabel = (key: string, fallback: string): string | null => {
  const term = terminology?.[key];
  if (term === null || term === undefined) return null; // hidden
  return term || fallback;
};

// Usage in components
const customerLabel = getLabel('customers', 'Customers');
const productLabel = getLabel('products', 'Products');
const salesLabel = getLabel('sales', 'Sales');

// Check if a term/section should be hidden
const isHidden = (key: string): boolean => {
  return terminology?.[key] === null || terminology?.[key] === undefined;
};

// Example: hide stock section for service businesses
if (!isHidden('stock')) {
  // Show inventory/stock section
}
```

---

## UI Adaptation Rules

### Rule 1: Hide Sections for Null Terms

If a terminology value is `null`, **completely remove** that UI element:

```typescript
// ❌ Wrong — shows empty/broken section
<Section title={terminology.stock || 'Stock'}> ... </Section>

// ✅ Correct — hide the section entirely
{terminology.stock !== null && (
  <Section title={terminology.stock}> ... </Section>
)}
```

### Rule 2: Module-Based Screen Visibility

Don't just check terminology — also check `enabled_modules`:

```typescript
// Dashboard sections to conditionally show/hide
const sections = {
  inventoryAlerts: modules.inventory && !isHidden('stock'),
  posToday: modules.pos && !isHidden('pos'),
  topProducts: modules.inventory && !isHidden('products'),
  projects: modules.projects && !isHidden('projects'),
  procurement: modules.procurement && !isHidden('procurement'),
};
```

### Rule 3: Adapt Dashboard Cards

| Business Category | Visible Dashboard Cards |
|-------------------|------------------------|
| **Trading** | Revenue, Expenses, Net Profit, Sales Count, Cash, Receivables, Payables, POS Today, Inventory Alerts, Top Products, Top Customers |
| **Manufacturing** | Revenue, Expenses (incl. Raw Materials), Net Profit, Production Cost, Cash, Receivables, Payables, Top Products, Top Customers |
| **Service** | Revenue, Expenses, Net Profit, Active Clients, Cash, Receivables, Payables, Top Clients, Outstanding Proposals |
| **Hybrid** | All cards visible |

### Rule 4: Chart Label Adaptation

Use terminology for chart labels too:

```typescript
// Revenue chart legend
const revenueLabel = terminology.sales ?? 'Revenue';
const expenseLabel = 'Expenses';

// Breakdown chart: use item.name from API (already correct)
```

---

## API Integration

### Getting Business Category Data

The `GET /dashboard` endpoint returns everything you need:

```typescript
// Response includes:
{
  "business_category": "service",    // the current category
  "terminology": { ... },            // all label overrides
  "enabled_modules": { ... },        // module flags
  // ... rest of dashboard data
}
```

### Getting Module Configuration

Use the Company Settings API for full module details:

```
GET /api/v1/tenant/{tenant}/settings/company/modules
```

Returns all modules with their enabled/disabled state.

### Changing Business Category

This is done through Company Settings:

```
PUT /api/v1/tenant/{tenant}/settings/company/business
```

Body:
```json
{
  "business_structure": "sole_proprietorship",
  "business_type_id": 5
}
```

> When the business type changes, the category may change, which updates module defaults and terminology. After this API call, **re-fetch the dashboard** to get updated terminology and module flags.

---

## Business Types & Sectors

Ballie has **97 predefined business types** across **11 sectors**. Each business type maps to one of the 4 categories.

### Sectors Overview

| Sector | Example Types | Typical Category |
|--------|--------------|-----------------|
| Retail & Trade | Supermarket, Fashion Store, Electronics | trading |
| Services | Consulting, Legal, Accounting | service |
| Manufacturing | Food Processing, Textiles, Furniture | manufacturing |
| Technology | Software Dev, IT Services | service / hybrid |
| Health & Wellness | Hospital, Pharmacy, Gym | service / hybrid |
| Food & Beverage | Restaurant, Bakery, Catering | hybrid |
| Construction | Building, Plumbing, Electrical | hybrid / manufacturing |
| Agriculture | Farming, Livestock, Fishery | trading / manufacturing |
| Education | School, Training Center | service |
| Transportation | Logistics, Taxi Service | service |
| Creative & Media | Design Agency, Photography | service |

The full list is available via the onboarding API.

---

## Implementation Checklist

### Must-Have for Mobile

- [ ] **Fetch `terminology` from dashboard API** on app load
- [ ] **Store terminology in app state** (Context/Redux/Provider)
- [ ] **Replace all hardcoded labels** with terminology values
- [ ] **Hide sections** where terminology value is `null`
- [ ] **Check `enabled_modules`** before showing module screens/tabs
- [ ] **Conditionally render navigation items** based on modules
- [ ] **Show correct dashboard cards** per business category
- [ ] **Use `business_category`** to choose default chart colors/themes if desired

### Nice-to-Have

- [ ] Cache terminology locally for offline support
- [ ] Animate section show/hide when category changes
- [ ] Show category-specific onboarding tips
- [ ] Adapt empty states per category (e.g., "No clients yet" vs "No customers yet")

### Testing Matrix

Test the mobile app with all 4 categories to verify:

| Test | What to Check |
|------|--------------|
| **Trading** | POS section visible, inventory visible, projects hidden |
| **Manufacturing** | POS hidden, e-commerce hidden, raw material purchase label |
| **Service** | Stock hidden, purchase hidden, POS hidden, "Clients" label, "Services" label, "Proposal" label |
| **Hybrid** | All sections visible, combined labels ("Products & Services") |

---

## Quick TypeScript Setup

```typescript
// types/business.ts
export type BusinessCategory = 'trading' | 'manufacturing' | 'service' | 'hybrid';

export interface BusinessContext {
  category: BusinessCategory;
  terminology: Record<string, string | null>;
  modules: EnabledModules;
  isHidden: (key: string) => boolean;
  getLabel: (key: string, fallback: string) => string | null;
}

// context/BusinessContext.tsx
import React, { createContext, useContext } from 'react';

const BusinessCtx = createContext<BusinessContext | null>(null);

export const BusinessProvider: React.FC<{ dashboard: DashboardResponse; children: React.ReactNode }> = ({
  dashboard,
  children,
}) => {
  const value: BusinessContext = {
    category: dashboard.business_category,
    terminology: dashboard.terminology,
    modules: dashboard.enabled_modules,
    isHidden: (key) => dashboard.terminology[key] === null || dashboard.terminology[key] === undefined,
    getLabel: (key, fallback) => {
      const term = dashboard.terminology[key];
      if (term === null || term === undefined) return null;
      return term || fallback;
    },
  };

  return <BusinessCtx.Provider value={value}>{children}</BusinessCtx.Provider>;
};

export const useBusiness = () => {
  const ctx = useContext(BusinessCtx);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
};

// Usage in any component:
const { getLabel, isHidden, modules } = useBusiness();

// Navigation label
<Tab.Screen name="CRM" options={{ title: getLabel('crm', 'Customers') }} />

// Conditional section
{!isHidden('stock') && modules.inventory && <InventorySection />}
```
