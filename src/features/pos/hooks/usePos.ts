// ── POS React Query Hooks ────────────────────────────────────────────────────
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { posService } from "../services/posService";
import type {
  SessionCheckResponse,
  CashRegister,
  CashRegisterSession,
  OpenSessionPayload,
  CloseSessionPayload,
  CloseSessionResponse,
  PosInitData,
  PosProduct,
  PosCategory,
  PosCustomer,
  PaymentMethod,
  CreateSalePayload,
  CreateSaleResponse,
  TransactionListItem,
  TransactionDetail,
  TransactionListFilters,
  ReceiptData,
  DailySalesReport,
  DailyReportFilters,
  TopProduct,
  TopProductsFilters,
  Pagination,
} from "../types";

// ── Session ──────────────────────────────────────────────────────────────────

export function usePosSession() {
  const queryClient = useQueryClient();
  const query = useApiQuery<SessionCheckResponse>(
    queryKeys.pos.session(),
    () => posService.checkSession(),
    { staleTime: 30_000 },
  );

  return {
    hasActiveSession: query.data?.has_active_session ?? false,
    session: query.data?.session ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.session() }),
  };
}

export function usePosRegisters() {
  const query = useApiQuery<{ success: boolean; data: CashRegister[] }>(
    queryKeys.pos.registers(),
    () => posService.listRegisters(),
  );

  return {
    registers: (query.data as any)?.data as CashRegister[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useOpenSession() {
  return useApiMutation<
    { success: boolean; message: string; session: CashRegisterSession },
    OpenSessionPayload
  >((payload) => posService.openSession(payload), {
    invalidateKeys: [queryKeys.pos.session(), queryKeys.pos.registers()],
    successMessage: "Session opened successfully",
  });
}

export function useCloseSession() {
  return useApiMutation<CloseSessionResponse, CloseSessionPayload>(
    (payload) => posService.closeSession(payload),
    {
      invalidateKeys: [queryKeys.pos.session(), queryKeys.pos.registers()],
      successMessage: "Session closed successfully",
    },
  );
}

// ── Init Data ────────────────────────────────────────────────────────────────

export function usePosInitData(enabled = true) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: PosInitData }>(
    queryKeys.pos.initData(),
    () => posService.getInitData(),
    { staleTime: 60_000, enabled },
  );

  const data = (query.data as any)?.data as PosInitData | undefined;

  return {
    data,
    products: data?.products ?? [],
    categories: data?.categories ?? [],
    customers: data?.customers ?? [],
    paymentMethods: data?.payment_methods ?? [],
    recentSales: data?.recent_sales ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.initData() }),
  };
}

// ── Products ─────────────────────────────────────────────────────────────────

export function usePosProducts(
  params: { search?: string; category_id?: number; in_stock?: boolean; page?: number; per_page?: number } = {},
) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: PosProduct[]; meta: Pagination }>(
    queryKeys.pos.products(params),
    () => posService.getProducts(params),
    { staleTime: 30_000 },
  );

  return {
    products: (query.data as any)?.data as PosProduct[] | undefined,
    meta: (query.data as any)?.meta as Pagination | undefined,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.products(params) }),
  };
}

// ── Categories ───────────────────────────────────────────────────────────────

export function usePosCategories() {
  const query = useApiQuery<{ success: boolean; data: PosCategory[] }>(
    queryKeys.pos.categories(),
    () => posService.getCategories(),
    { staleTime: 120_000 },
  );

  return {
    categories: (query.data as any)?.data as PosCategory[] | undefined,
    isLoading: query.isLoading,
  };
}

// ── Customers ────────────────────────────────────────────────────────────────

export function usePosCustomers(search?: string) {
  const query = useApiQuery<{ success: boolean; data: PosCustomer[] }>(
    queryKeys.pos.customers({ search }),
    () => posService.getCustomers({ search }),
    { staleTime: 60_000 },
  );

  return {
    customers: (query.data as any)?.data as PosCustomer[] | undefined,
    isLoading: query.isLoading,
  };
}

// ── Payment Methods ──────────────────────────────────────────────────────────

export function usePosPaymentMethods() {
  const query = useApiQuery<{ success: boolean; data: PaymentMethod[] }>(
    queryKeys.pos.paymentMethods(),
    () => posService.getPaymentMethods(),
    { staleTime: 120_000 },
  );

  return {
    paymentMethods: (query.data as any)?.data as PaymentMethod[] | undefined,
    isLoading: query.isLoading,
  };
}

// ── Sales ────────────────────────────────────────────────────────────────────

export function useCreateSale() {
  return useApiMutation<CreateSaleResponse, CreateSalePayload>(
    (payload) => posService.createSale(payload),
    {
      invalidateKeys: [
        queryKeys.pos.transactions.all(),
        queryKeys.pos.initData(),
        queryKeys.pos.session(),
        queryKeys.pos.reports.all(),
      ],
      successMessage: "Sale completed!",
    },
  );
}

// ── Transactions ─────────────────────────────────────────────────────────────

export function usePosTransactions(filters: TransactionListFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: TransactionListItem[]; meta: Pagination }>(
    queryKeys.pos.transactions.list(filters),
    () => posService.listTransactions(filters),
    { staleTime: 30_000 },
  );

  return {
    transactions: (query.data as any)?.data as TransactionListItem[] | undefined,
    meta: (query.data as any)?.meta as Pagination | undefined,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.pos.transactions.list(filters),
      }),
  };
}

export function usePosTransactionDetail(id: number) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: TransactionDetail }>(
    queryKeys.pos.transactions.detail(id),
    () => posService.getTransaction(id),
    { staleTime: 30_000, enabled: id > 0 },
  );

  return {
    transaction: (query.data as any)?.data as TransactionDetail | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.pos.transactions.detail(id),
      }),
  };
}

export function useVoidSale() {
  return useApiMutation<{ success: boolean; message: string }, number>(
    (id) => posService.voidSale(id),
    {
      invalidateKeys: [queryKeys.pos.transactions.all(), queryKeys.pos.session()],
      successMessage: "Sale voided successfully",
    },
  );
}

export function useRefundSale() {
  return useApiMutation<{ success: boolean; message: string }, number>(
    (id) => posService.refundSale(id),
    {
      invalidateKeys: [queryKeys.pos.transactions.all(), queryKeys.pos.session()],
      successMessage: "Sale refunded successfully",
    },
  );
}

// ── Receipts ─────────────────────────────────────────────────────────────────

export function usePosReceipt(saleId: number) {
  const query = useApiQuery<{ success: boolean; data: ReceiptData }>(
    queryKeys.pos.transactions.receipt(saleId),
    () => posService.getReceipt(saleId),
    { staleTime: 300_000, enabled: saleId > 0 },
  );

  return {
    receipt: (query.data as any)?.data as ReceiptData | undefined,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useEmailReceipt() {
  return useApiMutation<{ success: boolean; message: string }, number>(
    (saleId) => posService.emailReceipt(saleId),
    { successMessage: "Receipt emailed" },
  );
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function usePosDailySales(filters: DailyReportFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: DailySalesReport }>(
    queryKeys.pos.reports.daily(filters),
    () => posService.getDailySales(filters),
    { staleTime: 60_000 },
  );

  return {
    report: (query.data as any)?.data as DailySalesReport | undefined,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.pos.reports.daily(filters),
      }),
  };
}

export function usePosTopProducts(filters: TopProductsFilters = {}) {
  const queryClient = useQueryClient();
  const query = useApiQuery<{ success: boolean; data: TopProduct[] }>(
    queryKeys.pos.reports.topProducts(filters),
    () => posService.getTopProducts(filters),
    { staleTime: 60_000 },
  );

  return {
    products: (query.data as any)?.data as TopProduct[] | undefined,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.pos.reports.topProducts(filters),
      }),
  };
}
