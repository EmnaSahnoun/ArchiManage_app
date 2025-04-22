import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../config/auth.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    constructor(
        private oauthService: OAuthService,
        private router: Router
      ) {
        this.configureAuth();
      }
      private configureAuth(): void {
        this.oauthService.configure(authConfig);
        
        // Désactive la tentative de login automatique après le discovery
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Discovery document loaded');
          this.oauthService.tryLoginCodeFlow().then(() => {
            if (this.oauthService.hasValidAccessToken()) {
              this.storeTokenData();
              // NE PAS faire de redirection ici
            }
          });
        });
      
        // active le silent refresh  
        this.oauthService.setupAutomaticSilentRefresh();
      }
   
    
    
      private storeTokenData(): void {
        const token = this.oauthService.getAccessToken();
        const claims = this.oauthService.getIdentityClaims();
        const expiration = this.oauthService.getAccessTokenExpiration();
    
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("expiration", expiration.toString());
          
          // Stocker d'autres informations utilisateur si nécessaire
          if (claims) {
            localStorage.setItem('user_profile', JSON.stringify(claims));
          }
        }
      }
    
      login(): void {
        this.oauthService.initCodeFlow();
        //this.oauthService.getAccessToken();
      }
    
      logout(): void {
    
        this.oauthService.logOut();
        localStorage.removeItem('token');
        
      }
      private clearTokenData(): void {
       
        localStorage.removeItem('expiration');
        localStorage.removeItem('user_profile');
      }

      getAccessToken(): string | null {
      const token =  this.oauthService.getAccessToken();
      if(token){
        localStorage.setItem("token",token);
       
        return token;
      }
      return localStorage.getItem('token');
      } 
    
      isAuthenticated(): boolean {
        return !!this.oauthService.getAccessToken() && this.oauthService.hasValidAccessToken();
      }
    
    
      /* getTokenExpiration(): number | null {
        const expiration = localStorage.getItem('expiration');
        return expiration ? Number(expiration) : null;
      } */
}