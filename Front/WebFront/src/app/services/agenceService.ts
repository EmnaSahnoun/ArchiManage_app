import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
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
      'Authorization': `Bearer ${this.authService.getAccessToken()}`,
      'Accept': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}/create`, agence, { 
      headers: headers,
      withCredentials: true // Important pour les requêtes avec credentials
    }).pipe(
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
    const fullAgenceData = {
        ...agence,
        id: id // On s'assure que l'ID est bien inclus
    };

    return this.http.put(`${this.apiUrl}/update/${id}`, fullAgenceData, {
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
  
    getIdGroup(name: string): Observable<string> {
      const headers = this.getApiHeaders();
      return this.http.get<any[]>(`${this.keycloakUrl}/admin/realms/${this.realm}/groups?search=${encodeURIComponent(name)}`, { headers })
          .pipe(
              map(groups => {
                  const group = groups.find(g => g.name === name);
                  if (!group) {
                      throw new Error(`Groupe "${name}" introuvable`);
                  }
                  return group.id;
              }),
              catchError(this.handleError)
          );
  }
  getGroupMembers(groupId: string): Observable<any[]> {
    const headers = this.getApiHeaders();
    return this.http.get<any[]>(`${this.keycloakUrl}/admin/realms/${this.realm}/groups/${groupId}/members`, { headers })
        .pipe(
            catchError(this.handleError)
        );
}
getMembersByGroupName(groupName: string): Observable<any[]> {
  return this.getIdGroup(groupName).pipe(
      switchMap(groupId => this.getGroupMembers(groupId))
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
