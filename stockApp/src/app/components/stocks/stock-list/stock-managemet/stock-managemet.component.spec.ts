import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockManagemetComponent } from './stock-managemet.component';

describe('StockManagemetComponent', () => {
  let component: StockManagemetComponent;
  let fixture: ComponentFixture<StockManagemetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockManagemetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockManagemetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
