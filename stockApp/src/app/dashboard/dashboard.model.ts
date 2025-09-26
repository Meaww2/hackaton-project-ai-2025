export interface DashboardProductSummary {
  id: number;
  sku: string;
  name: string;
  unit: string | null;
  stock_on_hand: number;
  reorder_level: number;
}

export interface DashboardMovementSummary {
  id: number;
  kind: 'IN' | 'OUT';
  quantity: number;
  reference: string | null;
  moved_at: string;
  product: {
    id: number;
    sku: string;
    name: string;
  };
}

export interface DashboardStockSnapshotDto {
  low_stock: DashboardProductSummary[];
  recent_movements: DashboardMovementSummary[];
}

export interface DashboardStockSnapshot {
  lowStock: DashboardProductSummary[];
  recentMovements: DashboardMovementSummary[];
}
