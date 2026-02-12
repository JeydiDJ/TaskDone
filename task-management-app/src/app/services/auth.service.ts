import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { User, Users } from '../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: any;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {}

  redirectToTasks() {
    this.router.navigate(['/tasks']);
  }

  /**
   * REGISTER: no token handling, just returns backend response
   */
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  /**
   * LOGIN: handles token normally
   */
  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn);
      })
    );
  }

  getUsers(): Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/users`);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpirationDate');
    sessionStorage.removeItem('user');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // Optional: redirect to login
    // this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, {
      password,
    });
  }

  /**
   * PRIVATE: handle token storage after login only
   */
  private handleAuthentication(token: string, expiresIn: number) {
    const user = { token, expiresIn };
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin() {
    const token = this.getToken();
    const expirationDateStr = sessionStorage.getItem('tokenExpirationDate');
    const expirationDate = expirationDateStr ? new Date(expirationDateStr) : null;

    if (!token || !expirationDate || expirationDate <= new Date()) {
      this.logout();
      return;
    }

    const expiresIn = expirationDate.getTime() - new Date().getTime();
    this.autoLogout(expiresIn);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  getCurrentUserId(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      // JWT tokens are in format: header.payload.signature
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded._id;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): any {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  saveUserData(user: any): void {
    sessionStorage.setItem('user', JSON.stringify(user));
  }
}
