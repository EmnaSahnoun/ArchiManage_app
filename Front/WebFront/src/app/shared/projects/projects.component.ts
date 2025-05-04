import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/ProjectService';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; // <-- Importer MatDialog
import { ProjectFormComponent } from '../project-form/project-form.component'; // <-- Importer le composant formulaire
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Phase } from '../../models/phase.model';
import { ProjectMembersComponent } from '../project-members/project-members.component'; 
import { MatSnackBar } from '@angular/material/snack-bar';
export interface Project {
  id: string; // Or number, depending on your backend
  name: string;
  createdAt: string | Date;
  minStartDate: string | Date | null;
  maxEndDate: string | Date | null;
  progress: number;
  status: string;
  members?: any[]; // Define a Member interface if possible
  phases?: any[]; // Define a Phase interface if possible
  description?: string; // Add other editable fields
  // Add other relevant project properties
}
@Component({
  
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  viewMode: 'list' | 'card' = 'list'; // Default view mode is list
  projects: any[] = [];
  filteredProjects: any[] = [];
  members: any[] = [];
  isLoading: boolean = false;
  editingProjectId: string | null = null; // Track the ID of the project being edited
  editedProjectData: Partial<Project> = {}; // Holds the data being edited


  constructor(
    private modalService: NgbModal,
    private router: Router
    ,private projectService:ProjectService,
    public dialog: MatDialog ,
    private snackBar: MatSnackBar,

    

  ) { 
    this.currentDate = new Date().toLocaleDateString(); 
    
  }

  ngOnInit(): void {
    this.getProjects();    
  }

  // Toggle view mode
  toggleViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }
  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredProjects = [...this.projects]; // Use spread operator for a new array instance
    } else {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      this.filteredProjects = this.projects.filter(project =>
        project.name.toLowerCase().includes(lowerCaseQuery)
        // You could add more fields to search here, e.g., project.status.toLowerCase().includes(lowerCaseQuery)
      );
    }
   }
   getProjects(){
    const idCompany=localStorage.getItem("idAgence");
    if (idCompany){
      this.projectService.getAllProjects(idCompany).subscribe({
        next: (projects) => {
          this.projects = projects;
          this.projects.forEach(project => {
            this.getDates(project);
            this.checkProjectStatus(project);
          }); 
          this.projects = this.projects.filter(p => p.deleted !== true);                  
          this.applyFilter(); // Appliquer le filtre une fois les projets chargés
          console.log("les projets",this.projects);
          // Pour chaque projet, récupérer les détails des phases
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          this.projects = []; // Vider en cas d'erreur
          this.applyFilter(); // Appliquer le filtre même en cas d'erreur (liste vide)
        }
      });
    };
  }
  getDates(project: any) {
    project.minStartDate = null;
    project.maxEndDate = null;
    project.phases = []; // Initialiser le tableau des phases
  
    if (project.phaseIds && project.phaseIds.length > 0) {
      // Créer un tableau d'observables pour toutes les phases avec le type spécifié
      const phaseRequests = project.phaseIds.map((phaseId: string) => 
        this.projectService.getphaseById(phaseId)
      );
  
      // Spécifier le type générique pour forkJoin
      forkJoin<Phase[]>(phaseRequests).subscribe({
        next: (phases) => {
          // Ajouter toutes les phases au projet
          project.phases = phases;
          
          // Calculer les dates min/max
          phases.forEach((phase: Phase) => {
            const phaseStartDate = new Date(phase.startDate);
            const phaseEndDate = new Date(phase.endDate);
  
            if (!project.minStartDate || phaseStartDate < project.minStartDate) {
              project.minStartDate = phaseStartDate;
            }
            
            if (!project.maxEndDate || phaseEndDate > project.maxEndDate) {
              project.maxEndDate = phaseEndDate;
            }
          });
  
          console.log('Projet complet avec phases:', project);
          console.log('Dates pour le projet', project.name, ':');
          console.log('Début:', project.minStartDate);
          console.log('Fin:', project.maxEndDate);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des phases:', err);
        }
      });
    }
  }
checkProjectStatus(project: any) {
  if (!project.phaseIds || project.phaseIds.length === 0) {
    project.status = 'NOT_STARTED';
    return;
  }

  let allPhasesCompleted = true;
  
  // Vérifier chaque phase du projet
  project.phaseIds.forEach((phaseId: string) => {
    this.projectService.getphaseById(phaseId).subscribe({
      next: (phase) => {
        
        this.checkPhaseStatus(phase).then(phaseStatus => {
          phase.status = phaseStatus;
          
          // Si une phase n'est pas complète, le projet ne l'est pas
          if (phaseStatus !== 'COMPLETED') {
            allPhasesCompleted = false;
          }
          
          // Mettre à jour le statut du projet
          project.status = allPhasesCompleted ? 'COMPLETED' : 'IN_PROGRESS';
        });
      },
      error: (err) => {
        console.error(`Erreur phase ${phaseId}:`, err);
        project.status = 'ERROR';
      }
    });
  });
}
async checkPhaseStatus(phase: any): Promise<string> {
  if (!phase.taskIds || phase.taskIds.length === 0) {
    return 'NOT_STARTED';
  }

  try {
    // Récupérer toutes les tâches de la phase
    const tasks = await this.projectService.getTaskByPhase(phase.id).toPromise();
    
    if (!tasks || tasks.length === 0) {
      return 'NOT_STARTED';
    }

    // Vérifier si toutes les tâches sont complétées
    const allTasksCompleted = tasks.every((task: any) => task.status === 'COMPLETED');
    return allTasksCompleted ? 'COMPLETED' : 'IN_PROGRESS';
    
  } catch (error) {
    console.error(`Erreur lors de la récupération des tâches pour la phase ${phase.id}:`, error);
    return 'ERROR';
  }
}
  goToProjectDetails(project: any): void {
    this.router.navigate(['/project', project.id], {
      state: { projectData: project ,
        members:this.members
      }
    });
  }
  // Add project action
  addProject(): void {
    const modalRef = this.modalService.open(ProjectFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false // Empêche la fermeture avec la touche Echap si backdrop='static'
    });

    // Utiliser modalRef.result qui est une promesse
    modalRef.result.then(
      (result) => {
        // Ce bloc est exécuté quand la modale est fermée avec succès (ex: via modal.close(result))
        console.log('La modale a été fermée avec succès');
        if (result) {
          console.log('Nouveau projet ajouté:', result);
          this.getProjects(); // Recharger la liste des projets
        } else {
          console.log('La modale a été fermée avec succès mais sans résultat.');
        
        }
      },
      (reason) => {
        // Ce bloc est exécuté quand la modale est annulée (ex: clic hors modale, touche Echap, ou via modal.dismiss(reason))
        console.log(`La modale a été annulée/fermée (${reason})`);
        // Pas besoin de recharger les projets si l'action a été annulée
      }
    );
  }
  openMembersModal(project: any, event: MouseEvent): void {
    event.stopPropagation(); // Très important: Empêche le clic de déclencher aussi goToProjectDetails

    const modalRef = this.modalService.open(ProjectMembersComponent, {
      size: 'lg', 
      centered: true, 
      backdrop: 'static', // Empêche la fermeture au clic extérieur
      keyboard: false, // Empêche la fermeture avec Echap
      
    
    });

    modalRef.componentInstance.project = project;

    // Utiliser modalRef.result (Promise) au lieu de afterClosed (Observable)
    modalRef.result.then(result => {
      console.log('La modale des membres a été fermée', result);
     
    }, (reason) => { console.log(`La modale des membres a été annulée/fermée (${reason})`); });

  }
 


  
  deleteProject(projectId: string): void {

        this.isLoading = true;
        
        this.projectService.deleteProject(projectId).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Projet archivé avec succès', 'Fermer', { 
                    duration: 3000,
                    panelClass: ['success-snackbar'] 
                });
                
                this.getProjects(); // Recharger la liste des projets
                
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Erreur:', err);
                this.snackBar.open('Échec de l\'archivage du projet', 'Fermer', { 
                    duration: 5000,
                    panelClass: ['error-snackbar'] 
                });
            }
        });
 
}
 }

