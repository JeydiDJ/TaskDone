import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/badges';

  // Subject to notify badge updates
  private badgeChangeSubject = new Subject<void>();
  badgeChanges$ = this.badgeChangeSubject.asObservable();

  emitBadgeChange() {
    this.badgeChangeSubject.next();
  }

  getUserBadges(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  createBadge(badge: {
    userId: string;
    milestone: number;
    name: string;
    icon: string;
    type?: 'daily' | 'lifetime';
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, badge);
  }
}