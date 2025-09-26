import { Routes } from '@angular/router';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockManagemetComponent } from './components/stocks/stock-managemet/stock-managemet.component';

export const routes: Routes = [
    {
        path: 'index',
        component: StockListComponent,
    },
    {
        path: 'management',
        component: StockManagemetComponent,
    },
];
