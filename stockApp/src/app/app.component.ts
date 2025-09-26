import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth/auth.service';
import { User } from './auth/auth.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'stockApp';
  public user$: Observable<User | null>;

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {
    this.user$ = this.authService.user$;
  }

  public logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Signed out' });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Logout failed' });
      }
    });
  }
}
