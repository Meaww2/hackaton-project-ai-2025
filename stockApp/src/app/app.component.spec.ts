import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';

class AuthServiceStub {
  user$ = of(null);
  logout = jasmine.createSpy('logout').and.returnValue(of(void 0));
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [MessageService, { provide: AuthService, useClass: AuthServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app shell', () => {
    expect(component).toBeTruthy();
  });

  it('renders navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.nav-links a')).map((link) => link.textContent?.trim());
    expect(links).toContain('Dashboard');
    expect(links).toContain('Products');
    expect(links).toContain('Stock Movements');
  });
});
