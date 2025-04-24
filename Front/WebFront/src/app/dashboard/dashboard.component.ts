import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto'; // Import Chart.js
import { MatTableDataSource } from '@angular/material/table';
import { AgenceService } from '../services/agenceService';
import { UserService } from '../services/UserService';
import { catchError, filter, finalize, from, map, mergeMap, of, Subscription, takeUntil, tap, timeout, toArray } from 'rxjs';
import { UserFormComponent } from '../super-admin/user-form/user-form.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from '../super-admin/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

// Interface pour la structure des données de projet (basée sur le HTML)
export interface Project {
  id: number; // Ajout d'un ID pour la gestion
  name: string;
  statusClass: string; // Classe CSS pour le badge (ex: 'in-progress', 'completed')
  statusText: string;  // Texte du badge (ex: 'En cours', 'Terminé')
  progress: number;    // Pourcentage de progression
}

// Interface pour la structure des données utilisateur (basée sur le HTML)
export interface User {
  id: number; // Ajout d'un ID
  fullName: string;
  email: string;
  roleClass: string; // Classe CSS pour le badge de rôle (ex: 'super-admin', 'admin', 'user')
  roleText: string;  // Texte du badge de rôle
  statusClass: string; // Classe CSS pour le badge de statut (ex: 'active', 'inactive')
  statusText: string;  // Texte du badge de statut
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'] // Correction: utiliser styleUrls au lieu de styleUrl
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentAgence: any;
  isLoadingUsers: boolean = false;
  isUser: boolean = false;
  isAdmin: boolean = false;
  // --- Variables pour les statistiques ---
  pendingProjectCount: number = 12;
  inProgressProjectCount: number = 64;
  completedProjectCount: number = 105;
  totalTasks: number = 56;
  assignedMembers: number = 8;
  relatedProjects: number = 30;
  // Tables de données
  projectDataSource = new MatTableDataSource<Project>();
  userDataSource = new MatTableDataSource<User>();

  projectDisplayedColumns: string[] = ['name', 'status', 'progress', 'actions'];
  userDisplayedColumns: string[] = ['fullName', 'email', 'role', 'status', 'actions'];

  projects: Project[] = [ /* ... */ ];
  users: User[] = []; // Use the User interface

  public chart: Chart | undefined;

  // --- State for Inline Editing ---
  editingUserId: string | null = null;
  editedUserData: any = {}; // Use 'any' or a specific edit interface
  isSavingUser = false;
  isDeletingUser: string | null = null;
   routerSubscription: Subscription | null = null; // To store router event subscription
   activeModalRef: NgbModalRef | null = null; // To keep track of the opened modal

  constructor( private agenceService: AgenceService, 
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthService,
    private router: Router, // Inject Router
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.role();
    this.loadAgence();
    console.log('userss',this.users);
    this.subscribeToRouterEvents(); // Start listening to router changes
  }
role(){
 if (this.authService.isAdmin()){
  this.isAdmin=true
 }
 else { 
  this.isUser=true
 }
}
  ngAfterViewInit(): void {
    // Créer le graphique une fois que la vue est initialisée
    this.createChart();
    this.checkUrlAndOpenModal(this.router.url);
  }
  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.routerSubscription?.unsubscribe();
    // Ensure modal is closed if component is destroyed
    this.activeModalRef?.dismiss('Component Destroyed');
  }
  // --- Router Subscription Logic ---
  private subscribeToRouterEvents(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Only react to successful navigation
    ).subscribe((event: NavigationEnd) => {
      console.log('NavigationEnd:', event.urlAfterRedirects);
      this.checkUrlAndOpenModal(event.urlAfterRedirects);
    });
  }
  private checkUrlAndOpenModal(currentUrl: string): void {
    const addUserUrlPattern = '/dashboard/users/new'; // Match your child route path

    if (currentUrl.includes(addUserUrlPattern)) {
      // If URL matches and modal isn't already open, open it
      if (!this.activeModalRef) {
        this.openUserFormModal();
      }
    } else {
      // If URL *doesn't* match (e.g., navigated back) and modal *is* open, close it
      if (this.activeModalRef) {
        this.activeModalRef.dismiss('URL Navigation');
        this.activeModalRef = null; // Clear the reference
      }
    }
  }
  // This method is now triggered by the BUTTON CLICK
  triggerAddUser(): void {
    // Only navigate if agency data is ready
    if (this.currentAgence && this.currentAgence[0]?.name) {
      // Navigate to the child route. The router listener will handle opening the modal.
      this.router.navigate(['users/new'], { relativeTo: this.route });
    } else {
      console.error('Cannot add user: Agency data not loaded.');
      alert("Impossible d'ajouter un utilisateur : les informations de l'agence ne sont pas disponibles.");
    }
  }

  // This method is now triggered by the ROUTER LISTENER when URL matches
  openUserFormModal(): void {
    if (!this.currentAgence || !this.currentAgence[0]?.name) {
        console.error('Cannot open modal: Agency data missing.');
        // Optionally navigate back if data is missing
        this.router.navigate(['.'], { relativeTo: this.route });
        return;
    }
    const agencyName = this.currentAgence[0].name;
    console.log('Opening modal for agency:', agencyName);

    this.activeModalRef = this.modalService.open(UserFormComponent, {
      centered: true,
      backdrop: 'static', // Prevent closing on backdrop click (optional, forces explicit close)
      keyboard: false // Prevent closing with Esc key (optional)
    });

    // Pass the agency name
    this.activeModalRef.componentInstance.agencyName = agencyName;

    // Handle modal close/dismiss
    this.activeModalRef.result.then(
      (result) => {
        console.log('Modal closed with result:', result);
        this.activeModalRef = null; // Clear reference
        if (result?.success) {
          this.loadUsers(); // Refresh list on success
        }
        // Navigate back to the parent route on close
        this.router.navigate(['.'], { relativeTo: this.route });
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
        this.activeModalRef = null; // Clear reference
        // Navigate back to the parent route on dismiss (unless dismissal was due to navigation)
        if (reason !== 'URL Navigation' && reason !== 'Component Destroyed') {
            this.router.navigate(['.'], { relativeTo: this.route });
        }
      }
    );
  }
    createChart(): void {
      // Correction : Utiliser l'ID 'taskChartDashboard' qui correspond à l'HTML
      const ctx = document.getElementById('taskChartDashboard') as HTMLCanvasElement;
      if (ctx) {
        // Détruire l'ancien graphique s'il existe pour éviter les doublons
        if (this.chart) {
          this.chart.destroy();
        }
  
        this.chart = new Chart(ctx, {
          type: 'bar', // Type de graphique (bar, line, pie, etc.)
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], // Labels pour l'axe X
            datasets: [{
              label: 'Tâches complétées', // Légende du dataset
              data: [50, 60, 75, 90, 110, 130], // Données pour chaque label
              backgroundColor: 'rgba(74, 144, 226, 0.6)', // Couleur de fond des barres (utilise --primary-color avec transparence)
              borderColor: 'rgba(74, 144, 226, 1)', // Couleur de bordure des barres
              borderWidth: 1
            }]
          },
          options: {
            responsive: true, // Le graphique s'adapte à la taille du conteneur
            maintainAspectRatio: false, // Permet de contrôler la hauteur via CSS si nécessaire
            scales: {
              y: {
                beginAtZero: true, // L'axe Y commence à 0
                title: {
                  display: true,
                  text: 'Nombre de tâches' // Titre de l'axe Y
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Mois' // Titre de l'axe X
                }
              }
            },
            plugins: {
              legend: {
                display: true, // Afficher la légende
                position: 'top', // Position de la légende
              },
              tooltip: {
                enabled: true // Activer les infobulles au survol
              }
            }
          }
        });
      } else {
        // Le message d'erreur sera maintenant correct si l'élément n'est toujours pas trouvé
        console.error("L'élément Canvas avec l'ID 'taskChartDashboard' n'a pas été trouvé.");
      }
    }

  addNewProject(): void {
    console.log('Action: Ajouter un nouveau projet');
    // Logique pour ouvrir un formulaire ou naviguer vers la page de création
  }

  viewProject(project: Project): void {
    console.log('Action: Voir le projet', project);
    // Logique pour afficher les détails du projet (modal, navigation)
  }

  editProject(project: Project): void {
    console.log('Action: Modifier le projet', project);
    // Logique pour ouvrir le formulaire d'édition du projet
  }

  deleteProject(project: Project): void {
    console.warn('Action: Supprimer le projet', project);
    // Logique pour confirmer et supprimer le projet (appel API)
    // Pensez à mettre à jour this.projects après suppression
  }

  addNewUser(): void {
    if (this.currentAgence && this.currentAgence[0]?.name) {
      const agencyName = this.currentAgence[0].name;
      console.log('Opening modal for agency:', agencyName);

      const modalRef = this.modalService.open(UserFormComponent, {
        size: 'md',
        centered: true, 
      });

      // Pass the agency name to the component instance inside the modal
      modalRef.componentInstance.agencyName = agencyName;

      // Handle the result when the modal closes (e.g., user saved)
      modalRef.result.then(
        (result) => {
          console.log('Modal closed with result:', result);
          if (result) {
            console.log('User possibly added, refreshing list...');
            this.loadUsers(); // Refresh the user list
          }
        },
        (reason) => {
          console.log('Modal dismissed with reason:', reason);
          // Modal was dismissed (e.g., clicked cancel, backdrop click)
        }
      );
    } else {
      console.error('Cannot add user: Agency data not loaded or missing name.');
      // Optionally show an error message to the user
      alert("Impossible d'ajouter un utilisateur : les informations de l'agence ne sont pas disponibles.");
    }
  }

  viewUser(user: User): void {
    console.log('Action: Voir l\'utilisateur', user);
     // Logique pour afficher les détails de l'utilisateur
  }

  editUser(user: any) {
    // If another user is already being edited, cancel that first (optional)
    if (this.editingUserId && this.editingUserId !== user.id) {
        this.cancelEdit();
    }
    this.editingUserId = user.id;
    // Copy necessary properties for editing, including the ID
    this.editedUserData = {
        id: user.id, // Keep the id
        username: user.username,
        email: user.email,
        enabled: user.enabled // Include enabled status
        // We don't need firstName/lastName here if using partial update
    };
  }
  cancelEdit() {
    this.editingUserId = null;
    this.editedUserData = {};
    // No need to reset isSavingUser here, it's handled by saveUser or component init/load
  }
  saveUser(): void {
    if (!this.editingUserId || !this.editedUserData) return;

    this.isSavingUser = true;
    const userIdToSave = this.editingUserId;
    const dataToSave = { ...this.editedUserData }; // Copy data

    // Prepare payload for Keycloak update (adjust based on your User interface and API needs)
    const payload = {
      username: dataToSave.username,
      email: dataToSave.email,
      enabled: dataToSave.enabled
      // firstName, lastName if needed by API, but often username/email/enabled are sufficient for partial update
    };

    console.log('Saving user:', userIdToSave, 'with data:', payload);

    // Assuming agenceService.updateUser handles the API call
    this.agenceService.updateUser(userIdToSave, payload, { partialUpdate: true })
      .pipe(
        finalize(() => {
          this.isSavingUser = false;
          console.log('Save operation finalized.');
        })
      )
      .subscribe({
        next: () => {
          console.log('User updated successfully in Keycloak.');
          // Update the local data source
          const index = this.users.findIndex((u:any) => u.id === userIdToSave);
          if (index !== -1) {
            // Merge existing data (like role) with updated data
            this.users[index] = {
              ...this.users[index], // Keep existing properties like role, roleClass etc.
              ...payload
            };
            this.loadAgence();
          }
          this.cancelEdit(); // Exit edit mode
          // Optionally show success notification (e.g., using Toastr)
          // this.toastr.success('Utilisateur mis à jour avec succès!');
        },
        error: (err) => {
          console.error('Failed to update user:', err);
       
        }
      });
  }
  deleteUser(user: any) {
      const modalRef = this.modalService.open(ConfirmationDialogComponent, {
          centered: true,
          windowClass: 'confirmation-modal'
      });
  
      modalRef.componentInstance.message = `Voulez-vous vraiment supprimer l'utilisateur ${user.username} ?`;
      modalRef.componentInstance.username = user.username; // Pass username for confirmation if needed
  
      modalRef.result.then((confirm) => {
          if (confirm) {
              this.isDeletingUser = user.id; // Set deleting flag for this user
              // Use the service method that handles both group removal and user deletion
              this.agenceService.deleteUserCompletely(user.id, this.currentAgence[0].name)
              .pipe(
                  finalize(() => this.isDeletingUser = null) // Ensure flag is reset
              )
              .subscribe({
                  next: () => {
                      console.log('Utilisateur supprimé avec succès');
                  
                      this.loadAgence();
                  },
                  error: (err) => {
                      console.error('Erreur lors de la suppression', err);
                  }
              });
          }
      }).catch(() => {
          console.log('Suppression annulée');
      });
  }
  loadAgence(): void {
    const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    if (userProfile?.preferred_username) {
      
      this.agenceService.getUserByUsername(userProfile.preferred_username).pipe(
        mergeMap(user => this.agenceService.getAgenceByUser(user.id))
      ).subscribe({
        next: (agence) => {
          
          this.currentAgence = agence;
         
          this.loadUsers();
         console.log("les utilisateurs",this.users)
        },
        error: (err) => console.error('Error loading agency:', err)
      });
    }
  }
  loadUsers(): void {
    if (!this.currentAgence[0]?.name) {
        return;
    }

    const agencyName = this.currentAgence[0].name;    
    this.isLoadingUsers = true;
    const ROLE_HIERARCHY = ['SUPER-ADMIN', 'ADMIN', 'USER'];
    this.agenceService.getMembersByGroupName(agencyName).pipe(
       
        catchError(err => {
            
            return of([]);
        }),
        mergeMap(users => {
            return users.length ? from(users) : of([]);
        }),
        mergeMap(user => {            
            return this.processUserRoles(user, ROLE_HIERARCHY);
        }, 5), // Limite de concurrence
        toArray(),
        finalize(() => {
            console.log('Chargement terminé - arrêt du spinner');
            this.isLoadingUsers = false;
        })
    ).subscribe({
        next: (usersWithRoles) => {
            this.users = usersWithRoles;
            this.userDataSource.data=this.users;
            console.log("list users",this.users)
        },
        error: (err) => {
            console.error('Erreur globale dans le flux:', err);
            
        }
    });
   
}
  private processUserRoles(user: any, roleHierarchy: string[]) {
    return this.userService.getUserRoles(user.id).pipe(
      map(roles => ({
        ...user,
        role: this.getHighestRole(roles, roleHierarchy)
      })),
      catchError(() => of({
        ...user,
        role: 'Erreur Rôle'
      })),
      timeout(8000)
    );
  }

  private getHighestRole(roles: any[], hierarchy: string[]): string {
    const roleNames = roles.map(r => r.name.toUpperCase());
    return hierarchy.find(role => roleNames.includes(role)) || 'USER';
  }
}




