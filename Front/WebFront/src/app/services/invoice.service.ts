import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Invoice } from '../models/invoice';
import { AuthService } from './auth.service';
import { UserService } from './UserService';


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  // Adjust the baseUrl to your actual API endpoint

 private apiUrl = '/invoice';
  constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/commercialdocuments`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/commercialdocuments${id}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  createInvoice(invoicePayload: any): Observable<Invoice> {
    const url = `${this.apiUrl}/commercialdocuments`;
    return this.http.post<Invoice>(this.apiUrl, invoicePayload, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  updateInvoice(id: string, invoicePayload: any): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoicePayload, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
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
