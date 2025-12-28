import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Tenant } from "../api/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  needsOnboarding: boolean;
  setNeedsOnboarding: (needs: boolean) => void;
  login: (token: string, user: User, tenant: Tenant) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [storedToken, storedUser, storedTenant] =
        await AsyncStorage.multiGet(["auth_token", "user_data", "tenant_slug"]);

      const tokenValue = storedToken[1];
      const userData = storedUser[1] ? JSON.parse(storedUser[1]) : null;
      const tenantSlug = storedTenant[1];

      if (tokenValue && userData && tenantSlug) {
        setToken(tokenValue);
        setUser(userData);
        setTenant({
          id: userData.tenant_id || 0,
          slug: tenantSlug,
          name: userData.tenant_name || "",
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, user: User, tenant: Tenant) => {
    try {
      await AsyncStorage.multiSet([
        ["auth_token", token],
        ["user_data", JSON.stringify(user)],
        ["tenant_slug", tenant.slug],
        ["tenant_id", String(tenant.id)],
      ]);

      setToken(token);
      setUser(user);
      setTenant(tenant);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "auth_token",
        "user_data",
        "tenant_slug",
        "tenant_id",
      ]);

      setToken(null);
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        tenant,
        token,
        needsOnboarding,
        setNeedsOnboarding,
        login,
        logout,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
