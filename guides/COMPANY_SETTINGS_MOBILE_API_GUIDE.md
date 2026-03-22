# Company Settings Mobile API Guide

> Complete REST API reference for the **Company Settings** module. Designed for React Native / mobile developers integrating with the Ballie multi-tenant SaaS platform.

---

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Authorization](#authorization)
3. [Response Format](#response-format)
4. [Endpoints Overview](#endpoints-overview)
5. [Endpoint Details](#endpoint-details)
   - [Get All Settings](#1-get-all-settings)
   - [Get Company Info](#2-get-company-info)
   - [Update Company Info](#3-update-company-info)
   - [Get Business Details](#4-get-business-details)
   - [Update Business Details](#5-update-business-details)
   - [Get Branding](#6-get-branding)
   - [Upload Logo](#7-upload-logo)
   - [Remove Logo](#8-remove-logo)
   - [Get Preferences](#9-get-preferences)
   - [Update Preferences](#10-update-preferences)
   - [Get Modules](#11-get-modules)
   - [Update Modules](#12-update-modules)
   - [Reset Modules to Defaults](#13-reset-modules-to-defaults)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Recommended Mobile Screens](#recommended-mobile-screens)
8. [Error Handling](#error-handling)
9. [Implementation Notes](#implementation-notes)

---

## Base URL & Authentication

```
Base URL: {APP_URL}/api/v1/tenant/{tenant_slug}
```

All endpoints require authentication via **Bearer Token** (Laravel Sanctum):

```
Authorization: Bearer {token}
```

---

## Authorization

All Company Settings endpoints are restricted to **tenant owners only**. Non-owner users will receive a `403 Forbidden` response:

```json
{
  "success": false,
  "message": "Only tenant owners can access company settings."
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

---

## Endpoints Overview

| #  | Method   | Endpoint                            | Description                       |
|----|----------|-------------------------------------|-----------------------------------|
| 1  | `GET`    | `/settings/company`                 | Get all settings (all sections)   |
| 2  | `GET`    | `/settings/company/info`            | Get company information           |
| 3  | `PUT`    | `/settings/company/info`            | Update company information        |
| 4  | `GET`    | `/settings/company/business`        | Get business details              |
| 5  | `PUT`    | `/settings/company/business`        | Update business details           |
| 6  | `GET`    | `/settings/company/branding`        | Get branding/logo details         |
| 7  | `POST`   | `/settings/company/logo`            | Upload company logo               |
| 8  | `DELETE` | `/settings/company/logo`            | Remove company logo               |
| 9  | `GET`    | `/settings/company/preferences`     | Get regional preferences          |
| 10 | `PUT`    | `/settings/company/preferences`     | Update regional preferences       |
| 11 | `GET`    | `/settings/company/modules`         | Get modules list with metadata    |
| 12 | `PUT`    | `/settings/company/modules`         | Update enabled modules            |
| 13 | `POST`   | `/settings/company/modules/reset`   | Reset modules to category defaults|

---

## Endpoint Details

### 1. Get All Settings

Retrieve all company settings in a single call. Ideal for initial load of the settings screen.

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "company": {
      "name": "Acme Corp",
      "slug": "acme-corp",
      "email": "info@acmecorp.com",
      "phone": "+2348012345678",
      "website": "https://acmecorp.com",
      "address": "123 Business Avenue",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria"
    },
    "business": {
      "business_type": "retail",
      "business_registration_number": "RC123456",
      "tax_identification_number": "12345678-0001",
      "fiscal_year_start": "2025-01-01",
      "payment_terms": 30
    },
    "branding": {
      "logo": "http://localhost:8000/storage/logos/acme-logo.png",
      "logo_path": "logos/acme-logo.png"
    },
    "preferences": {
      "currency": "NGN",
      "currency_symbol": "₦",
      "date_format": "d/m/Y",
      "time_format": "12",
      "timezone": "Africa/Lagos",
      "language": "en"
    },
    "modules": [
      {
        "key": "dashboard",
        "name": "Dashboard",
        "description": "Business overview and analytics",
        "icon": "fas fa-tachometer-alt",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "accounting",
        "name": "Accounting",
        "description": "Chart of accounts, vouchers, ledger",
        "icon": "fas fa-calculator",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "inventory",
        "name": "Inventory",
        "description": "Product stock tracking & management",
        "icon": "fas fa-boxes",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "pos",
        "name": "POS",
        "description": "Point of sale terminal",
        "icon": "fas fa-cash-register",
        "core": false,
        "recommended": true,
        "enabled": false
      }
    ],
    "business_category": "trading"
  }
}
```

> **Note:** The `modules` array contains all 17 available modules. Only a subset is shown above for brevity.

---

### 2. Get Company Info

Retrieve company information only (name, contact, address).

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company/info
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "company": {
      "name": "Acme Corp",
      "slug": "acme-corp",
      "email": "info@acmecorp.com",
      "phone": "+2348012345678",
      "website": "https://acmecorp.com",
      "address": "123 Business Avenue",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria"
    }
  }
}
```

---

### 3. Update Company Info

Update company name, contact details, and address.

**Request:**
```
PUT /api/v1/tenant/{tenant_slug}/settings/company/info
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field     | Type   | Rules                    | Description               |
|-----------|--------|--------------------------|---------------------------|
| `name`    | string | **required**, max 255    | Company name              |
| `email`   | string | **required**, valid email | Company email             |
| `phone`   | string | optional, max 20         | Phone number              |
| `website` | string | optional, valid URL      | Company website           |
| `address` | string | optional, max 500        | Full address              |
| `city`    | string | optional, max 100        | City                      |
| `state`   | string | optional, max 100        | State / Province          |
| `country` | string | optional, max 100        | Country                   |

**Sample Payload:**
```json
{
  "name": "Acme Corporation",
  "email": "hello@acmecorp.com",
  "phone": "+2348098765432",
  "website": "https://acmecorp.com",
  "address": "456 Enterprise Street",
  "city": "Abuja",
  "state": "FCT",
  "country": "Nigeria"
}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Company information updated successfully.",
  "data": {
    "company": {
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "email": "hello@acmecorp.com",
      "phone": "+2348098765432",
      "website": "https://acmecorp.com",
      "address": "456 Enterprise Street",
      "city": "Abuja",
      "state": "FCT",
      "country": "Nigeria"
    }
  }
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field is required."],
    "website": ["The website format is invalid."]
  }
}
```

---

### 4. Get Business Details

Retrieve business legal and regulatory information.

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company/business
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "business": {
      "business_type": "retail",
      "business_registration_number": "RC123456",
      "tax_identification_number": "12345678-0001",
      "fiscal_year_start": "2025-01-01",
      "payment_terms": 30
    }
  }
}
```

---

### 5. Update Business Details

Update business type, registration numbers, fiscal year, and payment terms.

**Request:**
```
PUT /api/v1/tenant/{tenant_slug}/settings/company/business
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field                          | Type    | Rules                 | Description                      |
|--------------------------------|---------|-----------------------|----------------------------------|
| `business_type`                | string  | optional, max 100     | Business type (see options below)|
| `business_registration_number` | string  | optional, max 100     | CAC/RC number                    |
| `tax_identification_number`    | string  | optional, max 100     | TIN (e.g., 12345678-0001)       |
| `fiscal_year_start`            | string  | optional, format Y-m-d| Fiscal year start date           |
| `payment_terms`                | integer | optional, 0–365       | Default payment terms in days    |

**Business Type Options:**
| Value           | Label                    |
|-----------------|--------------------------|
| `retail`        | Retail & E-commerce      |
| `service`       | Service Business         |
| `restaurant`    | Restaurant & Food        |
| `manufacturing` | Manufacturing            |
| `wholesale`     | Wholesale & Distribution |
| `other`         | Other                    |

**Sample Payload:**
```json
{
  "business_type": "retail",
  "business_registration_number": "RC789012",
  "tax_identification_number": "98765432-0001",
  "fiscal_year_start": "2025-04-01",
  "payment_terms": 45
}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Business details updated successfully.",
  "data": {
    "business": {
      "business_type": "retail",
      "business_registration_number": "RC789012",
      "tax_identification_number": "98765432-0001",
      "fiscal_year_start": "2025-04-01",
      "payment_terms": 45
    }
  }
}
```

---

### 6. Get Branding

Retrieve company logo information.

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company/branding
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "branding": {
      "logo": "http://localhost:8000/storage/logos/acme-logo.png",
      "logo_path": "logos/acme-logo.png"
    }
  }
}
```

> When no logo is set, `logo` is `null` and `logo_path` is `null`.

---

### 7. Upload Logo

Upload or replace the company logo.

**Request:**
```
POST /api/v1/tenant/{tenant_slug}/settings/company/logo
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Parameters:**

| Field  | Type | Rules                                    | Description        |
|--------|------|------------------------------------------|--------------------|
| `logo` | file | **required**, image (jpeg,png,jpg,gif,svg), max 2MB | Company logo file |

**Sample Payload (FormData):**
```javascript
const formData = new FormData();
formData.append('logo', {
  uri: 'file:///path/to/logo.png',
  type: 'image/png',
  name: 'logo.png',
});
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Company logo updated successfully.",
  "data": {
    "branding": {
      "logo": "http://localhost:8000/storage/logos/abc123def.png",
      "logo_path": "logos/abc123def.png"
    }
  }
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "logo": ["The logo must be an image.", "The logo must not be greater than 2048 kilobytes."]
  }
}
```

---

### 8. Remove Logo

Delete the company logo.

**Request:**
```
DELETE /api/v1/tenant/{tenant_slug}/settings/company/logo
Authorization: Bearer {token}
```

**No body required.**

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Company logo removed successfully.",
  "data": {
    "branding": {
      "logo": null,
      "logo_path": null
    }
  }
}
```

---

### 9. Get Preferences

Retrieve regional preferences (currency, date format, timezone, etc.).

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company/preferences
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "preferences": {
      "currency": "NGN",
      "currency_symbol": "₦",
      "date_format": "d/m/Y",
      "time_format": "12",
      "timezone": "Africa/Lagos",
      "language": "en"
    }
  }
}
```

---

### 10. Update Preferences

Update regional preferences. Existing preferences not included in the request are preserved.

**Request:**
```
PUT /api/v1/tenant/{tenant_slug}/settings/company/preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field             | Type   | Rules          | Description                        |
|-------------------|--------|----------------|------------------------------------|
| `currency`        | string | optional, max 10 | Currency code (see options below)|
| `currency_symbol` | string | optional, max 5  | Currency display symbol          |
| `date_format`     | string | optional, max 20 | Date format pattern              |
| `time_format`     | string | optional, max 20 | `12` or `24`                     |
| `timezone`        | string | optional, max 50 | Timezone identifier              |
| `language`        | string | optional, max 10 | Language code                    |

**Available Options:**

| Field | Options |
|-------|---------|
| Currency | `NGN` (Nigerian Naira), `USD` (US Dollar), `EUR` (Euro), `GBP` (British Pound) |
| Currency Symbol | `₦`, `$`, `€`, `£` |
| Date Format | `d/m/Y` (DD/MM/YYYY), `m/d/Y` (MM/DD/YYYY), `Y-m-d` (YYYY-MM-DD) |
| Time Format | `12` (12-hour AM/PM), `24` (24-hour) |
| Timezone | `Africa/Lagos`, `UTC`, `America/New_York`, `Europe/London` |
| Language | `en` (English), `fr` (French) |

**Sample Payload:**
```json
{
  "currency": "USD",
  "currency_symbol": "$",
  "date_format": "m/d/Y",
  "time_format": "24",
  "timezone": "America/New_York",
  "language": "en"
}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Preferences updated successfully.",
  "data": {
    "preferences": {
      "currency": "USD",
      "currency_symbol": "$",
      "date_format": "m/d/Y",
      "time_format": "24",
      "timezone": "America/New_York",
      "language": "en"
    }
  }
}
```

---

### 11. Get Modules

Retrieve all available modules with their metadata, enabled state, and recommendations.

**Request:**
```
GET /api/v1/tenant/{tenant_slug}/settings/company/modules
Authorization: Bearer {token}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "modules": [
      {
        "key": "dashboard",
        "name": "Dashboard",
        "description": "Business overview and analytics",
        "icon": "fas fa-tachometer-alt",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "accounting",
        "name": "Accounting",
        "description": "Chart of accounts, vouchers, ledger",
        "icon": "fas fa-calculator",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "inventory",
        "name": "Inventory",
        "description": "Product stock tracking & management",
        "icon": "fas fa-boxes",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "crm",
        "name": "CRM",
        "description": "Customer/client management",
        "icon": "fas fa-users",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "pos",
        "name": "POS",
        "description": "Point of sale terminal",
        "icon": "fas fa-cash-register",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "ecommerce",
        "name": "E-commerce",
        "description": "Online storefront & orders",
        "icon": "fas fa-shopping-cart",
        "core": false,
        "recommended": true,
        "enabled": false
      },
      {
        "key": "payroll",
        "name": "Payroll",
        "description": "Employee salary & benefits management",
        "icon": "fas fa-money-check-alt",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "procurement",
        "name": "Procurement",
        "description": "Purchase orders & vendor management",
        "icon": "fas fa-truck",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "banking",
        "name": "Banking",
        "description": "Bank accounts & reconciliation",
        "icon": "fas fa-university",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "projects",
        "name": "Projects",
        "description": "Client projects, tasks & milestones",
        "icon": "fas fa-project-diagram",
        "core": false,
        "recommended": false,
        "enabled": false
      },
      {
        "key": "reports",
        "name": "Reports",
        "description": "Business & financial reports",
        "icon": "fas fa-chart-bar",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "statutory",
        "name": "Tax",
        "description": "Tax compliance & statutory filings",
        "icon": "fas fa-file-invoice",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "audit",
        "name": "Audit",
        "description": "Audit trail & activity logs",
        "icon": "fas fa-clipboard-check",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "admin",
        "name": "Admin",
        "description": "User & role management",
        "icon": "fas fa-user-shield",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "settings",
        "name": "Settings",
        "description": "Company & app configuration",
        "icon": "fas fa-cog",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "support",
        "name": "Support",
        "description": "Help desk & support tickets",
        "icon": "fas fa-headset",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "help",
        "name": "Help",
        "description": "Documentation & guides",
        "icon": "fas fa-question-circle",
        "core": true,
        "recommended": true,
        "enabled": true
      }
    ],
    "business_category": "trading"
  }
}
```

---

### 12. Update Modules

Enable or disable modules. Core modules are always enforced even if omitted.

**Request:**
```
PUT /api/v1/tenant/{tenant_slug}/settings/company/modules
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**

| Field       | Type     | Rules                            | Description                    |
|-------------|----------|----------------------------------|--------------------------------|
| `modules`   | string[] | **required**, array of valid keys | List of modules to enable     |

**Valid Module Keys:**
`dashboard`, `accounting`, `inventory`, `crm`, `pos`, `ecommerce`, `payroll`, `procurement`, `banking`, `projects`, `reports`, `statutory`, `audit`, `admin`, `settings`, `support`, `help`

**Sample Payload:**
```json
{
  "modules": [
    "dashboard",
    "accounting",
    "inventory",
    "crm",
    "pos",
    "payroll",
    "banking",
    "reports",
    "admin",
    "settings",
    "support",
    "help"
  ]
}
```

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Module settings updated successfully.",
  "data": {
    "modules": [
      {
        "key": "dashboard",
        "name": "Dashboard",
        "description": "Business overview and analytics",
        "icon": "fas fa-tachometer-alt",
        "core": true,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "inventory",
        "name": "Inventory",
        "description": "Product stock tracking & management",
        "icon": "fas fa-boxes",
        "core": false,
        "recommended": true,
        "enabled": true
      },
      {
        "key": "ecommerce",
        "name": "E-commerce",
        "description": "Online storefront & orders",
        "icon": "fas fa-shopping-cart",
        "core": false,
        "recommended": true,
        "enabled": false
      }
    ],
    "business_category": "trading"
  }
}
```

> **Note:** Full array of all 17 modules returned. Subset shown for brevity.

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "modules.0": ["The selected modules.0 is invalid."]
  }
}
```

---

### 13. Reset Modules to Defaults

Reset all modules to the category-based defaults for the tenant's business category.

**Request:**
```
POST /api/v1/tenant/{tenant_slug}/settings/company/modules/reset
Authorization: Bearer {token}
```

**No body required.**

**Sample Response (200):**
```json
{
  "success": true,
  "message": "Modules reset to category defaults successfully.",
  "data": {
    "modules": [
      {
        "key": "dashboard",
        "name": "Dashboard",
        "description": "Business overview and analytics",
        "icon": "fas fa-tachometer-alt",
        "core": true,
        "recommended": true,
        "enabled": true
      }
    ],
    "business_category": "trading"
  }
}
```

> Returns the full modules array after reset.

---

## TypeScript Interfaces

```typescript
// ─── API Response Wrapper ────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

// ─── Company Info ────────────────────────────────────────────
interface CompanyInfo {
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

// ─── Business Details ────────────────────────────────────────
type BusinessType = 'retail' | 'service' | 'restaurant' | 'manufacturing' | 'wholesale' | 'other';

interface BusinessDetails {
  business_type: BusinessType | null;
  business_registration_number: string | null;
  tax_identification_number: string | null;
  fiscal_year_start: string | null;  // YYYY-MM-DD
  payment_terms: number | null;
}

// ─── Branding ────────────────────────────────────────────────
interface Branding {
  logo: string | null;       // Full URL to logo image
  logo_path: string | null;  // Relative storage path
}

// ─── Preferences ─────────────────────────────────────────────
type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';
type DateFormat = 'd/m/Y' | 'm/d/Y' | 'Y-m-d';
type TimeFormat = '12' | '24';
type TimezoneId = 'Africa/Lagos' | 'UTC' | 'America/New_York' | 'Europe/London';
type LanguageCode = 'en' | 'fr';

interface Preferences {
  currency: CurrencyCode;
  currency_symbol: string;
  date_format: DateFormat;
  time_format: TimeFormat;
  timezone: TimezoneId;
  language: LanguageCode;
}

// ─── Module ──────────────────────────────────────────────────
type ModuleKey =
  | 'dashboard' | 'accounting' | 'inventory' | 'crm'
  | 'pos' | 'ecommerce' | 'payroll' | 'procurement'
  | 'banking' | 'projects' | 'reports' | 'statutory'
  | 'audit' | 'admin' | 'settings' | 'support' | 'help';

type BusinessCategory = 'trading' | 'manufacturing' | 'service' | 'hybrid';

interface Module {
  key: ModuleKey;
  name: string;
  description: string;
  icon: string;           // FontAwesome class (e.g., "fas fa-boxes")
  core: boolean;          // Cannot be disabled
  recommended: boolean;   // Recommended for this business category
  enabled: boolean;       // Currently enabled
}

// ─── Response Types ──────────────────────────────────────────
type GetAllSettingsResponse = ApiResponse<{
  company: CompanyInfo;
  business: BusinessDetails;
  branding: Branding;
  preferences: Preferences;
  modules: Module[];
  business_category: BusinessCategory;
}>;

type CompanyInfoResponse = ApiResponse<{ company: CompanyInfo }>;
type BusinessDetailsResponse = ApiResponse<{ business: BusinessDetails }>;
type BrandingResponse = ApiResponse<{ branding: Branding }>;
type PreferencesResponse = ApiResponse<{ preferences: Preferences }>;

type ModulesResponse = ApiResponse<{
  modules: Module[];
  business_category: BusinessCategory;
}>;

// ─── Request Payloads ────────────────────────────────────────
interface UpdateCompanyInfoPayload {
  name: string;           // Required
  email: string;          // Required
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface UpdateBusinessDetailsPayload {
  business_type?: BusinessType;
  business_registration_number?: string;
  tax_identification_number?: string;
  fiscal_year_start?: string;   // YYYY-MM-DD
  payment_terms?: number;       // 0-365
}

interface UpdatePreferencesPayload {
  currency?: CurrencyCode;
  currency_symbol?: string;
  date_format?: DateFormat;
  time_format?: TimeFormat;
  timezone?: string;
  language?: LanguageCode;
}

interface UpdateModulesPayload {
  modules: ModuleKey[];   // Required
}
```

---

## Recommended Mobile Screens

### 1. Company Settings Dashboard
- **Endpoint:** `GET /settings/company`
- **Features:**
  - Section cards for each settings area (Company, Business, Branding, Preferences, Modules)
  - Show summary info for each section (company name, logo thumbnail, currency, module count)
  - Tap a card to navigate to the detail/edit screen

### 2. Company Information Screen
- **Endpoints:** `GET /settings/company/info`, `PUT /settings/company/info`
- **Features:**
  - Form fields: Company Name (required), Email (required), Phone, Website, Address (multiline), City, State, Country
  - Inline validation for required fields and email format
  - Save button with loading state

### 3. Business Details Screen
- **Endpoints:** `GET /settings/company/business`, `PUT /settings/company/business`
- **Features:**
  - Business Type picker (dropdown/modal with 6 options)
  - Registration Number & TIN text inputs
  - Fiscal Year Start date picker
  - Payment Terms number input with stepper (0–365)
  - Helper text: "Number of days for payment due date"

### 4. Logo / Branding Screen
- **Endpoints:** `GET /settings/company/branding`, `POST /settings/company/logo`, `DELETE /settings/company/logo`
- **Features:**
  - Large logo preview (or placeholder when no logo)
  - "Change Logo" button → image picker (camera + gallery)
  - "Remove Logo" button (visible only when logo exists, with confirmation alert)
  - File size hint: "Max 2MB. Recommended 400×400px"
  - Accepted: JPEG, PNG, JPG, GIF, SVG

### 5. Preferences Screen
- **Endpoints:** `GET /settings/company/preferences`, `PUT /settings/company/preferences`
- **Features:**
  - Currency picker (NGN, USD, EUR, GBP) with symbol auto-fill
  - Date Format picker (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
  - Time Format toggle (12-hour / 24-hour)
  - Timezone picker
  - Language picker (English, French)
  - Live preview showing formatted date/time example

### 6. Module Management Screen
- **Endpoints:** `GET /settings/company/modules`, `PUT /settings/company/modules`, `POST /settings/company/modules/reset`
- **Features:**
  - Grid/list of all 17 modules with icon, name, description
  - Toggle switches for each module
  - Core modules: toggle disabled, "Core" badge displayed
  - Recommended modules: "Recommended" badge with business category name
  - Module counter: "X of 17 modules enabled"
  - "Reset to Defaults" button with confirmation dialog
  - Save button to batch-submit enabled modules

---

## Error Handling

| HTTP Code | Meaning          | When                                              |
|-----------|------------------|---------------------------------------------------|
| 200       | Success          | Operation completed successfully                   |
| 401       | Unauthorized     | Missing or invalid Bearer token                    |
| 403       | Forbidden        | Non-owner user attempting to access settings       |
| 422       | Validation Error | Invalid input data                                 |
| 500       | Server Error     | Unexpected server error                            |

### React Native API Client Example

```typescript
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: `${APP_URL}/api/v1/tenant/${tenantSlug}`,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) navigateToLogin();
    if (error.response?.status === 403) showForbiddenAlert();
    return Promise.reject(error);
  }
);

export const companySettingsApi = {
  // Get all settings at once
  getAll: () =>
    api.get<GetAllSettingsResponse>('/settings/company'),

  // Company Info
  getCompanyInfo: () =>
    api.get<CompanyInfoResponse>('/settings/company/info'),
  updateCompanyInfo: (data: UpdateCompanyInfoPayload) =>
    api.put<CompanyInfoResponse>('/settings/company/info', data),

  // Business Details
  getBusinessDetails: () =>
    api.get<BusinessDetailsResponse>('/settings/company/business'),
  updateBusinessDetails: (data: UpdateBusinessDetailsPayload) =>
    api.put<BusinessDetailsResponse>('/settings/company/business', data),

  // Branding
  getBranding: () =>
    api.get<BrandingResponse>('/settings/company/branding'),
  uploadLogo: (imageFile: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    formData.append('logo', imageFile as any);
    return api.post<BrandingResponse>('/settings/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeLogo: () =>
    api.delete<BrandingResponse>('/settings/company/logo'),

  // Preferences
  getPreferences: () =>
    api.get<PreferencesResponse>('/settings/company/preferences'),
  updatePreferences: (data: UpdatePreferencesPayload) =>
    api.put<PreferencesResponse>('/settings/company/preferences', data),

  // Modules
  getModules: () =>
    api.get<ModulesResponse>('/settings/company/modules'),
  updateModules: (modules: ModuleKey[]) =>
    api.put<ModulesResponse>('/settings/company/modules', { modules }),
  resetModules: () =>
    api.post<ModulesResponse>('/settings/company/modules/reset'),
};
```

---

## Implementation Notes

1. **Owner-Only Access:** All company settings endpoints are restricted to tenant owners. Check `user.role === 'owner'` before showing the settings screen, or handle the 403 response gracefully.

2. **Efficient Loading:** Use `GET /settings/company` (endpoint #1) to load all settings in a single request on initial screen load. Use individual GET endpoints only for refreshing a specific section after an update.

3. **Logo Upload:** Use `multipart/form-data` via `POST /settings/company/logo`. The old logo is automatically deleted from storage when replaced. Max file size: 2MB. Accepted formats: JPEG, PNG, JPG, GIF, SVG.

4. **Preferences Merging:** The `PUT /settings/company/preferences` endpoint merges submitted values with existing settings. Unsubmitted keys retain their current values. Defaults: currency=NGN, symbol=₦, date_format=d/m/Y, time_format=12, timezone=Africa/Lagos, language=en.

5. **Module Management:**
   - 17 total modules, 6 are core (cannot be disabled): Dashboard, Accounting, Admin, Settings, Support, Help
   - Core modules are always enforced — even if omitted from the `modules` array, they are automatically included
   - `recommended` flag indicates modules recommended for the tenant's business category
   - After resetting modules, `enabled_modules` is set to `null` and the system falls back to category defaults

6. **Business Categories:** The system supports 4 categories: `trading`, `manufacturing`, `service`, `hybrid`. The category determines default module recommendations. Tenants without a `business_type_id` default to `hybrid` (all modules enabled).

7. **Slug Immutability:** The company `slug` is returned in responses but cannot be changed via the API. It is set during tenant creation and used for URL routing.
