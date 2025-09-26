import { Component } from '@angular/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss',
})
export class ManagementComponent {
  public products: any = [
    { sku: 'P001', name: 'Product 1', on_stock: 100, min_order_quantity: 20, reorder: 50 },
    { sku: 'P002', name: 'Product 2', on_stock: 200, min_order_quantity: 30, reorder: 60 },
    { sku: 'P003', name: 'Product 3', on_stock: 150, min_order_quantity: 25, reorder: 55 },
    { sku: 'P004', name: 'Product 4', on_stock: 300, min_order_quantity: 40, reorder: 70 },
    { sku: 'P005', name: 'Product 5', on_stock: 250, min_order_quantity: 35, reorder: 65 },
  ];
  public selectedProduct: any = null;
  public type: any = [
    'รับเข้า',
    'เบิกออก'
  ];
  public selectedType: any = 'รับเข้า';

}
