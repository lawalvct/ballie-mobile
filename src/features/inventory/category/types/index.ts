// Category Management Types

export interface CategoryParentOption {
  id: number;
  name: string;
  slug?: string;
  level?: number;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  parent_id?: number | null;
  parent?: CategoryParentOption | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active: boolean;
  status?: string;
  products_count?: number;
  children_count?: number;
  full_path?: string;
  depth?: number;
  can_delete?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface CategoryStatistics {
  total_categories: number;
  active_categories: number;
  root_categories: number;
  with_products: number;
}

export interface CategoryPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface CategoryListParams {
  search?: string;
  status?: "active" | "inactive" | "";
  parent?: "root" | number | "";
  sort?: "sort_order" | "name" | "products_count" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: CategoryPagination | null;
  statistics: CategoryStatistics | null;
}
