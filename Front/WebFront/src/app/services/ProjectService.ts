import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
    private apiUrl = '/agence';
    private projetUrl="/projet"
    constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }

    getAllProjects(idCompany:string): Observable<any[]> {
        console.log("l'url",`${this.apiUrl}/${idCompany}/projects`);
        return this.http.get<any[]>(`${this.apiUrl}/${idCompany}/projects`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }

    createProject(projectData: any): Observable<any> {
        const url = `${this.projetUrl}/project`;
        const headers = this.getApiHeaders();
      
        return this.http.post(url, projectData, { headers }).pipe(
          catchError(this.handleError)
        );
      }

      getphaseById(idphase:string): Observable<any> {
        console.log("l'url",`${this.projetUrl}/phase/${idphase}`);
        return this.http.get<any>(`${this.projetUrl}/phase/${idphase}`, { 
          headers: this.getApiHeaders()
        }).pipe(
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