# Features Folder Structure

## 🎯 Purpose

The `features/` folder organizes code by business domain/feature rather than technical type. Each feature is self-contained with its own screens, components, services, and types.

## 📁 Current Features

### ✅ Account Group (`accountgroup/`)

Complete CRUD implementation for account group management.

**Structure:**

```
accountgroup/
├── screens/          # List, Create, Show, Edit screens
├── components/       # Stats, Filters, List components
├── services/         # API integration
├── types/            # TypeScript definitions
├── index.ts          # Barrel exports
└── README.md         # Feature documentation
```

## 🚀 Adding New Features

When adding a new feature (e.g., Ledger Accounts, Journal Entries), follow this pattern:

### 1. Create Feature Folder

```
src/features/yourfeature/
├── screens/
│   ├── YourFeatureListScreen.tsx
│   ├── YourFeatureCreateScreen.tsx
│   ├── YourFeatureShowScreen.tsx
│   └── YourFeatureEditScreen.tsx
├── components/
│   ├── YourFeatureStats.tsx
│   ├── YourFeatureFilters.tsx
│   └── YourFeatureList.tsx
├── services/
│   └── yourFeatureService.ts
├── types/
│   └── index.ts
├── index.ts
└── README.md
```

### 2. Define Types (`types/index.ts`)

```typescript
export interface YourFeature {
  id: number;
  name: string;
  // ... other fields
}

export interface CreateYourFeaturePayload {
  name: string;
  // ... required fields
}

export interface ListParams {
  search?: string;
  // ... filter params
}
```

### 3. Create Service (`services/yourFeatureService.ts`)

```typescript
import type { YourFeature, CreateYourFeaturePayload } from "../types";

export const yourFeatureService = {
  list: async (params) => {
    /* ... */
  },
  show: async (id) => {
    /* ... */
  },
  create: async (payload) => {
    /* ... */
  },
  update: async (id, payload) => {
    /* ... */
  },
  delete: async (id) => {
    /* ... */
  },
};
```

### 4. Build Screens

- **List**: Table with filters, search, pagination
- **Create**: Form with validation
- **Show**: Details view with actions
- **Edit**: Pre-filled form

### 5. Create Barrel Export (`index.ts`)

```typescript
export { default as YourFeatureListScreen } from "./screens/YourFeatureListScreen";
export { default as YourFeatureCreateScreen } from "./screens/YourFeatureCreateScreen";
export { default as YourFeatureShowScreen } from "./screens/YourFeatureShowScreen";
export { default as YourFeatureEditScreen } from "./screens/YourFeatureEditScreen";

export * from "./types";
export * from "./services/yourFeatureService";
```

### 6. Register Routes (MainNavigator.tsx)

```typescript
import {
  YourFeatureListScreen,
  YourFeatureCreateScreen,
  // ...
} from '../features/yourfeature';

// In renderScreen():
case "yourfeature":
  return <YourFeatureListScreen navigation={...} />;
case "yourfeaturecreate":
  return <YourFeatureCreateScreen navigation={...} />;
```

## 📋 Benefits

### ✅ Co-location

All related code lives together. Want to work on Account Groups? Everything is in one folder.

### ✅ Scalability

Adding new features doesn't clutter existing code. Each feature is independent.

### ✅ Maintainability

Clear boundaries make it easy to:

- Find what you need
- Update without breaking other features
- Delete obsolete features cleanly

### ✅ Reusability

Services and types can be imported anywhere:

```typescript
import { accountGroupService } from "features/accountgroup";
```

### ✅ Team Collaboration

Multiple developers can work on different features without conflicts.

## 🎨 Naming Conventions

### Screens

- Format: `FeatureNameActionScreen.tsx`
- Examples: `AccountGroupListScreen`, `LedgerAccountCreateScreen`

### Components

- Format: `FeatureNamePurpose.tsx`
- Examples: `AccountGroupStats`, `JournalEntryFilters`

### Services

- Format: `featureNameService.ts` (camelCase)
- Examples: `accountGroupService`, `ledgerAccountService`

### Types

- Always in `types/index.ts`
- Export interfaces and types only

## 🔄 Migration from Old Structure

When moving existing code:

1. **Copy files to new location**

   ```bash
   Copy-Item "src\screens\OldScreen.tsx" "src\features\feature\screens\NewScreen.tsx"
   ```

2. **Update imports** (3 levels up from feature folder)

   ```typescript
   // Old
   import { COLORS } from "../theme/colors";

   // New
   import { COLORS } from "../../../theme/colors";
   ```

3. **Update MainNavigator imports**

   ```typescript
   import { FeatureScreen } from "../features/feature";
   ```

4. **Delete old files** after testing

## 📚 Examples to Follow

Use `features/accountgroup/` as a reference implementation. It demonstrates:

- Complete CRUD operations
- API service integration
- Type definitions
- Component reusability
- Screen organization
- Documentation

## 🎯 Next Features to Migrate

Consider organizing these next:

- [ ] Ledger Accounts (COA)
- [ ] Journal Entries
- [ ] Vouchers
- [ ] Banking
- [ ] Reconciliation
- [ ] Inventory Items
- [ ] POS Products
- [ ] CRM Contacts

Each will follow the same pattern established by Account Groups.
