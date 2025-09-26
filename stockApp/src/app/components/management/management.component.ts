import { Component } from '@angular/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss',
})
export class ManagementComponent {
  public order: any = [
    { id: 1, product: 'น้ำดื่ม', action: 'รับเข้า', quantity: 20, date: '2023-10-01', status: 'pending' },
    { id: 2, product: 'ข้าวสาร', action: 'เบิกออก', quantity: 10, date: '2023-10-02', status: 'approved' },
    { id: 3, product: 'น้ำดื่ม', action: 'รับเข้า', quantity: 30, date: '2023-10-03', status: 'rejected' },
  ];
  public products: any = [];
  public selectedProduct: any = null;
  public type: any = [
    'รับเข้า',
    'เบิกออก'
  ];
  public selectedType: any = 'รับเข้า';

}
