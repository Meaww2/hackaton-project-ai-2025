import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/authentication/sign_in';

  constructor(private http: HttpClient) { }

  public login(email: string, password: string): Observable<any> {
    const payload = {
      user: { email, password }
    };

    console.log(payload);


    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);

        return res;
      })
    );
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
