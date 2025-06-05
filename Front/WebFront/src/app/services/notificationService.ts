import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './UserService';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notificationSubject = new Subject<any>();
  private eventSource!: EventSource;
  private destroy$ = new Subject<void>();
   urlNotif="/notification"
constructor(private http: HttpClient, private authService: AuthService) { }

  
   
  connect(userId: string): Observable<any> {
  this.disconnect();

  // Utilisez userId comme paramètre de requête au lieu d'un header
  const url = `https://e5.systeo.tn/notifications/stream?userId=${encodeURIComponent(userId)}`;
  
  this.eventSource = new EventSource(url);

  this.eventSource.onmessage = (event) => {
    try {
      const notification = JSON.parse(event.data);
      this.notificationSubject.next(notification);
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  };

  this.eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    // Tentative de reconnexion après un délai
    setTimeout(() => this.connect(userId), 5000);
  };

  return this.notificationSubject.asObservable().pipe(
    takeUntil(this.destroy$)
  );
}

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  getPendingNotifications(userId: string): Observable<any[]> {
    // Implémentez une requête HTTP pour récupérer les notifications en attente
    // return this.http.get<any[]>(`/api/notifications/pending?userId=${userId}`);
    return new Observable(observer => observer.next([])); // Stub pour l'exemple
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
   private getApiHeaders(): HttpHeaders {
          const token = this.authService.getAccessToken();
          return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
}