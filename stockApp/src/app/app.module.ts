import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StockMovementsPanelComponent } from './stock-movements/stock-movements-panel.component';
import { ProductsPageComponent } from './products/products-page.component';
import { StockMovementsPageComponent } from './stock-movements/stock-movements-page.component';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { LoginPageComponent } from './auth/login-page.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    StockMovementsPanelComponent,
    ProductsPageComponent,
    StockMovementsPageComponent,
    DashboardPageComponent,
    LoginPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    InputNumberModule,
    InputSwitchModule,
    TagModule,
    ToastModule,
    DropdownModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
