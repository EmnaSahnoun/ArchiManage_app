 import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
//import {KeycloakAuthGuard,KeyclaokService} from 'keyclaok-angular';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(
   protected readonly router: Router,
   //protected readonly key 
) { }

 
}
