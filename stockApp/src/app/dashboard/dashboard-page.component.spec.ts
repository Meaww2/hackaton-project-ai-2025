import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardService } from './dashboard.service';

const snapshotMock = {
  lowStock: [
    {
      id: 1,
      sku: 'SKU-LOW',
      name: 'Low Product',
      unit: 'pcs',
      stock_on_hand: 2,
      reorder_level: 5
    }
  ],
  recentMovements: [
    {
      id: 10,
      kind: 'OUT' as const,
      quantity: 3,
      reference: 'REF',
      moved_at: new Date().toISOString(),
      product: { id: 1, sku: 'SKU-LOW', name: 'Low Product' }
    }
  ]
};

class DashboardServiceStub {
  getStockSnapshot = jasmine.createSpy('getStockSnapshot').and.returnValue(of(snapshotMock));
}

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let service: DashboardServiceStub;

  beforeEach(async () => {
    service = new DashboardServiceStub();

    await TestBed.configureTestingModule({
      declarations: [DashboardPageComponent],
      imports: [ToastModule],
      providers: [MessageService, { provide: DashboardService, useValue: service }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads snapshot on init', () => {
    expect(service.getStockSnapshot).toHaveBeenCalled();
    expect(component.lowStock.length).toBeGreaterThan(0);
    expect(component.recentMovements.length).toBeGreaterThan(0);
  });
});
