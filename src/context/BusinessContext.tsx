import React, { createContext, useContext, useMemo } from "react";
import type {
  BusinessCategory,
  EnabledModules,
  DashboardData,
} from "../features/dashboard/types";

export interface BusinessContextValue {
  category: BusinessCategory;
  terminology: Record<string, string | null>;
  modules: EnabledModules;
  /** Returns null when the key should be hidden */
  getLabel: (key: string, fallback: string) => string | null;
  /** True when the terminology key is null (section should be hidden) */
  isHidden: (key: string) => boolean;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

const DEFAULT_MODULES: EnabledModules = {
  inventory: true,
  crm: true,
  pos: true,
  payroll: true,
  banking: true,
  ecommerce: true,
  projects: true,
  procurement: true,
};

export function BusinessProvider({
  dashboard,
  children,
}: {
  dashboard: DashboardData | null;
  children: React.ReactNode;
}) {
  const value = useMemo<BusinessContextValue>(() => {
    const terminology = dashboard?.terminology ?? {};
    return {
      category: dashboard?.business_category ?? "trading",
      terminology,
      modules: dashboard?.enabled_modules ?? DEFAULT_MODULES,
      getLabel: (key, fallback) => {
        const term = terminology[key];
        if (term === null || term === undefined) return null;
        return term || fallback;
      },
      isHidden: (key) =>
        terminology[key] === null || terminology[key] === undefined,
    };
  }, [dashboard]);

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}
