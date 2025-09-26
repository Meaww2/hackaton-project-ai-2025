export type ProductStatus = 'low' | 'ok';
export type SortDirection = 'asc' | 'desc';
export type ProductSortField = 'sku' | 'name' | 'unit' | 'reorderLevel' | 'stockOnHand';

export interface ProductDto {
  id: number;
  sku: string;
  name: string;
  unit: string | null;
  reorder_level: number;
  stock_on_hand: number;
  status: ProductStatus;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string | null;
  reorderLevel: number;
  stockOnHand: number;
  status: ProductStatus;
}

export interface ProductFilters {
  query?: string;
  lowStockOnly?: boolean;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  unit?: string | null;
  reorderLevel: number;
}

export interface UpdateProductPayload {
  name: string;
  unit?: string | null;
  reorderLevel: number;
}

export interface PaginationMetaDto {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
}

export interface ProductListDto {
  data: ProductDto[];
  pagination: PaginationMetaDto;
}

export interface ProductList {
  products: Product[];
  pagination: PaginationMeta;
}

export interface ProductQueryOptions {
  filters?: ProductFilters;
  page?: number;
  perPage?: number;
  sortField?: ProductSortField;
  sortDirection?: SortDirection;
}

export interface ReorderSuggestionDto {
  product: {
    id: number;
    sku: string;
    name: string;
    unit: string | null;
    stock_on_hand: number;
    reorder_level: number;
  };
  suggestion: {
    quantity: number;
  };
  basis: {
    window_days: number;
    weekly_out: number;
    reorder_level: number;
    stock_on_hand: number;
  };
}

export interface ReorderSuggestion {
  product: {
    id: number;
    sku: string;
    name: string;
    unit: string | null;
    stockOnHand: number;
    reorderLevel: number;
  };
  suggestion: {
    quantity: number;
  };
  basis: {
    windowDays: number;
    weeklyOut: number;
    reorderLevel: number;
    stockOnHand: number;
  };
}
