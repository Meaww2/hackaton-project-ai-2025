import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateStockMovementPayload,
  FetchMovementsOptions,
  StockMovement,
  StockMovementDto
} from './stock-movement.model';

@Injectable({ providedIn: 'root' })
export class StockMovementsService {
  private readonly baseUrl = '/api/v1/stock_movements';

  constructor(private readonly http: HttpClient) {}

  getRecentMovements(options: FetchMovementsOptions = {}): Observable<StockMovement[]> {
    let params = new HttpParams();

    if (options.productId) {
      params = params.set('product_id', options.productId);
    }

    if (options.limit) {
      params = params.set('limit', options.limit);
    }

    return this.http
      .get<StockMovementDto[]>(this.baseUrl, { params, withCredentials: true })
      .pipe(map((items) => items.map((item) => this.mapMovement(item))));
  }

  createMovement(payload: CreateStockMovementPayload): Observable<StockMovement> {
    const body = {
      movement: {
        product_id: payload.productId,
        kind: payload.kind,
        quantity: payload.quantity,
        reference: payload.reference ?? null,
        moved_at: payload.movedAt ? payload.movedAt.toISOString() : undefined
      }
    };

    return this.http
      .post<StockMovementDto>(this.baseUrl, body, { withCredentials: true })
      .pipe(map((item) => this.mapMovement(item)));
  }

  private mapMovement(dto: StockMovementDto): StockMovement {
    return {
      id: dto.id,
      kind: dto.kind,
      quantity: dto.quantity,
      reference: dto.reference,
      movedAt: dto.moved_at,
      createdAt: dto.created_at,
      product: dto.product
    };
  }
}
