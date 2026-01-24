// Unit Management Types

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  display_name?: string;
  is_base_unit: boolean;
  conversion_factor?: number;
  is_active: boolean;
  status?: string;
  type?: string;
  products_count?: number;
  derived_units_count?: number;
  can_delete?: boolean;
  base_unit_id?: number | null;
  description?: string | null;
}

export interface UnitStatistics {
  total_units: number;
  active_units: number;
  base_units: number;
  derived_units: number;
}

export interface UnitPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface UnitListParams {
  search?: string;
  type?: "base" | "derived" | "";
  status?: "active" | "inactive" | "";
  sort?: "name" | "symbol" | "is_base_unit" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface UnitListResponse {
  units: Unit[];
  pagination: UnitPagination | null;
  statistics: UnitStatistics | null;
}
