import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      return true; // มีข้อมูล → ผ่าน
    }

    // ไม่มีข้อมูล → บังคับไปหน้า login
    this.router.navigate(['/sign_in']);
    return false;
  }
}
