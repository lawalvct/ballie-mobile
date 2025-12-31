// Product Management Types

export interface Product {
  id: number;
  type: "item" | "service";
  name: string;
  sku: string;
  description: string | null;
  category_id: number | null;
  category_name?: string;
  brand: string | null;
  hsn_code: string | null;
  barcode: string | null;
  purchase_rate: number;
  sales_rate: number;
  mrp: number | null;
  primary_unit_id: number;
  primary_unit_name?: string;
  secondary_unit_id: number | null;
  secondary_unit_name?: string | null;
  conversion_factor: number | null;
  opening_stock: number;
  current_stock?: number;
  reorder_level: number | null;
  maintain_stock: boolean;
  stock_asset_account_id: number | null;
  stock_asset_account_name?: string | null;
  sales_account_id: number | null;
  sales_account_name?: string | null;
  purchase_account_id: number | null;
  purchase_account_name?: string | null;
  tax_rate: number;
  is_active: boolean;
  is_visible_online: boolean;
  is_featured: boolean;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface ProductUnit {
  id: number;
  name: string;
  symbol: string;
  is_base_unit: boolean;
}

export interface LedgerAccount {
  id: number;
  name: string;
  code: string;
  display_name: string;
  account_type: string;
}

export interface FormData {
  categories: ProductCategory[];
  units: ProductUnit[];
  ledger_accounts: LedgerAccount[];
  defaults: {
    type: "item" | "service";
    maintain_stock: boolean;
    is_active: boolean;
    tax_rate: number;
    default_purchase_account_id?: number;
    default_sales_account_id?: number;
    default_inventory_account_id?: number;
  };
}

export interface CreateProductData {
  type: "item" | "service";
  name: string;
  sku?: string;
  description?: string;
  category_id?: number;
  brand?: string;
  hsn_code?: string;
  barcode?: string;
  purchase_rate: number;
  sales_rate: number;
  mrp?: number;
  primary_unit_id: number;
  secondary_unit_id?: number;
  conversion_factor?: number;
  opening_stock?: number;
  reorder_level?: number;
  maintain_stock: boolean;
  stock_asset_account_id?: number;
  sales_account_id?: number;
  purchase_account_id?: number;
  tax_rate?: number;
  is_active?: boolean;
  is_visible_online?: boolean;
  is_featured?: boolean;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  type?: "item" | "service";
  status?: "active" | "inactive";
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  as_of_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: PaginationInfo;
    statistics: {
      total_products: number;
      active_products: number;
      inactive_products: number;
      low_stock_count: number;
      out_of_stock_count: number;
      total_stock_value: number;
    };
  };
  message: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  transaction_date: string;
  transaction_type: string;
  quantity: number;
  rate: number;
  amount: number;
  running_balance: number;
  reference_number: string | null;
  remarks: string | null;
}

export interface BulkActionData {
  action: "activate" | "deactivate" | "delete";
  product_ids: number[];
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  data: {
    success_count: number;
    failed_count: number;
    errors: string[];
  };
}
