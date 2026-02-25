# 💻 Code Examples for Interview - Ballie App

Quick reference for demonstrating code quality and patterns during your interview.

---

## 1. Feature Module Structure

### Show This File Structure
```
src/features/accounting/accountgroup/
├── screens/
│   ├── AccountGroupHomeScreen.tsx      # Data hub (container)
│   ├── AccountGroupCreateScreen.tsx    # Create form
│   ├── AccountGroupEditScreen.tsx      # Edit form
│   └── AccountGroupShowScreen.tsx      # Detail view
├── components/
│   ├── AccountGroupStats.tsx           # Statistics cards
│   ├── AccountGroupFilters.tsx         # Search & filters
│   └── AccountGroupList.tsx            # Data table
├── services/
│   └── accountGroupService.ts          # API calls
├── types/
│   └── index.ts                        # TypeScript types
├── index.ts                            # Barrel exports
└── README.md                           # Documentation
```

**Talking Point**: "This is a complete feature module. Everything related to Account Groups lives here - screens, components, API calls, and types. It's self-contained and can be developed, tested, and maintained independently."

---

## 2. Service Layer Pattern

### File: `accountGroupService.ts`

```typescript
import apiClient from '../../../../api/client';
import { AccountGroup, ListParams, CreatePayload } from '../types';

export const accountGroupService = {
  /**
   * List with filters and pagination
   */
  async list(params: ListParams = {}) {
    // Clean undefined/null/empty values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    );
    
    const response = await apiClient.get('/accounting/account-groups', {
      params: cleanParams
    });
    
    return response.data;
  },

  /**
   * Create new record
   */
  async create(payload: CreatePayload): Promise<AccountGroup> {
    const response = await apiClient.post('/accounting/account-groups', payload);
    return response.data.account_group;
  },

  /**
   * Update existing record
   */
  async update(id: number, payload: UpdatePayload): Promise<AccountGroup> {
    const response = await apiClient.put(`/accounting/account-groups/${id}`, payload);
    return response.data.account_group;
  },

  /**
   * Toggle active status
   */
  async toggleStatus(id: number): Promise<AccountGroup> {
    const response = await apiClient.patch(`/accounting/account-groups/${id}/toggle-status`);
    return response.data.account_group;
  },

  /**
   * Delete record
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/accounting/account-groups/${id}`);
  }
};
```

**Talking Point**: "All API calls are encapsulated in service modules. This makes it easy to mock for testing, change API implementations, and maintain API contracts. Notice the parameter cleaning - we only send non-empty filters to the API."

---

## 3. Container Component Pattern

### File: `AccountGroupHomeScreen.tsx`

```typescript
export default function AccountGroupHomeScreen({ navigation }: Props) {
  // State management
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filters, setFilters] = useState<ListParams>({
    sort: 'name',
    direction: 'asc',
  });

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  // Data fetching
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await accountGroupService.list(filters);
      
      setGroups(response.account_groups || []);
      setPagination(response.pagination || null);
      setStatistics(response.statistics || null);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Targeted update after edit (no full reload)
  const handleItemUpdated = async (id: number) => {
    try {
      const updated = await accountGroupService.show(id);
      setGroups(prev => prev.map(item => item.id === id ? updated : item));
      showToast('✅ Updated successfully', 'success');
    } catch (error) {
      loadData(); // Fallback to full reload
    }
  };

  // Full reload after create (maintains sorting)
  const handleItemCreated = () => {
    loadData();
  };

  // Toggle status
  const handleToggleStatus = async (id: number) => {
    try {
      await accountGroupService.toggleStatus(id);
      showToast('✅ Status updated', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to update', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        
        {/* Add New Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AccountGroupCreate', {
            onCreated: handleItemCreated
          })}>
          <Text>+ Add New</Text>
        </TouchableOpacity>

        {/* Presentational Components */}
        <AccountGroupStats statistics={statistics} />
        
        <AccountGroupFilters
          filters={filters}
          setFilters={setFilters}
          onSearch={loadData}
        />
        
        <AccountGroupList
          groups={groups}
          pagination={pagination}
          onToggleStatus={handleToggleStatus}
          onItemUpdated={handleItemUpdated}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Talking Point**: "This is a container component - it manages all the data and business logic. Notice the targeted update strategy: after editing, we only fetch the updated item and replace it in the array. After creating, we do a full reload to maintain proper sorting. The presentational components below just receive props and display UI."

---

## 4. Presentational Component Pattern

### File: `AccountGroupList.tsx`

```typescript
interface AccountGroupListProps {
  groups: AccountGroup[];
  pagination: PaginationInfo | null;
  onToggleStatus: (id: number) => void;
  onItemUpdated: (id: number) => void;
}

export default function AccountGroupList({
  groups,
  pagination,
  onToggleStatus,
  onItemUpdated,
}: AccountGroupListProps) {
  const navigation = useNavigation();

  if (!groups || groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No records found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Records ({pagination?.total || 0})</Text>
      </View>

      {groups.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.code}>{item.code}</Text>
          
          <View style={[
            styles.statusBadge,
            item.is_active ? styles.statusActive : styles.statusInactive
          ]}>
            <Text>{item.is_active ? 'Active' : 'Inactive'}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountGroupShow', { id: item.id })}>
              <Text>View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountGroupEdit', {
                id: item.id,
                onUpdated: onItemUpdated
              })}>
              <Text>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => onToggleStatus(item.id)}>
              <Text>{item.is_active ? 'Deactivate' : 'Activate'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {pagination && (
        <View style={styles.pagination}>
          <Text>
            Showing {pagination.from} to {pagination.to} of {pagination.total}
          </Text>
        </View>
      )}
    </View>
  );
}
```

**Talking Point**: "This is a pure presentational component. It receives data via props and emits events via callbacks. It has no idea where the data comes from or how to fetch it. This makes it highly reusable and easy to test - just pass mock props."

---

## 5. API Client with Interceptors

### File: `api/client.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://ballie.co/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// REQUEST INTERCEPTOR - Auto-inject auth token and tenant
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    const tenantSlug = await AsyncStorage.getItem('tenant_slug');

    // Add authentication
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add multi-tenancy (prepend tenant slug to URL)
    if (tenantSlug && config.url && !config.url.startsWith('/tenant/')) {
      config.url = `/tenant/${tenantSlug}${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap data
  async (error) => {
    // Handle 401 - Token expired
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([
        'auth_token',
        'user_data',
        'tenant_slug',
      ]);
      // Navigate to login (implement with navigation ref)
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```

**Talking Point**: "This is the heart of our API layer. Request interceptors automatically inject the auth token and tenant slug into every request. Response interceptors unwrap the data and handle global errors like token expiration. This keeps service code clean - they don't need to worry about auth or tenancy."

---

## 6. Type-Safe Navigation

### File: `navigation/types.ts`

```typescript
export type AccountingStackParamList = {
  AccountingHome: undefined;
  
  // Account Groups
  AccountGroupHome: undefined;
  AccountGroupCreate: { onCreated?: () => void };
  AccountGroupEdit: { id: number; onUpdated?: (id: number) => void };
  AccountGroupShow: { id: number };
  
  // Ledger Accounts
  LedgerAccountHome: undefined;
  LedgerAccountCreate: { onCreated?: () => void };
  LedgerAccountEdit: { id: number; onUpdated?: (id: number) => void };
  LedgerAccountShow: { id: number };
  
  // ... more routes
};
```

### Usage in Screen:

```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AccountingStackParamList, 'AccountGroupEdit'>;

export default function AccountGroupEditScreen({ navigation, route }: Props) {
  // TypeScript knows exactly what params are available
  const { id, onUpdated } = route.params;
  
  const handleSubmit = async () => {
    await accountGroupService.update(id, formData);
    
    // Call parent callback
    if (onUpdated) {
      onUpdated(id);
    }
    
    navigation.goBack();
  };
}
```

**Talking Point**: "All navigation is type-safe. TypeScript knows exactly what parameters each screen expects. If I try to navigate with wrong params, I get a compile-time error. This prevents runtime crashes from incorrect navigation."

---

## 7. Context API for Auth

### File: `context/AuthContext.tsx`

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  login: (token: string, user: User, tenant: Tenant) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [storedToken, storedUser, storedTenantSlug] = await AsyncStorage.multiGet([
        'auth_token',
        'user_data',
        'tenant_slug',
      ]);

      const tokenValue = storedToken[1];
      const userData = storedUser[1] ? JSON.parse(storedUser[1]) : null;
      const tenantSlug = storedTenantSlug[1];

      if (tokenValue && userData && tenantSlug) {
        setToken(tokenValue);
        setUser(userData);
        setTenant({ slug: tenantSlug });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, user: User, tenant: Tenant) => {
    await AsyncStorage.multiSet([
      ['auth_token', token],
      ['user_data', JSON.stringify(user)],
      ['tenant_slug', tenant.slug],
    ]);

    setToken(token);
    setUser(user);
    setTenant(tenant);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['auth_token', 'user_data', 'tenant_slug']);
    setToken(null);
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      tenant,
      token,
      login,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Usage:

```typescript
function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

**Talking Point**: "I use Context API for global state like authentication. It persists to AsyncStorage and provides a clean API for login/logout. The custom hook ensures it's used correctly and provides type safety."

---

## 8. TypeScript Type Definitions

### File: `features/accounting/accountgroup/types/index.ts`

```typescript
// Main entity
export interface AccountGroup {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// List parameters with filters
export interface ListParams {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  parent_id?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Pagination metadata
export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Statistics
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  with_parent: number;
  without_parent: number;
}

// API response wrapper
export interface ListResponse {
  account_groups: AccountGroup[];
  pagination: PaginationInfo;
  statistics: Statistics;
}

// Form data (dropdowns, options)
export interface FormData {
  parent_groups: Array<{ id: number; name: string }>;
}

// Create payload
export interface CreateAccountGroupPayload {
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
}

// Update payload
export interface UpdateAccountGroupPayload {
  name?: string;
  code?: string;
  description?: string;
  parent_id?: number;
}
```

**Talking Point**: "Every API response, component prop, and function parameter is fully typed. This catches bugs at compile time and provides excellent IDE autocomplete. Notice how I separate concerns - ListParams for filters, CreatePayload for creation, UpdatePayload for updates."

---

## 9. Error Handling Pattern

```typescript
// Screen level - User-facing errors
const handleSubmit = async () => {
  // Client-side validation
  if (!formData.name.trim()) {
    showToast('Name is required', 'error');
    return;
  }

  try {
    setLoading(true);
    await accountGroupService.create(formData);
    showToast('✅ Created successfully', 'success');
    
    if (onCreated) {
      onCreated();
    }
    
    navigation.goBack();
  } catch (error: any) {
    // Server-side validation errors
    const message = error.message || error.error || 'Failed to create';
    showToast(message, 'error');
  } finally {
    setLoading(false);
  }
};
```

**Talking Point**: "I implement layered error handling. Client-side validation provides immediate feedback. Server errors are caught and displayed with user-friendly messages. Loading states are always cleaned up in the finally block."

---

## 10. Callback Pattern for Screen Communication

```typescript
// Parent Screen
const handleItemUpdated = async (id: number) => {
  const updated = await accountGroupService.show(id);
  setGroups(prev => prev.map(item => item.id === id ? updated : item));
};

navigation.navigate('AccountGroupEdit', {
  id: item.id,
  onUpdated: handleItemUpdated, // Pass callback
});

// Child Screen (Edit)
type Props = NativeStackScreenProps<AccountingStackParamList, 'AccountGroupEdit'>;

export default function AccountGroupEditScreen({ navigation, route }: Props) {
  const { id, onUpdated } = route.params;

  const handleSubmit = async () => {
    await accountGroupService.update(id, formData);
    
    // Trigger parent update
    if (onUpdated) {
      onUpdated(id);
    }
    
    navigation.goBack();
  };
}
```

**Talking Point**: "I use callbacks for screen-to-screen communication. The parent passes a callback via navigation params, and the child invokes it after saving. This keeps data flow explicit and avoids the complexity of global state for transient operations."

---

## Quick Demo Flow for Interview

1. **Show folder structure** → Explain feature-based architecture
2. **Open service file** → Explain API layer and parameter cleaning
3. **Open HomeScreen** → Explain container pattern and state management
4. **Open List component** → Explain presentational pattern
5. **Show API client** → Explain interceptors for auth and multi-tenancy
6. **Show types file** → Explain TypeScript benefits
7. **Show navigation types** → Explain type-safe routing
8. **Show AuthContext** → Explain global state management

---

## Key Code Quality Points

✅ **Separation of Concerns**: Screens, components, services, types are separate
✅ **Type Safety**: Full TypeScript coverage with strict mode
✅ **Clean Code**: Descriptive names, single responsibility, DRY
✅ **Error Handling**: Layered approach with user feedback
✅ **Performance**: Targeted updates, efficient state management
✅ **Maintainability**: Consistent patterns, clear structure
✅ **Scalability**: Feature-based modules, easy to extend

---

## Common Interview Questions & Answers

**Q: How do you handle state management?**
A: "I use Context API for global state like auth, and local state for feature data. This hybrid approach balances simplicity with performance."

**Q: How do you ensure type safety?**
A: "Full TypeScript coverage with strict mode. Every API response, component prop, and navigation param is typed."

**Q: How do you structure large React Native apps?**
A: "Feature-based modular architecture. Each business domain is self-contained with screens, components, services, and types."

**Q: How do you handle API calls?**
A: "Centralized API client with interceptors for auth and multi-tenancy. Each feature has a service module that encapsulates API calls."

**Q: How do you optimize performance?**
A: "Targeted updates instead of full reloads, efficient state management, proper loading states, and avoiding unnecessary re-renders."

**Q: How do you handle errors?**
A: "Layered approach: global errors at API client level, logging at service level, user feedback at screen level."

---

You're ready to showcase production-quality code! 🚀
