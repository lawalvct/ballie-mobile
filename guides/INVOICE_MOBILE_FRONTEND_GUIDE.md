# Invoice Management - Mobile Frontend Guide

## Overview

This comprehensive guide provides all the information needed to build the mobile app invoice management features, including field descriptions, business logic, API endpoints, and screen architecture.

### Date Format Guidelines

**API Communication:** Always use ISO format `YYYY-MM-DD` (e.g., `2026-01-21`) when sending/receiving dates from the API.

**Display to Users:** Format dates as `MMM. DD, YYYY` (e.g., `Jan. 21, 2026`) for better readability on mobile screens.

**Example:**

- API sends: `"voucher_date": "2026-01-21"`
- Display shows: `Jan. 21, 2026`

---

## Table of Contents

1. [Mobile App Screen Architecture](#mobile-app-screen-architecture)
2. [Create Invoice with AI](#create-invoice-with-ai)
3. [Create Invoice Page - Fields & Logic](#create-invoice-page---fields--logic)
4. [API Endpoints with Sample Payloads](#api-endpoints-with-sample-payloads)
5. [Invoice Details/Show Screen](#invoice-detailsshow-screen)
6. [API Endpoints Summary](#api-endpoints-summary)
7. [Business Rules & Validations](#business-rules--validations)
8. [Stock Management Logic](#stock-management-logic)
9. [Accounting Entry Logic](#accounting-entry-logic)
10. [VAT Calculation Logic](#vat-calculation-logic)
11. [Error Handling](#error-handling)
12. [Testing Checklist](#testing-checklist)

---

## Mobile App Screen Architecture

### Recommended Screen Flow

```
└── Accounting Module
    ├── Dashboard Screen
    │   └── Quick Stats Cards (Total Sales, Purchases, Draft Invoices)
    │
    ├── Invoice List Screen
    │   ├── Filter Options (Status, Type, Date Range)
    │   ├── Search Bar
    │   ├── Invoice Cards/List Items
    │   └── FAB (Create New Invoice)
    │       ├── "Manual Invoice" → Create Invoice Screen
    │       └── "Create with AI ✨" → AI Invoice Screen
    │
    ├── AI Invoice Screen ✨ NEW
    │   ├── Header (Back, Title "Create with AI")
    │   ├── Text Input Area (multiline, placeholder)
    │   ├── Example Prompts (tappable chips)
    │   ├── "Generate Invoice" Button
    │   ├── Loading State (AI processing animation)
    │   ├── AI Preview Card (parsed result)
    │   │   ├── Invoice Type & Voucher Type
    │   │   ├── Party Name (with match status ✓/⚠)
    │   │   ├── Invoice Date
    │   │   ├── Items Table (name, qty, rate, amount)
    │   │   │   └── Unmatched items shown with ⚠ warning
    │   │   ├── VAT Toggle Status
    │   │   ├── Grand Total
    │   │   └── AI Interpretation Note
    │   ├── Warning Messages (unmatched items/party)
    │   └── Action Buttons
    │       ├── "Apply to Form" → Pre-fills Create Invoice Screen
    │       ├── "Submit Directly" → Posts invoice (only if ALL matched)
    │       └── "Try Again" → Back to input
    │
    ├── Create Invoice Screen ⭐
    │   ├── Header (Back, Save Actions)
    │   ├── Type Selection (Sales/Purchase)
    │   ├── Voucher Type Dropdown
    │   ├── Basic Info Section
    │   │   ├── Invoice Date
    │   │   ├── Reference Number
    │   │   └── Customer/Vendor Selection
    │   ├── Invoice Items Section
    │   │   ├── Add Item Button
    │   │   ├── Item List (Product, Qty, Rate, Amount)
    │   │   └── Subtotal Display
    │   ├── Additional Charges Section (Optional)
    │   │   ├── Add Charge Button
    │   │   ├── Charge List (Account, Amount, Narration)
    │   │   └── Charges Total
    │   ├── VAT Section (Toggle)
    │   │   ├── VAT Rate Input
    │   │   ├── VAT Applies To Selection
    │   │   └── VAT Amount Display
    │   ├── Grand Total Display
    │   ├── Narration/Notes
    │   └── Action Buttons (Save Draft, Post, Post & New)
    │
    ├── Invoice Details Screen ⭐ NEW
    │   ├── Header (Back, Action Menu)
    │   ├── Payment Status Card
    │   │   ├── Balance Due Display
    │   │   ├── Progress Bar
    │   │   └── Payment Status Label
    │   ├── Party Information Card
    │   ├── Invoice Summary Card
    │   ├── Invoice Items Section
    │   │   ├── Items List
    │   │   └── Totals Breakdown
    │   ├── Payment History Section
    │   ├── Accounting Entries (Expandable)
    │   └── Action Buttons
    │       ├── Record Payment (Posted only)
    │       ├── Email Invoice
    │       ├── Print Invoice
    │       ├── Download PDF
    │       ├── Unpost Invoice (Posted only)
    │       ├── Edit Invoice (Draft only)
    │       ├── Post Invoice (Draft only)
    │       └── Delete Invoice (Draft only)
    │
    └── Payment Modal/Bottom Sheet
        ├── Date Picker
        ├── Amount Input
        ├── Bank Account Selector
        ├── Reference Input
        ├── Notes Textarea
        └── Submit Button
```

    │   │   └── Charge List (Account, Amount, Narration)
    │   ├── VAT Section (Toggle)
    │   │   ├── Enable VAT Switch
    │   │   ├── VAT Rate Input
    │   │   ├── VAT Applies To Selection
    │   │   └── VAT Amount Display
    │   ├── Grand Total Display
    │   ├── Narration/Notes Field
    │   └── Action Buttons
    │       ├── Save as Draft
    │       ├── Save & Post
    │       └── Save & Post + New
    │
    ├── Product Search Screen (Modal/Bottom Sheet)
    │   ├── Search Bar
    │   ├── Product List
    │   │   ├── Product Name & Code
    │   │   ├── Current Stock
    │   │   ├── Price
    │   │   └── Unit
    │   └── Quick Add Product Button
    │
    ├── Customer/Vendor Search Screen (Modal/Bottom Sheet)
    │   ├── Search Bar
    │   ├── Party List
    │   │   ├── Name
    │   │   ├── Phone
    │   │   ├── Email
    │   │   └── Outstanding Balance
    │   └── Quick Add Button
    │
    ├── Invoice Detail Screen
    │   ├── Header (Invoice Number, Status Badge)
    │   ├── Customer/Vendor Info Card
    │   ├── Invoice Items Table
    │   ├── Payment Summary Card
    │   │   ├── Subtotal
    │   │   ├── Additional Charges
    │   │   ├── VAT
    │   │   └── Grand Total
    │   ├── Accounting Entries (Expandable)
    │   ├── Payment History
    │   └── Action Buttons
    │       ├── Edit (if draft)
    │       ├── Post/Unpost
    │       ├── Delete (if draft)
    │       ├── Share PDF
    │       ├── Send Email
    │       └── Record Payment
    │
    ├── Edit Invoice Screen
    │   └── (Same as Create, pre-filled with data)
    │
    └── Quick Add Screens
        ├── Quick Add Product (Modal/Bottom Sheet)
        └── Quick Add Customer/Vendor (Modal/Bottom Sheet)

````

---

## Create Invoice with AI

This feature allows users to describe an invoice in plain English (or pidgin/informal language) and the AI will parse it into a structured invoice with matched customers, vendors, products, and amounts.

### How It Works (3-Step Flow)

```
Step 1: INPUT          Step 2: PREVIEW         Step 3: ACTION
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ User types   │      │ AI returns   │      │ User either:  │
│ natural      │ ──►  │ structured   │ ──►  │ • Applies to  │
│ language     │      │ invoice      │      │   form (edit) │
│ description  │      │ preview      │      │ • Submits     │
│              │      │              │      │   directly    │
└──────────────┘      └──────────────┘      └──────────────┘
```

### API Endpoint

```
POST /api/v1/tenant/{tenant}/accounting/invoices/ai-parse
```

**Authentication:** Bearer token (Sanctum)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Request Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Natural language description (5-1000 chars) |
| `tenant_id` | integer | Yes | The tenant ID (from login response) |
| `voucher_type_id` | integer | No | Pre-selected voucher type ID (optional) |

**Sample Request:**
```json
{
  "description": "Sold 5 bags of rice at 45000 each to Alhaji Musa with VAT",
  "tenant_id": 1,
  "voucher_type_id": null
}
```

**More Example Descriptions the AI Understands:**
```
"Invoice 10 cartons of indomie at 3500 to Mama Nkechi"
"Purchase 200 bags of cement at 5500 from Dangote Supplies"
"Sold 3 HP laptops at 450k each and 5 USB cables at 2000 to TechHub Ltd"
"Bill Adamu for 20 bags of sugar @28000 and 10 bags flour @18000"
"Bought office chairs 15 pieces at 35000 from Furniture Masters"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "parsed_invoice": {
    "invoice_type": "sales",
    "voucher_type_id": 2,
    "voucher_type_name": "Sales Invoice",
    "party_id": 15,
    "party_name": "Alhaji Musa",
    "party_type": "customer",
    "invoice_date": "2026-01-21",
    "reference_number": null,
    "narration": "Sold 5 bags of rice at 45000 each to Alhaji Musa with VAT",
    "items": [
      {
        "product_id": 42,
        "product_name": "Bag of Rice (50kg)",
        "description": "Bag of Rice (50kg)",
        "quantity": 5,
        "rate": 45000,
        "amount": 225000,
        "purchase_rate": 38000,
        "current_stock": 120,
        "unit": "Bags"
      }
    ],
    "vat_enabled": true,
    "interpretation": "Sales invoice for 5 bags of rice at ₦45,000 each to customer Alhaji Musa. VAT will be applied at 7.5%."
  },
  "ai_interpretation": "I identified this as a sales transaction..."
}
```

### Response When Some Items/Party Not Matched

```json
{
  "success": true,
  "parsed_invoice": {
    "invoice_type": "sales",
    "voucher_type_id": 2,
    "voucher_type_name": "Sales Invoice",
    "party_id": null,
    "party_name": null,
    "party_name_suggested": "New Customer Name",
    "party_type": "customer",
    "invoice_date": "2026-01-21",
    "reference_number": null,
    "narration": "Sold 3 widgets to New Customer Name",
    "items": [
      {
        "product_id": null,
        "product_name_suggested": "Widget",
        "description": "Widget",
        "quantity": 3,
        "rate": 5000,
        "amount": 15000,
        "not_found": true
      }
    ],
    "vat_enabled": false,
    "interpretation": "Sales invoice detected. Note: Customer and product could not be matched to existing records."
  },
  "ai_interpretation": "..."
}
```

### Error Responses

**Empty/Short Description (400):**
```json
{
  "success": false,
  "message": "Please provide a description of the invoice you want to create."
}
```

**Invalid Tenant (404):**
```json
{
  "success": false,
  "message": "Tenant not found."
}
```

**AI Service Error (500):**
```json
{
  "success": false,
  "message": "Unable to parse the invoice description. Please try again or create the invoice manually.",
  "error": "Error details..."
}
```

> **Note:** When the AI service is unavailable, the backend falls back to a heuristic (rule-based) parser. The response format stays the same but the `interpretation` field will say "Parsed using offline rules because AI is temporarily unavailable." The heuristic parser handles simpler descriptions well.

### Response Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `invoice_type` | string | `"sales"` or `"purchase"` |
| `voucher_type_id` | int\|null | Matched voucher type ID, null if not found |
| `voucher_type_name` | string\|null | Voucher type display name |
| `party_id` | int\|null | Matched customer/vendor ledger account ID, null if not found |
| `party_name` | string\|null | Matched party name from database |
| `party_name_suggested` | string\|null | AI-suggested name when no match found |
| `party_type` | string | `"customer"` or `"vendor"` |
| `invoice_date` | string | ISO date `YYYY-MM-DD` (defaults to today) |
| `reference_number` | string\|null | Extracted reference number if any |
| `narration` | string | Original description or generated narration |
| `items` | array | List of invoice line items (see below) |
| `vat_enabled` | boolean | Whether VAT was detected in description |
| `interpretation` | string | AI explanation of how it parsed the input |

**Item Fields (when matched):**

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | int | Product ID from database |
| `product_name` | string | Product name from database |
| `description` | string | Item description |
| `quantity` | number | Parsed quantity |
| `rate` | number | Unit price (uses AI-parsed rate, or falls back to product's sales/purchase rate) |
| `amount` | number | `quantity × rate` |
| `purchase_rate` | number | Product's purchase rate (for reference) |
| `current_stock` | number | Current stock level |
| `unit` | string | Unit of measurement (e.g., `"Bags"`, `"Pcs"`) |

**Item Fields (when NOT matched - `not_found: true`):**

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | null | Always null |
| `product_name_suggested` | string | AI's best guess at the product name |
| `description` | string | Item description |
| `quantity` | number | Parsed quantity |
| `rate` | number | Parsed price (may be 0 if not detected) |
| `amount` | number | `quantity × rate` |
| `not_found` | boolean | Always `true` |

### Mobile Screen Implementation Guide

#### Screen State Machine

```
IDLE → LOADING → PREVIEW → (APPLYING | SUBMITTING | IDLE)
```

Manage screen state with a simple state variable:

```typescript
type AIInvoiceState = 'idle' | 'loading' | 'preview' | 'applying' | 'submitting' | 'error';

interface AIInvoiceScreenState {
  state: AIInvoiceState;
  description: string;
  parsedInvoice: ParsedInvoice | null;
  errorMessage: string | null;
}
```

#### State 1: Input (idle)

Show a text input area with example prompt chips:

```tsx
// AI Invoice Input Screen
<View style={styles.container}>
  <Text style={styles.title}>Describe your invoice</Text>
  <Text style={styles.subtitle}>
    Tell BallieAI what you want to invoice in plain English
  </Text>

  <TextInput
    style={styles.textArea}
    multiline
    numberOfLines={4}
    placeholder="e.g., Sold 5 bags of rice at 45000 each to Alhaji Musa with VAT"
    value={description}
    onChangeText={setDescription}
    maxLength={1000}
  />

  {/* Example prompt chips */}
  <Text style={styles.chipLabel}>Try these examples:</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {EXAMPLE_PROMPTS.map((prompt, i) => (
      <TouchableOpacity
        key={i}
        style={styles.chip}
        onPress={() => setDescription(prompt)}
      >
        <Text style={styles.chipText}>{prompt}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

  <TouchableOpacity
    style={[styles.generateBtn, !description.trim() && styles.disabledBtn]}
    disabled={!description.trim() || description.length < 5}
    onPress={handleGenerate}
  >
    <Text style={styles.generateBtnText}>✨ Generate Invoice</Text>
  </TouchableOpacity>
</View>
```

**Example Prompts Array:**
```typescript
const EXAMPLE_PROMPTS = [
  "Sold 10 bags of cement at 5500 to ABC Construction",
  "Purchase 200 units of palm oil at 1200 from Mama T Suppliers",
  "Invoice 5 laptops at 350k each to TechHub Ltd with VAT",
  "Bought 50 reams of A4 paper at 4500 from Office Mart",
];
```

#### State 2: Loading

```tsx
// While AI is processing
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color="#3B82F6" />
  <Text style={styles.loadingText}>BallieAI is analyzing your description...</Text>
  <Text style={styles.loadingSubtext}>Matching products and customers</Text>
</View>
```

#### State 3: Preview

Display the parsed invoice for review:

```tsx
// AI Invoice Preview
<ScrollView style={styles.previewContainer}>
  {/* Invoice Type Badge */}
  <View style={styles.typeBadge}>
    <Text style={styles.typeBadgeText}>
      {parsedInvoice.invoice_type === 'sales' ? '📤 Sales Invoice' : '📥 Purchase Invoice'}
    </Text>
    {parsedInvoice.voucher_type_name && (
      <Text style={styles.voucherType}>{parsedInvoice.voucher_type_name}</Text>
    )}
  </View>

  {/* Party Info */}
  <View style={styles.partyCard}>
    <Text style={styles.label}>
      {parsedInvoice.party_type === 'customer' ? 'Customer' : 'Vendor'}
    </Text>
    {parsedInvoice.party_id ? (
      <View style={styles.matchedRow}>
        <Text style={styles.matchIcon}>✓</Text>
        <Text style={styles.partyName}>{parsedInvoice.party_name}</Text>
      </View>
    ) : (
      <View style={styles.unmatchedRow}>
        <Text style={styles.warningIcon}>⚠</Text>
        <Text style={styles.suggestedName}>
          "{parsedInvoice.party_name_suggested}" — Not found in records
        </Text>
      </View>
    )}
  </View>

  {/* Date */}
  <View style={styles.infoRow}>
    <Text style={styles.label}>Date</Text>
    <Text style={styles.value}>
      {formatDate(parsedInvoice.invoice_date)}
    </Text>
  </View>

  {/* Items Table */}
  <View style={styles.itemsSection}>
    <Text style={styles.sectionTitle}>Items</Text>
    {parsedInvoice.items.map((item, index) => (
      <View key={index} style={[styles.itemRow, item.not_found && styles.itemWarning]}>
        <View style={styles.itemHeader}>
          {item.product_id ? (
            <Text style={styles.matchIcon}>✓</Text>
          ) : (
            <Text style={styles.warningIcon}>⚠</Text>
          )}
          <Text style={styles.itemName}>
            {item.product_name || item.product_name_suggested}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          <Text>{item.quantity} × ₦{formatNumber(item.rate)}</Text>
          <Text style={styles.itemAmount}>₦{formatNumber(item.amount)}</Text>
        </View>
        {item.not_found && (
          <Text style={styles.notFoundText}>Product not found in records</Text>
        )}
        {item.product_id && item.current_stock !== undefined && (
          <Text style={styles.stockInfo}>Stock: {item.current_stock} {item.unit}</Text>
        )}
      </View>
    ))}
  </View>

  {/* Totals */}
  <View style={styles.totalsSection}>
    <View style={styles.totalRow}>
      <Text>Subtotal</Text>
      <Text>₦{formatNumber(subtotal)}</Text>
    </View>
    {parsedInvoice.vat_enabled && (
      <View style={styles.totalRow}>
        <Text>VAT (7.5%)</Text>
        <Text>₦{formatNumber(subtotal * 0.075)}</Text>
      </View>
    )}
    <View style={[styles.totalRow, styles.grandTotal]}>
      <Text style={styles.grandTotalLabel}>Grand Total</Text>
      <Text style={styles.grandTotalValue}>
        ₦{formatNumber(parsedInvoice.vat_enabled ? subtotal * 1.075 : subtotal)}
      </Text>
    </View>
  </View>

  {/* AI Interpretation */}
  <View style={styles.interpretationCard}>
    <Text style={styles.interpretationLabel}>🤖 AI Interpretation</Text>
    <Text style={styles.interpretationText}>{parsedInvoice.interpretation}</Text>
  </View>

  {/* Warnings */}
  {hasUnmatchedItems && (
    <View style={styles.warningBanner}>
      <Text style={styles.warningText}>
        ⚠ Some items or the customer/vendor could not be matched.
        Use "Apply to Form" to review and select manually.
      </Text>
    </View>
  )}

  {/* Action Buttons */}
  <View style={styles.actionButtons}>
    {canSubmitDirectly && (
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitDirectly}>
        <Text style={styles.submitBtnText}>Submit Directly</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity style={styles.applyBtn} onPress={handleApplyToForm}>
      <Text style={styles.applyBtnText}>Apply to Form</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.retryBtn} onPress={handleTryAgain}>
      <Text style={styles.retryBtnText}>Try Again</Text>
    </TouchableOpacity>
  </View>
</ScrollView>
```

### Business Logic for Action Buttons

#### "Submit Directly" Button Visibility

The **Submit Directly** button should ONLY be visible when ALL of these conditions are met:

```typescript
const canSubmitDirectly = useMemo(() => {
  if (!parsedInvoice) return false;

  // Must have a matched party
  if (!parsedInvoice.party_id) return false;

  // Must have a matched voucher type
  if (!parsedInvoice.voucher_type_id) return false;

  // Must have at least one item
  if (!parsedInvoice.items || parsedInvoice.items.length === 0) return false;

  // ALL items must have a matched product_id
  const allItemsMatched = parsedInvoice.items.every(item => item.product_id !== null);
  if (!allItemsMatched) return false;

  return true;
}, [parsedInvoice]);
```

#### "Submit Directly" — Calls the Standard Invoice Store Endpoint

When the user taps "Submit Directly", transform the AI result into the standard invoice store payload and POST it:

```
POST /api/v1/tenant/{tenant}/accounting/invoices
```

**Transform AI Response → Invoice Store Payload:**

```typescript
const handleSubmitDirectly = async () => {
  if (!parsedInvoice || !canSubmitDirectly) return;

  setState('submitting');

  // Calculate totals
  const itemsSubtotal = parsedInvoice.items.reduce(
    (sum, item) => sum + (item.quantity * item.rate), 0
  );
  const vatAmount = parsedInvoice.vat_enabled ? itemsSubtotal * 0.075 : 0;

  // Build the standard invoice store payload
  const payload = {
    customer_id: parsedInvoice.party_id,
    voucher_type_id: parsedInvoice.voucher_type_id,
    voucher_date: parsedInvoice.invoice_date,
    reference_number: parsedInvoice.reference_number || '',
    narration: parsedInvoice.narration || '',
    inventory_items: parsedInvoice.items.map(item => ({
      product_id: item.product_id,
      description: item.description || item.product_name,
      quantity: item.quantity,
      rate: item.rate,
      amount: (item.quantity * item.rate).toFixed(2),
      purchase_rate: item.purchase_rate || 0,
    })),
    action: 'save_and_post_new_sales',
    // VAT fields (only if VAT enabled)
    ...(parsedInvoice.vat_enabled && {
      vat_enabled: '1',
      vat_amount: vatAmount.toFixed(2),
      vat_applies_to: 'items_only',
      vatAppliesTo: 'items_only',
    }),
  };

  try {
    const response = await api.post(
      `/api/v1/tenant/${tenantSlug}/accounting/invoices`,
      payload
    );
    // Success! Navigate to invoice details or list
    navigation.navigate('InvoiceDetails', { id: response.data.data.id });
  } catch (error) {
    Alert.alert('Error', 'Failed to create invoice. Please try "Apply to Form" instead.');
    setState('preview');
  }
};
```

#### "Apply to Form" — Navigate to Create Invoice Screen Pre-filled

When the user taps "Apply to Form", navigate to the regular Create Invoice screen with the AI data pre-loaded:

```typescript
const handleApplyToForm = () => {
  // Navigate to Create Invoice screen with pre-filled data
  navigation.navigate('CreateInvoice', {
    prefillData: {
      type: parsedInvoice.invoice_type,
      voucher_type_id: parsedInvoice.voucher_type_id,
      voucher_date: parsedInvoice.invoice_date,
      reference_number: parsedInvoice.reference_number,
      narration: parsedInvoice.narration,
      customer_id: parsedInvoice.party_id,
      customer_name: parsedInvoice.party_name,
      party_type: parsedInvoice.party_type,
      vat_enabled: parsedInvoice.vat_enabled,
      items: parsedInvoice.items.map(item => ({
        product_id: item.product_id || null,
        product_name: item.product_name || item.product_name_suggested || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: item.amount || 0,
        unit: item.unit || 'Pcs',
        current_stock: item.current_stock ?? null,
        purchase_rate: item.purchase_rate || 0,
        not_found: item.not_found || false,
      })),
    },
  });
};
```

**In the Create Invoice Screen**, check for `prefillData` in route params and populate the form:

```typescript
// In CreateInvoiceScreen.tsx
const route = useRoute();
const prefillData = route.params?.prefillData;

useEffect(() => {
  if (prefillData) {
    // Set invoice type (sales/purchase)
    setInvoiceType(prefillData.type);

    // Set voucher type
    if (prefillData.voucher_type_id) {
      setVoucherTypeId(prefillData.voucher_type_id);
    }

    // Set date
    if (prefillData.voucher_date) {
      setVoucherDate(prefillData.voucher_date);
    }

    // Set party
    if (prefillData.customer_id) {
      setSelectedPartyId(prefillData.customer_id);
      setSelectedPartyName(prefillData.customer_name);
    }

    // Set items
    if (prefillData.items?.length > 0) {
      setItems(prefillData.items.map(item => ({
        ...item,
        // Items with not_found=true need manual product selection
        needsManualSelection: item.not_found === true,
      })));
    }

    // Set narration
    if (prefillData.narration) {
      setNarration(prefillData.narration);
    }

    // Set VAT
    if (prefillData.vat_enabled) {
      setVatEnabled(true);
    }

    // Show a toast so user knows to review
    Toast.show({
      type: 'info',
      text1: 'AI Invoice Applied',
      text2: 'Please review the details and fix any ⚠ warnings',
    });
  }
}, [prefillData]);
```

### Complete API Call Example (Expo / React Native)

```typescript
import axios from 'axios';
import { Alert } from 'react-native';

const API_BASE = 'https://your-domain.com/api/v1';

interface ParseInvoiceRequest {
  description: string;
  tenant_id: number;
  voucher_type_id?: number | null;
}

interface ParsedItem {
  product_id: number | null;
  product_name?: string;
  product_name_suggested?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  purchase_rate?: number;
  current_stock?: number;
  unit?: string;
  not_found?: boolean;
}

interface ParsedInvoice {
  invoice_type: 'sales' | 'purchase';
  voucher_type_id: number | null;
  voucher_type_name: string | null;
  party_id: number | null;
  party_name: string | null;
  party_name_suggested?: string;
  party_type: 'customer' | 'vendor';
  invoice_date: string;
  reference_number: string | null;
  narration: string;
  items: ParsedItem[];
  vat_enabled: boolean;
  interpretation: string;
}

interface AIParseResponse {
  success: boolean;
  parsed_invoice: ParsedInvoice;
  ai_interpretation: string;
}

export const parseInvoiceWithAI = async (
  tenantSlug: string,
  token: string,
  data: ParseInvoiceRequest
): Promise<AIParseResponse> => {
  const response = await axios.post<AIParseResponse>(
    `${API_BASE}/tenant/${tenantSlug}/accounting/invoices/ai-parse`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );
  return response.data;
};

// Usage in component
const handleGenerate = async () => {
  if (!description.trim() || description.length < 5) {
    Alert.alert('Error', 'Please enter at least 5 characters');
    return;
  }

  setState('loading');
  setErrorMessage(null);

  try {
    const result = await parseInvoiceWithAI(tenantSlug, authToken, {
      description: description.trim(),
      tenant_id: tenantId,  // number from login response
      voucher_type_id: null,
    });

    if (result.success) {
      setParsedInvoice(result.parsed_invoice);
      setState('preview');
    } else {
      setErrorMessage('Could not parse the description. Try rephrasing.');
      setState('error');
    }
  } catch (error: any) {
    const message = error.response?.data?.message
      || 'Something went wrong. Please try again.';
    setErrorMessage(message);
    setState('error');
  }
};
```

### Helper Utilities

```typescript
// Format number with commas for Nigerian Naira display
export const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return '0.00';
  return parseFloat(String(num)).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Calculate subtotal from items
export const calculateSubtotal = (items: ParsedItem[]): number => {
  return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
};

// Check if all items and party are matched
export const isFullyMatched = (invoice: ParsedInvoice): boolean => {
  if (!invoice.party_id) return false;
  if (!invoice.voucher_type_id) return false;
  return invoice.items.every(item => item.product_id !== null);
};

// Check which items are unmatched
export const getUnmatchedItems = (items: ParsedItem[]): ParsedItem[] => {
  return items.filter(item => item.not_found === true || item.product_id === null);
};

// Format date for display
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  // Returns: "Jan. 21, 2026"
};
```

### Edge Cases to Handle

| Scenario | What Happens | Mobile Action |
|----------|-------------|---------------|
| AI service down | Backend uses heuristic parser automatically | Same UI — `interpretation` says "offline rules" |
| No products match | Items returned with `not_found: true` | Show ⚠ on items, hide "Submit Directly" |
| No customer/vendor match | `party_id` is null, `party_name_suggested` set | Show ⚠, hide "Submit Directly" |
| AI returns empty items | Items array may be empty or have 1 "Unknown" item | Show warning, suggest "Apply to Form" |
| Description too short | 400 error returned | Show inline error, keep input focused |
| Multiple products in one description | AI returns multiple items in the array | All items shown in preview table |
| Price with "k" suffix (e.g., "450k") | AI/heuristic parses as 450,000 | Display correctly in preview |
| Both sales and purchase keywords | AI uses context to decide; heuristic defaults to sales | Show detected type in preview for review |
| VAT mentioned ("with VAT", "plus tax", "7.5%") | `vat_enabled` set to `true` | Show VAT row in totals |

### Testing Checklist for AI Invoice

- [ ] Text input accepts 5-1000 characters
- [ ] "Generate" button disabled when input < 5 chars
- [ ] Loading state shows while AI processes
- [ ] Preview displays all matched items with ✓
- [ ] Preview displays unmatched items with ⚠
- [ ] Unmatched party shows suggested name with ⚠
- [ ] "Submit Directly" hidden when any item/party unmatched
- [ ] "Submit Directly" creates invoice and navigates to details
- [ ] "Apply to Form" pre-fills Create Invoice screen correctly
- [ ] Unmatched items in form highlight for manual selection
- [ ] "Try Again" resets to input state
- [ ] Error state shows user-friendly message
- [ ] VAT toggle reflected correctly in preview totals
- [ ] Grand total calculates correctly (subtotal + VAT if enabled)
- [ ] Network error handled gracefully
- [ ] Works with both sales and purchase descriptions
- [ ] Example chips populate the text input when tapped

---

## Create Invoice Page - Fields & Logic

### 1. Invoice Type Selection

**Field:** `type` (dropdown/segmented control)

- **Options:**
    - `sales` - For sales invoices
    - `purchase` - For purchase invoices
- **Logic:**
    - Determines which voucher types to show (based on `inventory_effect`)
    - Sales: `inventory_effect = 'decrease'`
    - Purchase: `inventory_effect = 'increase'`
    - Changes party label (Customer/Vendor)
    - Changes default price field (sales_price/purchase_price)
    - Changes accounting entry direction (Debit/Credit)

---

### 2. Voucher Type Selection

**Field:** `voucher_type_id` (dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/create?type={sales|purchase}`
- **Display:** Show `name` field from voucher types
- **Filter:** Only show active voucher types with `affects_inventory = true`
- **Logic:**
    - Determines invoice numbering prefix
    - Controls inventory effect (increase/decrease)
    - Defines default accounts for entries

---

### 3. Basic Information Section

#### 3.1 Invoice Date

**Field:** `voucher_date` (date picker)

- **Required:** Yes
- **Format:** YYYY-MM-DD
- **Default:** Today's date
- **Validation:** Cannot be future date (optional business rule)
- **Logic:** Used for accounting period allocation

#### 3.2 Reference Number

**Field:** `reference_number` (text input)

- **Required:** No
- **Max Length:** 255 characters
- **Purpose:** External reference (PO number, customer order number)
- **Example:** "PO-2024-001", "ORDER-123"

#### 3.3 Customer/Vendor Selection

**Field:** `customer_id` (searchable dropdown)

- **Required:** Yes
- **Label:** Changes based on type (Customer for sales, Vendor for purchase)
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-customers?search={query}&type={customer|vendor}`
- **Display:** Name, Phone, Mobile, Email, Outstanding Balance, Address
- **Response Fields:**
    - `id` - Customer/Vendor ID (use for form submission)
    - `ledger_account_id` - Associated ledger account ID
    - `name` - Full name (auto-generated from first_name + last_name for individuals, or company_name for businesses)
    - `customer_type` / `vendor_type` - "individual" or "business"
    - `email` - Email address
    - `phone` - Primary phone number
    - `mobile` - Mobile phone number
    - `outstanding_balance` - Current balance owed (numeric)
    - `currency` - Currency code (e.g., "NGN")
    - `payment_terms` - Payment terms (e.g., "Net 30")
    - `address` - Full formatted address string
- **Search Fields:** Searches across first_name, last_name, company_name, email, phone, and mobile
- **Logic:**
    - Links to ledger account for accounting entries
    - For sales: Debits customer account
    - For purchase: Credits vendor account
- **Features:**
    - Real-time search as user types
    - Shows outstanding balance for credit decisions
    - Displays full name regardless of customer/vendor type
    - Quick add new customer/vendor button

---

### 4. Invoice Items Section ⭐

This is the most complex section with dynamic calculations.

#### 4.1 Add Item Button

- Opens product search modal/bottom sheet
- Allows multiple item addition

#### 4.2 Invoice Item Fields

Each item contains:

##### Product Selection

**Field:** `inventory_items[*].product_id` (searchable dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-products?search={query}&type={sales|purchase}`
- **Display:**
    - Product Name
    - Product Code
    - Current Stock
    - Unit
    - Default Price
- **On Selection:**
    - Auto-fills description with product name
    - Sets unit_id
    - Sets rate based on type (sales_price or purchase_price)
    - Shows current stock for sales
    - Validates stock availability (for sales)

##### Description

**Field:** `inventory_items[*].description` (text input)

- **Required:** No
- **Max Length:** 500 characters
- **Default:** Product name
- **Editable:** Yes
- **Purpose:** Custom description for this invoice line

##### Quantity

**Field:** `inventory_items[*].quantity` (number input)

- **Required:** Yes
- **Min:** 0.01
- **Step:** 0.01
- **Validation:**
    - For sales: Must not exceed current stock (if stock tracking enabled)
    - Shows warning if quantity > current_stock
- **Logic:**
    - Triggers amount calculation on change
    - Updates grand total

##### Unit Display

**Field:** `inventory_items[*].unit_id` (hidden, display only)

- **Display:** Unit name (e.g., "Pcs", "Kg", "Box")
- **Source:** From product data
- **Non-editable:** Yes

##### Rate/Price

**Field:** `inventory_items[*].rate` (number input)

- **Required:** Yes
- **Min:** 0
- **Step:** 0.01
- **Default:**
    - Sales: product.sales_price
    - Purchase: product.purchase_price
- **Editable:** Yes
- **Logic:**
    - Triggers amount calculation on change
    - Updates grand total

##### Amount (Calculated)

**Field:** `inventory_items[*].amount` (calculated, read-only)

- **Formula:** `quantity × rate`
- **Display:** Currency formatted (₦ 1,234.56)
- **Updates:** Real-time on quantity or rate change
- **Stored:** Yes (in database)

##### Remove Button

- Deletes the item row
- Updates calculations
- Minimum 1 item required (cannot remove last item)

#### 4.3 Items Subtotal

**Calculation:** Sum of all item amounts

```javascript
subtotal = items.reduce((sum, item) => sum + item.amount, 0);
````

**Display:** Currency formatted at bottom of items section

---

### 5. Additional Charges Section (Optional)

Allows adding extra charges like VAT, Transport, Handling fees, etc.

#### 5.1 Add Charge Button

- Opens ledger account search
- Allows multiple charges

#### 5.2 Additional Charge Fields

##### Ledger Account

**Field:** `additional_ledger_accounts[*].ledger_account_id` (searchable dropdown)

- **Required:** Yes
- **Source:** GET `/api/v1/tenant/{tenant}/accounting/invoices/search-ledger-accounts?search={query}`
- **Display:** Account Name, Account Code, Account Group
- **Common Accounts:**
    - VAT Payable
    - Transport/Freight
    - Handling Charges
    - Insurance
    - Discount

##### Amount

**Field:** `additional_ledger_accounts[*].amount` (number input)

- **Required:** Yes
- **Min:** 0
- **Step:** 0.01
- **Logic:** Adds to grand total

##### Narration

**Field:** `additional_ledger_accounts[*].narration` (text input)

- **Required:** No
- **Max Length:** 255
- **Purpose:** Description of the charge
- **Example:** "Transport to customer location", "VAT @ 7.5%"

##### Remove Button

- Deletes the charge
- Updates grand total

#### 5.3 Additional Charges Total

**Calculation:** Sum of all additional charge amounts

```javascript
additionalTotal = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0,
);
```

---

### 6. VAT Section (Toggle-able)

#### 6.1 Enable VAT Toggle

**Field:** `vat_enabled` (boolean switch)

- **Default:** false
- **Logic:** Shows/hides VAT configuration fields

#### 6.2 VAT Rate

**Field:** `vat_rate` (number input, percentage)

- **Default:** 7.5 (for 7.5%)
- **Min:** 0
- **Max:** 100
- **Step:** 0.01
- **Visible:** Only when vat_enabled = true

#### 6.3 VAT Applies To

**Field:** `vat_applies_to` (radio buttons/segmented control)

- **Options:**
    - `items_only` - VAT on items subtotal only
    - `items_and_charges` - VAT on items + additional charges
- **Default:** `items_only`
- **Visible:** Only when vat_enabled = true

#### 6.4 VAT Amount (Calculated)

**Field:** `vat_amount` (calculated, read-only)

- **Formula:**

    ```javascript
    if (!vat_enabled) return 0;

    if (vat_applies_to === "items_only") {
        return itemsSubtotal * (vat_rate / 100);
    } else {
        return (itemsSubtotal + additionalChargesTotal) * (vat_rate / 100);
    }
    ```

- **Display:** Currency formatted
- **Updates:** Real-time when rate or applies_to changes

---

### 7. Grand Total Display

**Calculation:**

```javascript
grandTotal = itemsSubtotal + additionalChargesTotal + vatAmount;
```

**Display:**

- Large, prominent font
- Currency formatted
- Updates in real-time
- Shows breakdown on tap/click:
    - Items Subtotal: ₦ X,XXX.XX
    - Additional Charges: ₦ X,XXX.XX
    - VAT (7.5%): ₦ X,XXX.XX
    - **Grand Total: ₦ X,XXX.XX**

---

### 8. Narration/Notes

**Field:** `narration` (multi-line text input)

- **Required:** No
- **Max Length:** 1000 characters
- **Purpose:** General notes about the invoice
- **Example:** "Monthly supply as per agreement", "Rush order - deliver by Friday"

---

### 9. Action Buttons

#### 9.1 Save as Draft

**Action:** `action = 'save'`

- Creates invoice with `status = 'draft'`
- Does NOT post to accounts
- Does NOT update stock
- Allows editing later
- **Use Case:** Invoice not ready to be finalized

#### 9.2 Save & Post

**Action:** `action = 'save_and_post'`

- Creates invoice with `status = 'posted'`
- Posts to accounting ledgers
- Updates product stock
- Creates stock movements
- Cannot be edited (must unpost first)
- **Use Case:** Invoice is final and ready

#### 9.3 Save & Post + New Sales

**Action:** `action = 'save_and_post_new_sales'`

- Same as Save & Post
- After success, opens new sales invoice form
- **Use Case:** Rapid entry of multiple sales invoices

---

## API Endpoints with Sample Payloads

### Base URL

```
https://yourapp.com/api/v1/tenant/{tenant}/accounting/invoices
```

### Authentication

All requests require Bearer token:

```
Authorization: Bearer {your_access_token}
```

---

### 1. Get Create Form Data

**Endpoint:** `GET /create?type={sales|purchase}`

**Query Parameters:**

- `type` (optional): `sales` or `purchase` (default: `sales`)

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/create?type=sales' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Create form data retrieved successfully",
    "data": {
        "voucher_types": [
            {
                "id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "prefix": "SI-",
                "inventory_effect": "decrease",
                "is_active": true
            },
            {
                "id": 3,
                "name": "Sales Return",
                "code": "SR",
                "abbreviation": "SR",
                "prefix": "SR-",
                "inventory_effect": "increase",
                "is_active": true
            }
        ],
        "parties": [
            {
                "id": 1,
                "name": "John Doe Enterprises",
                "email": "john@example.com",
                "phone": "08012345678",
                "ledger_account_id": 45,
                "outstanding_balance": 15000.0,
                "status": "active"
            },
            {
                "id": 2,
                "name": "ABC Trading Ltd",
                "email": "abc@example.com",
                "phone": "08098765432",
                "ledger_account_id": 46,
                "outstanding_balance": 0.0,
                "status": "active"
            }
        ],
        "products": [
            {
                "id": 1,
                "name": "HP Laptop 15-DW3000",
                "code": "PROD-001",
                "type": "goods",
                "unit": "Pcs",
                "unit_id": 1,
                "sales_price": 450000.0,
                "purchase_price": 380000.0,
                "current_stock": 25,
                "sales_account_id": 78,
                "purchase_account_id": 79,
                "account_id": 78
            },
            {
                "id": 2,
                "name": "Wireless Mouse",
                "code": "PROD-002",
                "type": "goods",
                "unit": "Pcs",
                "unit_id": 1,
                "sales_price": 3500.0,
                "purchase_price": 2800.0,
                "current_stock": 150,
                "sales_account_id": 78,
                "purchase_account_id": 79,
                "account_id": 78
            }
        ],
        "ledger_accounts": [
            {
                "id": 100,
                "name": "VAT Payable",
                "code": "2150",
                "account_group": {
                    "id": 15,
                    "name": "Current Liabilities"
                }
            },
            {
                "id": 101,
                "name": "Transport & Freight",
                "code": "5020",
                "account_group": {
                    "id": 20,
                    "name": "Direct Expenses"
                }
            }
        ],
        "type": "sales"
    }
}
```

---

### 2. Create Invoice

**Endpoint:** `POST /`

**Sample Request (Sales Invoice):**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "voucher_type_id": 1,
    "voucher_date": "2026-01-19",
    "customer_id": 45,
    "reference_number": "PO-2024-001",
    "narration": "Monthly supply of laptops and accessories",
    "inventory_items": [
      {
        "product_id": 1,
        "description": "HP Laptop 15-DW3000",
        "quantity": 5,
        "unit_id": 1,
        "rate": 450000.00,
        "amount": 2250000.00,
        "discount_percentage": 0,
        "discount_amount": 0,
        "tax_percentage": 0,
        "tax_amount": 0,
        "total": 2250000.00
      },
      {
        "product_id": 2,
        "description": "Wireless Mouse - Bulk order",
        "quantity": 50,
        "unit_id": 1,
        "rate": 3500.00,
        "amount": 175000.00,
        "discount_percentage": 0,
        "discount_amount": 0,
        "tax_percentage": 0,
        "tax_amount": 0,
        "total": 175000.00
      }
    ],
    "additional_ledger_accounts": [
      {
        "ledger_account_id": 101,
        "amount": 25000.00,
        "narration": "Transport to customer location"
      }
    ],
    "vat_enabled": true,
    "vat_amount": 181875.00,
    "vat_applies_to": "items_only",
    "action": "save_and_post"
  }'
```

**Sample Response (201 Created):**

```json
{
    "success": true,
    "message": "Invoice created and posted successfully",
    "data": {
        "id": 125,
        "tenant_id": 1,
        "voucher_type_id": 1,
        "voucher_number": "SI-0125",
        "voucher_date": "2026-01-19",
        "reference_number": "PO-2024-001",
        "narration": "Monthly supply of laptops and accessories",
        "total_amount": 2631875.0,
        "status": "posted",
        "created_by": 1,
        "posted_at": "2026-01-19T10:30:00.000000Z",
        "posted_by": 1,
        "created_at": "2026-01-19T10:30:00.000000Z",
        "updated_at": "2026-01-19T10:30:00.000000Z",
        "voucher_type": {
            "id": 1,
            "name": "Sales Invoice",
            "code": "SI",
            "abbreviation": "SI",
            "prefix": "SI-"
        },
        "items": [
            {
                "id": 250,
                "voucher_id": 125,
                "product_id": 1,
                "description": "HP Laptop 15-DW3000",
                "quantity": 5.0,
                "unit_id": 1,
                "rate": 450000.0,
                "amount": 2250000.0,
                "total": 2250000.0,
                "product": {
                    "id": 1,
                    "name": "HP Laptop 15-DW3000",
                    "code": "PROD-001",
                    "current_stock": 20
                }
            },
            {
                "id": 251,
                "voucher_id": 125,
                "product_id": 2,
                "description": "Wireless Mouse - Bulk order",
                "quantity": 50.0,
                "unit_id": 1,
                "rate": 3500.0,
                "amount": 175000.0,
                "total": 175000.0,
                "product": {
                    "id": 2,
                    "name": "Wireless Mouse",
                    "code": "PROD-002",
                    "current_stock": 100
                }
            }
        ],
        "entries": [
            {
                "id": 500,
                "voucher_id": 125,
                "ledger_account_id": 45,
                "debit_amount": 2631875.0,
                "credit_amount": 0.0,
                "particulars": "Sales to John Doe Enterprises",
                "ledger_account": {
                    "id": 45,
                    "name": "John Doe Enterprises",
                    "code": "1020-001"
                }
            },
            {
                "id": 501,
                "voucher_id": 125,
                "ledger_account_id": 78,
                "debit_amount": 0.0,
                "credit_amount": 2425000.0,
                "particulars": "Sales",
                "ledger_account": {
                    "id": 78,
                    "name": "Sales - Computers",
                    "code": "4010"
                }
            },
            {
                "id": 502,
                "voucher_id": 125,
                "ledger_account_id": 101,
                "debit_amount": 0.0,
                "credit_amount": 25000.0,
                "particulars": "Transport to customer location",
                "ledger_account": {
                    "id": 101,
                    "name": "Transport & Freight",
                    "code": "5020"
                }
            },
            {
                "id": 503,
                "voucher_id": 125,
                "ledger_account_id": 100,
                "debit_amount": 0.0,
                "credit_amount": 181875.0,
                "particulars": "VAT @ 7.5%",
                "ledger_account": {
                    "id": 100,
                    "name": "VAT Payable",
                    "code": "2150"
                }
            }
        ]
    }
}
```

**Validation Error Response (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "voucher_type_id": ["The voucher type id field is required."],
        "customer_id": ["The customer id field is required."],
        "inventory_items": ["The inventory items field is required."],
        "inventory_items.0.quantity": ["The quantity must be at least 0.01."]
    }
}
```

---

### 3. List Invoices

**Endpoint:** `GET /?type={sales|purchase}&status={draft|posted}&from_date={date}&to_date={date}&search={query}&sort={field}&direction={asc|desc}&per_page={number}&page={number}`

**Query Parameters:**

- `type`: `sales` or `purchase`
- `status`: `draft` or `posted`
- `from_date`: YYYY-MM-DD
- `to_date`: YYYY-MM-DD
- `search`: Search term
- `sort`: Field to sort by (default: `voucher_date`)
- `direction`: `asc` or `desc` (default: `desc`)
- `per_page`: Items per page (default: 15)
- `page`: Page number

**List Response Additions (Mobile):**

- `party_id`: Customer/Vendor ID linked to the invoice
- `party_name`: Customer/Vendor display name (ready for list UI)

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?type=sales&status=posted&from_date=2026-01-01&to_date=2026-01-31&per_page=10&page=1' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoices retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 125,
                "voucher_type_id": 1,
                "voucher_number": "SI-0125",
                "voucher_date": "2026-01-19",
                "reference_number": "PO-2024-001",
                "narration": "Monthly supply",
                "total_amount": 2631875.0,
                "party_id": 49,
                "party_name": "John Doe Enterprises",
                "status": "posted",
                "posted_at": "2026-01-19T10:30:00.000000Z",
                "created_at": "2026-01-19T10:30:00.000000Z",
                "voucher_type": {
                    "name": "Sales Invoice",
                    "abbreviation": "SI"
                },
                "entries": [
                    {
                        "ledger_account": {
                            "name": "John Doe Enterprises"
                        }
                    }
                ]
            }
        ],
        "first_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=1",
        "from": 1,
        "last_page": 5,
        "last_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=5",
        "next_page_url": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices?page=2",
        "path": "https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices",
        "per_page": 10,
        "prev_page_url": null,
        "to": 10,
        "total": 48
    },
    "statistics": {
        "total_invoices": 48,
        "draft_invoices": 5,
        "posted_invoices": 43,
        "total_sales_amount": 12500000.0,
        "total_purchase_amount": 8750000.0
    }
}
```

---

### 4. Show Invoice Details

**Endpoint:** `GET /{invoice}`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice retrieved successfully",
    "data": {
        "invoice": {
            "id": 125,
            "voucher_type_id": 1,
            "voucher_number": "SI-0125",
            "voucher_date": "2026-01-19",
            "reference_number": "PO-2024-001",
            "narration": "Monthly supply of laptops and accessories",
            "total_amount": 2631875.0,
            "status": "posted",
            "posted_at": "2026-01-19T10:30:00.000000Z",
            "posted_by": 1,
            "created_at": "2026-01-19T10:30:00.000000Z",
            "updated_at": "2026-01-19T10:30:00.000000Z",
            "voucher_type": {
                "id": 1,
                "name": "Sales Invoice",
                "code": "SI",
                "abbreviation": "SI",
                "prefix": "SI-"
            },
            "items": [
                {
                    "id": 250,
                    "product_id": 1,
                    "description": "HP Laptop 15-DW3000",
                    "quantity": 5.0,
                    "rate": 450000.0,
                    "amount": 2250000.0,
                    "total": 2250000.0,
                    "product": {
                        "id": 1,
                        "name": "HP Laptop 15-DW3000",
                        "code": "PROD-001",
                        "unit": {
                            "name": "Pcs"
                        }
                    }
                },
                {
                    "id": 251,
                    "product_id": 2,
                    "description": "Wireless Mouse - Bulk order",
                    "quantity": 50.0,
                    "rate": 3500.0,
                    "amount": 175000.0,
                    "total": 175000.0,
                    "product": {
                        "id": 2,
                        "name": "Wireless Mouse",
                        "code": "PROD-002",
                        "unit": {
                            "name": "Pcs"
                        }
                    }
                }
            ],
            "entries": [
                {
                    "ledger_account_id": 45,
                    "debit_amount": 2631875.0,
                    "credit_amount": 0.0,
                    "particulars": "Sales to John Doe Enterprises",
                    "ledger_account": {
                        "id": 45,
                        "name": "John Doe Enterprises",
                        "code": "1020-001",
                        "account_group": {
                            "name": "Sundry Debtors"
                        }
                    }
                }
            ],
            "created_by": {
                "id": 1,
                "name": "Admin User"
            },
            "posted_by": {
                "id": 1,
                "name": "Admin User"
            }
        },
        "party": {
            "id": 1,
            "name": "John Doe Enterprises",
            "email": "john@example.com",
            "phone": "08012345678",
            "address": "123 Business Street, Lagos",
            "outstanding_balance": 2631875.0
        },
        "balance_due": 2631875.0,
        "total_paid": 0.0
    }
}
```

---

### 5. Update Invoice

**Endpoint:** `PUT /{invoice}`

**Note:** Only draft invoices can be updated. Posted invoices must be unposted first.

**Sample Request:**

```bash
curl -X PUT \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "voucher_date": "2026-01-20",
    "customer_id": 45,
    "reference_number": "PO-2024-001-REV",
    "narration": "Updated order",
    "inventory_items": [
      {
        "product_id": 1,
        "description": "HP Laptop 15-DW3000",
        "quantity": 10,
        "unit_id": 1,
        "rate": 450000.00,
        "amount": 4500000.00,
        "total": 4500000.00
      }
    ],
    "additional_ledger_accounts": [],
    "vat_enabled": false,
    "vat_amount": 0
  }'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice updated successfully",
    "data": {
        "id": 125,
        "voucher_number": "SI-0125",
        "total_amount": 4500000.0,
        "status": "draft",
        "updated_at": "2026-01-19T11:00:00.000000Z"
    }
}
```

**Error Response - Cannot Edit Posted (422):**

```json
{
    "success": false,
    "message": "Posted invoices cannot be edited. Unpost first to make changes.",
    "errors": {
        "status": ["Posted invoices are locked"]
    }
}
```

---

### 6. Delete Invoice

**Endpoint:** `DELETE /{invoice}`

**Note:** Only draft invoices can be deleted.

**Sample Request:**

```bash
curl -X DELETE \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice deleted successfully"
}
```

---

### 7. Post Invoice

**Endpoint:** `POST /{invoice}/post`

**Purpose:**

- Changes status from draft to posted
- Creates accounting entries in ledgers
- Updates product stock
- Creates stock movements

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/post' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice posted successfully",
    "data": {
        "id": 125,
        "status": "posted",
        "posted_at": "2026-01-19T11:30:00.000000Z",
        "posted_by": 1
    }
}
```

---

### 8. Unpost Invoice

**Endpoint:** `POST /{invoice}/unpost`

**Purpose:**

- Changes status from posted to draft
- Reverses stock movements
- Allows editing

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/unpost' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice unposted successfully",
    "data": {
        "id": 125,
        "status": "draft",
        "posted_at": null,
        "posted_by": null
    }
}
```

---

### 9. Search Customers/Vendors

**Endpoint:** `GET /search-customers?search={query}&type={customer|vendor}`

**Query Parameters:**

- `search`: Search term (name, email, phone)
- `type`: `customer` or `vendor`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-customers?search=john&type=customer' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "ledger_account_id": 45,
            "name": "John Doe",
            "customer_type": "individual",
            "email": "john@example.com",
            "phone": "08012345678",
            "mobile": "08012345678",
            "outstanding_balance": 2631875.0,
            "currency": "NGN",
            "payment_terms": "Net 30",
            "address": "123 Business Street, Lagos, Lagos State, 10001, Nigeria"
        },
        {
            "id": 5,
            "ledger_account_id": 49,
            "name": "Johnson Trading Co",
            "customer_type": "business",
            "email": "johnson@example.com",
            "phone": "08055667788",
            "mobile": null,
            "outstanding_balance": 150000.0,
            "currency": "NGN",
            "payment_terms": "Net 15",
            "address": "456 Trade Avenue, Lagos, Nigeria"
        }
    ]
}
```

---

### 10. Search Products

**Endpoint:** `GET /search-products?search={query}&type={sales|purchase}`

**Query Parameters:**

- `search`: Search term (name, code)
- `type`: `sales` or `purchase`

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-products?search=laptop&type=sales' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "HP Laptop 15-DW3000",
            "code": "PROD-001",
            "type": "goods",
            "unit": "Pcs",
            "unit_id": 1,
            "sales_price": 450000.0,
            "purchase_price": 380000.0,
            "current_stock": 20,
            "sales_account_id": 78,
            "purchase_account_id": 79,
            "default_price": 450000.0,
            "account_id": 78
        },
        {
            "id": 5,
            "name": "Dell Laptop Inspiron 15",
            "code": "PROD-005",
            "type": "goods",
            "unit": "Pcs",
            "unit_id": 1,
            "sales_price": 420000.0,
            "purchase_price": 350000.0,
            "current_stock": 15,
            "sales_account_id": 78,
            "purchase_account_id": 79,
            "default_price": 420000.0,
            "account_id": 78
        }
    ]
}
```

---

### 11. Search Ledger Accounts

**Endpoint:** `GET /search-ledger-accounts?search={query}`

**Query Parameters:**

- `search`: Search term (account name, code)

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/search-ledger-accounts?search=vat' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/json'
```

**Sample Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 100,
            "name": "VAT Payable",
            "code": "2150",
            "current_balance": 500000.0,
            "is_active": true,
            "account_group": {
                "id": 15,
                "name": "Current Liabilities",
                "code": "L02"
            }
        },
        {
            "id": 102,
            "name": "VAT Input",
            "code": "1320",
            "current_balance": 250000.0,
            "is_active": true,
            "account_group": {
                "id": 8,
                "name": "Current Assets",
                "code": "A02"
            }
        }
    ]
}
```

---

### 12. Email Invoice

**Endpoint:** `POST /{invoice}/email`

**Purpose:** Send invoice PDF via email to customer/vendor

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/email' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "to": "customer@example.com",
    "subject": "Invoice SV-0001 from Demo Company",
    "message": "Please find attached your invoice.",
    "cc": ["accounts@example.com"],
    "attach_pdf": true
  }'
```

**Request Body:**

- `to` (required): Recipient email address
- `subject` (optional): Email subject (auto-generated if not provided)
- `message` (optional): Email body message
- `cc` (optional): Array of CC email addresses
- `attach_pdf` (optional): Whether to attach PDF (default: true)

**Sample Response (200 OK):**

```json
{
    "success": true,
    "message": "Invoice emailed successfully",
    "data": {
        "sent_to": "customer@example.com",
        "sent_at": "2026-01-21T10:30:00Z"
    }
}
```

**Status:** ✅ **IMPLEMENTED** - Backend endpoint is ready to use

---

### 13. Download Invoice PDF

**Endpoint:** `GET /{invoice}/pdf`

**Purpose:** Download invoice as PDF file

**Sample Request:**

```bash
curl -X GET \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/pdf' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Accept: application/pdf'
```

**Sample Response (200 OK):**

Returns PDF file with headers:

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Invoice-SV-0001.pdf"`

**Status:** ✅ **IMPLEMENTED** - Backend endpoint is ready to use

---

### 14. Record Payment Against Invoice

**Endpoint:** `POST /{invoice}/record-payment`

**Purpose:** Record a payment/receipt against an invoice to reduce balance due

**Sample Request:**

```bash
curl -X POST \
  'https://yourapp.com/api/v1/tenant/demo-company/accounting/invoices/125/record-payment' \
  -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "date": "2026-01-21",
    "amount": 50000,
    "bank_account_id": 15,
    "reference": "BANK-TRF-001",
    "notes": "Bank transfer payment"
  }'
```

**Request Body:**

- `date` (required): Payment date (YYYY-MM-DD)
- `amount` (required): Payment amount (must be > 0)
- `bank_account_id` (required): ID of bank/cash account receiving payment
- `reference` (optional): Payment reference number
- `notes` (optional): Additional notes about the payment

**Sample Response (201 Created):**

```json
{
    "success": true,
    "message": "Payment recorded successfully",
    "data": {
        "payment_voucher": {
            "id": 156,
            "voucher_number": "RV-0045",
            "voucher_type": {
                "id": 5,
                "name": "Receipt Voucher",
                "code": "RV"
            },
            "voucher_date": "2026-01-21",
            "amount": 50000,
            "reference": "BANK-TRF-001",
            "notes": "Bank transfer payment"
        },
        "invoice": {
            "id": 125,
            "voucher_number": "SV-0001",
            "total_amount": 100000,
            "total_paid": 50000,
            "balance_due": 50000,
            "payment_status": "Partially Paid"
        }
    }
}
```

**Validation Errors (422):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "amount": ["Payment amount cannot exceed balance due of ₦50,000.00"],
        "bank_account_id": ["The selected bank account is invalid"]
    }
}
```

**Status:** ✅ **IMPLEMENTED** - Backend endpoint is ready to use

---

## Invoice Details/Show Screen

This screen displays complete invoice information with actions for the user to perform.

### Screen Sections

#### 1. Header Section

**Display:**

- Invoice number with voucher type prefix (e.g., "Invoice SV-0001")
- Back button
- Status badge (Draft/Posted)
- Action menu (3-dot menu with options)

#### 2. Payment Status Card (Top Priority)

**Display:**

- Balance Due amount (large, bold) - ₦50,000.00
- Payment progress bar
    - Shows percentage paid
    - Color-coded: Red (Unpaid), Yellow (Partial), Green (Paid)
- Payment status label: "Unpaid" | "Partially Paid" | "Fully Paid"
- Amount paid vs total: "₦50,000 of ₦100,000"

**Example:**

```
┌─────────────────────────────────┐
│    Payment Status               │
├─────────────────────────────────┤
│                                 │
│    ₦50,000.00                  │
│    Balance Due                  │
│                                 │
│    [████████░░] 50%            │
│                                 │
│    Partially Paid               │
│    ₦50,000 of ₦100,000         │
│                                 │
└─────────────────────────────────┘
```

#### 3. Party (Customer/Vendor) Information Card

**Display:**

- Section title: "Customer Information" or "Vendor Information"
- Name (bold)
- Email
- Phone
- Mobile
- Full Address

#### 4. Invoice Summary Card

**Display:**

- Invoice Date: Jan. 21, 2026
- Reference Number (if exists)
- Created By: User Name
- Posted On: Jan. 21, 2026 by User Name (if posted)
- Payment Terms: Net 30
- Status: Draft/Posted

#### 5. Invoice Items Section

**Display as table/list:**

- S/N | Description | Qty | Rate | Amount
- Each item row with:
    - Product name (bold)
    - Description (if different from product name)
    - Quantity with unit (e.g., "5 Pcs")
    - Rate (₦6,000.00)
    - Amount (₦30,000.00)

**Bottom totals:**

- Subtotal: ₦85,000.00
- Additional Charges (if any):
    - Transport: ₦5,000.00
    - Handling: ₦2,500.00
- VAT (if applicable): ₦7,500.00
- **Grand Total: ₦100,000.00** (bold, larger font)

#### 6. Payment History Section (if payments exist)

**Display as list of cards:**

- Payment date: Jan. 20, 2026
- Amount: ₦50,000.00
- Payment method: Bank Transfer
- Reference: BANK-TRF-001
- Notes: Bank transfer payment

#### 7. Accounting Entries Section (Collapsible/Expandable)

**Display as table:**

- Account Name | Debit | Credit
- Shows double-entry bookkeeping entries
- Useful for accounting staff

#### 8. Action Buttons

**For Posted Invoices:**

- 🧾 **Record Payment** (primary button, prominent)
- 📧 **Email Invoice** (secondary button)
- 🖨️ **Print Invoice** (opens print view)
- 📄 **Download PDF** (downloads PDF file)
- 🔄 **Unpost Invoice** (if user has permission)

**For Draft Invoices:**

- ✏️ **Edit Invoice**
- 📮 **Post Invoice** (primary button)
- 🗑️ **Delete Invoice**

### API Response for Show Screen

The show endpoint returns:

```json
{
    "success": true,
    "message": "Invoice retrieved successfully",
    "data": {
        "invoice": {
            "id": 125,
            "voucher_number": "SV-0001",
            "voucher_date": "2026-01-21",
            "reference_number": "PO-2024-001",
            "narration": "Monthly supply",
            "total_amount": 100000,
            "status": "posted",
            "created_at": "2026-01-21T08:30:00Z",
            "posted_at": "2026-01-21T09:00:00Z",
            "voucher_type": {
                "id": 3,
                "name": "Sales Invoice",
                "code": "SALES",
                "prefix": "SV-"
            },
            "items": [...],
            "entries": [...],
            "created_by": {
                "id": 5,
                "name": "John Doe"
            },
            "posted_by": {
                "id": 5,
                "name": "John Doe"
            }
        },
        "party": {
            "id": 49,
            "type": "customer",
            "name": "Acme Corporation",
            "email": "info@acme.com",
            "phone": "08012345678",
            "mobile": "08098765432",
            "address": "123 Business Street, Lagos, Lagos State, 10001, Nigeria",
            "outstanding_balance": 150000
        },
        "balance_due": 50000,
        "total_paid": 50000
    }
}
```

### Action Implementations

#### Record Payment Action Flow

1. User taps "Record Payment" button
2. Show payment modal/bottom sheet with:
    - Date picker (default: today)
    - Amount input (default: balance due, max: balance due)
    - Bank/Cash account selector (searchable dropdown)
    - Reference number input (optional)
    - Notes textarea (optional)
3. Validate amount ≤ balance due
4. POST to `/api/v1/tenant/{tenant}/accounting/invoices/{invoice}/record-payment`
5. Show success message
6. Refresh invoice details to show updated balance

#### Email Invoice Action Flow

1. User taps "Email Invoice" button
2. Show email modal/bottom sheet with:
    - To: (pre-filled with party email)
    - CC: (optional, multi-email input)
    - Subject: (pre-filled, editable)
    - Message: (pre-filled template, editable)
    - Attach PDF checkbox (default: checked)
3. POST to `/api/v1/tenant/{tenant}/accounting/invoices/{invoice}/email`
4. Show sending indicator
5. Show success/error message

#### Download PDF Action Flow

1. User taps "Download PDF" button
2. Show loading indicator
3. GET `/api/v1/tenant/{tenant}/accounting/invoices/{invoice}/pdf`
4. Save file to device downloads folder
5. Show success notification with option to open PDF

#### Unpost Invoice Action Flow

1. User taps "Unpost Invoice" button
2. Show confirmation dialog:
    - "Are you sure you want to unpost this invoice?"
    - "This will reverse stock movements and allow editing."
3. If confirmed, POST to `/api/v1/tenant/{tenant}/accounting/invoices/{invoice}/unpost`
4. Show success message
5. Update invoice status to "Draft"
6. Update UI to show edit/delete options

---

## Business Rules & Validations

### Invoice Creation Rules

1. **Draft Invoice:**
    - Can be created without posting
    - Does NOT affect stock
    - Does NOT create accounting entries
    - Can be edited freely
    - Can be deleted

2. **Posted Invoice:**
    - Automatically assigned invoice number
    - AFFECTS stock (sales decrease, purchase increase)
    - CREATES accounting entries in ledgers
    - CANNOT be edited directly
    - CANNOT be deleted
    - Must be unposted first to edit

3. **Stock Validation (Sales):**
    - Quantity cannot exceed current stock (optional warning)
    - Shows stock availability in product selector
    - Updates stock in real-time when posted

4. **Customer/Vendor Balance:**
    - For sales: Increases customer outstanding balance
    - For purchase: Increases vendor payable balance
    - Updated on post

---

## Stock Management Logic

### Sales Invoice (inventory_effect = 'decrease')

**When Posted:**

```
1. For each item:
   - product.current_stock -= item.quantity
   - Create StockMovement:
     * movement_type = 'out'
     * quantity = item.quantity
     * reference = voucher_number
```

**When Unposted:**

```
1. For each stock movement:
   - product.current_stock += movement.quantity
   - Delete StockMovement
```

### Purchase Invoice (inventory_effect = 'increase')

**When Posted:**

```
1. For each item:
   - product.current_stock += item.quantity
   - Create StockMovement:
     * movement_type = 'in'
     * quantity = item.quantity
     * reference = voucher_number
```

**When Unposted:**

```
1. For each stock movement:
   - product.current_stock -= movement.quantity
   - Delete StockMovement
```

---

## Accounting Entry Logic

### Sales Invoice Entries

```
Debit:  Customer Account ........... ₦ 2,631,875
Credit:   Sales Account ............ ₦ 2,425,000
Credit:   Transport Account ........ ₦    25,000
Credit:   VAT Payable .............. ₦   181,875
                                    _______________
        Total ...................... ₦ 2,631,875
```

**Entry Creation Logic:**

```javascript
// Customer debit
voucher_entries.create({
  ledger_account_id: customer.ledger_account_id,
  debit_amount: grand_total,
  credit_amount: 0,
  particulars: "Sales to {customer_name}"
});

// Sales credit (grouped by product's sales_account_id)
for each unique sales_account in items:
  voucher_entries.create({
    ledger_account_id: sales_account_id,
    debit_amount: 0,
    credit_amount: sum_of_items_for_this_account,
    particulars: "Sales"
  });

// Additional charges credit
for each additional_charge:
  voucher_entries.create({
    ledger_account_id: charge.ledger_account_id,
    debit_amount: 0,
    credit_amount: charge.amount,
    particulars: charge.narration
  });
```

### Purchase Invoice Entries

```
Debit:  Purchase Account ........... ₦ 3,000,000
Debit:  Transport Account .......... ₦    50,000
Debit:  VAT Input .................. ₦   225,000
Credit:   Vendor Account ........... ₦ 3,275,000
                                    _______________
        Total ...................... ₦ 3,275,000
```

---

## VAT Calculation Logic

### VAT on Items Only

```javascript
vat_amount = items_subtotal * (vat_rate / 100)

Example:
items_subtotal = ₦ 2,425,000
vat_rate = 7.5%
vat_amount = 2,425,000 * 0.075 = ₦ 181,875
```

### VAT on Items + Additional Charges

```javascript
vat_amount = (items_subtotal + additional_charges_total) * (vat_rate / 100)

Example:
items_subtotal = ₦ 2,425,000
additional_charges = ₦ 25,000
vat_rate = 7.5%
vat_amount = (2,425,000 + 25,000) * 0.075 = ₦ 183,750
```

---

## Error Handling

### Common Error Responses

#### 1. Validation Errors (422)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

#### 2. Authentication Error (401)

```json
{
    "message": "Unauthenticated."
}
```

#### 3. Not Found (404)

```json
{
    "message": "Resource not found."
}
```

#### 4. Server Error (500)

```json
{
    "success": false,
    "message": "Failed to create invoice: {error_message}"
}
```

### Error Handling Best Practices

1. **Display user-friendly messages**
2. **Show validation errors next to fields**
3. **Log detailed errors for debugging**
4. **Implement retry logic for network failures**
5. **Handle offline scenarios gracefully**

---

## Mobile UI/UX Best Practices

### 1. Form Validation

- Validate fields on blur
- Show real-time validation errors
- Disable submit until form is valid
- Show total calculations in real-time

### 2. Product Selection

- Show product image (if available)
- Display current stock prominently
- Highlight low stock in red
- Auto-focus quantity field after selection

### 3. Calculations

- Update all totals immediately on change
- Show breakdown on tap
- Format currency consistently
- Handle decimal precision (2 places)

### 4. Save States

- Show loading spinner during save
- Disable form during submission
- Show success/error messages
- Auto-navigate on success

### 5. Offline Support (Optional)

- Cache form data locally
- Queue submissions when offline
- Sync when connection restored
- Show offline indicator

---

## API Endpoints Summary

### ✅ Available Endpoints (Ready to Use)

| Endpoint                    | Method | Purpose                            | Status     |
| --------------------------- | ------ | ---------------------------------- | ---------- |
| `/ai-parse`                 | POST   | Parse natural language → invoice   | ✅ Working |
| `/create`                   | GET    | Get form data for creating invoice | ✅ Working |
| `/`                         | POST   | Create new invoice                 | ✅ Working |
| `/`                         | GET    | List invoices with filters         | ✅ Working |
| `/{invoice}`                | GET    | Get invoice details                | ✅ Working |
| `/{invoice}`                | PUT    | Update draft invoice               | ✅ Working |
| `/{invoice}`                | DELETE | Delete draft invoice               | ✅ Working |
| `/{invoice}/post`           | POST   | Post draft invoice                 | ✅ Working |
| `/{invoice}/unpost`         | POST   | Unpost posted invoice              | ✅ Working |
| `/search-customers`         | GET    | Search customers/vendors           | ✅ Working |
| `/search-products`          | GET    | Search products                    | ✅ Working |
| `/search-ledger-accounts`   | GET    | Search ledger accounts             | ✅ Working |
| `/{invoice}/pdf`            | GET    | Download invoice PDF               | ✅ Working |
| `/{invoice}/email`          | POST   | Email invoice to customer          | ✅ Working |
| `/{invoice}/record-payment` | POST   | Record payment against invoice     | ✅ Working |

### ⚠️ Pending Endpoints (To Be Implemented)

| Endpoint           | Method | Purpose                    | Priority  | Notes                              |
| ------------------ | ------ | -------------------------- | --------- | ---------------------------------- |
| `/{invoice}/print` | GET    | Get printable invoice HTML | 🟡 Medium | Web view exists, needs API wrapper |

### Implementation Status

✅ **All high-priority endpoints have been implemented!**

The following endpoints are now available in the API:

- `POST /{invoice}/email` - Email invoice with PDF attachment
- `GET /{invoice}/pdf` - Download invoice as PDF
- `POST /{invoice}/record-payment` - Record payment and create receipt voucher

All endpoints follow the API specifications documented above and return proper JSON responses.

---

## Testing Checklist

### Functional Testing

- [ ] Create draft invoice
- [ ] Create and post invoice
- [ ] Edit draft invoice
- [ ] Delete draft invoice
- [ ] Post draft invoice
- [ ] Unpost posted invoice
- [ ] Record payment against invoice
- [ ] Email invoice to customer
- [ ] Download invoice PDF
- [ ] Stock updates correctly
- [ ] Customer balance updates
- [ ] VAT calculations accurate
- [ ] Additional charges work
- [ ] Search functions work
- [ ] Validation prevents errors

### UI Testing

- [ ] All fields display correctly
- [ ] Payment status card shows correctly
- [ ] Progress bar animates smoothly
- [ ] Calculations update in real-time
- [ ] Error messages appear
- [ ] Loading states show
- [ ] Success messages display
- [ ] Navigation works
- [ ] Responsive on all screens
- [ ] Invoice details screen renders properly
- [ ] Action buttons work correctly

### Performance Testing

- [ ] Form loads quickly
- [ ] Invoice details load quickly
- [ ] Calculations are instant
- [ ] Search is responsive
- [ ] Large invoices handle well
- [ ] API responses are fast
- [ ] PDF generation is quick

---

## Support & Documentation

For additional help:

- Backend API Docs: `/api/documentation`
- Support Email: dev-support@yourapp.com
- Slack Channel: #mobile-dev

---

**Version:** 3.0
**Last Updated:** February 26, 2026
**Maintained By:** Backend Development Team
