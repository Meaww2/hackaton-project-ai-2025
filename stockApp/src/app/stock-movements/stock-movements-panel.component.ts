import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/product.model';
import {
  CreateStockMovementPayload,
  StockMovement,
  StockMovementKind
} from './stock-movement.model';
import { StockMovementsService } from './stock-movements.service';

interface ProductOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stock-movements-panel',
  templateUrl: './stock-movements-panel.component.html',
  styleUrls: ['./stock-movements-panel.component.scss']
})
export class StockMovementsPanelComponent implements OnInit, OnDestroy {
  @Output() movementCreated = new EventEmitter<void>();

  public movementForm: FormGroup;
  public saving = false;
  public movements: StockMovement[] = [];
  public loadingMovements = false;
  public productOptions: ProductOption[] = [];
  public productFilterOptions: Array<{ label: string; value: number | null }> = [
    { label: 'All products', value: null }
  ];
  public filterProductId: number | null = null;
  public canCreateMovements = false;
  private currentUser: User | null = null;

  public readonly kindOptions: Array<{ label: string; value: StockMovementKind }> = [
    { label: 'Stock In', value: 'IN' },
    { label: 'Stock Out', value: 'OUT' }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productsService: ProductsService,
    private readonly stockMovementsService: StockMovementsService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService
  ) {
    this.movementForm = this.formBuilder.group({
      productId: [null, Validators.required],
      kind: ['IN', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reference: [''],
      movedAt: [null]
    });
  }

  public ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.canCreateMovements = this.authService.hasAnyRole('manager', 'inventory_officer');
        if (!this.canCreateMovements) {
          this.movementForm.disable({ emitEvent: false });
        } else {
          this.movementForm.enable({ emitEvent: false });
        }
      });

    this.loadProductOptions();
    this.loadRecentMovements();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadRecentMovements(): void {
    this.loadingMovements = true;
    this.stockMovementsService
      .getRecentMovements({ productId: this.filterProductId ?? undefined, limit: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movements) => {
          this.movements = movements;
          this.loadingMovements = false;
        },
        error: (error) => {
          this.loadingMovements = false;
          const message = this.extractErrorMessage(error) || 'Unable to fetch recent movements.';
          this.messageService.add({ severity: 'error', summary: 'Load failed', detail: message });
        }
      });
  }

  public applyFilter(productId: number | null): void {
    this.filterProductId = productId;
    this.loadRecentMovements();
  }

  public submitMovement(): void {
    if (!this.canCreateMovements) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot record movements.' });
      return;
    }
    if (this.movementForm.invalid || this.saving) {
      this.movementForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;

    this.stockMovementsService
      .createMovement(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movement) => {
          this.saving = false;
          this.messageService.add({ severity: 'success', summary: 'Movement recorded', detail: `${movement.kind} ${movement.quantity} for ${movement.product.sku}` });
          this.movementCreated.emit();
          this.loadRecentMovements();
          this.resetForm(payload.productId);
        },
        error: (error) => {
          this.saving = false;
          const message = this.extractErrorMessage(error) || 'Unable to save movement.';
          this.messageService.add({ severity: 'error', summary: 'Save failed', detail: message });
        }
      });
  }

  public hasError(controlName: string): boolean {
    const control = this.movementForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  public kindSeverity(kind: StockMovementKind): 'success' | 'danger' {
    return kind === 'IN' ? 'success' : 'danger';
  }

  public kindLabel(kind: StockMovementKind): string {
    return kind === 'IN' ? 'IN' : 'OUT';
  }

  private buildPayload(): CreateStockMovementPayload {
    const raw = this.movementForm.getRawValue();
    return {
      productId: Number(raw.productId),
      kind: raw.kind,
      quantity: Number(raw.quantity),
      reference: raw.reference?.trim() || null,
      movedAt: raw.movedAt ? new Date(raw.movedAt) : null
    };
  }

  private resetForm(productId: number): void {
    this.movementForm.reset({
      productId,
      kind: 'IN',
      quantity: 1,
      reference: '',
      movedAt: null
    });
  }

  private loadProductOptions(): void {
    this.productsService
      .getProducts({ perPage: 100, sortField: 'sku', sortDirection: 'asc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ products }) => {
          this.productOptions = products.map((product) => this.mapProductOption(product));
          this.productFilterOptions = [
            { label: 'All products', value: null },
            ...this.productOptions
          ];
        },
        error: (error) => {
          const message = this.extractErrorMessage(error) || 'Unable to load products for selection.';
          this.messageService.add({ severity: 'error', summary: 'Load failed', detail: message });
        }
      });
  }

  private mapProductOption(product: Product): ProductOption {
    return {
      label: `${product.sku} — ${product.name}`,
      value: product.id
    };
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
