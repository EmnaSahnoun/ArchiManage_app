import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  onLogin() {
    console.log('Utilisateur connecté:', this.user);
    alert('Connexion réussie !');
    this.router.navigate(['/dashboard']);
  }
}
