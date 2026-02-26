/**
 * useInvoiceForm
 *
 * TanStack Query hook for InvoiceCreateScreen.
 * - useQuery  → fetches form data (voucher_types, parties, products, ledger_accounts)
 * - useMutation → creates invoice, then invalidates list cache
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../state/queryKeys";
import { invoiceService } from "../services/invoiceService";
import type { FormData, CreateInvoicePayload, InvoiceDetails } from "../types";

export function useInvoiceForm(type: "sales" | "purchase") {
  const queryClient = useQueryClient();

  /* ───── form data (voucher types, parties, products, ledger accounts) ───── */
  const {
    data: formData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FormData>({
    queryKey: queryKeys.invoices.formData(type),
    queryFn: () => invoiceService.getFormData(type),
    staleTime: 5 * 60 * 1000, // 5 min — form options rarely change
  });

  /* ───── create invoice mutation ───── */
  const createMutation = useMutation<
    InvoiceDetails,
    Error,
    CreateInvoicePayload
  >({
    mutationFn: (payload) => invoiceService.create(payload),
    onSuccess: () => {
      // Invalidate list cache so the home screen is fresh
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.statistics(),
      });
    },
  });

  return {
    formData: formData ?? null,
    isLoading,
    isError,
    error,
    refetch,

    createInvoice: createMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
  };
}
