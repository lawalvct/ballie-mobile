// Purchase Order (LPO) Management Types

export type PurchaseOrderStatus =
  | "draft"
  | "sent"
  | "confirmed"
  | "received"
  | string;

export interface PurchaseOrderItem {
  id?: number;
  product_id: number | null;
  product_name?: string;
  quantity: number | null;
  unit_price: number | null;
  discount?: number | null;
  tax_rate?: number | null;
  total?: number | null;
}

export interface PurchaseOrderVendor {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface PurchaseOrderVendorSearchItem {
  id: number;
  name: string;
  email?: string | null;
}

export interface PurchaseOrderProductSearchItem {
  id: number;
  name: string;
  unit_price?: number | null;
  description?: string | null;
}

export interface PurchaseOrder {
  id: number;
  lpo_number?: string;
  lpo_date: string;
  expected_delivery_date?: string | null;
  vendor_id?: number;
  vendor_name?: string;
  vendor?: PurchaseOrderVendor;
  status: PurchaseOrderStatus;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  items?: PurchaseOrderItem[];
  notes?: string | null;
  terms_conditions?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderStatistics {
  total: number;
  sent: number;
  confirmed: number;
  total_value: number;
}

export interface PurchaseOrderPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface PurchaseOrderListParams {
  search?: string;
  status?: PurchaseOrderStatus | "";
  date_from?: string;
  date_to?: string;
  vendor_id?: number;
  per_page?: number;
  page?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  pagination: PurchaseOrderPagination;
  statistics?: PurchaseOrderStatistics | null;
}

export interface PurchaseOrderCreatePayload {
  vendor_id: number;
  lpo_date: string;
  expected_delivery_date?: string;
  notes?: string;
  terms_conditions?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax_rate?: number;
  }>;
  action?: "draft" | "send";
}

export interface PurchaseOrderEmailPayload {
  to: string;
  subject: string;
  message: string;
}
