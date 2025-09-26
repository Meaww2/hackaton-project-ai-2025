import { Routes } from '@angular/router';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockManagemetComponent } from './components/stocks/stock-managemet/stock-managemet.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // {
  //   path: '',
  //   canActivate: [AuthGuard],   // 👈 เช็คทุกหน้า
  //   children: [
  //     { path: '', component: StockListComponent }
  //   ]
  // },

  {
    path: 'index',
    component: StockListComponent,
  },
  {
    path: 'management',
    component: StockManagemetComponent,
  },
  { path: 'sign_in', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
