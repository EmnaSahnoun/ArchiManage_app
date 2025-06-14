import { Component,  Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/UserService';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AgenceService } from '../../services/agenceService';
import { GmailService } from '../../services/gmailService';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  roles: string[] = [];
  isLoading = false;
  @Input() agencyName!: string;
  constructor(
    public activeModal: NgbActiveModal, // Injectez NgbActiveModal
    private fb: FormBuilder,
    private userService:UserService,
    private agenceService:AgenceService,
    private gmailService:GmailService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    
    this.loadRoles();
    console.log("agencyName:", this.agencyName);
  }
  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map((r: any) => r.name);

      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }
  onSubmit(): void {
    console.log("Données du formulaire:", this.userForm.value);
    console.log("Nom du groupe (agencyName):", this.agencyName);

    if (this.userForm.valid && this.agencyName) {
        this.isLoading = true;
        const formValue = this.userForm.value;

        const userData = {
            username: formValue.username,
            email: formValue.email,
            enabled: true,
            credentials: [{
                type: 'password',
                value: formValue.password,
                temporary: true
            }],
            groups: [this.agencyName] // Ajout direct du groupe dans la création
        };

        console.log('Envoi des données à Keycloak:', userData);
        console.log('le role choisi',formValue.role)
        this.agenceService.createUserWithRoleAndGroup(
            userData, 
            formValue.role,
            this.agencyName
        ).subscribe({
            next: () => {
              this.sendWelcomeEmail(formValue.email, formValue.username, this.agencyName);
          
                console.log('Utilisateur créé avec succès avec rôle et groupe');
                this.isLoading = false;
                this.activeModal.close({ success: true });
            },
            error: (err) => {
                console.error('Erreur complète:', err);
                this.isLoading = false;
                // Afficher un message d'erreur à l'utilisateur
                alert(`Erreur: ${err.message || 'Échec de la création'}`);
            }
        });
    } else {
        console.error('Formulaire invalide ou nom de groupe manquant');
        if (!this.agencyName) {
            console.error('agencyName est undefined');
        }
    }
}

private sendWelcomeEmail(userEmail: string, username: string, agencyName: string): void {
    console.log("Début de l'envoi d'email");
    
    // URL de votre application frontend
    const loginUrl = 'http://localhost:4200/login'; 
    // Ou utilisez votre domaine de production en environnement réel
    // const loginUrl = 'https://votre-domaine.com/login';

    const emailData = {
      to: userEmail,
      subject: `Bienvenue dans l'agence ${agencyName}`,
      text: `Bonjour ${username},\n\n` +
            `Bienvenue dans l'agence ${agencyName} !\n\n` +
            `Vous êtes maintenant membre de notre application. Vous pouvez y accéder en suivant ce lien : ${loginUrl}\n\n` +
            `Note importante : Lors de votre première connexion, vous devrez définir un nouveau mot de passe.\n\n` +
            `Cordialement,\nL'équipe ${agencyName}`,
      // Si vous voulez aussi une version HTML
      html: `
        <p>Bonjour ${username},</p>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Bienvenue dans ${agencyName}</h2>
          <p>Bonjour ${username},</p>
          
          <p>Votre compte pour l'agence <strong>${agencyName}</strong> a été créé avec succès.</p>

         <div style="text-align: center; margin: 25px 0;">
            <a href="${loginUrl}" 
               style="display: inline-block; padding: 12px 24px; 
                      background: #3498db; color: white; 
                      text-decoration: none; border-radius: 5px;
                      font-weight: bold;">
              Accéder à ${agencyName}
            </a>
          </div>

          <p style="font-size: 14px; color: #7f8c8d;">
            <em>Première connexion ? Vous devrez définir un nouveau mot de passe.</em>
          </p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
            <p>Cordialement,<br>L'équipe ${agencyName}</p>
          </div>
        </div>
      `
    };

    console.log('Données email envoyées:', JSON.stringify(emailData, null, 2));
    
    this.gmailService.sendSystemEmail(emailData).subscribe({
      next: (response) => {
        console.log('Email envoyé avec succès:', response);
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
      }
    });
}


  onCancel(): void {
    this.activeModal.dismiss();
  }
}
