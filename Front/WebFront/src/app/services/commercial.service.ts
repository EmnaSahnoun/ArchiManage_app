import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Invoice } from '../models/invoice';
import { AuthService } from './auth.service';
import { UserService } from './UserService';
import { Client } from '../clients/clients.component';


@Injectable({
  providedIn: 'root'
})
export class CommercialService {
  // Adjust the baseUrl to your actual API endpoint

 private apiUrl = '/commercial';
  constructor(private http: HttpClient, 
    private authService: AuthService, 
    private userService:UserService) { }

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

  getClients(idCompany:string): Observable<any[]> {
    console.log("headezrrs",this.getApiHeaders())
    return this.http.get<any[]>(`${this.apiUrl}/client/company/${idCompany}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
  createClient(clientData: any): Observable<any> {
    console.log("headezrrs",this.getApiHeaders())
    return this.http.post<any>(`${this.apiUrl}/client`, clientData, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }
getClientById(idClient:string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client/${idClient}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
  updateClient(idClient: string, clientData: any): Observable<any> {
    
    return this.http.put<any>(`${this.apiUrl}/client/${idClient}`, clientData,  { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
   deleteClient(idClient: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/client/${idClient}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }
   private getApiHeaders(): HttpHeaders {
         const token = this.authService.getAccessToken();
         return new HttpHeaders({
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
           'Scope': 'roles'
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
