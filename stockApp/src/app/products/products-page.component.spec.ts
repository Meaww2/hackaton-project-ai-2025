import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ProductsPageComponent } from './products-page.component';
import { ProductsService } from './products.service';
import { MessageService } from 'primeng/api';
import { PaginationMeta, Product } from './product.model';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { of } from 'rxjs';

class ProductsServiceStub {
  private readonly emptyPagination: PaginationMeta = {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalCount: 0
  };

  getProducts = jasmine
    .createSpy('getProducts')
    .and.returnValue(of({ products: [], pagination: this.emptyPagination }));
  createProduct = jasmine
    .createSpy('createProduct')
    .and.returnValue(of({} as Product));
  updateProduct = jasmine
    .createSpy('updateProduct')
    .and.returnValue(of({} as Product));
  getReorderSuggestion = jasmine
    .createSpy('getReorderSuggestion')
    .and.returnValue(
      of({
        product: {
          id: 1,
          sku: 'SKU-1',
          name: 'Product 1',
          unit: 'pcs',
          stockOnHand: 4,
          reorderLevel: 10
        },
        suggestion: { quantity: 5 },
        basis: {
          windowDays: 7,
          weeklyOut: 3,
          reorderLevel: 10,
          stockOnHand: 4
        }
      })
    );
}

class AuthServiceStub {
  user$ = of({
    id: 1,
    email: 'spec@example.com',
    roles: ['manager']
  } as User);
  hasAnyRole = (...roles: string[]) => roles.some((role) => role === 'manager');
  hasRole = (role: string) => role === 'manager';
}

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;
  let serviceStub: ProductsServiceStub;

  beforeEach(async () => {
    serviceStub = new ProductsServiceStub();

    await TestBed.configureTestingModule({
      declarations: [ProductsPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        MessageService,
        { provide: ProductsService, useValue: serviceStub },
        { provide: AuthService, useClass: AuthServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('loads products when initialized', () => {
    component.ngOnInit();
    expect(serviceStub.getProducts).toHaveBeenCalled();
  });

  it('returns "Low" label for low stock items', () => {
    const product = {
      id: 1,
      sku: 'SKU-LOW',
      name: 'Low Item',
      unit: 'pcs',
      stockOnHand: 1,
      reorderLevel: 5,
      status: 'low'
    } as Product;

    expect(component.statusLabel(product)).toBe('Low');
    expect(component.statusSeverity(product)).toBe('danger');
  });

  it('returns "OK" label for healthy stock items', () => {
    const product = {
      id: 2,
      sku: 'SKU-OK',
      name: 'OK Item',
      unit: 'pcs',
      stockOnHand: 10,
      reorderLevel: 4,
      status: 'ok'
    } as Product;

    expect(component.statusLabel(product)).toBe('OK');
    expect(component.statusSeverity(product)).toBe('success');
  });

  it('requests reorder suggestion via service', () => {
    const product = {
      id: 1,
      sku: 'SKU-1',
      name: 'Product 1',
      unit: 'pcs',
      stockOnHand: 4,
      reorderLevel: 10,
      status: 'low'
    } as Product;

    component.openSuggestionDialog(product);

    expect(serviceStub.getReorderSuggestion).toHaveBeenCalledWith({ id: 1 });
  });
});
