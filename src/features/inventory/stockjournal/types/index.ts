/**
 * Stock Journal Types
 * Mirrors API responses from STOCK_JOURNAL_API_REFERENCE.md
 */

export interface StockJournalItem {
  id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    sku: string;
    unit?: string;
  };
  movement_type: "in" | "out";
  quantity: number;
  rate: number;
  amount: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  remarks?: string | null;
  stock_before?: number;
  stock_after?: number;
}

export interface StockMovement {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    unit: string;
  };
  quantity: number;
  reference: string;
}

export interface StockJournalEntry {
  id: number;
  journal_number: string;
  journal_date: string;
  reference_number?: string | null;
  entry_type: "consumption" | "production" | "adjustment" | "transfer";
  entry_type_display: string;
  status: "draft" | "posted" | "cancelled";
  status_display: string;
  status_color: "yellow" | "green" | "red";
  narration?: string | null;
  total_items: number;
  total_amount: number;
  can_edit: boolean;
  can_post: boolean;
  can_cancel: boolean;
  can_delete?: boolean;
  items?: StockJournalItem[];
  stock_movements?: StockMovement[];
  created_at?: string;
  updated_at?: string;
}

export interface StockJournalStatistics {
  total_entries: number;
  draft_entries: number;
  posted_entries: number;
  this_month_entries: number;
}

export interface StockJournalPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface StockJournalListParams {
  search?: string;
  entry_type?: "consumption" | "production" | "adjustment" | "transfer" | "";
  status?: "draft" | "posted" | "cancelled" | "";
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface StockJournalListResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: StockJournalEntry[];
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  statistics?: StockJournalStatistics;
}

export interface EntryType {
  key: "consumption" | "production" | "adjustment" | "transfer";
  label: string;
  movement: string;
}

export interface ProductOption {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  purchase_rate: number;
  unit?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface StockJournalFormData {
  entry_type?: string;
  entry_types: EntryType[];
  products: ProductOption[];
}

export interface StockJournalCreateData {
  journal_date: string;
  entry_type: "consumption" | "production" | "adjustment" | "transfer";
  reference_number?: string;
  narration?: string;
  items: {
    product_id: number;
    movement_type: "in" | "out";
    quantity: number;
    rate: number;
    batch_number?: string;
    expiry_date?: string;
    remarks?: string;
  }[];
  action?: "save" | "save_and_post";
}

export interface ProductStockInfo {
  current_stock: number;
  unit: string;
  rate: number;
}

export interface StockCalculation {
  current_stock: number;
  new_stock: number;
  unit: string;
}
