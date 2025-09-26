import { Routes } from '@angular/router';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { LoginPageComponent } from './auth/login-page.component';
import { ProductsPageComponent } from './products/products-page.component';
import { StockMovementsPageComponent } from './stock-movements/stock-movements-page.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsPageComponent, canActivate: [AuthGuard] },
  { path: 'movements', component: StockMovementsPageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
