# 📋 Interview Cheat Sheet - Quick Reference

Quick answers for common senior mobile developer interview questions.

---

## 🎯 App Overview (30 seconds)

**Ballie** is a comprehensive business management mobile app (ERP-style) built with React Native and TypeScript. It includes modules for:
- Accounting (vouchers, invoices, ledgers, bank reconciliation)
- Inventory (products, categories, stock management)
- CRM (customers, vendors, documents)
- Payroll (employees, attendance, processing)
- Reports (financial, sales, inventory)

**Tech Stack:**
- React Native 0.81 + Expo
- TypeScript (strict mode)
- React Navigation (nested navigators)
- Axios (API client)
- AsyncStorage (persistence)
- Context API (global state)

---

## 🏗️ Architecture (1 minute)

**Feature-Based Modular Architecture**
```
src/features/accounting/accountgroup/
  ├── screens/      # Smart containers
  ├── components/   # Dumb presentational
  ├── services/     # API layer
  └── types/        # TypeScript defs
```

**Key Patterns:**
1. **Container/Presentational**: Screens manage data, components display UI
2. **Service Layer**: All API calls encapsulated in service modules
3. **Type-Safe Navigation**: All routes and params fully typed
4. **Context API**: Global state (auth, user, tenant)
5. **Callback Pattern**: Screen-to-screen communication

**Why This Matters:**
- Team can scale horizontally (10 devs on 10 features)
- Easy to test (mock services, not screens)
- Clear separation of concerns
- Maintainable and scalable

---

## ⚡ Performance (1 minute)

**Current Optimizations:**
1. **Targeted Updates**: Fetch only changed item after edit (90% fewer requests)
2. **Parameter Cleaning**: Remove empty filters before API calls
3. **Loading States**: Proper feedback with pull-to-refresh
4. **Callback Pattern**: Avoid global state pollution

**Future Enhancements:**
1. **React Query**: Intelligent caching and background refetching
2. **WatermelonDB**: Offline support with sync
3. **FlatList**: Virtualization for long lists
4. **Code Splitting**: Lazy load feature modules
5. **Sentry**: Performance monitoring and error tracking

---

## 🔧 Technical Deep Dive

### API Client (30 seconds)
```typescript
// Request interceptor: Auto-inject auth + tenant
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  const tenant = await AsyncStorage.getItem('tenant_slug');
  
  config.headers.Authorization = `Bearer ${token}`;
  config.url = `/tenant/${tenant}${config.url}`;
  
  return config;
});

// Response interceptor: Handle 401, unwrap data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) logout();
    return Promise.reject(error.response?.data);
  }
);
```

**Benefits:** Services don't worry about auth or tenancy

---

### Service Layer (30 seconds)
```typescript
export const accountGroupService = {
  async list(params) {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    return await apiClient.get('/groups', { params: clean });
  },
  
  async create(payload) {
    return await apiClient.post('/groups', payload);
  },
  
  async update(id, payload) {
    return await apiClient.put(`/groups/${id}`, payload);
  }
};
```

**Benefits:** Easy to mock, add caching, implement offline

---

### Container Pattern (30 seconds)
```typescript
// Container (HomeScreen) - Smart
function HomeScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [filters]);
  
  const loadData = async () => {
    const response = await service.list(filters);
    setData(response.data);
  };
  
  return (
    <>
      <Stats statistics={stats} />
      <Filters filters={filters} setFilters={setFilters} />
      <List data={data} onToggle={handleToggle} />
    </>
  );
}

// Components - Dumb
function List({ data, onToggle }) {
  return data.map(item => <Item {...item} onToggle={onToggle} />);
}
```

**Benefits:** Components are reusable and testable

---

### Type-Safe Navigation (30 seconds)
```typescript
// Define types
export type AccountingStackParamList = {
  AccountGroupHome: undefined;
  AccountGroupEdit: { id: number; onUpdated?: (id: number) => void };
};

// Use in screen
type Props = NativeStackScreenProps<AccountingStackParamList, 'AccountGroupEdit'>;

function EditScreen({ route }: Props) {
  const { id, onUpdated } = route.params; // Fully typed!
}
```

**Benefits:** Catch navigation errors at compile time

---

## 💡 Common Questions & Answers

### Q: How do you structure large React Native apps?
**A:** "Feature-based modular architecture. Each business domain (accounting, inventory, CRM) is self-contained with screens, components, services, and types. This allows teams to scale horizontally and work independently."

### Q: How do you handle state management?
**A:** "Hybrid approach: Context API for global state like auth, local state for feature data. This balances simplicity with performance. For production, I'd consider React Query for server state."

### Q: How do you ensure type safety?
**A:** "Full TypeScript coverage with strict mode. Every API response, component prop, and navigation param is typed. This catches bugs at compile time and improves developer experience."

### Q: How do you optimize performance?
**A:** "Multiple strategies: targeted updates instead of full reloads, parameter cleaning, proper loading states, callback pattern to avoid global state, and FlatList for long lists. For production, I'd add React Query for caching and memoization for expensive computations."

### Q: How do you handle API calls?
**A:** "Centralized API client with interceptors for auth and multi-tenancy. Each feature has a service module that encapsulates API calls. This makes it easy to mock for testing and add caching layers."

### Q: How do you handle errors?
**A:** "Layered approach: global errors (401) at API client level, logging at service level, user-friendly feedback at screen level. Always use try-catch with proper loading states."

### Q: How would you implement offline support?
**A:** "I'd use WatermelonDB for local storage with a sync strategy: pull changes from server, apply to local DB, push local changes, handle conflicts. The service layer abstraction makes this easy to add without changing screens."

### Q: How do you test React Native apps?
**A:** "Unit tests with Jest for services and utilities, component tests with React Testing Library, E2E tests with Detox. I'd aim for 80%+ coverage focusing on critical paths."

### Q: How do you handle multi-tenancy?
**A:** "Request interceptor automatically prepends tenant slug to all API calls. Services are tenant-agnostic. Tenant context is stored in AsyncStorage and injected globally."

### Q: What's your approach to navigation?
**A:** "Nested navigation: bottom tabs for main modules, stack navigators for each module. All routes and params are typed. I use callbacks for screen-to-screen communication instead of global state."

---

## 🎨 Code Quality Highlights

**Show These:**
1. ✅ TypeScript strict mode
2. ✅ Consistent naming (camelCase, PascalCase)
3. ✅ Single responsibility principle
4. ✅ DRY (Don't Repeat Yourself)
5. ✅ Proper error handling
6. ✅ Loading states everywhere
7. ✅ Clean code (descriptive names, small functions)
8. ✅ Documentation (README in each feature)

---

## 📊 Metrics to Mention

- **10+ Feature Modules** across accounting, inventory, CRM, payroll
- **50+ Screens** with complete CRUD operations
- **100% TypeScript** coverage with strict mode
- **Feature-based architecture** for team scalability
- **Multi-tenancy** support at API client level
- **Type-safe navigation** with full parameter validation

---

## 🚀 Future Enhancements (Show Forward Thinking)

**Short Term:**
1. React Query for caching
2. FlatList optimization for long lists
3. Memoization for expensive computations
4. Image optimization with FastImage

**Medium Term:**
1. WatermelonDB for offline support
2. Sentry for error tracking
3. Code splitting and lazy loading
4. Comprehensive testing (Jest + Detox)

**Long Term:**
1. CI/CD pipeline (GitHub Actions)
2. Performance monitoring dashboard
3. A/B testing framework
4. Push notifications

---

## 🎯 Opening Statement (30 seconds)

> "I built Ballie, a comprehensive business management mobile app using React Native and TypeScript. It's an ERP-style application with modules for accounting, inventory, CRM, and payroll. I architected it with a feature-based modular structure for scalability, implemented a robust service layer for maintainability, and optimized performance with targeted updates and efficient state management. The app supports multi-tenancy, has full TypeScript coverage, and follows best practices for production-ready mobile applications."

---

## 🎯 Closing Statement (30 seconds)

> "I'm excited about this opportunity because I enjoy building scalable, maintainable mobile applications. The Ballie app demonstrates my ability to architect complex systems, optimize performance, and write clean, type-safe code. I'm always learning and staying current with React Native best practices. I'd love to bring this experience to your team and contribute to building great mobile experiences."

---

## ❓ Questions to Ask Interviewer

**Technical:**
1. "What's your current approach to state management in React Native?"
2. "How do you handle offline functionality and data sync?"
3. "What's your testing strategy for mobile apps?"
4. "How do you manage app performance as the codebase grows?"

**Process:**
1. "What does your mobile development workflow look like?"
2. "How do you handle code reviews and quality assurance?"
3. "What's your deployment and CI/CD process?"
4. "How do you prioritize technical debt vs new features?"

**Team:**
1. "What's the team structure for mobile development?"
2. "How do you approach knowledge sharing and documentation?"
3. "What opportunities are there for growth and learning?"

---

## 🎬 Demo Flow (5 minutes)

1. **Show folder structure** (30s)
   - "Feature-based architecture, everything self-contained"

2. **Open service file** (30s)
   - "All API calls encapsulated, easy to mock and test"

3. **Open HomeScreen** (1m)
   - "Container pattern: manages data and state"
   - "Targeted updates for performance"

4. **Open List component** (30s)
   - "Presentational: just receives props and displays UI"

5. **Show API client** (1m)
   - "Interceptors for auth and multi-tenancy"
   - "Global error handling"

6. **Show types file** (30s)
   - "Full TypeScript coverage for safety"

7. **Show navigation** (30s)
   - "Type-safe routing with parameter validation"

8. **Wrap up** (30s)
   - "Production-ready: auth, multi-tenancy, error handling"
   - "Scalable: team can grow horizontally"
   - "Maintainable: clear patterns and structure"

---

## 🔑 Key Takeaways

**Architecture:**
- Feature-based modular design
- Container/Presentational pattern
- Service layer abstraction
- Type-safe navigation

**Performance:**
- Targeted updates (90% fewer requests)
- Efficient state management
- Proper loading states
- Callback pattern

**Quality:**
- 100% TypeScript coverage
- Consistent patterns
- Comprehensive error handling
- Production-ready features

**Scalability:**
- Team can scale horizontally
- Easy to add new features
- Clear separation of concerns
- Well-documented

---

## 💪 Confidence Boosters

**You've Built:**
- ✅ Production-grade mobile app
- ✅ Complex feature modules (10+)
- ✅ Type-safe architecture
- ✅ Scalable patterns
- ✅ Performance optimizations

**You Can Discuss:**
- ✅ Architecture decisions and tradeoffs
- ✅ Performance optimization strategies
- ✅ Scalability and maintainability
- ✅ Testing approaches
- ✅ Future enhancements

**You're Ready For:**
- ✅ Technical deep dives
- ✅ Code reviews
- ✅ Architecture discussions
- ✅ Performance questions
- ✅ Senior-level conversations

---

## 🎯 Final Tips

1. **Be Confident**: You've built a production-grade app
2. **Be Honest**: If you don't know something, say so and explain how you'd learn
3. **Show Enthusiasm**: Talk about what you enjoyed building
4. **Ask Questions**: Show interest in their tech stack and challenges
5. **Be Yourself**: Let your passion for mobile development shine

---

**You've got this! 🚀**

Remember: You're not just showing code, you're demonstrating:
- Senior-level thinking
- Problem-solving skills
- Performance awareness
- Scalability mindset
- Production readiness

Good luck with your interview! 💪
