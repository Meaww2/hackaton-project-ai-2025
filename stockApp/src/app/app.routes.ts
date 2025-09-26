import { Routes } from '@angular/router';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';

export const routes: Routes = [
    {
        path: 'index',
        component: StockListComponent,
    }
];
