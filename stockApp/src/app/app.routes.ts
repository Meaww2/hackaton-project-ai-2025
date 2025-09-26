import { Routes } from '@angular/router';
import { ManagementComponent } from './components/management/management.component';

import { StockListComponent } from './components/stocks/stock-list/stock-list.component';

export const routes: Routes = [
    {
        path: 'index',
        component: StockListComponent,
    }

    {
        path: 'management',
        component: ManagementComponent
    }
];
