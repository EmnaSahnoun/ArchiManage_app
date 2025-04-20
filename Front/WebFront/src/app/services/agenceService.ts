import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgenceService {
    private apiUrl = '/agence';
    private realm = 'systeodigital';
    private keycloakUrl = '/api';

    
    
    constructor(private http: HttpClient, private authService: AuthService) { }
  // Méthode pour créer une agence
  createAgence(agence: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getAccessToken()}`
    });
  
    return this.http.post(`${this.apiUrl}/create`, agence, { headers })
      .pipe(
        catchError(error => {
          console.error('Error details:', error);
          return throwError(() => new Error(
            error.error?.message || 
            error.message || 
            'Une erreur est survenue'
          ));
        })
      );
  }
  // Méthode pour mettre à jour une agence
  updateAgence(id: string, agence: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, agence, {
      headers: this.getApiHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
    getAllAgencies(): Observable<any[]> {
      console.log("l'url",`${this.apiUrl}/all`);
      return this.http.get<any[]>(`${this.apiUrl}/all`, { 
        headers: this.getApiHeaders()
      }).pipe(
        catchError(this.handleError)
      );
    }

  getUsers(id:string):Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/groups/${id}/members`,).pipe(
      catchError(this.handleError)
    );
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
