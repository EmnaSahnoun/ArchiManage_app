import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgenceService } from '../../services/agenceService'; // Service pour récupérer les utilisateurs
import { ProjectService } from '../../services/ProjectService'; // Service pour gérer les accès projet
import { forkJoin, map } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface ProjectAccessData {
  projectId: string;
  agenceId: string; // ID de l'agence pour récupérer les utilisateurs
  currentAccess: { userId: string, canView: boolean }[]; // Accès actuels pour pré-remplir
}

// Interface pour représenter un utilisateur avec son état d'accès
export interface UserAccess {
  id: string;
  username: string; // Ou firstName + lastName
  email: string;
  canView: boolean;
}
@Component({
  selector: 'app-project-access',
  templateUrl: './project-access.component.html',
  styleUrl: './project-access.component.scss'
})
//interface

export class ProjectAccessComponent {
  isLoading = false;
  searchQuery = '';
  allUsers: UserAccess[] = []; 
 
  filteredUsers: UserAccess[] = []; // Utilisateurs filtrés par la recherche
  @Input() phase: any;

  constructor(
    
    public activeModal: NgbActiveModal,

    private agenceService: AgenceService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('Phase:', this.phase);
    this.loadUsersAndAccess();
  }

  loadUsersAndAccess(): void {
    this.isLoading = true;
        this.projectService.getPhaseAccessByIdPhase(this.phase.id).subscribe({
      next: (phaseAccesses) => {
        console.log('Utilisateurs avec accès:', phaseAccesses);
  
        // Créer un tableau pour stocker toutes les requêtes
        const userRequests = phaseAccesses.map(access => 
          this.agenceService.getUserById(access.idUser).pipe(
            map(user => ({
              ...access, // Conserver les données d'accès originales
              id: access.idUser, // Ensure the main ID is the user ID for consistency if needed later
              username: user.username, // Ajouter le username
              email: user.email 
            }))
          )
        );
  
        // Exécuter toutes les requêtes en parallèle
        forkJoin(userRequests).subscribe({
          next: (usersWithAccess) => {
            // Maintenant usersWithAccess contient les accès avec les usernames
            console.log('Utilisateurs avec accès:', usersWithAccess);
            this.allUsers = usersWithAccess.map(u => ({
              id: u.idUser, // User ID
              username: u.username || 'N/A', // Provide fallback
              email: u.email || '', // Provide fallback (empty string is safe for .toLowerCase())
              canView: u.canView // Get canView from the original access object
            }));
            console.log('Usernames:', this.allUsers);
            
            this.applyFilter();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
            this.snackBar.open('Erreur lors de la récupération des détails utilisateurs', 'Fermer', { duration: 3000 });
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des accès:', err);
        this.snackBar.open('Erreur lors du chargement des accès', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.activeModal.dismiss();
      }
    });
  }

  applyFilter(): void {
    
    if (!this.searchQuery) {
      this.filteredUsers = [...this.allUsers];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.allUsers.filter(user =>
        (user.username && user.username.toLowerCase().includes(query)) 
     
      );
    }
  }

  onSave(): void {
    this.isLoading = true;
    // Préparer les données à envoyer : liste des ID utilisateur avec leur état canView
    const accessUpdates = this.allUsers.map(user => ({
      userId: user.id,
      canView: user.canView
    }));
    console.log("Updating access for phase:", this.phase.id, "with data:", accessUpdates);

    // Appeler le service pour mettre à jour les accès
   /*  this.projectService.updatePhaseAccess(this.phase.id, accessUpdates).subscribe({ // Utiliser this.phase._id
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Accès mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.activeModal.close(true);// Fermer et indiquer le succès
      },
      error: (err:any) => {
        this.isLoading = false;
        console.error('Erreur lors de la mise à jour des accès:', err);
        this.snackBar.open('Erreur lors de la mise à jour des accès', 'Fermer', { duration: 5000 });
        // Ne pas fermer le modal pour permettre à l'utilisateur de réessayer
      }
    }); */
  } 

  onCancel(): void {
    this.activeModal.dismiss(); // Fermer sans sauvegarder
  }

  // Optionnel: Pour suivre les éléments dans *ngFor pour de meilleures performances
  trackByUser(index: number, item: UserAccess): string {
    return item.id;
  }
}
