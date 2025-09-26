import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateProductPayload,
  PaginationMeta,
  PaginationMetaDto,
  Product,
  ProductDto,
  ProductFilters,
  ProductList,
  ProductListDto,
  ProductQueryOptions,
  ProductSortField,
  ReorderSuggestion,
  ReorderSuggestionDto,
  UpdateProductPayload
} from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = '/api/v1/products';
  private readonly sortFieldMap: Record<ProductSortField, string> = {
    sku: 'sku',
    name: 'name',
    unit: 'unit',
    reorderLevel: 'reorder_level',
    stockOnHand: 'stock_on_hand'
  };

  constructor(private readonly http: HttpClient) {}

  getProducts(options: ProductQueryOptions = {}): Observable<ProductList> {
    let params = new HttpParams();

    const filters = options.filters ?? {};

    if (filters.query) {
      params = params.set('query', filters.query.trim());
    }

    if (filters.lowStockOnly) {
      params = params.set('low_stock', 'true');
    }

    if (options.sortField && this.sortFieldMap[options.sortField]) {
      params = params.set('sort_column', this.sortFieldMap[options.sortField]);
    }

    if (options.sortDirection) {
      params = params.set('sort_direction', options.sortDirection);
    }

    if (options.page) {
      params = params.set('page', options.page.toString());
    }

    if (options.perPage) {
      params = params.set('per_page', options.perPage.toString());
    }

    return this.http.get<ProductListDto>(this.baseUrl, { params, withCredentials: true }).pipe(
      map((response) => ({
        products: response.data.map((product) => this.mapProduct(product)),
        pagination: this.mapPagination(response.pagination)
      }))
    );
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    const body = {
      product: this.serializePayload(payload)
    };

    return this.http
      .post<ProductDto>(this.baseUrl, body, { withCredentials: true })
      .pipe(map((product) => this.mapProduct(product)));
  }

  updateProduct(id: number, payload: UpdateProductPayload): Observable<Product> {
    const body = {
      product: this.serializePayload(payload)
    };

    return this.http
      .put<ProductDto>(`${this.baseUrl}/${id}`, body, { withCredentials: true })
      .pipe(map((product) => this.mapProduct(product)));
  }

  getReorderSuggestion(product: { id?: number; sku?: string }): Observable<ReorderSuggestion> {
    const body = {
      product: {
        id: product.id,
        sku: product.sku
      }
    };

    return this.http
      .post<ReorderSuggestionDto>(`${this.baseUrl}/reorder_suggestion`, body, { withCredentials: true })
      .pipe(map((dto) => this.mapReorderSuggestion(dto)));
  }

  private serializePayload(
    payload: CreateProductPayload | UpdateProductPayload
  ): Record<string, string | number | null | undefined> {
    return {
      sku: 'sku' in payload ? payload.sku : undefined,
      name: payload.name,
      unit: payload.unit ?? null,
      reorder_level: payload.reorderLevel
    };
  }

  private mapProduct(dto: ProductDto): Product {
    return {
      id: dto.id,
      sku: dto.sku,
      name: dto.name,
      unit: dto.unit,
      reorderLevel: dto.reorder_level,
      stockOnHand: dto.stock_on_hand,
      status: dto.status
    };
  }

  private mapPagination(dto: PaginationMetaDto): PaginationMeta {
    return {
      currentPage: dto.current_page,
      perPage: dto.per_page,
      totalPages: dto.total_pages,
      totalCount: dto.total_count
    };
  }

  private mapReorderSuggestion(dto: ReorderSuggestionDto): ReorderSuggestion {
    return {
      product: {
        id: dto.product.id,
        sku: dto.product.sku,
        name: dto.product.name,
        unit: dto.product.unit,
        stockOnHand: dto.product.stock_on_hand,
        reorderLevel: dto.product.reorder_level
      },
      suggestion: {
        quantity: dto.suggestion.quantity
      },
      basis: {
        windowDays: dto.basis.window_days,
        weeklyOut: dto.basis.weekly_out,
        reorderLevel: dto.basis.reorder_level,
        stockOnHand: dto.basis.stock_on_hand
      }
    };
  }
}
