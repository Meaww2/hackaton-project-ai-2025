import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss',
})
export class ManagementComponent {
  public products: any = [
    { sku: 'P001', name: 'Product 1', stock_on_hand: 100, min_order_quantity: 20, reorder_level: 50 },
    { sku: 'P002', name: 'Product 2', stock_on_hand: 200, min_order_quantity: 30, reorder_level: 60 },
    { sku: 'P003', name: 'Product 3', stock_on_hand: 150, min_order_quantity: 25, reorder_level: 55 },
    { sku: 'P004', name: 'Product 4', stock_on_hand: 300, min_order_quantity: 40, reorder_level: 70 },
    { sku: 'P005', name: 'Product 5', stock_on_hand: 250, min_order_quantity: 35, reorder_level: 65 },
  ];
  public selectedProduct: any = null;
  public type: any = [
    'รับเข้า',
    'เบิกออก'
  ];
  public selectedType: any = 'รับเข้า';

  // constructor(private http: HttpClient) {}

  // ngOnInit(): void {
  //   this.getData().subscribe((data) => {
  //     console.log(data);
      
  //   });
  // }

  // public getData(): Observable<Product[]> {
  //   return this.http.get<Product[]>('http://localhost:3000/api/v1/products');
  // }
}

// export interface Product {
//   sku: string;
//   name: string;
//   stock_on_hand: number;
//   min_order_quantity: number;
//   reorder_level: number;
// }
