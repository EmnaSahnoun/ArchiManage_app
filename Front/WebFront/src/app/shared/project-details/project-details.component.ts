import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import * as bootstrap from 'bootstrap';
import { AddMemberComponent } from '../../add-member/add-member.component';
import { ProjectService } from '../../services/ProjectService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhaseFormComponent } from '../phase-form/phase-form.component';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importer MatSnackBar
import { AgenceService } from '../../services/agenceService';
import { PhaseAccessComponent } from '../phase-access/phase-access.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent implements OnInit {
  projectId: string | null = null;
  selectedTab: string = 'details';
  selectedPhase: any = null;
  isLoading: boolean = false;
  members: any[] = [];
  phases: any[] = [];
  pendingMembers: any[] = [];
  usersToAdd: any[] = [];
  project = {
    _id: '67c8306029b4bfa9328a19b4',
    name: 'Projet Exemple',
    description: 'Description du projet',
    createdAt: '2025-01-01T00:00:00.000Z',
    progress: 60,
    members: [
      { _id: '1', name: "Alice", image: "assets/images/alice.jpg" },
      { _id: '2', name: "Bob", image: "assets/images/bob.jpg" },
      { _id: '3', name: "Charlie", image: "assets/images/charlie.jpg" }
    ],
    phases: [
      {
        _id: "67c85299bae88e131703dd8e",
        name: "Étude de Faisabilité",
        description: "Analyse des contraintes techniques et réglementaires.",
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-02-10T00:00:00.000Z",
        tasks: [
          {
            _id: "67c8556dbae88e131703dda4",
            name: "Analyse des contraintes techniques",
            status: "PENDING"
          }
        ],
        members: [{ _id: '1', name: "Alice", image: "assets/images/alice.jpg" }]
      },
      {
        _id: "67c852e7bae88e131703dd92",
        name: "Conception Détaillée",
        description: "Élaboration des plans détaillés.",
        startDate: "2025-02-15T00:00:00.000Z",
        endDate: "2025-03-20T00:00:00.000Z",
        tasks: [],
        members: [{ _id: '2', name: "Bob", image: "assets/images/bob.jpg" }]
      }
    ]
  };
  projet!: any ;
  availableMembers: any[] = [];
  progressOffset: string = '';
  selectedMember: any = null;
  constructor(private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private router:Router,
    private projectService:ProjectService,
    private modalService: NgbModal,
    private snackBar: MatSnackBar,
    private agenceService: AgenceService,
    
  
  ) {}
  isEditing: boolean = false;
  editedProjectData: { name: string, description: string } = { name: '', description: '' };

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    //this.project = this.router.getCurrentNavigation()?.extras.state?.['projectData'];
    console.log('Données du projectId :', this.projectId);
    this.calculateProgress();
    this.formatDates();
    this.getProjetById();
    this.loadProjectMembers();
    this.getPhases();
  }
  getProjetById(){
    if (this.projectId){
      this.projectService.getProjectById(this.projectId).subscribe({
        next: (p) => {
          this.projet = p;
          
          // Appliquer le filtre une fois les projets chargés
          console.log("le projet",this.projet);
          // Pour chaque projet, récupérer les détails des phases
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
  }
  startEdit(): void {
    if (!this.projet) return;
    this.isEditing = true;
    // Copier les données actuelles dans le formulaire d'édition
    this.editedProjectData = {
      name: this.projet.name,
      description: this.projet.description || ''
    };
  }
  
  cancelEdit(): void {
    this.isEditing = false;
    // Réinitialiser les données éditées (optionnel, mais propre)
    this.editedProjectData = { name: '', description: '' };
  }
  
  saveEdit(): void {
    if (!this.projectId || !this.editedProjectData) return;
  
    this.isLoading = true; // Afficher un indicateur de chargement si nécessaire
  
    this.projectService.updateProject(this.projectId, this.editedProjectData).subscribe({
      next: (updatedProject) => {
        this.isLoading = false;
        // Mettre à jour les données locales du projet avec la réponse
        this.projet.name = updatedProject.name; // Assurez-vous que l'API retourne le projet mis à jour
        this.projet.description = updatedProject.description;
        this.isEditing = false; // Sortir du mode édition
        this.snackBar.open('Projet mis à jour avec succès!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de la mise à jour du projet:', err);
        this.snackBar.open(`Erreur: ${err.message || 'Impossible de mettre à jour le projet'}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
              }
    });
  }
  
  getPhases(){
    if (this.projectId){
      this.projectService.getphaseByIdProject(this.projectId).subscribe({
        next: (phase) => {
          this.phases = phase;
          
          // Appliquer le filtre une fois les projets chargés
          console.log("les phases",this.phases);
          // Pour chaque projet, récupérer les détails des phases
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
  }
  addPhase(): void {
    const modalRef = this.modalService.open(PhaseFormComponent, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
        keyboard: false
    });
    
    modalRef.componentInstance.projectId = this.projectId;
    
    modalRef.result.then(
        (result) => {
            if (result) {
                console.log('Nouvelle phase créée:', result);
                this.openPhaseAccesssModal(result);
                this.getPhases();
            }
        },
        (reason) => {
            console.log('Modal fermée avec raison:', reason);
        }
    );
}
    loadProjectMembers(): void {
      this.isLoading = true;
      if (this.projectId) {
          this.projectService.getProjectAccessByIdProject(this.projectId).subscribe({
              next: async (accessList) => {
                  try {
                      // Traitement des membres acceptés
                      const acceptedMembers = accessList
                          .filter(access => access.invitationStatus === 'ACCEPTED');
                      
                      // Tableau pour stocker les membres avec données complètes
                      this.members = [];
                      
                      // Récupération des données pour chaque membre
                      for (const access of acceptedMembers) {
                          try {
                              const userData = await this.agenceService.getUserById(access.idUser).toPromise();
                              this.members.push({
                                  id: access.idUser,
                                  name: `${userData.firstName} ${userData.lastName}`,
                                  email: userData.email,
                                  role: access.role,
                                  username: access.username,
                                  // Ajoutez d'autres champs si nécessaire
                                  ...userData
                              });
                          } catch (error) {
                              console.error(`Erreur lors de la récupération de ${access.username}:`, error);
                              // Ajouter quand même les données de base si échec
                              this.members.push({
                                  id: access.idUser,
                                  name: access.username,
                                  email: access.emailUser,
                                  role: access.role,
                                  username: access.username
                              });
                          }
                      }
  
                      // Traitement des invitations en attente
                      this.pendingMembers = accessList
                          .filter(access => access.invitationStatus === 'PENDING')
                          .map(pending => ({
                              id: pending.id,
                              idUser: pending.idUser,
                              emailUser: pending.emailUser,
                              role: pending.role,
                              createdAt: pending.createdAt,
                              username: pending.username
                          }));
  
                      console.log('Members with full data:', this.members);
                      this.isLoading = false;
                  } catch (error) {
                      console.error('Error processing members:', error);
                      this.isLoading = false;
                  }
              },
              error: (err) => {
                  console.error('Error loading members:', err);
                  this.isLoading = false;
              }
          });
      }
  }

  private formatDates() {
    this.project.phases.forEach(phase => {
      phase.startDate = this.formatDate(phase.startDate);
      phase.endDate = this.formatDate(phase.endDate);
    });
    this.project.createdAt = this.formatDate(this.project.createdAt);
  }
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
 
  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  calculateProgress() {
    const circumference = 2 * Math.PI * 40; // 40 = rayon du cercle
    this.progressOffset = ((100 - this.project.progress) / 100 * circumference).toString();
  }
  
  editPhase(phase: any) {
    console.log("Modifier la phase:", phase);
    // Ici, on peut ouvrir un modal pour modifier les détails
  }
  deletePhase(phase: any) {
    this.project.phases = this.project.phases.filter(p => p !== phase);
  }

 openMemberModal(phase: any): void {
  this.selectedPhase = phase;  // Sélectionner la phase
  this.availableMembers = this.project.members.filter(member => 
    !phase.members.some((phaseMember:any) => phaseMember._id === member._id)
  ); // Filtrer les membres déjà assignés à la phase

  // Ouvrir le modal avec les membres disponibles et la phase sélectionnée
  const dialogRef = this.dialog.open(AddMemberComponent, {
    data: {  phase: this.selectedPhase }
  });

  // Quand un membre est ajouté dans le modal
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Mettre à jour la phase dans le projet avec le membre ajouté
      this.selectedPhase.members.push(result);
    }
  });
} 
openPhaseAccesssModal(phase: any): void {
  const modalRef = this.modalService.open(PhaseAccessComponent, {
    size: 'lg',
    centered: true,
    backdrop: 'static',
    keyboard: false
  });

  // Passez les données via componentInstance
  modalRef.componentInstance.phase = phase;

  modalRef.result.then(
    (result) => console.log('Modal closed', result),
    (reason) => console.log('Modal dismissed', reason)
  );
}
openTasks(phase: any): void {
  this.router.navigate(['project', this.project._id, 'phase', phase._id]);
}
}