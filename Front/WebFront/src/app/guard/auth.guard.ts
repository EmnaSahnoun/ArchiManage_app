 import { Injectable } from '@angular/core';
import {   Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(
   private router: Router,
   private authService: AuthService,
) { }
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  console.log('=== AUTH GUARD DEBUG ===');
  console.log('URL demandée:', state.url);
  console.log('Token présent:', !!this.authService.getAccessToken());
  console.log('Token valide:', this.authService.isAuthenticated());
  
  if (this.authService.isAuthenticated()) {
    console.log('Accès autorisé à', state.url);
    return true;
  }

  console.log('Redirection vers /login');
  this.router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
}
}
 