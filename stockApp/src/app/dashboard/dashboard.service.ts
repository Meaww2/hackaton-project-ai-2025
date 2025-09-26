import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  DashboardStockSnapshot,
  DashboardStockSnapshotDto
} from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = '/api/v1/dashboard/stock';

  constructor(private readonly http: HttpClient) {}

  getStockSnapshot(): Observable<DashboardStockSnapshot> {
    return this.http
      .get<DashboardStockSnapshotDto>(this.baseUrl, { withCredentials: true })
      .pipe(
        map((snapshot) => ({
          lowStock: snapshot.low_stock,
          recentMovements: snapshot.recent_movements
        }))
      );
  }
}
