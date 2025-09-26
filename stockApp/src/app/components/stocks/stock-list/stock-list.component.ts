import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent {
  currentTab: string = 'dashboard'; // ค่า default

  setTab(tab: string) {
    this.currentTab = tab;
  }
}
