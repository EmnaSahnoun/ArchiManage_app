import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: '<div>Redirection vers le portail d\'authentification...</div>'

})
export class LoginComponent  {
  constructor(private authService: AuthService) {
    // Redirection immédiate
    this.authService.login();
  }

  user = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  

  onLogin() {
    this.authService.login();
  }
}
