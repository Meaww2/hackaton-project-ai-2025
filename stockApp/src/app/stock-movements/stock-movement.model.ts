export type StockMovementKind = 'IN' | 'OUT';

export interface StockMovementDto {
  id: number;
  kind: StockMovementKind;
  quantity: number;
  reference: string | null;
  moved_at: string;
  created_at: string;
  product: {
    id: number;
    sku: string;
    name: string;
  };
}

export interface StockMovement {
  id: number;
  kind: StockMovementKind;
  quantity: number;
  reference: string | null;
  movedAt: string;
  createdAt: string;
  product: {
    id: number;
    sku: string;
    name: string;
  };
}

export interface CreateStockMovementPayload {
  productId: number;
  kind: StockMovementKind;
  quantity: number;
  reference?: string | null;
  movedAt?: Date | null;
}

export interface FetchMovementsOptions {
  productId?: number;
  limit?: number;
}
