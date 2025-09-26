import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { ProductsService } from '../products/products.service';
import { DashboardService } from './dashboard.service';
import { DashboardProductSummary, DashboardMovementSummary } from './dashboard.model';
import { ReorderSuggestion } from '../products/product.model';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  public loading = false;
  public lowStock: DashboardProductSummary[] = [];
  public recentMovements: DashboardMovementSummary[] = [];
  public canSuggest = false;
  public suggestionDialogVisible = false;
  public suggestionLoading = false;
  public suggestionSummary: ReorderSuggestion | null = null;
  public suggestionError = '';
  public suggestionTarget: DashboardProductSummary | null = null;

  private readonly destroy$ = new Subject<void>();
  private currentUser: User | null = null;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) {}

  public ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.canSuggest = this.authService.hasAnyRole('manager', 'inventory_officer');
      });

    this.loadSnapshot();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadSnapshot(): void {
    this.loading = true;
    this.dashboardService
      .getStockSnapshot()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (snapshot) => {
          this.lowStock = snapshot.lowStock;
          this.recentMovements = snapshot.recentMovements;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          const message = this.extractErrorMessage(error) || 'Unable to load dashboard snapshot.';
          this.messageService.add({ severity: 'error', summary: 'Load failed', detail: message });
        }
      });
  }

  public statusSeverity(product: DashboardProductSummary): 'danger' | 'warning' {
    return product.stock_on_hand <= 0 ? 'danger' : 'warning';
  }

  public openSuggestion(product: DashboardProductSummary): void {
    if (!this.canSuggest) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot request suggestions.' });
      return;
    }

    this.suggestionDialogVisible = true;
    this.suggestionLoading = true;
    this.suggestionSummary = null;
    this.suggestionError = '';
    this.suggestionTarget = product;

    this.productsService
      .getReorderSuggestion({ id: product.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.suggestionSummary = summary;
          this.suggestionLoading = false;
          this.messageService.add({
            severity: 'info',
            summary: 'Reorder suggestion ready',
            detail: `${summary.product.sku} → ${summary.suggestion.quantity} units`
          });
        },
        error: (error) => {
          this.suggestionLoading = false;
          const message = this.extractErrorMessage(error) || 'Unable to fetch suggestion.';
          this.suggestionError = message;
          this.messageService.add({ severity: 'error', summary: 'Suggestion failed', detail: message });
        }
      });
  }

  public closeSuggestionDialog(): void {
    this.suggestionDialogVisible = false;
    this.suggestionLoading = false;
    this.suggestionSummary = null;
    this.suggestionError = '';
    this.suggestionTarget = null;
  }

  public suggestionBasisEntries(): Array<{ label: string; value: string | number }> {
    if (!this.suggestionSummary) {
      return [];
    }

    const { basis } = this.suggestionSummary;
    return [
      { label: 'Window (days)', value: basis.windowDays },
      { label: 'Weekly OUT', value: basis.weeklyOut },
      { label: 'Reorder level', value: basis.reorderLevel },
      { label: 'Stock on hand', value: basis.stockOnHand }
    ];
  }

  private extractErrorMessage(error: any): string | null {
    const details = error?.error?.error;
    if (!details) {
      return error?.message ?? null;
    }

    if (details.message) {
      return details.message;
    }

    if (details.details) {
      const firstError = Object.values(details.details)[0] as string[] | undefined;
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }

    return null;
  }
}
