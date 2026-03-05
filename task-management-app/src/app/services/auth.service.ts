import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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

  // --------------------
  // Reactive current user
  // --------------------
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  redirectToTasks() {
    this.router.navigate(['/tasks']);
  }

  // --------------------
  // AUTH API METHODS
  // --------------------
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

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

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // --------------------
  // LOGOUT & AUTOLOGOUT
  // --------------------
  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpirationDate');
    sessionStorage.removeItem('user');
    this.currentUserSubject.next(null);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  // --------------------
  // TOKEN HANDLING
  // --------------------
  private handleAuthentication(token: string, expiresIn: number) {
    const payload = JSON.parse(atob(token.split('.')[1]));

    const user: User = {
      _id: payload._id,
      token,
      expiresIn,
    };

    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('tokenExpirationDate', expirationDate.toISOString());

    this.currentUserSubject.next(user);
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

    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user: User = JSON.parse(userData);
      this.currentUserSubject.next(user);
    }
  }

  // --------------------
  // CURRENT USER HELPERS
  // --------------------
  getCurrentUserId(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload._id;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  saveUserData(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const userData = sessionStorage.getItem('user');
    if (!userData) return null;

    try {
      const parsed: Partial<User> = JSON.parse(userData);
      return parsed as User;
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      return null;
    }
  }
}