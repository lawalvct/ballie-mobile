# Account Group Feature Module

## 📁 Structure

```
src/features/accountgroup/
├── screens/                          # All screen components
│   ├── AccountGroupListScreen.tsx    # Main list view with filters
│   ├── AccountGroupCreateScreen.tsx  # Create new group
│   ├── AccountGroupShowScreen.tsx    # View details
│   └── AccountGroupEditScreen.tsx    # Edit existing group
├── components/                       # Reusable UI components
│   ├── AccountGroupStats.tsx        # Statistics cards
│   ├── AccountGroupFilters.tsx      # Search and filter UI
│   └── AccountGroupList.tsx         # Data table/list
├── services/                        # API integration
│   └── accountGroupService.ts       # All API calls
├── types/                           # TypeScript definitions
│   └── index.ts                     # Interfaces and types
└── index.ts                         # Barrel exports
```

## 🎯 Purpose

This feature-based organization provides:

- **Modularity**: All related code in one place
- **Scalability**: Easy to add new CRUD screens
- **Maintainability**: Clear separation of concerns
- **Reusability**: Shared types and services
- **Type Safety**: Centralized TypeScript definitions

## 🚀 Usage

### Importing Screens

```typescript
import {
  AccountGroupListScreen,
  AccountGroupCreateScreen,
  AccountGroupShowScreen,
  AccountGroupEditScreen,
} from "../features/accounting/accountgroup";
```

### Using Services

```typescript
import { accountGroupService } from "../features/accounting/accountgroup";

// Load form data
const formData = await accountGroupService.getFormData();

// Create group
const newGroup = await accountGroupService.create({
  name: "Current Assets",
  code: "CA-001",
  nature: "assets",
});

// List groups
const { account_groups, pagination } = await accountGroupService.list({
  search: "asset",
  status: "active",
});

// Show details
const group = await accountGroupService.show(id);

// Update
const updated = await accountGroupService.update(id, {
  name: "Updated Name",
});

// Delete
await accountGroupService.delete(id);

// Toggle status
const toggled = await accountGroupService.toggleStatus(id);
```

### Using Types

```typescript
import type {
  AccountGroup,
  CreateAccountGroupPayload,
} from "../features/accounting/accountgroup";

const group: AccountGroup = {
  id: 1,
  name: "Assets",
  code: "AST",
  nature: "assets",
  // ...
};
```

## 🔧 API Integration

Replace mock data in `services/accountGroupService.ts` with real API calls:

```typescript
// Before
return mockData;

// After
const response = await api.get("/accounting/account-groups/create");
return response.data.data;
```

## 🎨 Components

### AccountGroupStats

Displays 4 statistics cards (Total, Active, Parents, Children)

### AccountGroupFilters

Collapsible filter section with:

- Search input
- Status filter (Active/Inactive)
- Nature filter (Assets, Liabilities, etc.)
- Level filter (Parent/Child)
- Apply/Clear buttons

### AccountGroupList

Data table with:

- Zebra striped rows
- Nature badges with colors
- Status indicators
- Action buttons (View, Edit, Deactivate, +Child)
- Hierarchy display

## 📱 Screens

### AccountGroupListScreen

- Main list view
- Search and filters
- Statistics overview
- - Add New button
- Pagination support

### AccountGroupCreateScreen

- Nature selection (required first)
- Form fields (name, code, parent, status)
- Client-side validation
- Parent filtering by nature

### AccountGroupShowScreen

- View full details
- Toggle active/inactive
- Delete with confirmation
- Edit navigation

### AccountGroupEditScreen

- Pre-filled form
- Nature locked (read-only)
- Parent group selection
- Update validation

## 🔄 Navigation Routes

```typescript
// In MainNavigator.tsx
case "accountgroup":        // → AccountGroupListScreen
case "accountgroupcreate":  // → AccountGroupCreateScreen
case "accountgroupshow":    // → AccountGroupShowScreen
case "accountgroupedit":    // → AccountGroupEditScreen
```

## 📋 Future Features

Coming soon:

- [ ] AccountGroupCreateChildScreen (specialized child creation)
- [ ] Bulk operations (import/export)
- [ ] Advanced search with query builder
- [ ] Hierarchy tree view
- [ ] Drag and drop reordering

## 🧪 Testing

To test with real API:

1. Update `BASE_URL` in `accountGroupService.ts`
2. Import your API client
3. Replace mock responses with actual API calls
4. Handle errors appropriately

## 📝 Notes

- All screens include "Coming Soon" banners for incomplete features
- Mock data is provided for development
- TypeScript interfaces match API response structure
- Navigation uses simple state-based routing (can upgrade to React Navigation)
