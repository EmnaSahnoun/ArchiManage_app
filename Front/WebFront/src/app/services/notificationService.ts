import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { catchError, distinct, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './UserService';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notificationSubject = new Subject<any>();
  private eventSource!: EventSource;
  private destroy$ = new Subject<void>();
  private baseUrl = 'https://e5.systeo.tn/notifications';
constructor(private http: HttpClient, private authService: AuthService) { }

 connect(userId: string): Observable<any> {
    this.disconnect();

    const url = `${this.baseUrl}/stream?userId=${encodeURIComponent(userId)}`;
    const headers = this.getApiHeaders();

    return new Observable(observer => {
      this.eventSource = new EventSource(url);

      const messageHandler = (event: MessageEvent) => {
        try {
          const notification = JSON.parse(event.data);
          observer.next(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      const errorHandler = (error: Event) => {
        console.error('SSE Error:', error);
        this.disconnect();
        setTimeout(() => this.connect(userId).subscribe(observer), 5000);
      };

      this.eventSource.onmessage = messageHandler;
      this.eventSource.onerror = errorHandler;

      return () => {
        this.eventSource.removeEventListener('message', messageHandler);
        this.eventSource.removeEventListener('error', errorHandler);
        this.disconnect();
      };
    }).pipe(
      takeUntil(this.destroy$)
    );
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  getPendingNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending`, {
      headers: this.getApiHeaders(),
      params: { userId }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getNotificationHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`, {
      headers: this.getApiHeaders(),
      params: { userId }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`, {
      headers: this.getApiHeaders(),
      params: { userId }
    }).pipe(
      catchError(this.handleError)
    );
  }

  markAsRead(userId: string, notificationId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/mark-as-read/${notificationId}`,
      null,
      { headers: this.getApiHeaders(), params: { userId } }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getApiHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': localStorage.getItem('user_id') || ''
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error Details:', error);
    
    let errorMessage = 'Une erreur est survenue';
    if (error.status === 401) {
      errorMessage = 'Session expirée - veuillez vous reconnecter';
      this.authService.logout();
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 500) {
      errorMessage = `Erreur serveur (${error.status}) - ${error.error?.error || 'Veuillez contacter l\'administrateur'}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

}