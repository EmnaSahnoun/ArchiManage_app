import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
     private apiUrl = '/document';
     constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }
      
uploadFile(
    file: File,
    description: string,
    taskId: string,
    projectId: string | null,
    phaseId: string | null,
    uploadedBy: string,
    idUser: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('taskId', taskId);
    formData.append('uploadedBy', uploadedBy);
    formData.append('idUser', idUser);
    
    if (projectId) formData.append('projectId', projectId);
    if (phaseId) formData.append('phaseId', phaseId);

    return this.http.post(`${this.apiUrl}`, formData, { 
      headers: this.getApiHeaders(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    );
  }

  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.getApiHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  getFilesByTask(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/task/${taskId}`, { 
      headers: this.getApiHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getApiHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private getApiHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    const userId = localStorage.getItem('user_id') || '';
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    
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