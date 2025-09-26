import { Routes } from '@angular/router';
import { ManagementComponent } from './components/management/management.component';

import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockManagemetComponent } from './components/stocks/stock-list/stock-managemet/stock-managemet.component';

export const routes: Routes = [
    {
        path: 'index',
        component: StockListComponent,
    },

    {
        path: 'management',
        component: ManagementComponent
    },
    {
        path: 'create',
        component: StockManagemetComponent,
    },
];
