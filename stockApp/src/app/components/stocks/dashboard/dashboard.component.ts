import { Component, OnInit } from '@angular/core';

interface Movement {
  type: 'IN' | 'OUT';
  product: string;
  quantity: number;
  movedAt: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api/v1/products';

  public products = [
    { id: 1, name: 'สินค้า A', stockOnHand: 10 },
    { id: 2, name: 'สินค้า B', stockOnHand: 2 },
    { id: 3, name: 'สินค้า C', stockOnHand: 0 },
  ];

  public lowStockProducts = this.products.filter(p => p.stockOnHand < 5);

  public movements: Movement[] = [
    { type: 'IN', product: 'สินค้า A', quantity: 5, movedAt: '2025-09-26' },
    { type: 'OUT', product: 'สินค้า B', quantity: 1, movedAt: '2025-09-26' },
    { type: 'IN', product: 'สินค้า C', quantity: 3, movedAt: '2025-09-26' },
  ];

  public productIn = this.movements.filter(m => m.type === 'IN').length
  public productOut = this.movements.filter(m => m.type === 'OUT').length

  constructor(
  ) {}

  ngOnInit(): void {
  }
}
