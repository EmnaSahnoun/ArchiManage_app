import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY, finalize, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AgenceService } from '../services/agenceService';

@Component({
  selector: 'app-agence-details',
  templateUrl: './agence-details.component.html',
  styleUrl: './agence-details.component.scss'
})
export class AgenceDetailsComponent implements OnInit {
  agenceForm!: FormGroup;
  currentAgence: any | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private agenceService: AgenceService,
    private authService: AuthService, // Supposons que authService.getUserId() existe
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.agenceForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      email: ['', [Validators.email]],
      phone: ['']
      // Ajoutez d'autres champs ici correspondant à votre modèle Agence
    });
    this.loadAgenceDetails();
  }

  loadAgenceDetails(): void {
    this.isLoading = true;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.snackBar.open('Impossible de récupérer l\'identifiant utilisateur.', 'Fermer', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    this.agenceService.getAgenceByUser(userId).pipe(
      switchMap(groups => {
        if (!groups || groups.length === 0) {
          return throwError(() => new Error('L\'utilisateur n\'est assigné à aucune agence (groupe Keycloak).'));
        }

        const agenceGroup = groups[0];
        if (!agenceGroup || !agenceGroup.name) {
          return throwError(() => new Error('Nom de l\'agence (groupe Keycloak) non trouvé.'));
        }
        return this.agenceService.getAgenceByName(agenceGroup.name);
      }),
      tap(agenceDetails => {
        if (agenceDetails) {
          this.currentAgence = agenceDetails;
          console.log('Détails de l\'agence:', agenceDetails)
          this.agenceForm.patchValue(agenceDetails);
        } else {
          this.snackBar.open('Détails de l\'agence non trouvés.', 'Fermer', { duration: 4000 });
        }
      }),
      catchError(err => {
        console.error('Erreur lors du chargement des détails de l\'agence:', err);
        this.snackBar.open(err.message || 'Une erreur est survenue lors du chargement des détails.', 'Fermer', { duration: 5000 });
        return EMPTY;
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  onSubmit(): void {
    if (this.agenceForm.invalid || !this.currentAgence) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire.', 'Fermer', { duration: 3000 });
      return;
    }

    this.isSaving = true;
const updatedAgenceData = { 
  ...this.currentAgence, 
  name: this.agenceForm.value.name,
  address: this.agenceForm.value.address,
  email: this.agenceForm.value.email,
  phone: this.agenceForm.value.phone
};
    this.agenceService.updateAgence(this.currentAgence.id, updatedAgenceData).pipe(
      tap(() => {
        this.snackBar.open('Détails de l\'agence mis à jour avec succès !', 'Fermer', { duration: 3000 });
        this.currentAgence = updatedAgenceData; // Mettre à jour l'objet local
      }),
      catchError(err => {
        console.error('Erreur lors de la mise à jour de l\'agence:', err);
        this.snackBar.open(err.message || 'Échec de la mise à jour de l\'agence.', 'Fermer', { duration: 5000 });
        return EMPTY;
      }),
      finalize(() => this.isSaving = false)
    ).subscribe();
  }
}
