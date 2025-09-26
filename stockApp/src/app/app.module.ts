import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockManagemetComponent } from './components/stocks/stock-managemet/stock-managemet.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { ManagementComponent } from './components/management/management.component';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './components/stocks/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    StockListComponent,
    ManagementComponent,
    DashboardComponent,
    StockManagemetComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DropdownModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    TableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
