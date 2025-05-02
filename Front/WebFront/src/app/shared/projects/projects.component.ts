import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/ProjectService';
import { MatDialog } from '@angular/material/dialog'; // <-- Importer MatDialog
import { ProjectFormComponent } from '../project-form/project-form.component'; // <-- Importer le composant formulaire
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
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
   minStartDate: Date | null = null;
   maxEndDate: Date | null = null;
  constructor(
    private modalService: NgbModal,
    private router: Router
    ,private projectService:ProjectService,
    public dialog: MatDialog // <-- Injecter MatDialog

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
          this.getDates(this.projects);
        

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
getDates(projects: any[]){
  // Initialiser les variables pour les dates min/max
 
  
  // Pour chaque projet et chaque phase
  projects.forEach(project => {
    if (project.phaseIds && project.phaseIds.length > 0) {
      project.phaseIds.forEach((phaseId:string) => {
        this.projectService.getphaseById(phaseId).subscribe({
          next: (phase) => {
            console.log(`Phase ${phaseId}:`, phase);
            
            // Convertir les dates strings en objets Date
            const phaseStartDate = new Date(phase.startDate);
            const phaseEndDate = new Date(phase.endDate);
            
            // Comparaison pour trouver le min/max
            if (!this.minStartDate || phaseStartDate < this.minStartDate) {
              this.minStartDate = phaseStartDate;
            }
            
            if (!this.maxEndDate || phaseEndDate > this.maxEndDate) {
              this.maxEndDate = phaseEndDate;
            }
            
            // Afficher les dates min/max actuelles
            console.log('Date de début min actuelle:', this.minStartDate);
            console.log('Date de fin max actuelle:', this.maxEndDate);
          },
          error: (err) => {
            console.error(`Erreur phase ${phaseId}:`, err);
          }
        });
      });
    }
  });
}
  goToProjectDetails(project: any): void {
    this.router.navigate(['/project', project._id]);
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
}
