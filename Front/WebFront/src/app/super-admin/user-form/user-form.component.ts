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
    const emailData = {
      to: userEmail,
      subject: `Bienvenue dans l'agence ${agencyName}`,
      text: `Bonjour ${username},\n\n` +
            `Bienvenue dans l'agence ${agencyName} !\n\n` +
            `Vous êtes maintenant membre de notre application. Vous pouvez y accéder en suivant ce lien : [URL_DE_VOTRE_APPLICATION]\n\n` +
            `Note importante : Lors de votre première connexion, vous devrez définir un nouveau mot de passe.\n\n` +
            `Cordialement,\nL'équipe ArchiManage`
    };

    this.gmailService.sendSystemEmail(emailData).subscribe({
      next: () => console.log('Email de bienvenue envoyé avec succès'),
      error: (err) => console.error('Erreur lors de l\'envoi de l\'email', err)
    });
  }


  onCancel(): void {
    this.activeModal.dismiss();
  }
}
