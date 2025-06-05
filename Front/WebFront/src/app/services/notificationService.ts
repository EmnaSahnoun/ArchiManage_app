import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { distinct, Observable, Subject, takeUntil, throwError } from 'rxjs';
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

  const url = `https://e5.systeo.tn/notifications/stream?userId=${encodeURIComponent(userId)}`;
  
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
    takeUntil(this.destroy$),
    distinct((n: any) => n.message) // Éviter les doublons
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