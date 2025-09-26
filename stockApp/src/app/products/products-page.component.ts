import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { ProductsService } from './products.service';
import {
  CreateProductPayload,
  PaginationMeta,
  Product,
  ProductSortField,
  ReorderSuggestion,
  SortDirection
} from './product.model';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  public products: Product[] = [];
  public loading = false;
  public dialogVisible = false;
  public dialogMode: 'create' | 'edit' = 'create';
  public filtersForm: FormGroup;
  public productForm: FormGroup;
  public formError = '';
  public pagination: PaginationMeta = {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalCount: 0
  };
  public sortState: { field: ProductSortField; direction: SortDirection } = {
    field: 'sku',
    direction: 'asc'
  };
  public tableFirst = 0;
  public unitOptions: Array<{ label: string; value: string }> = [
    { label: 'Unit', value: 'unit' },
    { label: 'Box', value: 'box' },
    { label: 'Pack', value: 'pack' },
    { label: 'Piece', value: 'pcs' },
    { label: 'Ream', value: 'ream' },
    { label: 'Roll', value: 'roll' },
    { label: 'Set', value: 'set' }
  ];
  public suggestionDialogVisible = false;
  public suggestionLoading = false;
  public suggestionSummary: ReorderSuggestion | null = null;
  public suggestionError = '';
  public suggestionTarget: Product | null = null;
  private currentUser: User | null = null;
  public canManageProducts = false;
  public canSuggest = false;

  private readonly destroy$ = new Subject<void>();
  private readonly defaultSortField: ProductSortField = 'sku';
  private selectedProduct: Product | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly productsService: ProductsService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService
  ) {
    this.filtersForm = this.formBuilder.group({
      query: [''],
      lowStockOnly: [false]
    });

    this.productForm = this.formBuilder.group({
      sku: ['', [Validators.required]],
      name: ['', [Validators.required]],
      unit: ['unit'],
      reorderLevel: [10, [Validators.required, Validators.min(0)]]
    });
  }

  public ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.canManageProducts = this.authService.hasRole('manager');
        this.canSuggest = this.authService.hasAnyRole('manager', 'inventory_officer');
      });

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.onFiltersChanged());

    this.loadProducts();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadProducts(event?: TableLazyLoadEvent): void {
    if (event) {
      const rows = event.rows && event.rows > 0 ? event.rows : this.pagination.perPage;
      const first = event.first ?? (this.pagination.currentPage - 1) * rows;
      const computedPage = Math.floor(first / rows) + 1;

      this.pagination = {
        ...this.pagination,
        currentPage: computedPage,
        perPage: rows
      };

      let sortField: ProductSortField = this.sortState.field;
      let sortDirection: SortDirection = this.sortState.direction;
      const hasSortField = typeof event.sortField === 'string' && this.isSortableField(event.sortField);

      if (hasSortField) {
        sortField = event.sortField as ProductSortField;
      } else if (!event.sortField) {
        sortField = this.defaultSortField;
      }

      if (typeof event.sortOrder === 'number') {
        sortDirection = event.sortOrder === -1 ? 'desc' : 'asc';
      } else if (!hasSortField) {
        sortDirection = 'asc';
      }

      this.sortState = { field: sortField, direction: sortDirection };
    }

    this.loading = true;
    const filters = this.filtersForm.getRawValue();

    this.productsService
      .getProducts({
        filters: { query: filters.query, lowStockOnly: filters.lowStockOnly },
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage,
        sortField: this.sortState.field,
        sortDirection: this.sortState.direction
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ products, pagination }) => {
          this.products = products;
          products.forEach((product) => this.ensureUnitOption(product.unit));
          this.pagination = pagination;
          this.tableFirst = (pagination.currentPage - 1) * pagination.perPage;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          const message = this.extractErrorMessage(error) || 'Unable to load products right now.';
          this.messageService.add({ severity: 'error', summary: 'Load failed', detail: message });
        }
      });
  }

  public openCreateDialog(): void {
    if (!this.canManageProducts) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot create products.' });
      return;
    }
    this.dialogMode = 'create';
    this.dialogVisible = true;
    this.selectedProduct = null;
    this.formError = '';
    this.productForm.reset({ sku: '', name: '', unit: 'unit', reorderLevel: 10 });
    this.productForm.get('sku')?.enable({ emitEvent: false });
  }

  public openEditDialog(product: Product): void {
    if (!this.canManageProducts) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot edit products.' });
      return;
    }
    this.dialogMode = 'edit';
    this.dialogVisible = true;
    this.selectedProduct = product;
    this.formError = '';
    this.ensureUnitOption(product.unit ?? undefined);
    this.productForm.reset({
      sku: product.sku,
      name: product.name,
      unit: product.unit ?? null,
      reorderLevel: product.reorderLevel
    });
    this.productForm.get('sku')?.disable({ emitEvent: false });
  }

  public closeDialog(): void {
    this.dialogVisible = false;
    this.productForm.get('sku')?.enable({ emitEvent: false });
    this.productForm.reset({ sku: '', name: '', unit: 'unit', reorderLevel: 10 });
    this.formError = '';
    this.selectedProduct = null;
  }

  public submitProduct(): void {
    if (!this.canManageProducts) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot modify products.' });
      return;
    }
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const rawValue = this.productForm.getRawValue();
    const payloadBase = {
      name: rawValue.name.trim(),
      unit: this.sanitizedUnit(rawValue.unit),
      reorderLevel: Number(rawValue.reorderLevel)
    };

    if (this.dialogMode === 'create') {
      const payload: CreateProductPayload = {
        ...payloadBase,
        sku: rawValue.sku.trim().toUpperCase()
      };

      this.productsService
        .createProduct(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Product created',
              detail: `${payload.sku} added successfully`
            });
            this.closeDialog();
            this.loadProducts();
          },
          error: (error) => this.handleFormError(error)
        });
    } else if (this.selectedProduct) {
      this.productsService
        .updateProduct(this.selectedProduct.id, payloadBase)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Product updated',
              detail: `${this.selectedProduct?.sku} updated successfully`
            });
            this.closeDialog();
            this.loadProducts();
          },
          error: (error) => this.handleFormError(error)
        });
    }
  }

  public statusSeverity(product: Product): 'danger' | 'success' {
    return product.status === 'low' ? 'danger' : 'success';
  }

  public statusLabel(product: Product): 'Low' | 'OK' {
    return product.status === 'low' ? 'Low' : 'OK';
  }

  public openSuggestionDialog(product: Product): void {
    if (!this.canSuggest) {
      this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: 'You cannot request suggestions.' });
      return;
    }
    this.suggestionDialogVisible = true;
    this.suggestionSummary = null;
    this.suggestionError = '';
    this.suggestionTarget = product;
    this.suggestionLoading = true;

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
    this.suggestionSummary = null;
    this.suggestionError = '';
    this.suggestionTarget = null;
    this.suggestionLoading = false;
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

  public hasError(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private onFiltersChanged(): void {
    this.pagination = {
      ...this.pagination,
      currentPage: 1
    };
    this.tableFirst = 0;
    this.loadProducts();
  }

  private handleFormError(error: unknown): void {
    const message = this.extractErrorMessage(error) || 'Unable to save changes.';
    this.formError = message;
    this.messageService.add({ severity: 'error', summary: 'Save failed', detail: message });
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

  private sanitizedUnit(unit: string | null | undefined): string | null {
    if (!unit) {
      return null;
    }

    const trimmed = unit.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private isSortableField(field: string): field is ProductSortField {
    return ['sku', 'name', 'unit', 'reorderLevel', 'stockOnHand'].includes(field);
  }

  private ensureUnitOption(unit?: string | null): void {
    if (!unit) {
      return;
    }

    const normalized = unit.trim();
    if (!normalized) {
      return;
    }

    const alreadyPresent = this.unitOptions.some((option) => option.value === normalized);
    if (!alreadyPresent) {
      this.unitOptions = [
        ...this.unitOptions,
        { label: this.formatUnitLabel(normalized), value: normalized }
      ];
    }
  }

  private formatUnitLabel(value: string): string {
    return value
      .split(/[_\s-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
