import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { StockMovementsPanelComponent } from './stock-movements-panel.component';
import { ProductsService } from '../products/products.service';
import { StockMovementsService } from './stock-movements.service';
import { MessageService } from 'primeng/api';
import { Product } from '../products/product.model';
import { StockMovement } from './stock-movement.model';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

class ProductsServiceStub {
  getProducts = jasmine.createSpy('getProducts').and.returnValue(
    of({
      products: [
        {
          id: 1,
          sku: 'SKU-1',
          name: 'Product 1',
          unit: 'pcs',
          reorderLevel: 5,
          stockOnHand: 10,
          status: 'ok'
        } as Product
      ],
      pagination: {
        currentPage: 1,
        perPage: 10,
        totalPages: 1,
        totalCount: 1
      }
    })
  );
}

class StockMovementsServiceStub {
  getRecentMovements = jasmine
    .createSpy('getRecentMovements')
    .and.returnValue(of([] as StockMovement[]));

  createMovement = jasmine
    .createSpy('createMovement')
    .and.returnValue(
      of({
        id: 99,
        kind: 'IN',
        quantity: 5,
        reference: 'TEST',
        movedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        product: { id: 1, sku: 'SKU-1', name: 'Product 1' }
      } as StockMovement)
    );
}

class AuthServiceStub {
  user$ = of({
    id: 1,
    email: 'manager@example.com',
    roles: ['manager']
  } as User);
  hasAnyRole = (...roles: string[]) => roles.includes('manager');
  hasRole = (role: string) => role === 'manager';
}

describe('StockMovementsPanelComponent', () => {
  let component: StockMovementsPanelComponent;
  let fixture: ComponentFixture<StockMovementsPanelComponent>;
  let movementsService: StockMovementsServiceStub;

  beforeEach(async () => {
    movementsService = new StockMovementsServiceStub();

    await TestBed.configureTestingModule({
      declarations: [StockMovementsPanelComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        InputNumberModule,
        InputTextModule,
        TableModule,
        TagModule,
        ButtonModule
      ],
      providers: [
        MessageService,
        { provide: ProductsService, useClass: ProductsServiceStub },
        { provide: StockMovementsService, useValue: movementsService },
        { provide: AuthService, useClass: AuthServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovementsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits a movement and emits event', () => {
    spyOn(component.movementCreated, 'emit');

    component.movementForm.setValue({
      productId: 1,
      kind: 'IN',
      quantity: 5,
      reference: 'TEST',
      movedAt: null
    });

    component.submitMovement();

    expect(movementsService.createMovement).toHaveBeenCalled();
    expect(component.movementCreated.emit).toHaveBeenCalled();
  });
});
