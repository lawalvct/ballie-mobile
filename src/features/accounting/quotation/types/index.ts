// Quotation Management Types

export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export interface QuotationItem {
  id?: number;
  product_id: number | null;
  product_name?: string;
  description?: string;
  quantity: number | null;
  rate: number | null;
  discount?: number | null;
  tax?: number | null;
  amount?: number | null;
}

export interface QuotationCustomerSearchItem {
  id: number;
  name: string;
  ledger_account_id: number;
  email?: string | null;
}

export interface QuotationProductSearchItem {
  id: number;
  name: string;
  sales_rate?: number | null;
  rate?: number | null;
  description?: string | null;
}

export interface Quotation {
  id: number;
  quotation_number?: string;
  quotation_date: string;
  expiry_date?: string | null;
  subject?: string | null;
  reference_number?: string | null;
  status: QuotationStatus;
  customer_name?: string;
  customer_ledger_id?: number;
  customer?: {
    id: number;
    name: string;
  };
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
  items?: QuotationItem[];
  notes?: string | null;
  terms_and_conditions?: string | null;
  can_edit?: boolean;
  can_delete?: boolean;
  can_send?: boolean;
  can_accept?: boolean;
  can_reject?: boolean;
  can_convert?: boolean;
}

export interface QuotationStatistics {
  total: number;
  pending: number;
  accepted: number;
  total_value: number;
}

export interface QuotationPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface QuotationListParams {
  search?: string;
  status?: QuotationStatus | "";
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  per_page?: number;
  page?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface QuotationListResponse {
  data: Quotation[];
  pagination: QuotationPagination;
  statistics?: QuotationStatistics | null;
}

export interface QuotationCreatePayload {
  quotation_date: string;
  expiry_date?: string;
  customer_ledger_id: number;
  subject?: string;
  reference_number?: string;
  terms_and_conditions?: string;
  notes?: string;
  items: Array<{
    product_id: number;
    description?: string;
    quantity: number;
    rate: number;
    discount?: number;
    tax?: number;
  }>;
  action?: "save" | "save_and_send";
}
