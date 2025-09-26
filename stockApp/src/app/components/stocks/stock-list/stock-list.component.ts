import { Component } from '@angular/core';
import { AuthService } from "../../../services/auth.service";
import { ProductService } from "../../../services/product.service";

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent {
  currentTab: string = 'dashboard'; // ค่า default

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  setTab(tab: string) {
    this.currentTab = tab;
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
