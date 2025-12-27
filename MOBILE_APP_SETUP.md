# Ballie Mobile App - React Native Setup Guide

> **🔷 TypeScript Recommended**: This guide uses TypeScript for better type safety, IDE support, and maintainability. TypeScript is industry standard for React Native in 2025.

## 🎨 Design System & Branding

### Brand Colors

Your app must follow the **Ballie brand color palette** for consistency:

```typescript
// theme/colors.ts
export const BRAND_COLORS = {
    gold: "#d1b05e", // Primary accent, CTAs, highlights
    blue: "#2b6399", // Primary actions, links
    darkPurple: "#3c2c64", // Headers, primary backgrounds
    teal: "#69a2a4", // Success states, positive metrics
    purple: "#85729d", // Secondary accents
    lightBlue: "#7b87b8", // Info states, secondary elements
    deepPurple: "#4a3570", // Dark mode, footers
    lavender: "#a48cb4", // Tertiary accents
    violet: "#614c80", // Borders, dividers
    green: "#249484", // Success, profit indicators
};

// Semantic colors for accounting app
export const SEMANTIC_COLORS = {
    profit: BRAND_COLORS.green,
    loss: "#ef4444",
    pending: BRAND_COLORS.gold,
    approved: BRAND_COLORS.teal,
    rejected: "#dc2626",
};
```

### Design Principles for Accounting App

#### ✅ **Must Have:**

-   **Clean, Professional UI** - Accounting requires trust and clarity
-   **Data Visualization** - Charts, graphs for financial insights
-   **Clear Typography** - Numbers must be easily readable (use tabular numbers)
-   **Gradient Backgrounds** - Match web app aesthetic
-   **Consistent Spacing** - Follow 8px grid system
-   **Card-Based Layouts** - Group related financial data
-   **Clear Visual Hierarchy** - Important numbers stand out

#### ✅ **Modern UI Features:**

-   Bottom sheet modals for quick actions
-   Swipeable cards for transactions
-   Pull-to-refresh on all lists
-   Skeleton loaders (no spinners)
-   Haptic feedback on actions
-   Smooth animations (React Native Reanimated)
-   Gesture-based navigation
-   Dark mode support
-   Biometric authentication

#### ✅ **Accounting-Specific UI:**

-   **Dashboard Cards** - Revenue, expenses, profit at glance
-   **Transaction Lists** - Swipe to categorize/edit
-   **Receipt Scanner** - Camera integration for expense capture
-   **Invoice Preview** - PDF generation and sharing
-   **Quick Entry FAB** - Floating action button for fast transactions
-   **Category Colors** - Visual coding for expense categories
-   **Balance Indicators** - Green/red for positive/negative
-   **Period Filters** - Easy date range selection

---

## 📁 Recommended Project Structure

```
ballie-mobile/
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── client.ts          # Axios instance with auth
│   │   ├── types.ts           # API response types
│   │   ├── endpoints/
│   │   │   ├── auth.ts        # Login, register, profile
│   │   │   ├── dashboard.ts   # Stats, metrics
│   │   │   ├── invoices.ts
│   │   │   ├── expenses.ts
│   │   │   └── support.ts
│   │   └── interceptors.ts    # Token refresh logic
│   │
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── GradientBackground.tsx
│   │   │   └── LoadingState.tsx
│   │   ├── charts/            # Financial charts
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── BarChart.tsx
│   │   ├── lists/             # Transaction lists
│   │   │   ├── TransactionItem.tsx
│   │   │   └── InvoiceItem.tsx
│   │   └── forms/             # Form components
│   │       ├── MoneyInput.tsx
│   │       ├── DatePicker.tsx
│   │       └── CategoryPicker.tsx
│   │
│   ├── screens/
│   │   ├── auth/              # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── WorkspaceSelectorScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── dashboard/         # Main dashboard
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── components/
│   │   ├── invoices/          # Invoice management
│   │   ├── expenses/          # Expense tracking
│   │   ├── support/           # Support tickets
│   │   └── profile/           # User profile
│   │
│   ├── navigation/
│   │   ├── types.ts           # Navigation types
│   │   ├── AppNavigator.tsx   # Main navigation
│   │   ├── AuthNavigator.tsx  # Auth flow
│   │   └── TabNavigator.tsx   # Bottom tabs
│   │
│   ├── theme/
│   │   ├── colors.ts          # Brand colors (see above)
│   │   ├── typography.ts      # Font styles
│   │   ├── spacing.ts         # Spacing system
│   │   └── shadows.ts         # Shadow styles
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useCurrency.ts
│   │
│   ├── store/                 # State management (Zustand/Redux)
│   │   ├── authStore.ts
│   │   ├── tenantStore.ts
│   │   └── cacheStore.ts
│   │
│   ├── types/                 # Global TypeScript types
│   │   ├── models.ts          # Data models
│   │   ├── api.ts             # API types
│   │   └── navigation.ts      # Navigation types
│   │
│   ├── utils/
│   │   ├── formatters.ts      # Currency, date formatting
│   │   ├── validators.ts      # Form validation
│   │   └── constants.ts
│   │
│   └── App.tsx
│
├── types/                     # Type declarations
│   └── declarations.d.ts
│
├── assets/
│   ├── images/
│   │   └── ballie_logo.png
│   ├── fonts/
│   └── icons/
│
├── app.json
├── package.json
├── babel.config.js
└── README.md
```

---

## 🚀 Quick Start Commands

```bash
# Create new Expo app with TypeScript
npx create-expo-app ballie-mobile --template blank-typescript

cd ballie-mobile

# Install essential dependencies
npx expo install react-native-safe-area-context
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs
npx expo install axios
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler

# Install UI libraries
npm install react-native-paper
npm install react-native-svg
npm install react-native-chart-kit

# Install state management
npm install zustand

# Install utilities
npm install date-fns
npm install react-hook-form
npm install zod
```

---

## 🔐 API Integration Example

### API Client Setup (`src/api/client.ts`)

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse, ApiError } from "./types";

const API_BASE_URL = __DEV__
    ? "http://10.0.2.2:8000/api/v1" // Android emulator
    : "https://api.ballie.co/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem("auth_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            // Token expired - logout user
            await AsyncStorage.multiRemove([
                "auth_token",
                "user_data",
                "tenant_slug",
            ]);
            // Navigate to login (implement with navigation ref)
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default apiClient;
```

### API Types (`src/api/types.ts`)

```typescript
// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

// User types
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    is_active: boolean;
    email_verified: boolean;
    onboarding_completed: boolean;
    tour_completed: boolean;
    last_login_at: string | null;
    created_at: string;
}

// Tenant types
export interface Tenant {
    id: number;
    slug: string;
    name: string;
}

// Auth responses
export interface LoginResponse {
    user: User;
    token: string;
    tenant: Tenant;
    token_type: string;
    multiple_tenants?: boolean;
    tenants?: Array<{
        tenant_id: number;
        tenant_slug: string;
        tenant_name: string;
        user_role: string;
    }>;
}

export interface CheckEmailResponse {
    email: string;
    multiple_tenants: boolean;
    tenants: Array<{
        tenant_id: number;
        tenant_slug: string;
        tenant_name: string;
        user_role: string;
    }>;
}
```

### Auth Endpoints (`src/api/endpoints/auth.ts`)

```typescript
import apiClient from "../client";
import { ApiResponse, LoginResponse, CheckEmailResponse, User } from "../types";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    device_name?: string;
}

export const authAPI = {
    // Login with email (auto-detect tenant)
    login: async (
        email: string,
        password: string,
        deviceName: string = "Mobile App"
    ): Promise<ApiResponse<LoginResponse>> => {
        return apiClient.post("/auth/login", {
            email,
            password,
            device_name: deviceName,
        });
    },

    // Select tenant if user belongs to multiple
    selectTenant: async (
        email: string,
        password: string,
        tenantId: number,
        deviceName: string = "Mobile App"
    ): Promise<ApiResponse<LoginResponse>> => {
        return apiClient.post("/auth/select-tenant", {
            email,
            password,
            tenant_id: tenantId,
            device_name: deviceName,
        });
    },

    // Check which workspaces an email belongs to
    checkEmail: async (
        email: string
    ): Promise<ApiResponse<CheckEmailResponse>> => {
        return apiClient.post("/auth/check-email", { email });
    },

    // Register new user
    register: async (
        tenantSlug: string,
        userData: RegisterData
    ): Promise<ApiResponse<LoginResponse>> => {
        return apiClient.post("/auth/register", {
            tenant_slug: tenantSlug,
            ...userData,
        });
    },

    // Get user profile
    getProfile: async (tenantSlug: string): Promise<ApiResponse<User>> => {
        return apiClient.get(`/tenant/${tenantSlug}/profile`);
    },

    // Logout
    logout: async (tenantSlug: string): Promise<ApiResponse<null>> => {
        return apiClient.post(`/tenant/${tenantSlug}/auth/logout`);
    },
};
```

---

## 🎨 Example Component with Brand Colors

### Gradient Button (`src/components/common/Button.tsx`)

```typescript
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "success";

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    loading = false,
    disabled = false,
}) => {
    const gradients = {
        primary: [BRAND_COLORS.blue, BRAND_COLORS.deepPurple],
        secondary: [BRAND_COLORS.gold, BRAND_COLORS.violet],
        success: [BRAND_COLORS.green, BRAND_COLORS.teal],
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={gradients[variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
            >
                <Text style={styles.text}>
                    {loading ? "Loading..." : title}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: BRAND_COLORS.darkPurple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});
```

---

## 📱 Example Login Screen

```typescript
import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { authAPI } from "../api/endpoints/auth";
import { GradientButton } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { BRAND_COLORS } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthStackParamList } from "../navigation/types";

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await authAPI.login(email, password);

            // Check if multiple tenants
            if (response.data.multiple_tenants) {
                navigation.navigate("WorkspaceSelector", {
                    email,
                    password,
                    tenants: response.data.tenants || [],
                });
            } else {
                // Single tenant - save and proceed
                await AsyncStorage.multiSet([
                    ["auth_token", response.data.token],
                    ["user_data", JSON.stringify(response.data.user)],
                    ["tenant_slug", response.data.tenant.slug],
                    ["tenant_id", String(response.data.tenant.id)],
                ]);
                // Navigate to main app (type-safe)
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Login failed";
            Alert.alert("Login Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[BRAND_COLORS.darkPurple, BRAND_COLORS.deepPurple]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome to Ballie</Text>
                    <Text style={styles.subtitle}>Accounting made simple</Text>

                    <View style={styles.form}>
                        <Input
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <GradientButton
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            variant="secondary"
                        />
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: "center" },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: BRAND_COLORS.gold,
        textAlign: "center",
        marginBottom: 48,
    },
    form: { gap: 16 },
});
```

---

---

## 📐 Navigation Types (`src/navigation/types.ts`)

```typescript
import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    Register: { tenantSlug?: string };
    WorkspaceSelector: {
        email: string;
        password: string;
        tenants: Array<{
            tenant_id: number;
            tenant_slug: string;
            tenant_name: string;
            user_role: string;
        }>;
    };
    ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
    Dashboard: undefined;
    Invoices: undefined;
    Expenses: undefined;
    Support: undefined;
    Profile: undefined;
};

// Root Stack
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen Props helper
export type AuthScreenProps<T extends keyof AuthStackParamList> =
    NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
    NativeStackScreenProps<MainTabParamList, T>;
```

---

## 🎯 Next Steps

1. **Create the repo:**

    ```bash
    cd ..
    npx create-expo-app ballie-mobile --template blank-typescript
    cd ballie-mobile
    git init
    git remote add origin https://github.com/yourusername/ballie-mobile.git
    ```

2. **Copy this structure** into your new repo's README.md

3. **Install dependencies** as listed above

4. **Create theme files** with your brand colors

5. **Build authentication flow** first (login → workspace selector → dashboard)

6. **Test API integration** with Postman collection

7. **Implement dashboard** with financial widgets

8. **Add biometric auth** for security

---

## 🎨 UI/UX Best Practices for Accounting App

### Typography

-   **Headers**: Bold, clear hierarchy
-   **Numbers**: Use monospace/tabular fonts
-   **Labels**: Medium weight, good contrast

### Data Display

-   **Currency**: Always format with currency symbol
-   **Dates**: Use relative dates ("Today", "Yesterday")
-   **Large Numbers**: Use abbreviations (1.2K, 3.5M)
-   **Decimals**: Consistent precision (2 decimal places)

### Colors for Financial Data

-   **Positive (Profit)**: Green (#249484)
-   **Negative (Loss)**: Red (#ef4444)
-   **Neutral**: Gray
-   **Pending**: Gold (#d1b05e)

### Animations

-   **Keep under 300ms** for UI transitions
-   **Use spring animations** for natural feel
-   **Skeleton loaders** while fetching data
-   **Haptic feedback** on important actions

---

## 📚 Recommended Libraries

### Must-Have:

-   **Navigation**: @react-navigation/native
-   **State**: Zustand (lightweight) or Redux Toolkit
-   **Forms**: react-hook-form + zod
-   **Charts**: react-native-chart-kit or Victory Native
-   **Date**: date-fns
-   **Storage**: @react-native-async-storage/async-storage
-   **Secure Storage**: expo-secure-store
-   **Animations**: react-native-reanimated

### Nice-to-Have:

-   **Bottom Sheet**: @gorhom/bottom-sheet
-   **Gestures**: react-native-gesture-handler
-   **Camera**: expo-camera (receipt scanning)
-   **PDF**: react-native-pdf or expo-print
-   **Biometrics**: expo-local-authentication
-   **Push Notifications**: expo-notifications

---

## 🔐 Security Checklist

-   [ ] Token stored in SecureStore (not AsyncStorage)
-   [ ] Biometric authentication implemented
-   [ ] API calls use HTTPS only
-   [ ] Sensitive data never logged
-   [ ] Auto-logout after inactivity
-   [ ] PIN/Pattern lock option
-   [ ] SSL pinning (production)

---

## 🚀 Ready to Start?

Your API is ready at:

-   **Base URL**: `http://localhost:8000/api/v1`
-   **Auth Endpoint**: `/auth/login` (no tenant slug needed!)
-   **Postman Collection**: `Ballie_Mobile_API_v1_Global_Auth.postman_collection.json`

**Brand colors are defined** ✅
**Modern UI principles outlined** ✅
**Accounting-specific features listed** ✅
**Project structure recommended** ✅

Now create that new repo and start building! 🎉
