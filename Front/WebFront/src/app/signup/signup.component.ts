import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user = {
    nom: '',
    prenom: '',
    username: '',
    email: '',
    password: ''
  };
  constructor(private router:Router){}
  onRegister() {
    console.log('Utilisateur connecté:', this.user);
    alert('Connexion réussie !');
    this.router.navigate(['/dashboard']);
  }
}
