 import { Injectable } from '@angular/core';
import {   Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(
   private router: Router,
   private authService: AuthService,
) { }
canActivate(): boolean {
  if (this.authService.isAuthenticated()) {
    return true;
  }
  
  // Stockez l'URL demandée avant la redirection
  this.router.navigate(['/login'], {
    queryParams: { returnUrl: this.router.url }
  });
  return false;
}
}
 