import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { queryKeys } from "../../../state/queryKeys";
import { ledgerAccountService } from "../ledgeraccount/services/ledgerAccountService";
import { voucherService } from "../voucher/services/voucherService";
import { bankService } from "../bank/services/bankService";

const PAGE_1 = { page: 1, per_page: 1 } as const;

/**
 * Fetches the three accounting overview statistics in parallel.
 * TanStack Query handles caching (5-min stale), deduplication, and
 * background refetch — no manual useEffect / useState needed in the screen.
 *
 * Usage:
 *   const { overview, isLoading, isRefreshing, refresh } = useAccountingOverview();
 */
export function useAccountingOverview() {
  const queryClient = useQueryClient();

  const ledger = useApiQuery(
    queryKeys.ledgerAccounts.statistics(),
    () => ledgerAccountService.list(PAGE_1),
    { staleTime: 5 * 60 * 1000 },
  );

  const voucher = useApiQuery(
    queryKeys.vouchers.statistics(),
    () => voucherService.list(PAGE_1),
    { staleTime: 5 * 60 * 1000 },
  );

  const bank = useApiQuery(
    queryKeys.banks.statistics(),
    () => bankService.list(PAGE_1),
    { staleTime: 5 * 60 * 1000 },
  );

  const isLoading = ledger.isLoading || voucher.isLoading || bank.isLoading;
  const isRefreshing =
    ledger.isFetching || voucher.isFetching || bank.isFetching;

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.ledgerAccounts.statistics(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.vouchers.statistics(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.banks.statistics(),
    });
  };

  const overview = {
    totalAccounts: (ledger.data as any)?.statistics?.total_accounts ?? 0,
    pendingVouchers: (voucher.data as any)?.statistics?.draft_vouchers ?? 0,
    bankBalance: (bank.data as any)?.statistics?.total_balance ?? 0,
    needsReconciliation:
      (bank.data as any)?.statistics?.needs_reconciliation ?? 0,
  };

  return { overview, isLoading, isRefreshing, refresh };
}
