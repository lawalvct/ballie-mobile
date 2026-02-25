import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FiscalPeriod {
  startDate: string; // ISO "2026-01-01"
  endDate: string; // ISO "2026-12-31"
  label: string; // "FY 2026"
}

export interface ActiveFilters {
  dateFrom?: string;
  dateTo?: string;
  branchId?: number;
  warehouseId?: number;
}

interface AppState {
  // ── Company / Branch context ──────────────────────────────────────────────
  selectedBranchId: number | null;
  setSelectedBranch: (branchId: number | null) => void;

  // ── Fiscal period ─────────────────────────────────────────────────────────
  fiscalPeriod: FiscalPeriod | null;
  setFiscalPeriod: (period: FiscalPeriod) => void;

  // ── Cross-module filters ──────────────────────────────────────────────────
  globalFilters: ActiveFilters;
  setGlobalFilters: (filters: Partial<ActiveFilters>) => void;
  resetGlobalFilters: () => void;

  // ── UI state ──────────────────────────────────────────────────────────────
  activeModule: string | null; // "accounting" | "inventory" | …
  setActiveModule: (module: string | null) => void;

  // ── Draft / Cart state (e.g. POS, multi-step forms) ───────────────────────
  draftItems: Record<string, any[]>;
  setDraftItems: (key: string, items: any[]) => void;
  clearDraft: (key: string) => void;
  clearAllDrafts: () => void;
}

// ─── Default values ──────────────────────────────────────────────────────────

const DEFAULT_FILTERS: ActiveFilters = {};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Branch
  selectedBranchId: null,
  setSelectedBranch: (branchId) => set({ selectedBranchId: branchId }),

  // Fiscal period
  fiscalPeriod: null,
  setFiscalPeriod: (period) => set({ fiscalPeriod: period }),

  // Global filters
  globalFilters: DEFAULT_FILTERS,
  setGlobalFilters: (filters) =>
    set((state) => ({
      globalFilters: { ...state.globalFilters, ...filters },
    })),
  resetGlobalFilters: () => set({ globalFilters: DEFAULT_FILTERS }),

  // Active module
  activeModule: null,
  setActiveModule: (module) => set({ activeModule: module }),

  // Drafts (POS cart, multi-step wizard data, etc.)
  draftItems: {},
  setDraftItems: (key, items) =>
    set((state) => ({
      draftItems: { ...state.draftItems, [key]: items },
    })),
  clearDraft: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.draftItems;
      return { draftItems: rest };
    }),
  clearAllDrafts: () => set({ draftItems: {} }),
}));
