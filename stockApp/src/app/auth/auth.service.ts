import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiUser, User } from './auth.models';

interface AuthResponse {
  user: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'inventory-user';
  private readonly userSubject = new BehaviorSubject<User | null>(this.loadUser());

  public readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  public login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(
        '/api/v1/login',
        { user: { email, password } },
        { withCredentials: true }
      )
      .pipe(
        map((response) => this.mapUser(response.user)),
        tap((user) => this.setUser(user))
      );
  }

  public register(email: string, password: string, passwordConfirmation: string): Observable<User> {
    return this.http
      .post<AuthResponse>(
        '/api/v1/register',
        { user: { email, password, password_confirmation: passwordConfirmation } },
        { withCredentials: true }
      )
      .pipe(
        map((response) => this.mapUser(response.user)),
        tap((user) => this.setUser(user))
      );
  }

  public logout(): Observable<void> {
    return this.http.delete<void>('/api/v1/logout', { withCredentials: true }).pipe(tap(() => this.clearUser()));
  }

  public isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  public currentUser(): User | null {
    return this.userSubject.value;
  }

  public hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  public hasAnyRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return !!user && roles.some((role) => user.roles.includes(role));
  }

  private setUser(user: User): void {
    this.userSubject.next(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.storageKey);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch (error) {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private mapUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      roles: apiUser.roles || []
    };
  }
}
