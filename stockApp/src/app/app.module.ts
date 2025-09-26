import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { ManagementComponent } from './components/management/management.component';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    AppComponent,
    StockListComponent,
    ManagementComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DropdownModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    TableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
