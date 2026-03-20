# Statutory & Tax Module - Mobile API Guide (React Native)

> **Base URL:** `{APP_URL}/api/v1/tenant/{tenant_slug}`
> **Auth:** `Authorization: Bearer {token}` (Sanctum)
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Dashboard (Overview)](#1-dashboard)
2. [VAT Report](#2-vat-report)
3. [PAYE Report](#3-paye-report)
4. [Pension Report](#4-pension-report)
5. [NSITF Report](#5-nsitf-report)
6. [Tax Settings](#6-tax-settings)
7. [Tax Filing History](#7-tax-filing-history)
8. [TypeScript Interfaces](#8-typescript-interfaces)
9. [Screen Wireframes](#9-screen-wireframes)

---

## 1. Dashboard

Get an overview of all statutory obligations for the current month.

### `GET /statutory/dashboard`

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "month": "March 2026",
      "start": "2026-03-01",
      "end": "2026-03-31"
    },
    "vat": {
      "output": 125000.00,
      "input": 45000.00,
      "net_payable": 80000.00,
      "rate": 7.50
    },
    "paye": {
      "total_tax": 350000.00
    },
    "pension": {
      "total": 540000.00,
      "employee_rate": 8,
      "employer_rate": 10
    },
    "nsitf": {
      "total": 30000.00,
      "rate": 1
    },
    "compliance": {
      "overdue_filings": 2
    }
  }
}
```

---

## 2. VAT Report

Get detailed VAT output/input transactions for a date range.

### `GET /statutory/vat/report`

**Query Parameters:**

| Param       | Type   | Required | Default              |
|-------------|--------|----------|----------------------|
| start_date  | date   | No       | Start of month       |
| end_date    | date   | No       | End of month         |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-31"
    },
    "summary": {
      "vat_output": 125000.00,
      "vat_input": 45000.00,
      "net_payable": 80000.00,
      "rate": 7.50
    },
    "output_transactions": [
      {
        "id": 1,
        "date": "2026-03-15",
        "voucher_number": "SV-0024",
        "type": "Sales Voucher",
        "description": "Sales to ABC Ltd",
        "amount": 7500.00
      }
    ],
    "input_transactions": [
      {
        "id": 2,
        "date": "2026-03-10",
        "voucher_number": "PV-0012",
        "type": "Purchase Voucher",
        "description": "Office supplies purchase",
        "amount": 3750.00
      }
    ]
  }
}
```

---

## 3. PAYE Report

Get employee income tax breakdown per period, with optional department filter.

### `GET /statutory/paye/report`

**Query Parameters:**

| Param          | Type   | Required | Default        |
|----------------|--------|----------|----------------|
| start_date     | date   | No       | Start of month |
| end_date       | date   | No       | End of month   |
| department_id  | int    | No       | All depts      |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-31"
    },
    "summary": {
      "total_gross": 3000000.00,
      "total_relief": 600000.00,
      "total_taxable": 2400000.00,
      "total_tax": 350000.00,
      "employee_count": 25
    },
    "employees": [
      {
        "employee_id": 1,
        "name": "John Adebayo",
        "tin": "TIN-00123456",
        "department": "Engineering",
        "gross_salary": 250000.00,
        "consolidated_relief": 50000.00,
        "taxable_income": 200000.00,
        "monthly_tax": 28000.00
      }
    ],
    "departments": [
      { "id": 1, "name": "Engineering" },
      { "id": 2, "name": "Marketing" }
    ]
  }
}
```

---

## 4. Pension Report

Get pension contribution breakdown by employee and PFA provider.

### `GET /statutory/pension/report`

**Query Parameters:**

| Param       | Type   | Required | Default        |
|-------------|--------|----------|----------------|
| start_date  | date   | No       | Start of month |
| end_date    | date   | No       | End of month   |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-31"
    },
    "summary": {
      "total_employee_contribution": 240000.00,
      "total_employer_contribution": 300000.00,
      "total_contribution": 540000.00,
      "employee_count": 25,
      "employee_rate": 8,
      "employer_rate": 10
    },
    "by_pfa": [
      {
        "pfa_provider": "ARM Pension",
        "employee_count": 8,
        "employee_contribution": 80000.00,
        "employer_contribution": 100000.00,
        "total_contribution": 180000.00
      }
    ],
    "employees": [
      {
        "employee_id": 1,
        "name": "John Adebayo",
        "pfa_provider": "ARM Pension",
        "pfa_name": "ARM Pension Managers",
        "rsa_pin": "PEN100012345678",
        "pension_pin": "PIN-001",
        "employee_contribution": 20000.00,
        "employer_contribution": 25000.00,
        "total": 45000.00
      }
    ]
  }
}
```

---

## 5. NSITF Report

Get NSITF (National Social Insurance Trust Fund) contribution breakdown.

### `GET /statutory/nsitf/report`

**Query Parameters:**

| Param       | Type   | Required | Default        |
|-------------|--------|----------|----------------|
| start_date  | date   | No       | Start of month |
| end_date    | date   | No       | End of month   |

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2026-03-01",
      "end_date": "2026-03-31"
    },
    "summary": {
      "total_nsitf": 30000.00,
      "employee_count": 25,
      "rate": 1
    },
    "employees": [
      {
        "employee_id": 1,
        "name": "John Adebayo",
        "department": "Engineering",
        "gross_salary": 250000.00,
        "nsitf_contribution": 2500.00
      }
    ]
  }
}
```

---

## 6. Tax Settings

### Get Settings

`GET /statutory/settings`

**Response:**

```json
{
  "success": true,
  "data": {
    "vat_rate": 7.50,
    "vat_registration_number": "VAT-NG-12345678",
    "tax_identification_number": "TIN-00987654321",
    "tax_rates": [
      {
        "id": 1,
        "name": "Standard VAT",
        "rate": 7.50,
        "type": "percentage",
        "is_default": true
      }
    ],
    "statutory_rates": {
      "pension_employee": 8,
      "pension_employer": 10,
      "nsitf": 1
    }
  }
}
```

### Update Settings

`PUT /statutory/settings`

**Payload:**

```json
{
  "vat_rate": 7.50,
  "vat_registration_number": "VAT-NG-12345678",
  "tax_identification_number": "TIN-00987654321"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tax settings updated successfully.",
  "data": {
    "vat_rate": 7.50,
    "vat_registration_number": "VAT-NG-12345678",
    "tax_identification_number": "TIN-00987654321"
  }
}
```

---

## 7. Tax Filing History

### List Filings

`GET /statutory/filings`

**Query Parameters:**

| Param    | Type   | Required | Default  |
|----------|--------|----------|----------|
| type     | string | No       | All      |
| status   | string | No       | All      |
| year     | int    | No       | All      |
| per_page | int    | No       | 20       |
| page     | int    | No       | 1        |

**Type Values:** `vat`, `paye`, `pension`, `nsitf`, `wht`, `cit`
**Status Values:** `draft`, `filed`, `paid`, `overdue`

**Response:**

```json
{
  "success": true,
  "data": {
    "filings": [
      {
        "id": 1,
        "tenant_id": 1,
        "type": "vat",
        "reference_number": "FIRS-2026-001",
        "period_label": "February 2026",
        "period_start": "2026-02-01",
        "period_end": "2026-02-28",
        "amount": 80000.00,
        "status": "paid",
        "due_date": "2026-03-21",
        "filed_date": "2026-03-15T10:00:00.000000Z",
        "paid_date": "2026-03-18T14:30:00.000000Z",
        "payment_reference": "PAY-REF-001",
        "notes": "Filed via FIRS portal",
        "filed_by": 1,
        "created_at": "2026-03-10T09:00:00.000000Z",
        "updated_at": "2026-03-18T14:30:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 20,
      "total": 48
    },
    "summary": {
      "paid": 30,
      "filed": 10,
      "draft": 5,
      "overdue": 3
    }
  }
}
```

### Create Filing

`POST /statutory/filings`

**Payload:**

```json
{
  "type": "vat",
  "period_label": "March 2026",
  "period_start": "2026-03-01",
  "period_end": "2026-03-31",
  "amount": 80000.00,
  "status": "draft",
  "due_date": "2026-04-21",
  "reference_number": "FIRS-2026-003",
  "notes": "Monthly VAT return"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Tax filing recorded successfully.",
  "data": {
    "id": 5,
    "type": "vat",
    "period_label": "March 2026",
    "amount": 80000.00,
    "status": "draft",
    "due_date": "2026-04-21",
    "reference_number": "FIRS-2026-003"
  }
}
```

### Update Filing Status

`PATCH /statutory/filings/{filing_id}/status`

**Payload:**

```json
{
  "status": "paid",
  "payment_reference": "PAY-REF-003"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Filing status updated.",
  "data": { "...full filing object..." }
}
```

### Delete Filing

`DELETE /statutory/filings/{filing_id}`

**Response:**

```json
{
  "success": true,
  "message": "Filing record deleted."
}
```

---

## 8. TypeScript Interfaces

```typescript
// === Dashboard ===
interface StatutoryDashboard {
  period: { month: string; start: string; end: string };
  vat: { output: number; input: number; net_payable: number; rate: number };
  paye: { total_tax: number };
  pension: { total: number; employee_rate: number; employer_rate: number };
  nsitf: { total: number; rate: number };
  compliance: { overdue_filings: number };
}

// === VAT Report ===
interface VatTransaction {
  id: number;
  date: string;
  voucher_number: string;
  type: string | null;
  description: string | null;
  amount: number;
}

interface VatReport {
  period: DateRange;
  summary: {
    vat_output: number;
    vat_input: number;
    net_payable: number;
    rate: number;
  };
  output_transactions: VatTransaction[];
  input_transactions: VatTransaction[];
}

// === PAYE Report ===
interface PayeEmployee {
  employee_id: number;
  name: string;
  tin: string | null;
  department: string | null;
  gross_salary: number;
  consolidated_relief: number;
  taxable_income: number;
  monthly_tax: number;
}

interface PayeReport {
  period: DateRange;
  summary: {
    total_gross: number;
    total_relief: number;
    total_taxable: number;
    total_tax: number;
    employee_count: number;
  };
  employees: PayeEmployee[];
  departments: { id: number; name: string }[];
}

// === Pension Report ===
interface PensionPFA {
  pfa_provider: string;
  employee_count: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
}

interface PensionEmployee {
  employee_id: number;
  name: string;
  pfa_provider: string | null;
  pfa_name: string | null;
  rsa_pin: string | null;
  pension_pin: string | null;
  employee_contribution: number;
  employer_contribution: number;
  total: number;
}

interface PensionReport {
  period: DateRange;
  summary: {
    total_employee_contribution: number;
    total_employer_contribution: number;
    total_contribution: number;
    employee_count: number;
    employee_rate: number;
    employer_rate: number;
  };
  by_pfa: PensionPFA[];
  employees: PensionEmployee[];
}

// === NSITF Report ===
interface NsitfEmployee {
  employee_id: number;
  name: string;
  department: string | null;
  gross_salary: number;
  nsitf_contribution: number;
}

interface NsitfReport {
  period: DateRange;
  summary: {
    total_nsitf: number;
    employee_count: number;
    rate: number;
  };
  employees: NsitfEmployee[];
}

// === Settings ===
interface TaxSettings {
  vat_rate: number;
  vat_registration_number: string | null;
  tax_identification_number: string | null;
  tax_rates: TaxRate[];
  statutory_rates: {
    pension_employee: number;
    pension_employer: number;
    nsitf: number;
  };
}

interface TaxRate {
  id: number;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  is_default: boolean;
}

// === Filing History ===
type FilingType = 'vat' | 'paye' | 'pension' | 'nsitf' | 'wht' | 'cit';
type FilingStatus = 'draft' | 'filed' | 'paid' | 'overdue';

interface TaxFiling {
  id: number;
  tenant_id: number;
  type: FilingType;
  reference_number: string | null;
  period_label: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: FilingStatus;
  due_date: string | null;
  filed_date: string | null;
  paid_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  filed_by: number | null;
  created_at: string;
  updated_at: string;
}

interface FilingListResponse {
  filings: TaxFiling[];
  pagination: Pagination;
  summary: {
    paid: number;
    filed: number;
    draft: number;
    overdue: number;
  };
}

// === Shared ===
interface DateRange {
  start_date: string;
  end_date: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
```

---

## 9. Screen Wireframes

### Dashboard Screen
```
┌─────────────────────────────────────┐
│  Statutory & Tax                    │
│  March 2026                         │
├─────────────────────────────────────┤
│  ⚠️ 2 Overdue Filings  [View →]    │
├──────────┬──────────────────────────┤
│ VAT Out  │  ₦125,000.00            │
│ VAT In   │  ₦45,000.00             │
│ Net VAT  │  ₦80,000.00  [Report →] │
├──────────┼──────────────────────────┤
│ PAYE     │  ₦350,000.00 [Report →] │
├──────────┼──────────────────────────┤
│ Pension  │  ₦540,000.00 [Report →] │
│ (8%+10%) │                          │
├──────────┼──────────────────────────┤
│ NSITF    │  ₦30,000.00  [Report →] │
│ (1%)     │                          │
├──────────┴──────────────────────────┤
│  Quick Actions                      │
│  [VAT Report] [PAYE] [Pension]      │
│  [NSITF] [Filings] [Settings]       │
└─────────────────────────────────────┘
```

### PAYE Report Screen
```
┌─────────────────────────────────────┐
│  ← PAYE Tax Report                 │
├─────────────────────────────────────┤
│  Date: [2026-03-01] - [2026-03-31] │
│  Dept: [All Departments ▼] [Apply] │
├─────────────────────────────────────┤
│  Total Gross    ₦3,000,000.00      │
│  Total Relief   ₦600,000.00        │
│  Taxable        ₦2,400,000.00      │
│  Total PAYE     ₦350,000.00        │
│  Employees: 25                      │
├─────────────────────────────────────┤
│  Employee Breakdown                 │
│  ┌───────────────────────────────┐  │
│  │ John Adebayo                  │  │
│  │ TIN: TIN-00123456             │  │
│  │ Dept: Engineering             │  │
│  │ Gross: ₦250,000  Tax: ₦28,000│  │
│  ├───────────────────────────────┤  │
│  │ Jane Okonkwo                  │  │
│  │ TIN: TIN-00654321             │  │
│  │ Dept: Marketing               │  │
│  │ Gross: ₦200,000  Tax: ₦21,000│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Filing History Screen
```
┌─────────────────────────────────────┐
│  ← Filing History         [+ New]  │
├─────────────────────────────────────┤
│  [All Types ▼] [All Status ▼]      │
│  [2026 ▼]         [Filter] [Reset] │
├─────────────────────────────────────┤
│  Summary: 30 Paid │ 10 Filed │ 3 ⚠️│
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ VAT · Feb 2026          PAID │  │
│  │ ₦80,000.00  Due: Mar 21      │  │
│  │ Ref: FIRS-2026-001           │  │
│  ├───────────────────────────────┤  │
│  │ PAYE · Feb 2026        FILED │  │
│  │ ₦350,000.00  Due: Mar 10     │  │
│  │ [Mark Paid]  [Delete]         │  │
│  ├───────────────────────────────┤  │
│  │ ⚠️ NSITF · Jan 2026  OVERDUE │  │
│  │ ₦28,000.00  Due: Feb 28      │  │
│  │ [Mark Paid]  [Delete]         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Page 1 of 3  [< Prev] [Next >]    │
└─────────────────────────────────────┘
```

### Create Filing Modal
```
┌─────────────────────────────────────┐
│  Record Tax Filing              [X] │
├─────────────────────────────────────┤
│  Tax Type:  [VAT ▼]                │
│  Status:    [Draft ▼]              │
│  Period:    [March 2026          ]  │
│  Start:     [2026-03-01]           │
│  End:       [2026-03-31]           │
│  Amount:    [₦ 80000.00]           │
│  Due Date:  [2026-04-21]           │
│  Reference: [FIRS-2026-003      ]  │
│  Notes:     [                    ]  │
│                                     │
│       [Cancel]  [Save Filing]       │
└─────────────────────────────────────┘
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (wrong tenant)
- `404` - Not found
- `422` - Validation error

---

## API Endpoint Summary

| Method   | Endpoint                               | Description                    |
|----------|----------------------------------------|--------------------------------|
| `GET`    | `/statutory/dashboard`                 | Monthly overview               |
| `GET`    | `/statutory/vat/report`                | VAT output/input details       |
| `GET`    | `/statutory/paye/report`               | PAYE tax per employee          |
| `GET`    | `/statutory/pension/report`            | Pension by PFA & employee      |
| `GET`    | `/statutory/nsitf/report`              | NSITF contributions            |
| `GET`    | `/statutory/settings`                  | Get tax configuration          |
| `PUT`    | `/statutory/settings`                  | Update tax configuration       |
| `GET`    | `/statutory/filings`                   | List filing history            |
| `POST`   | `/statutory/filings`                   | Record new filing              |
| `PATCH`  | `/statutory/filings/{id}/status`       | Update filing status           |
| `DELETE` | `/statutory/filings/{id}`              | Delete filing record           |
